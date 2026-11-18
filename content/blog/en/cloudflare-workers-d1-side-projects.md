---
title: "Why I Run Side Projects on Cloudflare Workers + D1"
date: "2026-05-27"
excerpt: "Why I chose Cloudflare Workers + D1 for side projects: cost, my wrangler deploy flow, a sample wrangler.jsonc, and the limits worth knowing before you commit."
tags: ["cloudflare", "workers", "d1", "side-project", "serverless"]
---

I work a full-time job, and I have a side studio called Kasion that builds several small apps. I have almost no time to look after servers. That is the main reason nearly all of Kasion's apps run on Cloudflare Workers + D1. This post covers why I chose this stack for side projects, the deploy flow I actually use, and the limits to know before you decide.

## Why Workers + D1

**1. No servers to look after**
My day job is already about deploys, rollbacks, and looking after production systems. I do not want to come home to a VM that needs patching, an SSL certificate to renew, or a disk to check for being full. Workers removes all of that.

**2. Very low starting cost**
Most side projects have few users at first, and many may never grow. Paying a monthly VM bill for an app with a handful of users a day is wasteful. Workers bills by usage and has a free tier that is enough for testing most ideas, so I can launch a new app without thinking hard about it. For the latest prices and quotas, check Cloudflare's pricing page directly, since they can change.

**3. D1 is SQLite, which I already know**
D1 is a database built on SQLite. I write SQL as usual, it has migrations, and there is no connection pool to set up. For apps without very large data, this is the right amount of simplicity.

**4. Fast deploys and easy rollbacks**
One command goes to production, and if it breaks you can go back to the previous version immediately. For someone who only has the evenings for side projects, the speed of this cycle matters a lot.

## Sample wrangler.jsonc

This is the basic config I use as the starting point for almost every project.

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "my-side-app",
  "main": "src/index.ts",
  "compatibility_date": "2026-05-01",
  "compatibility_flags": ["nodejs_compat"],
  "observability": {
    "enabled": true
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "my-side-app-db",
      "database_id": "<your-database-id>",
      "migrations_dir": "migrations"
    }
  ],
  "vars": {
    "APP_ENV": "production"
  }
}
```

Remember: do not put secrets in `vars`. Use `wrangler secret put` instead, because the config file is committed to git.

On the Worker code side, you use D1 directly through the binding.

```typescript
export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/notes") {
      const { results } = await env.DB
        .prepare("SELECT id, title, created_at FROM notes ORDER BY created_at DESC LIMIT ?")
        .bind(20)
        .all();
      return Response.json(results);
    }

    return new Response("Not found", { status: 404 });
  },
};
```

Always use `prepare().bind()`. Never build SQL by concatenating strings, same as with any other database.

## The deploy flow I use

1. Create the database with `wrangler d1 create my-side-app-db` and put the id in the config
2. Write migrations in the `migrations/` folder and run `wrangler d1 migrations apply my-side-app-db --local` to test locally
3. Develop with `wrangler dev`, which also runs D1 locally
4. Before going live, run the migration against the real database with `wrangler d1 migrations apply my-side-app-db --remote`
5. `wrangler deploy`
6. Open the logs and watch for a while to make sure there are no errors

I write these steps down as a runbook for every project, because a side project I have not touched in three months is one I will have completely forgotten. I expand on this idea in [Turn every deploy into a runbook](/en/blog/turn-every-deploy-into-runbook).

## Limits worth knowing

Workers + D1 is not right for every job. These are the ones I hit and think you should know before starting.

- **CPU time per request is limited.** Heavy computation, processing large files, or long-running jobs do not belong in a single request. You have to break them up with Queues or Workflows.
- **D1 has a maximum database size.** It suits small to medium app data. If you expect the data to grow a lot, design for splitting the database from the start.
- **Not every npm package works.** Even though `nodejs_compat` helps a lot, libraries that depend on native modules or the filesystem will not work.
- **Many concurrent writes.** D1 is not designed for high write throughput like a large database. If your app writes heavily, you need to think about this.

The exact limit numbers depend on the plan and change over time. I recommend reading the limits page in the official docs before choosing, and not trusting numbers from old blogs, including this one.

## When I do not choose Workers

My day job still uses Laravel on regular servers and Docker Compose, because there are many existing systems, they need to connect to internal databases, and the team knows that stack. So choosing a platform is not about what is best, but about what fits the constraints of that job. For side projects, the biggest constraint is my own time, so Workers wins.

## Summary

I run side projects on Cloudflare Workers + D1 because there are no servers to look after, the starting cost is low, I can deploy with wrangler in one command, and D1 uses the SQL I already know. But you need to know the limits on CPU time, database size, and package compatibility before starting. If your work fits within those bounds, this is a stack that lets you spend your time on the product instead of losing it to servers.
