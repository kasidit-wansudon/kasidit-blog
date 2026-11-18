---
title: "Feature Flags for Fast Rollback in Small Teams: Simple Database Flags"
date: "2026-02-11"
excerpt: "Use database-backed feature flags to roll back fast without a new deploy, built for small teams, with Laravel code and rules for when to delete a flag."
tags: ["feature-flags", "laravel", "deploy", "rollback"]
---

In the small team I look after, rolling back by deploying the old version takes several minutes, and sometimes it is not easy because there is a migration mixed in. What greatly reduces the stress here is simple feature flags stored in the database. Flip one off and the new feature disappears immediately, with no deploy. This post covers how to build feature flags for fast rollback without buying an external service, and, importantly, when you have to delete them.

## What problem a feature flag solves

The idea is to separate "deploying code" from "turning on a feature." New code can go to production in the morning while still turned off. When it is ready, you turn it on, and if there is a problem, you turn it off.

The real benefits in a small team:

- **Rollback in seconds** instead of deploying backward
- **Open it to a small group first,** such as the IT team or users who volunteer to test
- **Deploy more often,** because unfinished code can be merged into main with the flag off
- **Lower risk during a deploy freeze.** Over holidays when we do not want to deploy, we can still turn off a feature that has problems.

## Why store flags in the database

There are many options, from putting them in env, using config files, to SaaS services for small teams. I chose the database because:

- Values can change instantly with no deploy or restart (env needs a restart and may need a config cache clear)
- No extra cost and no external dependency
- You can audit who turned what on or off and when
- The team already knows it

## Table structure and a service to check flags

There are only three pieces: the table, one small class for checking values, and the call sites in the code.

```php
// Migration
Schema::create('feature_flags', function (Blueprint $table) {
    $table->id();
    $table->string('key', 100)->unique();
    $table->boolean('enabled')->default(false);
    $table->json('allowed_user_ids')->nullable(); // optional allowlist
    $table->string('owner', 100);                 // who is responsible
    $table->date('remove_by')->nullable();        // planned cleanup date
    $table->text('description')->nullable();
    $table->timestamps();
});

// Model FeatureFlag: protected $casts = ['enabled' => 'bool', 'allowed_user_ids' => 'array'];

// app/Support/Feature.php
namespace App\Support;

use App\Models\FeatureFlag;
use Illuminate\Support\Facades\Cache;

class Feature
{
    public static function enabled(string $key, ?int $userId = null): bool
    {
        $flag = Cache::remember("flag:{$key}", 30, fn () =>
            FeatureFlag::where('key', $key)->first()?->only(['enabled', 'allowed_user_ids'])
        );

        if (! $flag) {
            return false; // unknown flag = off (safe default)
        }

        if ($flag['enabled']) {
            return true;
        }

        $allowed = $flag['allowed_user_ids'] ?? [];
        return $userId !== null && in_array($userId, $allowed, true);
    }

    public static function forget(string $key): void
    {
        Cache::forget("flag:{$key}");
    }
}

// Usage in a controller
if (Feature::enabled('orders.new_export', auth()->id())) {
    return $this->newExport($request);
}
return $this->legacyExport($request);
```

The `owner` and `remove_by` columns have nothing to do with how the flag works, but they matter most in the long run. I explain in the last section.

Key design points:

- **The default is off.** If you forget to create the record or the database has a problem, the system goes back to the old, safe path.
- **A short cache,** so not every request hits the database, but changes still show up within a few tens of seconds. Call `forget` immediately when a value is edited.
- **The legacy path must still work.** A flag is useless if the old path is already broken.
- **Record changes.** Every time someone turns a flag on or off, log who, when, and what changed from and to.

## Flags and migrations

A flag does not help if a migration destroys the schema the old code uses. Do the migration as an expand step first: add a new column or table without touching the old one, turn on the flag to use the new one, and once you are confident, do the contract step, which removes the old one, in a later deploy. This order makes turning off the flag a truly safe rollback.

## When to use a flag and when not to

Use one when:

- A new feature affects a large number of users
- Changing important logic, such as calculations or report exports
- Switching to call a new external API

You do not need one when:

- Fixing a small bug that a normal deploy can roll back
- Changing text or styles
- Work that would leave so many overlapping paths that testing cannot cover them all

## When to delete a flag

This is the part most teams get wrong. A flag that is never deleted becomes technical debt. The code has two paths to maintain, tests must cover both, and one day someone will accidentally turn off a flag that has been on for a year and send the system back to old code nobody remembers.

The rules I use:

1. **Every flag must have an owner and `remove_by`** from the moment it is created, usually 2-4 weeks after being fully on
2. **Once fully on with no problems for one full usage cycle,** for example passing month-end for reporting work, open a ticket to delete the flag
3. **Delete in two deploys.** The first removes the flag check and the old-path code. The second removes the record from the table.
4. **Have a reminder command.** Flags past `remove_by` are sent to the team channel every week.

```php
// app/Console/Commands/StaleFlags.php (handle method)
$stale = FeatureFlag::whereNotNull('remove_by')
    ->where('remove_by', '<', now()->toDateString())
    ->get(['key', 'owner', 'remove_by']);

foreach ($stale as $flag) {
    $this->warn("{$flag->key} (owner: {$flag->owner}) overdue since {$flag->remove_by}");
}
```

A simple rule I tell the team: a flag is scaffolding, not part of the house. When the building is done, it has to come down.

## Summary

Database-backed feature flags are the cheapest and most effective rollback tool for a small team. Set the default to off, use a short cache, keep a log of changes, and pair them with expand/contract migrations. But what keeps them from becoming debt is the discipline of deleting them: every flag must have an owner and a removal date from day one. If you want to go further on deploy rules for the whole system, read [Deploy freeze and branch-merge policy](/en/blog/deploy-freeze-branch-merge-policy).
