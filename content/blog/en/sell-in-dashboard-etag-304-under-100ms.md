---
title: "Dashboard from ~300ms to Under 100ms with Set Lookup and ETag/304"
date: "2026-10-07"
excerpt: "Cut dashboard latency from about 300ms to under 100ms with Set lookup and ETag/304 caching in Laravel, with code examples you can use in real projects."
tags: ["laravel", "performance", "caching", "php"]
---

While building the Sell-in Dashboard at OPPO Mexico (Laravel 12 + PostgreSQL), users complained that every filter click felt "laggy". It wasn't slow enough to be unusable, but slow enough to notice. I measured about ~300ms per interaction. After two main changes, **Set lookup** and **ETag/304 caching** in Laravel, the number dropped below 100ms. This post walks through both techniques with example code.

## Measure Before Fixing

Before touching any code, I split the time into three parts: query time, PHP processing time, and network transfer time. What I found was that the queries weren't as slow as I assumed, because the data sits in PostgreSQL with good indexes already. Most of the time went to PHP looping over data to match records, and to sending the same JSON payload again and again even though the data hadn't changed.

If I had skipped this step, I would have wasted time tuning queries that weren't the problem.

## Technique 1: Replace in_array with Set Lookup

The original code had this pattern hidden in several places: loop over the sales rows, then check whether the product code is in the list the user selected.

```php
// Before: in_array is O(n) per call -> O(n * m) overall
$selected = $request->input('product_ids', []);

$rows = $orders->filter(function ($order) use ($selected) {
    return in_array($order->product_id, $selected);
});

// After: build a hash set once, lookup is O(1)
$selectedSet = array_flip($request->input('product_ids', []));

$rows = $orders->filter(function ($order) use ($selectedSet) {
    return isset($selectedSet[$order->product_id]);
});
```

PHP has no built-in Set type, but an array that uses values as keys behaves like a hash set. `array_flip` builds it once, and `isset` checks in constant time. If the selection has hundreds of items and the data has tens of thousands of rows, the difference is obvious.

A caveat: `array_flip` only works with string or integer values. Also, values from a request may be strings while data from the database is integers. PHP automatically converts numeric keys, but you should test this case to be sure.

The same principle applies to in-memory joins: instead of calling `firstWhere` inside a loop, build a map once with `keyBy('id')` and look things up by key.

## Technique 2: ETag and 304 Not Modified

The dashboard is left open all day, and the frontend fetches the same data again every time the user switches tabs or hits refresh. But sell-in data only changes during the scheduled sync, not every second.

ETag fits this problem exactly. The server sends a hash of the response in the `ETag` header. The browser stores it and sends it back in `If-None-Match` on the next request. If the hash matches, the server replies `304 Not Modified` with no body, and the browser uses the data in its own cache.

The Laravel middleware:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetETag
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (! $request->isMethod('GET') || $response->getStatusCode() !== 200) {
            return $response;
        }

        $etag = '"' . md5($response->getContent()) . '"';
        $response->headers->set('ETag', $etag);
        $response->headers->set('Cache-Control', 'private, no-cache');

        if ($request->headers->get('If-None-Match') === $etag) {
            $response->setNotModified();
        }

        return $response;
    }
}
```

`Cache-Control: private, no-cache` tells the browser it may store the response but must ask the server every time before using it, which is what we want. The data never goes stale, but it doesn't need to be sent again. `private` matters because the data depends on the user's permissions, so intermediate proxies must not store it and share it.

Laravel already has a `cache.headers` middleware that supports an `etag` option. If it meets your needs, use that. I wrote my own because I wanted to control the headers for our specific case.

## Making ETag Even Cheaper

The middleware above still has to build the whole response before it can hash it. What it saves is network transfer and client-side JSON parsing. If you want to save on the server side too, build the ETag from a "data version" instead, for example the last sync time combined with the request's filters, and check `If-None-Match` **before** running any query. If it matches, return 304 immediately.

This works well when data changes on a known schedule, such as a system that reads from a read-only mirror synced on a timetable, which I wrote about in [a PostgreSQL read-only mirror synced on a schedule](/en/blog/postgres-read-only-mirror-scheduled-sync).

## Verify That ETag Really Works

After deploying, I opened the DevTools Network tab and checked two things: the first request must return `200` with an `ETag` header, and the next request, when the data hasn't changed, must return `304` with a response size of only a few hundred bytes. If you still get `200` every time, a common cause is that the response contains a value that changes on every request, such as a timestamp generated at response time or a CSRF token, so the hash never matches. Another cause is a proxy or compression layer that modifies the ETag along the way. You have to check the whole path, not just Laravel.

## Results and Lessons Learned

After combining both techniques, most dashboard interactions dropped from ~300ms to under 100ms. Users stopped complaining about lag, without adding servers or changing the architecture.

Lessons I took away:

- **Always measure each part separately first.** What's slow may not be the database.
- **O(n × m) hides in innocent-looking code.** `in_array` and `firstWhere` inside loops are the first suspects.
- **Data that hasn't changed shouldn't be sent again.** ETag/304 adds a few lines of code but helps every repeated request.
- **Watch permissions.** A response that depends on the user must always be `private`.

## Summary

Making a dashboard faster doesn't have to start with changing the stack. In my case, two basic techniques were enough to bring latency from ~300ms to under 100ms: replacing array lookups with a Set using `array_flip` and `isset`, and adding ETag/304 caching in Laravel. Start by measuring where the time goes, then fix that spot.
