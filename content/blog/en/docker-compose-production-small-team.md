---
title: "Docker Compose in Production for Small Teams: Healthcheck, Env, Deploy"
date: "2026-04-01"
excerpt: "Run production on Docker Compose safely as a small team: healthchecks, env files, near zero-downtime deploys and backups, with a sample compose file."
tags: ["docker", "docker-compose", "devops", "deploy"]
---

Many people say Docker Compose should not be used in production, but for a small team looking after a few internal systems on a few machines, Kubernetes is often more burden than benefit. I have used Docker Compose in production for several systems, and I have found it sufficient if we pay attention to four things: healthchecks, env files, the deploy method, and backups.

## When Docker Compose in production fits

- A team of 1-5 people with no full-time infra person
- Systems run on one or a few machines
- A few seconds of downtime during deploys is acceptable
- You want dev and production to look the same

If you need to auto-scale across dozens of nodes or need truly zero downtime, that is the time to think about an orchestrator.

## Sample compose file

This is the structure I use for a typical Laravel app, with an app, a queue worker, nginx, and PostgreSQL.

```yaml
services:
  app:
    image: registry.example.com/orders-app:${APP_TAG}
    env_file: .env.production
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "php", "artisan", "app:health"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 20s

  worker:
    image: registry.example.com/orders-app:${APP_TAG}
    env_file: .env.production
    restart: unless-stopped
    command: ["php", "artisan", "queue:work", "--tries=3", "--max-time=3600"]
    depends_on:
      app:
        condition: service_healthy

  nginx:
    image: nginx:1.27-alpine
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      app:
        condition: service_healthy

  db:
    image: postgres:16
    restart: unless-stopped
    env_file: .env.db
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  db_data:
```

## Healthcheck: don't let a container be "running" but not "ready"

The most common problem is a container showing a running status while the app still cannot connect to the database, and then nginx sends requests in and you get a 502.

A healthcheck fixes this. The key points are:

- **Check the real thing,** not just that the process is still alive. The health endpoint should briefly try the database and the cache.
- **Use `depends_on` with `condition: service_healthy`** so the start order is correct
- **Set `start_period`** so the app has time to boot before failures are counted
- **The health check must be fast.** If it is slower than the timeout, it becomes a false alarm.

## Env file: keep them separate and out of git

My rules are few.

- Separate env by service (`.env.production`, `.env.db`) so the app does not see the database superuser password unless necessary
- The real env files live only on the server. Git has only `.env.example` with no real values.
- Set permissions so only the user running the deploy can read them
- Very sensitive values, such as the key for encrypting personal data, should live in a secret manager and be fetched at runtime, which I described in [Encrypting PII with AES-256 and Secrets Manager](/en/blog/encrypt-pii-aes-256-secrets-manager)
- Use the image tag through a variable (`APP_TAG`) so a rollback is just changing the tag back

## Near zero-downtime deploys

Compose has no built-in rolling update, but you can make downtime very short with these steps.

1. Build and push an image with a new tag from CI
2. On the server: run `docker compose pull` first, so download time is not part of the downtime
3. Run a backward-compatible migration before switching code
4. `docker compose up -d --no-deps app worker` to recreate only the services that changed
5. Wait for the healthcheck to pass, then smoke test the main page
6. If it breaks: set `APP_TAG` back to the previous value and run `up -d` again

The thing to watch is that a migration must not break the older code version. For example, do not drop a column in the same round that you stop using it. Split it into two deploys.

The queue worker needs care too. Use `--max-time` and run `queue:restart` before recreating, so jobs in progress can finish first.

## Backup: if you have never restored, you do not have a backup

The database volume is the one thing that cannot be recovered once lost. I do backups like this:

- A cron job runs `pg_dump` through `docker compose exec` every night, compresses it, and puts the date in the file name
- Send the file off the machine, for example to object storage in a different place from the server
- Keep history for the period the team agreed on, and delete old ones automatically
- **Test restores regularly** onto an empty database, then check the row counts of the main tables

The last step is the one most teams skip, and it is what will save you on your worst day.

## Logs and daily care

A small team does not have time to watch dashboards all day. What I set up:

- Configure the logging driver to rotate, for example `max-size` and `max-file`, otherwise the logs of a container that errors in a loop will fill the disk within a few days
- Use `docker compose ps` and `docker compose logs --since 10m app` as the first commands when someone reports a problem, and write them in the runbook so everyone on the team knows
- Set up a small cron job that checks whether any container is unhealthy and sends an alert to the team chat channel
- Clean up unused old images periodically, but keep the latest two or three tags in case of rollback

## Checklist before going live

- Every service has `restart: unless-stopped`
- Every service that others depend on has a healthcheck
- No secrets in the compose file or git
- The database port is not exposed outside the machine
- Logs rotate so the disk does not fill up
- There is a backup and it has been restored successfully at least once
- Rollback is a single command and everyone on the team knows it

## Summary

Docker Compose in production works well for small teams if we do not treat it as just a dev tool. Add healthchecks that check the real thing, separate env files safely, deploy with image tags so rollback is easy, and test restoring backups for real. That is enough to keep internal systems running steadily without carrying the complexity of an orchestrator.
