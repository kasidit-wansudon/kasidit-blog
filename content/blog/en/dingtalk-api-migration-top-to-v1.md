---
title: "Migrating a DingTalk Integration from the Old TOP API to API v1.0"
date: "2026-09-23"
excerpt: "A plan for migrating a DingTalk integration from the old TOP API to API v1.0: auditing call sites, access tokens, testing and staged rollout."
tags: ["dingtalk", "api", "migration", "laravel"]
---

Several internal systems I look after connect to DingTalk for login, approval webhooks, and sending messages. Many of those integration points were written long ago on the older API generation (which many people call the TOP API or oapi). This year I led the migration of the **DingTalk API from TOP to v1.0**. This post is the plan I actually used, from the audit and token handling through testing and rollout.

## Why migrate

DingTalk's newer API (v1.0) has a more consistent shape. It is REST using JSON for both request and response, and it passes the access token in a header instead of the query string. New features often arrive on v1.0 first or only on v1.0. Staying on the old API is technical debt whose interest keeps growing.

But the reason I actually started was that the DingTalk integration code is spread across several systems, and each system wrote its own way of requesting tokens, caching them, and handling errors. So this migration was a chance to bring everything into one place.

## Step 1: Audit every call site

Before writing new code, I grepped every repository for calls to the old API's domain and built a table:

- Which system calls which endpoint
- What it is used for (login, user data, approval, messages)
- Whether that endpoint has an equivalent on v1.0, and how the fields differ
- Business importance, meaning who is affected if it breaks

This table became the rollout plan by itself. Low-importance endpoints with clear equivalents move first, while login and approval, which everyone uses every day, move last.

## Step 2: Manage access tokens in one place

Both API generations use access tokens with a limited lifetime. A mistake I often found in the old code was requesting a new token on every request, which is both slow and at risk of hitting rate limits.

On v1.0, you request a token with `appKey` and `appSecret` and send it in the `x-acs-dingtalk-access-token` header. I wrote a central client that caches the token and renews it before it expires:

```php
<?php

namespace App\Services\DingTalk;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class DingTalkClient
{
    private const BASE = 'https://api.dingtalk.com';

    public function token(): string
    {
        return Cache::remember('dingtalk:v1:token', now()->addMinutes(100), function () {
            $res = Http::post(self::BASE . '/v1.0/oauth2/accessToken', [
                'appKey'    => config('services.dingtalk.app_key'),
                'appSecret' => config('services.dingtalk.app_secret'),
            ])->throw()->json();

            return $res['accessToken'];
        });
    }

    public function get(string $path, array $query = []): array
    {
        return $this->request()->get(self::BASE . $path, $query)->throw()->json();
    }

    public function post(string $path, array $body = []): array
    {
        return $this->request()->post(self::BASE . $path, $body)->throw()->json();
    }

    private function request()
    {
        return Http::withHeaders(['x-acs-dingtalk-access-token' => $this->token()])
            ->timeout(10)
            ->retry(2, 200);
    }
}
```

The token lasts about two hours. I cache it for less than that to leave some margin. If you have multiple servers, you need a shared cache such as Redis, not a per-machine file cache, otherwise each machine will request its own token.

`appKey` and `appSecret` are read from config that comes from the environment or a secrets manager. Never hardcode them in the code.

## Step 3: An adapter instead of editing every call site

Instead of editing every place that calls the old API to call the new one, I created a central interface, such as `getUser` and `sendWorkNotice`, with two implementations: one calls the old API and the other calls v1.0. Each system's code calls only through the interface.

The benefits are:

- You can switch generations with config per feature, with no new deploy
- Differing fields are converted in one place, such as field names that changed format
- Rollback means changing the config back, an idea I described in [Feature flags for fast rollback](/en/blog/feature-flags-fast-rollback)

During the same period, I also consolidated QR login and JSAPI signing into a shared central service. New systems no longer have to write that part themselves.

## Step 4: Testing

- **Contract tests**: call real endpoints with a test app and compare the output of both adapters, to check they return the same data after field conversion
- **Shadow calls**: in the early period, have the system call both generations, use the result from the old one, but log the differences in the result from the new one. This approach caught several edge cases that are not in the documentation.
- **Token expiry tests**: delete the cache while the system is in use and check that the client requests a new token correctly without users seeing an error
- **Error tests**: check that v1.0 errors, which have a different format from the old generation, are converted into messages our systems understand

## Step 5: Roll out in stages

The order I used:

1. Non-critical read endpoints, such as department data
2. Sending notification messages
3. The approval webhook, which already has a scheduled recovery job to catch missed events
4. Login last, opened to a small group first and then expanded

Between each step, I left some time for real use, watched the error and latency logs before moving on, and avoided periods with a deploy freeze.

## Summary

Migrating DingTalk from the TOP API to v1.0 is not just changing a URL. Start by auditing every call site, bring access token handling into one central client with correct caching, use an adapter so you can switch generations by config, test with shadow calls, and roll out from the least important parts to the most important. Done this way, users barely notice that a migration happened.
