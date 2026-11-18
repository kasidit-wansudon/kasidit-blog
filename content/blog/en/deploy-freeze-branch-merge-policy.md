---
title: "Deploy Discipline: Deploy-List, Branch-Merge Policy, Holiday Freeze"
date: "2026-08-12"
excerpt: "Deploy discipline for small teams: the deploy-list template, branch-merge policy and holiday deploy freeze I use across 6 internal systems, with templates."
tags: ["devops", "deploy", "git", "team-management", "process"]
---

As Technical Lead at OPPO Mexico, I looked after the deploys and rollbacks of more than 6 internal systems every day, including WMS, Canteen, Sellout, Attendance and others. About 200 back-office users depend on these systems every morning. What kept our small team from going down often was not expensive tools but three disciplines for deploying: a deploy-list, a branch-merge policy, and a holiday deploy freeze. This post shares all three with templates.

## Problems before we had deploy discipline

Before we had rules, the symptoms we saw often were:

- We deployed and nobody knew what had gone up, so when the system broke we had to go through commits one by one
- Two people's branches were merged at the same time and collided on production
- Someone deployed on a Friday evening before a long holiday, and nobody was around to fix it

All of this can be solved with a simple process that everyone follows the same way.

## 1. Deploy-list template

Every production deploy needs one deploy-list, written before the deploy, not after. I have the team post it in the team chat group or attach it to the merge request.

```markdown
## Deploy: <system> — <YYYY-MM-DD HH:mm>
Owner: <name of person deploying>
Reviewer: <name of reviewer>

### Changes
- [ ] <ticket/MR> short note on what changes
- [ ] <ticket/MR> ...

### Risk
- DB migration: yes / no  (if yes: reversible? how long does it take?)
- Config/env change: yes / no
- Affects users: <user group / which page>

### Steps
1. git pull origin main (tag: vX.Y.Z)
2. composer install --no-dev / npm ci && npm run build
3. php artisan migrate --force
4. clear cache / restart queue worker

### Verify (10 minutes after deploy)
- [ ] can log in
- [ ] the main changed page works
- [ ] no new errors in the error log

### Rollback
- git checkout vX.Y.(Z-1) + steps to reverse the migration (if any)
```

The most important part is **Rollback**. If you cannot write this section, you are not ready to deploy.

A benefit that follows is that the deploy-list becomes a searchable history. When someone asks "when did this feature go up?", you can answer in a few seconds, and when kept long enough, it becomes a runbook, following the idea in [Turn every deploy into a runbook](/en/blog/turn-every-deploy-into-runbook).

## 2. Branch-merge policy

A small team does not need a full git flow, but it needs clear rules. This is the policy I use:

```text
main        = only what is on production
develop     = integrates work for testing on staging
feature/*   = new work, branched from develop
hotfix/*    = urgent fixes, branched from main and merged back into both main and develop

Rules:
1. No direct pushes to main and develop; everything goes through a merge request
2. Every MR needs at least 1 reviewer who is not the author
3. One MR fixes one thing; if it exceeds ~400 lines, split it
4. Only the person deploying that round may merge into main, and a deploy-list is required
5. Every merge into main gets a version tag
6. QA passes on staging before merging into main, always, except for hotfixes with a stated reason
```

Rules 4 and 5 help the most in practice, because you always know which tag is on production, and a rollback is done by checking out the previous tag. I wrote more detail about branches in [Git branch strategy for small teams](/en/blog/git-branch-strategy-small-team).

## 3. Holiday deploy freeze

During long holidays or periods when the business has something important going on, such as month-end closing, the risk of deploying is much higher than usual, because the people who can fix things are away and users have no patience left. So I announce a deploy freeze in advance.

```markdown
## Deploy Freeze: <name of period>
Period: <start date 18:00> to <end date 09:00>
Systems covered: all production systems

Allowed only:
- Hotfixes where the system is unusable or data is wrong
- Must be approved by the Tech Lead first
- Must have a deploy-list + reviewer + someone watching for 1 hour after the deploy

Last deploy day before freeze: <day> before 14:00
On-call: <name / contact channel>
```

An additional rule I use all year is **no deploys after 2 p.m. on Friday** unless it is a hotfix. The reason is simple: if it breaks, we need time to fix it before the end of the workday.

## Getting the team to follow along

A good rule that nobody follows is useless. What helps the team follow it:

- **Make it easy**: the template lives in one place, and you can copy it and fill it in right away
- **The lead sets the example**: I write a deploy-list every time, even for small changes
- **Enforce with tools**: set up protected branches on GitLab or GitHub so nobody can push directly to main
- **Review after incidents**: every time there is a rollback, look at which rule helped or what was missing, then adjust the template

## Summary

A small team's deploy discipline comes down to three things you must get right: a deploy-list with rollback steps every time, a branch-merge policy that keeps main matching production, and a deploy freeze during high-risk periods. All of this adds only a few minutes per deploy but clearly reduces system outages. Copy the templates and adapt them for your team.
