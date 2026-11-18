---
title: "Building an IT Ticketing System from Requirements to Production in 2 Days"
date: "2026-07-22"
excerpt: "How I built an IT ticketing system from requirements to production in 2 days: cutting scope, choosing the stack, designing the schema, and what I left out."
tags: ["laravel", "project-management", "mvp", "internal-tools"]
---

When I was Technical Lead at OPPO Mexico, requests from other departments reached the IT team from every direction: chat, email, someone walking up to my desk. Some got lost, some were done twice, and nobody could say which work was still pending. So I built an IT ticketing system to take in requests, going from gathering requirements to a demo and production within 2 days. This post covers how I cut scope, chose the stack, and what I deliberately left out.

## Set the Narrowest Possible Goal

Before writing code, I wrote one sentence describing what this system had to solve:

> Every request to IT must have a number, an owner, and a status the requester can check on their own.

For every feature proposed, I only asked "does this help make that sentence true?" If not, it was cut and saved for the next round.

## The Scope That Remained After Cutting

**In (Must have)**
- Users log in with their existing accounts, no new membership system
- Ticket creation form: title, category, related system, urgency, description, attachments
- A "my tickets" list page with status
- A management page for the IT team: assign an owner, change status, write comments
- Notification when status changes

**Not in the first round**
- SLA and response-time calculation
- Dashboards and reports
- Multi-step approval workflow
- Full multi-language translation (main language first)

Cutting the dashboard was the hardest decision, because management wanted to see one. But I explained that without accurate data accumulated in the system, a dashboard has no meaning. Data has to come first.

## Choose the Stack the Team Knows Best

The key rule for time-boxed work is **no learning new things**. I chose Laravel with MySQL, which the team uses every day, used server-side templates instead of setting up a separate frontend project, and deployed with the team's existing deploy process.

The time saved by not configuring anything new went into features users actually see.

## The Simplest Schema That Works

```sql
CREATE TABLE tickets (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20) NOT NULL UNIQUE,      -- e.g. IT-2026-0001
  requester_id  BIGINT UNSIGNED NOT NULL,
  assignee_id   BIGINT UNSIGNED NULL,
  category      VARCHAR(30) NOT NULL,             -- bug, access, new_feature, hardware
  system        VARCHAR(50) NULL,
  priority      TINYINT NOT NULL DEFAULT 2,       -- 1 high, 2 normal, 3 low
  status        VARCHAR(20) NOT NULL DEFAULT 'open',
  title         VARCHAR(200) NOT NULL,
  description   TEXT NOT NULL,
  created_at    TIMESTAMP NULL,
  updated_at    TIMESTAMP NULL,
  closed_at     TIMESTAMP NULL,
  INDEX idx_status_assignee (status, assignee_id),
  INDEX idx_requester (requester_id, created_at)
);

CREATE TABLE ticket_events (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ticket_id   BIGINT UNSIGNED NOT NULL,
  user_id     BIGINT UNSIGNED NOT NULL,
  type        VARCHAR(20) NOT NULL,   -- comment, status_change, assign
  body        TEXT NULL,
  meta        JSON NULL,              -- {"from":"open","to":"in_progress"}
  created_at  TIMESTAMP NULL,
  INDEX idx_ticket (ticket_id, created_at)
);
```

I put comments, status changes, and assignments in a single `ticket_events` table. That lets the detail page show a timeline with one query, and if we later want a response-time report, the data is already there. This is why I was comfortable cutting the dashboard from the first round.

Status is a plain string instead of a database enum, because new statuses can be added later without a migration.

## The Two-Day Plan

**Day 1**
- Morning: talk with user representatives from two or three departments, summarize the goal sentence and scope, and get everyone to confirm
- Afternoon: migration, models, ticket creation form, the user's list page
- Evening: the IT team's management page and the timeline

**Day 2**
- Morning: notifications, attachments, access restriction (users see only their own tickets)
- Before noon: demo to representative users to try it for real, and collect feedback
- Afternoon: fix only what blocks usage, QA testing, write the deploy list
- Evening: deploy to production and send the link with a one-page guide

I used AI to help scaffold the repetitive patterns, such as form requests, validation, and list pages, but I wrote and reviewed the access control myself, because that is the one place where mistakes are not acceptable.

## What Made Two Days Possible

- **Fast decisions, with one decision maker.** No long meetings about scope.
- **Fast demo.** Users saw the real thing before noon on day two. Feedback from the real thing beats feedback from documents.
- **Reuse as much as possible**: login, stack, and deploy pipeline.
- **Accept that it's incomplete**, and tell users directly what comes next round.

After going to production, the team started getting real data on which departments the requests come from and which topics are most common. This data helped with long-term planning, which I wrote about in [the 25-week IT project plan](/en/blog/25-week-it-project-plan).

## Summary

Building an IT ticketing system in 2 days didn't come from writing code fast. It came from cutting scope down to one sentence, choosing the stack the team knows best, designing a schema that stores enough data to build on later, and showing users the real thing as early as possible. What was cut didn't disappear, it is just waiting until real data supports it.
