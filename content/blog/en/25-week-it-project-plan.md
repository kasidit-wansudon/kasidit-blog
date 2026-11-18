---
title: "Planning a 25-Week IT Project: Assessment to Handover, With a Template"
date: "2026-04-15"
excerpt: "How to plan a 25-week IT project in phases, from assessment and core support to module delivery, knowledge transfer and handover, with a template."
tags: ["project-management", "it-planning", "team-management", "handover"]
---

When I took the Technical Lead role at OPPO Mexico, I had to produce a 25-week IT project plan for management. What I learned is that a good plan is not the most detailed one. It is the one everyone can read and immediately know "which phase are we in, and what do we get when this phase ends?" This post shares the structure I use, along with a template you can adapt right away.

## Why Phases Instead of a Task List

Internal IT teams constantly get hit by two kinds of work at once: daily support (systems down, users asking for data fixes, hotfix deploys) and long-running project work. If you write the plan as a list of features only, then a two-day incident in week three pushes the whole plan back, and nobody knows why it slipped.

Splitting the plan into phases helps in three ways:

- Management sees the big picture on a single page
- Each phase has a clear deliverable, so you can tell whether it is done
- Support work counts as real work in the plan, not as an invisible "interruption"

## The 25-Week IT Project Plan Structure

I split it into 7 phases. Some can overlap, because in real life work does not run in a straight line.

### 1. Assessment (weeks 1-3)

The goal is to "know what exists" before fixing anything. The main tasks are:

- Build an inventory of all systems: who uses them, what stack, how they are deployed, who owns them
- Talk to the main users of each system and ask what hurts most
- Do a basic review of security and backup risks

The deliverable is a system map and a prioritized risk list. Do not skip this phase, because if you do, you end up fixing what is loudest, not what is most important.

### 2. Core Support (weeks 2-25)

This phase runs the whole length of the project, and I deliberately put it in the plan from the start. It is about keeping the existing systems running: deploys, rollbacks, bug fixes, answering tickets. I set a clear percentage of the team's week that support consumes, so the capacity left for project work can be calculated realistically.

### 3. Project Management Setup (weeks 3-5)

Before building anything new, you need shared ground rules.

- A ticket system for collecting requirements
- A branch-merge policy and a deploy-list template
- A short weekly meeting and a status report format

I wrote about this part separately in [Building a ticketing system in 2 days](/en/blog/ticketing-system-in-2-days).

### 4. Module Delivery (weeks 5-18)

This is the main body. Development of each module is split into 2-3 week cycles, and every cycle must end with a demo to real users, not just "the code is done." I order the modules by the risk list from the Assessment phase, not by what anyone happens to want.

### 5. Capability Building (weeks 10-20)

The team has to get stronger along the way. Otherwise, when the project ends, everything falls back onto one person. Work in this phase includes pair programming, code review with a checklist, and having team members deploy on their own while I watch.

### 6. Knowledge Transfer (weeks 19-23)

Write runbooks, an updated system map and an owner list, and have the incoming people try doing real work without our help. This phase usually gets squeezed, so it has to be reserved in the plan from day one.

### 7. Handover (weeks 24-25)

A formal handover with a checklist that both sides sign off on, plus a short hypercare period where we can still answer questions.

## Template: 25-Week Plan Table

This is the template I use as the first page of the document.

```markdown
| Phase                | Weeks  | Goal                         | Deliverable                       | Exit criteria                        |
|----------------------|--------|------------------------------|-----------------------------------|--------------------------------------|
| Assessment           | 1-3    | Know the current system state | System map, risk list             | Management has reviewed the risk list |
| Core Support         | 2-25   | Existing systems keep running | Deploy log, ticket stats          | No incident open beyond SLA          |
| PM Setup             | 3-5    | Shared working rules in place | Ticket system, deploy policy      | Team has used it for a full 2 weeks  |
| Module Delivery      | 5-18   | Deliver modules in risk order | Demo + production release         | User sign-off on every module        |
| Capability Building  | 10-20  | Team works without one person | Review checklist, pairing log     | Team members can deploy on their own |
| Knowledge Transfer   | 19-23  | Knowledge in docs, not heads  | Runbooks, owner list              | Successor does real tasks unassisted |
| Handover             | 24-25  | Formal handover               | Handover checklist                | Both sides sign off                  |
```

The most important column is Exit criteria, because it forces us to answer what "done" means. If you cannot write it, that phase is not clear yet.

## Lessons From Using This Plan

**Overlapping phases are normal.** Do not try to make the Gantt chart pretty; make it real. Core Support overlaps every phase because it really does.

**Report by phase, not by percentage.** Saying "63% done" means nothing to management, but "Module Delivery cycle 3 of 5, demo on Friday" is understood immediately.

**Slipping is fine, but give the reason.** When an incident ate our time, I logged it in the Core Support log and referred to it when explaining why Module Delivery slipped. Management accepts a slip backed by evidence more easily than I expected.

**Knowledge Transfer must start earlier than you think.** If you wait until the last week to write documentation, you get documents nobody reads. Write a runbook every time you deploy or fix a problem, and the Knowledge Transfer phase becomes just collecting and testing them.

## Summary

A usable IT project plan admits that support work exists, splits the work into phases with clear deliverables and exit criteria, and reserves time for the team to grow and for knowledge to be handed over. Try putting the template above onto your own systems. Start by filling in the Exit criteria column completely, and you will immediately see which phases you have not thought through.
