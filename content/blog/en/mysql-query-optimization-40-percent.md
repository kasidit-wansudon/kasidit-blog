---
title: "MySQL Query Optimization: Cutting Main Query Latency by Over 40%"
date: "2026-02-04"
excerpt: "MySQL query optimization steps that cut my main query latency by over 40%: EXPLAIN, composite and covering indexes, and removing N+1, with real examples."
tags: ["mysql", "database", "performance", "laravel"]
---

Most of my work as a full-stack developer is on internal systems used for operations across several countries. Data grows every day, and screens that opened quickly last year start getting slow even though nobody changed the code. MySQL query optimization has become work I come back to periodically. Most recently I cut the latency of a group of main queries by over 40% without adding a single server. This post is the process I use, in the order I actually do it.

## 1. Measure First, Do Not Guess

Before touching any index, I turn on the slow query log and note the slowest queries along with how often they are called. A query that takes 2 seconds but runs once a day matters less than a query that takes 200 ms but runs every time a user opens the dashboard.

What I note for each query:

- Average time and worst time
- Number of calls per day
- Which screen or API calls it

This set of numbers is the baseline. Without a baseline, we cannot know whether a fix really improved things or just feels faster.

## 2. Learn to Read EXPLAIN

`EXPLAIN` is the most worthwhile tool for MySQL query optimization. Four columns I look at first:

- `type`: if you see `ALL`, that means a full table scan, which is often the root cause
- `key`: the index MySQL actually chose (not the one we think it will use)
- `rows`: the estimated number of rows to read; the lower the better
- `Extra`: watch out for `Using filesort` or `Using temporary`

A common example is an order list page that filters by status and date range, then sorts by latest date.

```sql
EXPLAIN
SELECT id, customer_id, total, created_at
FROM orders
WHERE status = 'paid'
  AND created_at >= '2026-01-01'
ORDER BY created_at DESC
LIMIT 50;
```

If the table only has a single index on `status`, the result is usually reading every row where `status = 'paid'` and then sorting in memory, which gets slower as the number of orders grows.

## 3. Order Composite Index Columns Correctly

My rule is that columns compared with equality (`=`) come first, followed by range columns (`>=`, `BETWEEN`) or columns used for sorting.

```sql
ALTER TABLE orders
  ADD INDEX idx_orders_status_created (status, created_at);
```

With the index ordered as `(status, created_at)`, MySQL jumps to the `paid` group and walks `created_at`, which is already sorted. `Using filesort` disappears, and `rows` drops from hundreds of thousands to tens. If you swap the order to `(created_at, status)`, the index helps much less, because the date range condition prevents using the next column.

A caution: do not index every column. Every index slows down `INSERT` and `UPDATE` and uses disk space. I add an index only when a real query benefits, and I drop redundant ones. For example, if `(status, created_at)` exists, a single index on `status` is usually unnecessary.

## 4. Covering Indexes for Frequently Called Queries

If a query fetches only a few columns and all of them are in the index, MySQL does not need to go back and read the actual table rows. In `EXPLAIN` you will see `Using index` in `Extra`.

This suits count or summary queries on a dashboard, such as counting orders per status per day. I use this technique selectively, because an index that is too wide has a cost too.

## 5. Eliminate N+1 in the Application Layer

A slow query is not always in the SQL. Often the culprit is an ORM firing one query per row. In Laravel, the classic example is:

```php
// N+1: 1 query for orders + N more queries for customer
$orders = Order::where('status', 'paid')->latest()->take(50)->get();
foreach ($orders as $order) {
    echo $order->customer->name;
}

// Fix with eager loading: down to 2 queries
$orders = Order::with('customer:id,name')
    ->where('status', 'paid')
    ->latest()
    ->take(50)
    ->get();
```

The easiest way to catch N+1 is to enable the query log during development and count queries per request. If one screen fires hundreds of queries, there is almost certainly an N+1 hiding. In newer Laravel versions you can also call `Model::preventLazyLoading()` in the development environment so lazy loading throws an error immediately.

## 6. Select Only the Columns You Use

`SELECT *` looks harmless, but if the table has long text or JSON columns, fetching every column sends far more data over the network than needed and prevents covering indexes from being used. So I always specify columns in frequently called queries.

## 7. Measure Again After the Fix

After adding an index or changing code, I measure again the same way as the baseline, every time. Sometimes a new index makes one query faster but another slower, because the optimizer changed its plan. Re-measuring is the only way to know.

I also keep a short checklist before deploying an index change to production:

- Try the `ALTER TABLE` on a copy of data of similar size first, to know how long it takes
- Choose a time when there are few users
- Prepare a `DROP INDEX` statement as the rollback

## Summary

Cutting latency by over 40% did not come from a secret technique, but from doing the basics in order: measure a baseline, read `EXPLAIN`, design composite indexes to match query patterns, use covering indexes for frequently called queries, eliminate N+1 in code, select only the columns you use, and re-measure every time. If you are just starting, begin with the three most frequently called queries. The results are usually worth more than trying to fix everything at once. Other lessons from last year are in [Lessons From 2025 in Full-Stack](/en/blog/lessons-from-2025-full-stack).
