---
title: "Migrating PHP/MySQL From AWS to Alibaba Cloud ECS Without Downtime"
date: "2026-08-26"
excerpt: "A checklist for moving a production PHP/MySQL system from AWS to Alibaba Cloud ECS: inventory, data migration, DNS cutover, rollback plan and gotchas."
tags: ["devops", "alibaba-cloud", "aws", "migration", "mysql"]
---

This year I led a team moving a production system from AWS to Alibaba Cloud ECS. Most of the system was PHP and MySQL, the kind many companies still run. The hard part of this work is not the commands. It is "forgetting" something and finding out at 2 a.m. This post is the AWS to Alibaba Cloud migration checklist, rewritten in a neutral form that works for a typical PHP/MySQL stack.

## Phase 1: Inventory Before Touching Anything

The biggest mistake in a cloud migration is starting by creating the new machine when you do not yet know what is on the old one. I start by making a table of everything the system depends on:

- **Machines and services**: web server, PHP version, extensions used, cron, queue workers, supervisor
- **Database**: MySQL version, size, charset/collation, users and grants
- **Storage**: files on disk, files on object storage, paths hardcoded in code
- **External connections**: APIs that whitelist our IP, incoming webhooks, SMTP
- **Secrets and config**: `.env`, keys hardcoded in code (almost every old project has them)
- **DNS and SSL**: all records, current TTLs, how certificates are renewed

Basic commands that help build the inventory quickly on the old machine:

```bash
php -v && php -m                    # PHP version + extensions
crontab -l; ls /etc/cron.d/         # scheduled jobs
systemctl list-units --type=service --state=running
mysql -e "SELECT table_schema, ROUND(SUM(data_length+index_length)/1024/1024) AS mb
          FROM information_schema.tables GROUP BY table_schema;"
grep -rn "amazonaws.com" /var/www --include=*.php | head
```

The last line matters a lot, because old code is often tied directly to AWS endpoints without going through config.

## Phase 2: Prepare the Target Machine

- Create the ECS instance with an OS and PHP version as close to the old machine as possible. Do not use the move as a chance to upgrade PHP, because if it breaks you will not know what caused it.
- Security group opens only the ports needed. SSH is limited to the VPN only (I wrote how in [Moving SSH behind a VPN](/en/blog/vpn-only-ssh-access-small-team)).
- Install, then deploy the same code as production and run it against a test database first
- Make everything read from `.env`, with no hardcoded values pointing at the old machine

## Phase 3: Migrate the Data

For MySQL I split it into two rounds: a rehearsal and the real one.

```bash
# dump without locking tables (InnoDB)
mysqldump --single-transaction --routines --triggers --events \
  --default-character-set=utf8mb4 app_db | gzip > app_db.sql.gz

# on the target side
gunzip < app_db.sql.gz | mysql --default-character-set=utf8mb4 app_db
```

The rehearsal measures how long the dump and restore take. That number is the minimum downtime of the real run. If it is too long to accept, consider setting up replication instead.

After the restore, compare the row counts of the important tables on both sides and check that the charset matches. Thai, Spanish or Chinese text turning into question marks is a sign the collation does not match.

For files on disk, use `rsync` repeatedly before the real day. The final round will only have a small delta left.

## Phase 4: DNS Cutover

- **Lower the TTL at least 24-48 hours ahead** to 60-300 seconds
- Announce the maintenance window to users in advance
- On the day: turn on maintenance mode on the old machine, and stop cron and queue workers before the final dump
- Restore the data, run the final rsync, then test the new machine by editing `/etc/hosts` on your own machine
- Once it passes, change DNS and turn on cron and workers on the new machine

Never turn on cron on both sides at the same time, or some jobs will run twice, such as sending emails twice or syncing data over each other.

## Phase 5: Rollback Plan

The rollback plan must be written before the real day, not thought up when the system is broken. What I put in the plan:

- **The conditions for rolling back**, such as login not working, or an error rate above the threshold within the first 30 minutes
- **One decision maker**, no meeting needed
- **Steps**: point DNS back, bring up the old machine, and handle data written to the new machine in the meantime
- **Keep the old machine** for at least one to two weeks. You can stop it, but do not delete it yet.

## Gotchas to Know

- **Third-party IP whitelists.** Tell them the new IP in advance. Some take several days.
- **Object storage APIs are not 100% the same.** Even when they say S3-compatible, test upload, presigned URLs and ACLs for real.
- **SMTP port 25** is often blocked on new clouds. Use port 465/587 or an email-sending service instead.
- **OS and MySQL timezone.** Check they match, or daily reports will be off.
- **OS packages differ.** Each cloud's distro has different repositories, so installing some PHP versions may require finding an extra repo.
- **The hostname may be reset** after a reboot by cloud-init. If the app relies on the hostname, set it permanently.

I wrote down every step as a runbook as I went, following the idea in [Turn every deploy into a runbook](/en/blog/turn-every-deploy-into-runbook). The next time another system needs to move, it will go much faster.

## Summary

A successful migration from AWS to Alibaba Cloud ECS depends more on preparation than on execution: complete the inventory, rehearse the data move to measure time, lower the TTL in advance, write the rollback plan before the real day, and keep the old machine for a while. Do not upgrade anything at the same time as the move. Change one thing at a time, and the system will tell you what broke.
