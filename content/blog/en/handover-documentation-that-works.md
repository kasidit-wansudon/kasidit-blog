---
title: "Handover Docs People Use: Runbook, System Map, Owner List"
date: "2026-03-04"
excerpt: "How to write handover documentation the receiving team can use, with a runbook, system map, and owner list, plus a template you can use to hand over a system."
tags: ["documentation", "handover", "runbook", "team-management"]
---

Most handover documents share one fate: they are written in a rush in the last week, run dozens of pages, and are never opened again, until the day the system goes down and the information you need is not in there. In the 25-week plan I manage, the knowledge transfer and handover phase is the part I care about most. This post is how I write handover documentation that people actually use, split into three pieces: a system map, an owner list, and runbooks.

## Why most handover documentation goes unused

- **It follows the writer's structure, not the reader's questions.** The receiver does not want the history of the system; they want to know "if X breaks, what do I do?"
- **It is too long.** The important information is buried in unimportant paragraphs.
- **It is out of date on the day it is delivered**, because it was written from memory, not from work actually done.
- **It was never tested.** Nobody tried following the document without the author helping.

## Piece 1: System map

A system map answers "what exists, and how does it connect" on a single page. It does not need to be pretty, but it needs to be complete.

What to include for each system:

- System name and its job in one sentence
- User groups and approximate numbers
- Stack and main versions
- Where it lives (server type, environment) and how it is deployed
- Other systems it calls, and systems that call it
- What data is sensitive

A connection diagram helps a lot, but always pair it with a table, because a table is searchable and easier to edit than a picture.

## Piece 2: Owner list

The biggest problem after a handover is usually not "I do not know how to do it" but "I do not know who to ask". The owner list fixes that.

Split owners into three kinds:

- **Business owner**: the person who decides what the system should do and approves changes
- **Technical owner**: the person responsible for the code and deploys
- **Escalation**: who to contact if the technical owner is unavailable

I do not put any real names in this blog, but in a real document it must be names of people and working contact channels, not department names, because "the IT team" never answers the phone. People do.

## Piece 3: Runbook

The runbook is the heart of a handover. It is step-by-step instructions for recurring tasks or predictable events, such as deploy, rollback, restarting a service, restoring a backup, adding a user, and fixing common problems.

Principles for writing a runbook that works:

- One runbook, one task
- Start with "when to use this" so the reader knows they opened the right one
- Every step is a command that can be copied and run, or a clear action
- Include a way to verify that each step succeeded
- Include a way back if it goes wrong

The best method I have found is to write the runbook every time you actually do the task, not wait until handover. I describe this in [Turn every deploy into a runbook](/en/blog/turn-every-deploy-into-runbook).

## Template

This is the template I use. Keep it as a markdown file in each system's repo.

```markdown
# Handover: <system name>

## 1. System summary
- Purpose: <one sentence>
- Users: <group, approx. count>
- Stack: <framework + version, database, queue>
- Environments: <dev / staging / production>
- Depends on: <systems/APIs it calls>
- Used by: <systems that call it>
- Sensitive data: <what, where, how protected>

## 2. Owners
| Role             | Name | Contact | Backup |
|------------------|------|---------|--------|
| Business owner   |      |         |        |
| Technical owner  |      |         |        |
| Escalation       |      |         |        |

## 3. Runbooks
- [Deploy](runbooks/deploy.md)
- [Rollback](runbooks/rollback.md)
- [Restore backup](runbooks/restore.md)
- [Common issues](runbooks/common-issues.md)

## 4. Known issues and risks
| Issue | Impact | Workaround | Planned fix |
|-------|--------|------------|-------------|

## 5. Access checklist
- [ ] Repository access
- [ ] Server / VPN account (personal, not shared)
- [ ] Secrets manager access
- [ ] Monitoring and alert channel

## 6. Verified by
- Receiver performed deploy without help on: <date>
- Receiver performed restore drill on: <date>
```

Section 6 is the most important. It forces the document to be tested for real.

## Test the document by not helping

Before handover day, I have the receiver do at least three real tasks from the document: deploy, rollback, and restore a backup, while I only sit and watch and answer no questions. Every time they get stuck, it means the document has a gap. Write it down and fix it right away.

The first round usually gets stuck in many places, and that is a good thing, because it is better than getting stuck at 2 a.m. with nobody to help.

## Do not forget access

The part that is often overlooked is access. The receiver needs their own account everywhere they need one, not borrowing the previous person's account or sharing a common account. And on handover day there must be a clear list of which of the handing-over person's permissions will be removed and when. If you skip this, you end up with a system the new person cannot get into and a system the old person still can, which is bad both ways.

## Keep the document alive after handover

- Keep the documents in the same repo as the code, not in a drive nobody can find
- Require that every PR that changes how deploys work also updates the runbook
- Put the last-checked date in each runbook
- Delete documents that are no longer used; a wrong document is more dangerous than no document

## Summary

Good handover documentation is not the longest document but the one that answers the receiver's questions when something happens. Have three pieces: a system map that shows the overview on one page, an owner list with real names, and runbooks that can be copied and run. Then test by having the receiver do real tasks without help. If they can do it, your document works.
