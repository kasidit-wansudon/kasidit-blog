---
title: "Signing TikTok Shop API Requests with HMAC-SHA256 in PHP and Node.js"
date: "2026-03-25"
excerpt: "How to sign TikTok Shop API requests with HMAC-SHA256 in PHP and Node.js: the canonical string, common mistakes, and how to test signing correctly first time."
tags: ["api", "hmac", "php", "nodejs", "tiktok-shop"]
---

When I first connected to the TikTok Shop API, I spent more time fighting the `invalid sign` error than writing the actual logic. The problem wasn't HMAC-SHA256 itself, but building the string to sign so that it matches the server's, character for character. This post summarizes the principles of signing TikTok Shop API requests, with PHP and Node.js code and the testing approach that stopped me from guessing.

Note: the spec details may change between API versions, so always check the official TikTok Shop documentation for the version you use. The code below is the basic structure I use.

## How HMAC Signing Works

The idea is that both we and the server hold the same app secret. We build a "canonical string" from the request and compute HMAC-SHA256 with the secret, producing a signature that we attach to the request. The server does the same thing and compares. If they match, the request came from us and wasn't altered along the way.

So the only thing you must get right is that **the canonical string is identical, byte for byte**.

## Building the Canonical String

The general structure for the TikTok Shop API goes roughly like this:

1. Take all query parameters except `sign` and `access_token`
2. Sort by key in character order (ASCII order)
3. Concatenate as `key` + `value` with no separator
4. Put the API path in front
5. If there is a request body that isn't multipart, append the body (JSON string) at the end
6. Wrap the whole thing with the app secret at both the start and the end
7. Compute HMAC-SHA256 with the app secret and convert to lowercase hex

## PHP Code

```php
<?php

function tiktokSign(string $path, array $query, string $body, string $secret): string
{
    unset($query['sign'], $query['access_token']);
    ksort($query, SORT_STRING);

    $input = $path;
    foreach ($query as $key => $value) {
        $input .= $key . $value;
    }
    $input .= $body;

    $input = $secret . $input . $secret;

    return hash_hmac('sha256', $input, $secret);
}

$query = [
    'app_key'   => 'your_app_key',
    'timestamp' => (string) time(),
    'shop_cipher' => 'your_shop_cipher',
];
$body = json_encode(['page_size' => 20], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

$query['sign'] = tiktokSign('/order/202309/orders/search', $query, $body, getenv('TIKTOK_APP_SECRET'));
```

## Node.js Code

```javascript
import crypto from "node:crypto";

export function tiktokSign(path, query, body, secret) {
  const keys = Object.keys(query)
    .filter((k) => k !== "sign" && k !== "access_token")
    .sort();

  let input = path;
  for (const k of keys) input += k + String(query[k]);
  input += body ?? "";
  input = secret + input + secret;

  return crypto.createHmac("sha256", secret).update(input, "utf8").digest("hex");
}

const query = {
  app_key: "your_app_key",
  timestamp: Math.floor(Date.now() / 1000).toString(),
  shop_cipher: "your_shop_cipher",
};
const body = JSON.stringify({ page_size: 20 });
query.sign = tiktokSign("/order/202309/orders/search", query, body, process.env.TIKTOK_APP_SECRET);
```

## Common Mistakes

**1. The body you sign isn't the body you send.** This is the number one cause. We compute the signature from one JSON string, but the HTTP client serializes it again, and the key order or whitespace changes, so the signature is wrong. The fix is to serialize once and send that exact same string as the raw body.

**2. JSON escaping differs between languages.** PHP's `json_encode` by default escapes `/` as `\/` and escapes unicode characters, while Node doesn't. If you use PHP, always pass `JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE`.

**3. Locale-based sorting.** Use `ksort` with `SORT_STRING`, and the plain `.sort()` in JS. Don't use `localeCompare`, because the order may not be ASCII.

**4. Wrong timestamp unit or a drifting clock.** Send seconds, not milliseconds, and the server must sync its time via NTP. If the clock drifts too far, requests get rejected.

**5. Path mismatch.** Don't put the domain or query string in the path you sign, and watch for a trailing `/` on the path.

**6. Non-string values.** Booleans or numbers get converted to strings differently in some languages (`true` vs `1`). Convert them to strings explicitly yourself before signing.

## Test Strategy

I don't start by testing signing against the real API, because the server's error only says "wrong" and not where. The steps I use are:

- **Golden test**: prepare a fixed set of inputs (path, query, body, a fake secret) and compute the expected signature. Write unit tests in both PHP and Node that produce the same value. If the two languages don't match, the problem is definitely in the canonical string.
- **Log the canonical string in dev**: print the string before hashing (dev only, and never with a real secret in the logs). You'll see immediately whether the body was escaped.
- **Test special values**: an empty body, Thai or Spanish text in the body, parameters whose values are numbers.
- **Integration test against a read-only endpoint**, such as fetching shop info, before trying an endpoint that writes data.

## Keep the Signing Code in One Place

Another lesson: don't let each endpoint build its own signature. I made a single HTTP client wrapper that takes the path, query, and body and handles everything in order: add `app_key` and `timestamp`, serialize the body, compute the sign, attach the access token in the header, and send. The benefits are:

- Fix a signing bug once and every endpoint benefits at the same time
- Log requests with sensitive values stripped from a single point
- Easily add retries for temporary errors such as rate limits, as long as you generate a new timestamp and sign again on every retry instead of resending the old sign

As for the secret, it must live only in an env variable or a secret manager. Never hardcode it in code or put it in a test fixture as a real value.

## Summary

HMAC-SHA256 is the easy part. The hard part is making the canonical string match the server's, byte for byte. Serialize the body once and send the same string, watch JSON escaping in PHP, sort keys in ASCII order, send the timestamp in seconds, and write a golden test that both languages must pass with identical results. Do this and an `invalid sign` error becomes something you can debug in a few minutes.
