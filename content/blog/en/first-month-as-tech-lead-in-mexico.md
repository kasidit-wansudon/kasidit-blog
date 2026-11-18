---
title: "My First Month as Tech Lead in Mexico City: Listen First, Fix Later"
date: "2026-04-08"
excerpt: "What I did in my first month as Tech Lead in Mexico City: a listening tour, quick wins, deploy rules, and what I would do differently if I could go back."
tags: ["tech-lead", "team-management", "leadership", "deploy"]
---

In March 2026 I started as Tech Lead at OPPO Mexico in Mexico City. I look after a team of 5 (2 programmers, 1 QA, 1 helpdesk, 1 infra) and more than 6 internal systems used by about 200 back-office users, who in turn support roughly 5,000 employees. This post is a record of what I did in my first month as Tech Lead, what worked, and what I would do differently if I could go back.

## Weeks 1-2: Listening tour

What I most wanted to do when I arrived was open the code and start fixing things. Instead I forced myself to listen for two weeks, because a new Tech Lead who changes things before understanding the context tends to destroy the team's trust faster than you would expect.

I talked one-on-one with everyone on the team and with the main users of each system. I asked the same questions every time.

- Which task do you repeat every day that feels like a waste of time?
- The last time the system broke, what happened and who fixed it?
- If you could fix only one thing this month, what would it be?
- Is there anything that is "do not touch", and why?

The last question is the most valuable, because it reveals what everyone is afraid of. That is usually the part with no documentation, where only one person knows how it works.

Language was part of the listening tour too. The team and users speak English, Spanish, Chinese, and Thai. I learned quickly that trying to speak Spanish, even badly, made people more willing to tell me about their problems than talking in English only.

## Weeks 2-3: Finding quick wins

After listening, I put all the problems on two axes, impact and difficulty, and picked only the ones with high impact that could be done in a few days.

A good quick win has three traits:

1. Users see the result right away, not just the dev team.
2. It needs no architecture change.
3. It is easy to roll back if it goes wrong.

The point of quick wins is not only to solve problems but to build credit, so that when I need to ask for a bigger change next month, people are willing to listen.

## Weeks 3-4: Setting deploy rules

The biggest problem I found in the listening tour was that deploys had no common rules. Whoever was ready deployed, nothing recorded what went up and when, and when something broke nobody knew what to roll back.

I did not write a page-long rulebook. I started with the three smallest things that would work.

- **Deploy list**: every deploy needs a list of which system, which branch, what changed, how to roll back, and who is pressing the button
- **Branch-merge policy**: merge into main only through review, no direct pushes
- **Rollback owner**: every deploy has a clearly named person responsible for rollback, and I took that role myself first

Here is an example of the deploy list the team uses.

```markdown
## Deploy 2026-03-27

| System   | Branch          | Change                     | Rollback                  | Owner |
|----------|-----------------|----------------------------|---------------------------|-------|
| orders   | release/0327    | Fix export timeout         | Revert to tag v1.8.2      | Lead  |
| users    | release/0327    | Add language field         | Run down migration 0412   | Dev A |

- Pre-check: backup DB, notify users in channel
- Post-check: smoke test login + main report
```

What made these rules stick is that I followed them first and never skipped them, even when in a hurry. This later grew into the approach I wrote about in [Turn every deploy into a runbook](/en/blog/turn-every-deploy-into-runbook).

## What I would do differently

**Write a system map in week one.** I took scattered notes from the listening tour, and it was the end of the month before they came together as one picture. If I had started drawing on day one and filled it in bit by bit, I would have seen the gaps sooner.

**Set deploy rules one week earlier.** I waited until I "understood everything", but basic rules like the deploy list do not need full understanding, and they actually help you understand the system faster.

**Hand work to the team sooner.** Early on I did several quick wins myself because it was faster, but the result was that the team did not feel ownership. If I could go back, I would pair with someone on the team and let them press the deploy button.

**Ask about security from the start.** I focused on deploys and features, so access control and secret management got pushed back, and later became a big job. It would have been better to put those questions into the listening tour from the beginning.

## Summary

The first month as Tech Lead is not the time to prove you are good. It is the time to understand where the team hurts. Listen fully, pick quick wins that users can see, set the smallest deploy rules that work, and follow them yourself before anyone else. What I got wrong was waiting too long on things that did not need waiting.
