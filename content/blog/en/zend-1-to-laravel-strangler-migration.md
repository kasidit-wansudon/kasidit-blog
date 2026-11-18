---
title: "Migrating Zend Framework 1.12 to Laravel with the Strangler Pattern"
date: "2026-07-01"
excerpt: "Migrate Zend Framework 1.12 to Laravel module by module with the strangler pattern: split routing, share session and database, and order modules safely."
tags: ["laravel", "zend", "legacy", "migration", "php"]
---

One piece of work I'm leading right now is migrating the Sell-in and WMS system, written in Zend Framework 1.12, to Laravel. The system has daily users and holds important data such as sales orders, purchase orders, and IMEI tracking. Rewriting everything and switching over at once (a big bang rewrite) is too risky, so I'm using the strangler pattern to move from Zend 1 to Laravel one module at a time. This post explains the routing structure, how session and database are shared, and the order for migrating modules.

## What Is the Strangler Pattern

The idea is to place the new system next to the old one and gradually move pieces over to the new system. Users visit the same URLs, but some paths are sent to Laravel and some still go to Zend, until finally the old system has no paths left to serve and can be shut down.

Advantages for a system that must stay in daily use:

- Migrating one module at a time means that if something breaks, you roll back only that module
- You deliver value all along the way, without waiting months
- The team learns the old system piece by piece instead of having to understand all of it before starting

## 1. Routing: Let the Web Server Do the Splitting

The way I like best is to split at the web server level, because the two apps don't need to know about each other at all. An example with Nginx and PHP-FPM:

```nginx
server {
    listen 80;
    server_name app.example.com;

    # Migrated modules -> Laravel
    location ~ ^/(sales-orders|purchase-orders|api/v2)(/|$) {
        root /var/www/laravel/public;
        try_files $uri /index.php?$query_string;
    }

    # Everything else -> Zend 1
    location / {
        root /var/www/zend/public;
        try_files $uri /index.php?$query_string;
    }

    location ~ \.php$ {
        # Choose the root based on the prefix that came through
        set $app_root /var/www/zend/public;
        if ($request_uri ~ ^/(sales-orders|purchase-orders|api/v2)(/|$)) {
            set $app_root /var/www/laravel/public;
        }
        fastcgi_pass unix:/run/php-fpm/www.sock;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $app_root/index.php;
    }
}
```

With Apache you can do the same thing using a `RewriteRule` that points specific prefixes to Laravel's `public/index.php`.

Every time a module is finished, you just add its prefix to the regex and reload the web server. Rolling back means removing the prefix, which takes under a minute.

## 2. Sharing Session Between the Two Systems

Users must log in once and be able to use both sides, but Zend 1 uses native PHP sessions while Laravel has its own session with a differently encrypted cookie format. So the two apps can't read each other's sessions directly.

The route I chose is to let the old system keep owning login for now. When login succeeds, Zend writes a small key to a shared Redis (session id pointing to a user id), and Laravel reads that key through middleware instead of parsing PHP's session directly:

```php
<?php
// app/Http/Middleware/LegacySessionAuth.php
namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Support\Facades\Auth;

class LegacySessionAuth
{
    public function handle($request, Closure $next)
    {
        if (!Auth::check()) {
            $sid = $request->cookie(config('legacy.session_cookie', 'PHPSESSID'));
            $userId = $sid ? $this->readLegacyUserId($sid) : null;
            if (!$userId) {
                return redirect('/login'); // Zend login page
            }
            Auth::login(User::findOrFail($userId));
        }
        return $next($request);
    }

    private function readLegacyUserId(string $sid): ?int
    {
        if (!preg_match('/^[a-zA-Z0-9,-]{20,128}$/', $sid)) {
            return null;
        }
        // On login, the Zend app also writes "legacy_auth:<session id>" => user id
        // into a shared Redis, with the same TTL as its session.
        $userId = app('redis')->connection('legacy')->get('legacy_auth:' . $sid);
        return $userId ? (int) $userId : null;
    }
}
```

The details will differ by system, but the principles you need are:

- The shared data must live in storage both apps can reach, such as Redis or a database, not files on a single machine
- On logout or session expiry, Zend must delete this key too
- Always validate the session id format before using it
- Laravel must not overwrite Zend's session. Keep it read-only
- Once enough modules have been migrated, flip it around: let Laravel own login and have Zend read from it

## 3. Share the Database with Discipline

During the transition both systems use the same database, which is convenient but dangerous. The rules I use:

- **Each table has one owner** at any given time. Only the owning system may change the schema.
- **Laravel models use the existing table names** via `protected $table`, and disable timestamps if the old table has no `created_at`/`updated_at` columns.
- **Migrations must be backward compatible.** You may add columns, but never delete or rename them until all the Zend code that uses that column is gone.
- **Business logic lives in one place.** If both sides need to calculate the same totals or statuses, move that logic to Laravel and have Zend call it through an internal API, instead of writing it twice.

## 4. The Order for Migrating Modules

The wrong order can block the entire project. I order by these principles:

1. **Start with read-only modules**, such as reports or search pages. Risk is low, and you get to test routing and session for real.
2. **Follow with self-contained modules** that have few dependencies on other modules.
3. **Then the core modules that write data**, such as sales orders and purchase orders, one module at a time, with a feature flag for rolling back.
4. **Leave the most complex modules for later**, such as IMEI tracking, which touches almost every part, because by then the team will understand the old system well enough.
5. **Last are auth and the home page**, and only then shut down Zend.

Before migrating each module, I have the team write characterization tests that capture the existing behavior first. Even if some of the existing behavior looks strange, users may depend on it. Changing behavior is a separate piece of work after the migration is done.

## Summary

Migrating Zend Framework 1.12 to Laravel with the strangler pattern lets a system in daily use transition without downtime. Split routing at the web server so you can roll back in a minute, share session read-only through central storage, give every table a single owner, and order modules from least risky to most risky. If you'd like to read about the data design of the most complex module, see [schema design for IMEI tracking](/en/blog/imei-tracking-schema-design).
