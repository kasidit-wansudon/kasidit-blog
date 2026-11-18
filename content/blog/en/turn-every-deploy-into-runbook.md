---
title: "Turn Every Deploy into a Runbook: A Template Small Teams Can Actually Use"
date: "2026-11-04"
excerpt: "How to turn every deploy and every fix into a reusable runbook, with a template, what to record, and why small teams benefit the most from this habit."
tags: ["devops", "runbook", "deploy", "team-management"]
---

Every time I finish a deploy or fix a production problem, I ask myself one question: "If we have to do this again tomorrow and I'm not here, can someone on the team do it?" If the answer is no, the work isn't finished. What's missing is a **runbook**, and in this post I'll share how I turn every deploy into a reusable runbook, one of the habits that has helped my small team the most.

## Why Small Teams Need Runbooks More Than Big Ones

As Technical Lead at OPPO Mexico, I looked after a team of 5 responsible for more than 6 internal systems, and we owned daily deploys and rollbacks. In a team this size, knowledge tends to pile up in one or two people. When that person is out sick, stuck in a meeting, or moves to another job, everything slows down immediately.

Big teams have backups and a separate platform team. Small teams don't, so a runbook is the cheapest "backup person" there is.

Benefits I've clearly seen:

- A new person can do their first deploy without sitting next to a veteran
- Rollbacks are faster, because the steps to go back were written in advance and don't have to be figured out under stress
- Recurring problems get fixed in minutes instead of being tracked down from scratch
- Handover becomes much easier, because the documentation accumulates over time instead of being written all at once at the end

## The Runbook Template I Use

I tried many formats and ended up with a template short enough that people will actually write it:

```markdown
# <Task name: e.g. Deploy the orders system to production>

## When to use
- Conditions that call for this runbook

## Before starting (pre-check)
- [ ] Branch / tag to deploy
- [ ] When the last database backup was taken
- [ ] Affected users or teams have been notified

## Steps
1. The commands actually run (copy-paste ready)
2. The expected output at each step

## Verify after deploy
- URLs / endpoints to open and check
- Logs to check

## Rollback
1. Steps to go back
2. Points of no return (e.g. a migration that drops a column)

## Problems we've seen
- Symptom -> cause -> fix

## Last updated
- Date / who edited / what changed
```

The most important sections are **expected output** and **problems we've seen**. These two hold the knowledge that lives in people's heads, which is the knowledge that disappears fastest.

## What to Record (and What Not To)

**Record**

- The commands actually run, not broad descriptions. For example, write `php artisan migrate --force`, not "run the migration"
- The order of steps, and the reason if the order matters
- Success signals, such as status codes, log messages, the screen you should see
- Points of no return, with a clear warning
- Approximate time for each step, so you know when something is abnormal

**Don't record**

- Passwords, API keys, or tokens in the document. Just write where they are kept, such as the team's secrets manager or password manager
- Data that changes so often the document goes stale within a week. Link to the real source instead

## Make It a Habit, Not a Documentation Project

A common mistake is announcing a "documentation week" where everyone writes what they remember. The result is documentation that doesn't match reality from day one.

What works for me:

1. **Write while doing.** Keep the runbook file open next to the terminal during the deploy and copy commands into it right away.
2. **Tie it to the deploy list.** Every item in the team's deploy list must have a runbook link. If it doesn't, the work isn't complete.
3. **The next person fixes it.** Whoever uses a runbook and finds a wrong or missing step must fix it immediately. This makes the document better every time it's used.
4. **Quick review.** Have someone who has never done the task try reading it. If they have to ask questions, it isn't written well enough yet.

## Not Just Deploys: Every Fix Can Be a Runbook

Many people think runbooks are only for deploys, but the runbooks I use most often are about fixing problems, such as "what to do when the queue is stuck" or "a user can't log in after changing their password, what do I check first". These problems don't happen often, and when they happen again, everyone has forgotten how it was fixed last time.

My team's rule is that if a problem takes more than half an hour to track down, the person who fixes it must write a short runbook, even if it's only three lines: symptom, cause, the command used to fix it. That alone makes the next time many times faster, and the helpdesk can use the same runbook to answer users right away without waiting for a programmer.

## Let AI Help Capture Runbooks

In Kasidit I built the `/kasi-acknowledge` command for exactly this. After an agent helps finish a deploy or fix, the command summarizes the steps that were just performed into a runbook following the template and stores it in the project's knowledge folder, so next time it can be found immediately.

The key point is that a runbook must come from "what was actually done", not what the AI thinks should have been done. So I still read it through every time before saving it. For passing documentation on to a new team, I wrote about it in [handover documentation that actually works](/en/blog/handover-documentation-that-works).

## Summary

A runbook is the cheapest backup person for a small team. Use a short template with real commands, expected output, rollback steps, and problems we've seen. Write it while working, tie it to the deploy list, and have the person using it be the one to fix it. Do this for a few months and the team will depend noticeably less on any one person.
