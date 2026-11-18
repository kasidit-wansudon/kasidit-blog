---
title: "Lessons from 2025 Building Systems for 12 Countries as a Full-Stack Dev"
date: "2025-12-31"
excerpt: "Lessons from 2025 as a full-stack developer building tools for 12 countries: timezones, language, deploys, and communication I wish I had known at the start."
tags: ["career", "full-stack", "lessons", "laravel"]
---

The last day of the year is when I like to sit and review what I learned. In 2025 I worked as a full-stack developer building internal tools used in operations across 12 countries, with Laravel, Vue, MySQL, AWS, Cloudflare, and GitLab CI. This kind of work taught me many things I never met when building systems for a single client or a single country. This post collects the lessons I think apply to anyone building cross-country systems too.

## 1. Timezone is not a detail, it is design

The first problem you meet when one system is used in many countries is a simple question like "today's sales": whose today?

The rules I hold to after getting burned:

- Always store time in the database as UTC
- Convert to local time only when displaying and when building reports
- A daily report must state clearly which timezone it cuts off by

```php
// Cut off "today" by the country's timezone, then convert back to UTC before querying
$tz    = $country->timezone; // e.g. 'Asia/Bangkok'
$start = now($tz)->startOfDay()->utc();
$end   = now($tz)->endOfDay()->utc();

$total = Order::whereBetween('created_at', [$start, $end])->sum('total');
```

These few lines of code have prevented arguments about mismatched numbers many times.

## 2. Language and number formats need thinking from day one

Adding a language later always hurts more than preparing for it at the start. Every string should be in a translation file from the first line, even if there is only one language at the time. And remember that date, number, and currency formats differ in each country. I stopped formatting numbers by hand and use APIs that support locale instead.

## 3. As data grows, the system slows down by itself

A screen that opened fast at the start of the year was noticeably slower by mid-year with nobody changing the code, because data from many countries accumulates faster than you expect. This year I cut the latency of the main queries by more than 40% by going back to basics, including composite indexes and removing N+1 queries.

The lesson is that performance is not a one-time job. It needs periodic measurement, not waiting for users to complain.

## 4. A boring deploy is a good deploy

With users in many countries, there is never a time when "nobody is using the system" for real. So deploys have to be predictable and quick to roll back. What helped me most this year:

- Let GitLab CI run tests and build every time, not skipping even for small fixes
- Migrations must be compatible with the previous code version, so code can be rolled back without rolling back the database
- Record what was deployed every round, however small

## 5. Cache helps a lot if you know when to invalidate

I use Cloudflare for assets and some APIs. Speed improved clearly for users far from the server, but I also hit the classic problem of stale data. The lesson is that before caching anything, you must be able to answer when that data changes and how you will clear the cache. If you cannot answer, do not cache it yet.

## 6. Communication matters more than code

The work that took more time than I expected was not writing code but understanding how each country works differently. A process that looks the same on paper always has specific exceptions in practice.

What I started doing that worked:

- Ask users to walk through the real steps with sample data, not just say which feature they want
- Ship a demo early even if it is incomplete, because people point out problems on a screen more easily than on a document
- Write a short summary after every meeting so everyone understands the same thing

## 7. AI is a multiplier, not a replacement

This year I used AI more and more to help write code. It speeds up boring work a lot, but I have also lost time fixing bugs the AI created by guessing. What I learned is that AI multiplies what you already have. If you have discipline in checking, it multiplies speed. If you do not check, it multiplies mistakes.

## What I want to do differently next year

- Write documentation while working, not after the work is done
- Measure performance on a schedule, not wait until someone complains
- Write the blog regularly, to force myself to summarize what I learn, which is the same reason I [started this blog](/en/blog/why-i-write-this-blog)

## Summary

My 2025 lessons as a full-stack developer building systems for 12 countries: store time as UTC, prepare for language from day one, measure performance periodically, make deploys boring and rollback-able, cache when you know how to invalidate, invest in communication, and use AI with discipline. None of this is new, but it is the kind of thing you have to experience yourself before it really sticks.
