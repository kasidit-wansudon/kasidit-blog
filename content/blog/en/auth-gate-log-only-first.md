---
title: "Run an Auth Gate in Log-Only Mode Before Enforcing It"
date: "2026-09-16"
excerpt: "Roll out a new auth gate in log-only mode first, use logs to chase failures from old app builds, then enforce safely, with Laravel middleware code."
tags: ["security", "laravel", "auth", "rollout"]
---

Adding new authorization checks to a system that already has users carries a risk people tend to underestimate: if the check is too strict, or some clients are not ready, real users get locked out immediately. When I added a staff-token **auth gate** to an internal system, I turned it on in **log-only** mode first, collected data on who would be blocked, fixed things until the count was zero, and only then enforced. This post covers the whole process.

## Why Not Enforce Right Away

In a system with many clients, such as the web, several versions of a mobile app, automated scripts and webhooks from external systems, we almost never know completely who calls which endpoint with which headers.

Mobile apps are the biggest problem, because users do not update at the same time. Old builds that do not send the new token will stay on users' devices for weeks. If you enforce on day one, these users open the app and cannot use it at once, and the helpdesk team cannot keep up with the calls.

Log-only changes the question from "will it break if we enforce?", which cannot be answered, to "if we enforce today, how many requests would be blocked, and where do they come from?", which can be answered with real data.

## Middleware With Two Modes

The core is a single middleware that works in both modes, switched by config:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class StaffTokenGate
{
    public function handle(Request $request, Closure $next): Response
    {
        $mode = config('auth_gate.mode', 'log'); // off | log | enforce

        if ($mode === 'off') {
            return $next($request);
        }

        $failure = $this->check($request);

        if ($failure !== null) {
            Log::channel('auth_gate')->warning('auth_gate.fail', [
                'reason'      => $failure,
                'mode'        => $mode,
                'route'       => optional($request->route())->getName(),
                'app_version' => $request->header('X-App-Version', 'unknown'),
                'platform'    => $request->header('X-Platform', 'unknown'),
                'user_id'     => optional($request->user())->id,
            ]);

            if ($mode === 'enforce') {
                return response()->json(['message' => 'Unauthorized'], 401);
            }
        }

        return $next($request);
    }

    private function check(Request $request): ?string
    {
        $token = $request->bearerToken();

        if (! $token) {
            return 'missing_token';
        }

        if (! app(StaffTokenVerifier::class)->verify($token)) {
            return 'invalid_token';
        }

        return null;
    }
}
```

Deliberate choices:

- **There is an `off` mode** as the last way back if the middleware itself has a bug
- **Log the reason by type.** `missing_token` and `invalid_token` indicate different problems. The first is usually an old client; the second may be a bug on the token-issuing side or an attack.
- **Log the app version and platform.** This is the data that makes it possible to actually chase problems.
- **Do not log the token itself.** More people can read logs than you think. Never store credentials in them.

## Chasing Failures From the Log

After turning on log-only, I summarized the log every day, grouped by `reason`, `app_version`, `platform` and `route`. The picture was very clear:

1. **Old mobile app builds.** Almost all `missing_token` came from app versions before token sending was added. The fix is to enforce a minimum app version and notify users in advance.
2. **Internal scripts and integrations.** Some automated jobs call the same endpoints without any token, and for some nobody remembered they existed. The fix is to move them onto service credentials.
3. **Endpoints that should not be behind the gate.** Some routes, such as health checks or external webhooks, should never have been checked for a staff token. They had to move to a different kind of check.
4. **A real bug in token issuing.** A small number of `invalid_token` came from expired tokens that the app did not refresh. If we had enforced first, this bug would have been seen as a user problem.

Each group became one task with an owner and a due date. I tracked the number of failures per day until only what we truly intended to block remained.

## How to Know You Are Ready to Enforce

I set criteria in advance rather than deciding by feel. The criteria: log-only must run for several full business days, including the start and end of the month when special jobs run, because some jobs run only once a month; the failing requests must be only groups we know and intend to block; and the minimum app version must already be enforced. If any one of these is not met, we do not enforce yet, even if we are past the planned date.

## Enforce Safely

Once the numbers are stable, enforcing is changing a single config value, but I still do it in steps:

1. **Enforce one route group at a time,** starting with the routes whose logs are cleanest
2. **Choose a time when the team is ready.** Do not enforce on Friday evening or during a deploy freeze.
3. **Prepare the rollback.** Rolling back means switching the mode to `log`, which takes a few seconds. Write it in the runbook before you start.
4. **Tell the helpdesk in advance,** with ready-made answers for users who have not updated the app
5. **Keep logging after enforcing.** Blocked requests must still be recorded so you can see whether new groups appear.

The same idea works for other rollouts that are hard to reverse. I wrote about using flags as a way back in [Feature flags for fast rollback](/en/blog/feature-flags-fast-rollback).

## Summary

When adding an auth gate to a system that already has users, start in log-only mode that records the reason, app version, platform and route of every request that would be blocked. Use that data to fix things group by group, including old app builds, forgotten scripts and routes that should not be behind the gate. Then enforce part by part, with a way back that can be switched in a few seconds. Added security should not be paid for with users locked out unnecessarily.
