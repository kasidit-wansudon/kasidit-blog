---
title: "Building a Read-Only Warehouse Mirror in PostgreSQL with Scheduled Sync"
date: "2026-09-30"
excerpt: "Why reports should not query the main DB directly, and how to build a read-only mirror in PostgreSQL with scheduled sync in Laravel, with code and pitfalls."
tags: ["postgresql", "laravel", "data", "reporting"]
---

When I started building the Sell-in Dashboard, I needed data from the warehouse system, which is the main database the operational system uses every day. The easiest option was to connect and query it directly, but I chose to build a **read-only mirror** of the 20 tables I needed in **PostgreSQL**, with a **scheduled sync** pulling data on a schedule. This post covers the reasons, the design, the sync job, and the pitfalls I hit.

## Why Not Query the Main Database Directly

**1. Reports and operations have different load patterns.** The warehouse system needs short, fast transactions, while the dashboard needs queries that aggregate large amounts of data. If both fight over the same resources, the people who suffer are the staff scanning goods into the warehouse.

**2. Permission risk.** A reporting system should have no write access to operational data at all, even by accident.

**3. Freedom to adjust the reporting-side schema.** On the mirror, I can add indexes suited to reports or create materialized views without asking anyone for permission and without affecting the main system.

**4. Data does not need to be real-time.** Dashboard users look at sales to plan, so data that is a few minutes late is acceptable. If you agree on this with users from the start, the design becomes much simpler.

## Design

The overall structure has three parts:

- **Source:** the warehouse database, using a user with `SELECT` permission only, on only the tables needed
- **Sync job:** a Laravel command run by the scheduler that pulls data changed since the last run and upserts it
- **Target:** PostgreSQL, which the reporting app connects to with a read-only role as well. Only the sync job can write.

For each table I define in config what the primary key is and which column indicates that a row changed (normally `updated_at`). For small tables with no change-tracking column, I copy the whole table again instead.

On the PostgreSQL side, the roles are clearly separated:

```sql
CREATE ROLE report_reader LOGIN PASSWORD '...';
GRANT CONNECT ON DATABASE reporting TO report_reader;
GRANT USAGE ON SCHEMA mirror TO report_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA mirror TO report_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA mirror GRANT SELECT ON TABLES TO report_reader;
```

`ALTER DEFAULT PRIVILEGES` is important, because if you forget it, tables added later cannot be read, and it becomes a bug that is hard to trace.

## The Sync Job

This is the skeleton of a command that does an incremental sync one table at a time (the example uses the `orders` table):

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncMirror extends Command
{
    protected $signature = 'mirror:sync {table}';

    public function handle(): int
    {
        $table = $this->argument('table');
        $source = DB::connection('warehouse');
        $target = DB::connection('reporting');

        $since = $target->table('mirror.sync_state')
            ->where('table_name', $table)
            ->value('last_synced_at') ?? '1970-01-01 00:00:00';

        $startedAt = $source->selectOne('SELECT NOW() AS now')->now;

        $source->table($table)
            ->where('updated_at', '>=', $since)
            ->orderBy('id')
            ->chunkById(2000, function ($rows) use ($target, $table) {
                $payload = $rows->map(fn ($r) => (array) $r)->all();
                $columns = array_keys($payload[0]);

                $target->table("mirror.{$table}")
                    ->upsert($payload, ['id'], array_diff($columns, ['id']));
            });

        $target->table('mirror.sync_state')->updateOrInsert(
            ['table_name' => $table],
            ['last_synced_at' => $startedAt]
        );

        return self::SUCCESS;
    }
}
```

And set the schedule in the scheduler:

```php
Schedule::command('mirror:sync orders')
    ->everyTenMinutes()
    ->withoutOverlapping()
    ->onOneServer();
```

Points I designed on purpose:

- **Use the source's time.** `$startedAt` is read from the source database, not the app server's clock, to avoid clock mismatch problems.
- **Record the start time, not the end time.** Rows changed during a sync are pulled again in the next run. I use `>=` for the same reason. Duplicate data is fine because of the upsert.
- **Chunk.** Do not pull the whole table into memory at once.
- **withoutOverlapping.** If the previous run has not finished, the new run does not overlap.

## How to Choose the Sync Interval

A sync interval that is too frequent does not always make the data better, but it definitely adds load to the source. I start by asking users "how many minutes late can the data be without affecting decisions", then choose an interval slightly shorter than that. Tables that change often and matter get synced frequently, while master data tables that rarely change, such as the list of warehouses or product categories, only need a few syncs a day. Separating intervals by table like this reduces load a lot, and also makes it easy to see which table takes unusually long to sync.

## Pitfalls I Hit

**Deleted rows.** An incremental sync using `updated_at` cannot see deletes. If the source uses soft delete, there is no problem. If it uses hard delete, you need a separate reconcile pass, such as comparing the list of `id` values once a day and deleting the ones that disappeared.

**`updated_at` is not always updated.** Some old code paths modify data with raw SQL without touching `updated_at`. You need to verify this before trusting the column, and keep a full resync as a fallback.

**Data types and timezone.** Zero dates (`0000-00-00`), which some systems allow to be stored, cannot be inserted into PostgreSQL and must be converted to `NULL`. For timestamps, you must decide clearly whether to store UTC or local time.

**Source schema changes.** If someone adds a column at the source, the upsert breaks because the column does not exist at the target. I chose to list the columns explicitly in config instead of copying every column, so it breaks in a way you notice rather than silently.

**Not knowing the sync stopped.** The worst case is a dashboard showing old data without anyone knowing. I show `last_synced_at` on the dashboard page and set an alert when there has been no sync for longer than a set time.

Another benefit of having a clear sync cycle is that it can serve as a data version for caching, which I used to build ETags in the [dashboard that got under 100ms](/en/blog/sell-in-dashboard-etag-304-under-100ms).

## Summary

A read-only mirror in PostgreSQL separates reporting load from the operational system, lets you restrict permissions clearly, and gives freedom to adjust the reporting-side schema. The heart of a scheduled sync is to use the source's time, record the start time, upsert in chunks, and prevent overlapping runs. The things to plan from the start are deletes, an `updated_at` you cannot trust, data types, and alerts when the sync stops.
