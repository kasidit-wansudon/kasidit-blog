---
title: "Security Incident Lessons for Small Teams: What to Do After the Fire"
date: "2026-09-09"
excerpt: "Lessons after a security incident for small teams: rotating secrets, least privilege, auditing repo by repo, and communication, as a ready-to-use checklist."
tags: ["security", "devops", "team-management", "incident"]
---

This year my team had to deal with a **security incident**. I will not go into the details of what happened, but I want to share the lessons I learned as the person who had to lead a small team through the aftermath, because small teams have particular limits: no separate security team, nobody free, and everyone still has to keep the systems running as usual at the same time.

## After the Fire Is Out, the Real Work Starts

The first phase of an incident is limiting the damage, stopping what is happening, and getting the system working again. Many teams stop right there, but the most important lesson I took away is that **limiting the damage can itself cause side effects.** For example, revoking a credential or adding a policy in a hurry can silently break an unrelated feature for several days without anyone knowing.

So every change made while putting out the fire must be written down: what was done, when, and on which system. This list is the first thing to check when something strange happens in the following week.

## 1. Rotate All Secrets That May Be Involved

The principle is that if you are not sure which secret leaked, treat everything reachable from the same point as leaked.

The checklist I use:

- List all secrets: database passwords, API keys, tokens for external services, SSH keys, and encryption keys
- Identify where each secret is used. This is usually the hardest part, because a single secret gets copied to many places.
- Rotate one at a time, testing the systems that use it immediately
- Disable the old secret only after confirming nobody uses it anymore
- Search for secrets hardcoded in code and move them to the environment or a secrets manager

An example of a basic search in a repository:

```bash
# Find likely hardcoded secrets (review results manually)
git grep -nE "(api[_-]?key|secret|password|token)\s*[:=]\s*['\"][^'\"]{8,}" -- . ':!*.lock'

# Check whether secrets ever existed in history, not only in the current tree
git log -p -S "BEGIN RSA PRIVATE KEY" --all | head
```

Commands like these will not find everything, but they are a good starting point. And remember that a secret that was ever in git history counts as leaked, even if it has been removed from the current branch.

## 2. Least Privilege Is No Longer Optional

What makes damage large or small is usually not the vulnerability but the privileges that come with it. If a leaked credential can do everything, the damage can be anything.

What I did afterward:

- **Separate credentials per system.** Each app has its own credential, with permissions only for what it needs.
- **Do not use the highest-level account for daily work.** Keep the account with all privileges for cases of real need only.
- **One account per person, not a shared account.** When everyone uses the same account, there is no way to know who did what. I moved server access behind a VPN and gave each engineer their own account, which I wrote about in [VPN-Only SSH for Small Teams](/en/blog/vpn-only-ssh-access-small-team).
- **Personal data must be encrypted.** Even if the database leaks, the readable data should be as little as possible.

## 3. Audit One Repo at a Time, Not All at Once

A small team does not have the capacity to audit every system at the same time, and if you try, the work stalls halfway on every system. What worked for me:

1. Rank repos by risk: is it exposed to the internet, what data does it hold, how many users does it have
2. Audit one repo at a time with the same checklist each time: authentication, per-endpoint permission checks, file uploads, secrets in code, and endpoints nobody uses anymore
3. Finish fixing and deploying that repo before moving to the next
4. Record the results in a document the team can read, so the next round goes faster

AI helps a lot at this step, especially for finding suspicious endpoints and patterns, but every conclusion must be confirmed with a real test before it counts as a problem.

## 4. Communication

The part I underestimated most before facing a real incident was communication.

- **Within the team:** one channel for this, one person who summarizes the status, and a clear statement of who is doing what. A team that works in several languages, like mine, needs to write even shorter and clearer.
- **With management:** state what you know, what you do not yet know, and what you are doing. Separate clearly what is confirmed from what is still a hypothesis.
- **With users:** if a change affecting them is needed, such as logging in again or updating the app, tell them in advance with a reason that is easy to understand.
- **Do not blame people.** The goal is to fix the system so the problem is harder to repeat, not to find someone at fault. If the team fears being blamed, next time nobody will report something unusual early.

## 5. Make Sure the Lessons Do Not Disappear

After everything is settled, write a short post-incident review: timeline, what worked, what did not, and follow-up work with owners. Then turn what you learned into checklists in deploy and code review, so it becomes a habit and not a memory.

## Summary

After a security incident, a small team should do five things: record every change made while putting out the fire, rotate all secrets that may be involved, apply least privilege with one account per person, audit one repo at a time with the same checklist, and communicate clearly without blaming people. No team wants an incident, but if you have one, do not let it pass without making your systems stronger.
