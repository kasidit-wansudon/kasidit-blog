---
title: "Starting Kasion as a Side Studio While Working Full-Time"
date: "2026-04-22"
excerpt: "Notes on starting Kasion as a side studio while working full-time: managing time, choosing products, and being honest with myself about what I can really do."
tags: ["side-project", "kasion", "productivity", "startup", "career"]
---

I work full-time as a Technical Lead at OPPO Mexico, looking after a team and several internal systems. At the same time I started Kasion, a side studio building AI products for Southeast Asia. The question I get most often is "where do you find the time?" This post is the most honest answer I can give, about starting a side studio alongside a day job, managing time, choosing products, and accepting how far I can actually go.

## Why a Studio and Not a Startup

The word startup comes with expectations of fundraising, a big team, and fast growth, none of which match my situation. I have limited time, no full-time team, and I don't want to quit a day job I enjoy.

The word studio reflects reality better: a place that makes several small products, tries out ideas, keeps the ones that work, and lets go of the ones that don't. Right now Kasion has products in progress such as the KasionL1 career engine, Phlik Career, and Kasion Pay.

## Rule One: The Day Job Comes First

I set this rule on day one, and I think everyone with a side project should have one.

- No studio work during work hours
- No company machines, accounts, or resources for studio work
- No products that compete with or overlap the employer's business

The last one is very important. It means I don't have to worry about conflicts of interest and can work on both sides with a clear conscience. If the day job needs more time one day, for example around an important deploy, the studio always pauses first.

## Managing Time: Small but Consistent Blocks

I don't have full days. What I have is some mornings before work, some evenings, and part of the weekends. What works for me:

**1. One block, one goal**
Each block needs a tangible outcome, such as "deploy the landing page" or "get the payment sandbox working", not "work on Kasion". If a goal is too big for one block, it needs to be broken down smaller.

**2. Write down where I stopped**
Before shutting down each time, I write three lines: what I did, what's blocking me, and what the next step is. The next block may be days away, and without notes I lose the first half hour trying to remember what I left unfinished.

**3. Use AI to get the most out of limited time**
I use Claude Code for studio work in a structured way. The AI plans and writes the repetitive parts, while I make the product decisions and check the results. I wrote about this idea in [discipline beats longer prompts](/en/blog/discipline-beats-bigger-prompts).

**4. No servers to maintain**
Kasion's apps run on Cloudflare Workers + D1 because I don't have time to patch servers. Every hour I don't spend maintaining infrastructure is an hour I spend on the product.

## How I Choose Products

I always have more ideas than time, so I filter them with four questions.

1. **Do I understand this problem from real experience?** The products I understand most deeply are the ones I've faced myself, such as job hunting, career development, and working with complex systems.
2. **Can one person build the first version in a few weeks?** If it needs a team from day one, it isn't its time yet.
3. **Is there a way to learn quickly whether people really want it?** It has to be measurable, not something I only find out after a year.
4. **Does it avoid overlapping with the day job?** There are no exceptions on this one.

Ideas that fail any of these go on a "not now" list instead of being thrown away. Some can come back when circumstances change.

## Being Honest About Scope

This is the hardest part. I love building things and tend to overestimate my own time. What helps:

- **Count the real hours available per week**, not the hours I hope to have, and plan around those.
- **One main product per period.** Other products are in maintenance mode only.
- **Cut features before moving dates.** If it won't make it, ship a smaller version instead of postponing again and again.
- **Accept that some won't succeed.** That isn't a failure of the studio, it's how a studio works.

Writing a plan with clear scope like this is similar to how I make AI refuse tasks whose scope is vague. I just apply the same rule to myself.

## What I Don't Know Yet

I don't yet know which Kasion product will go the furthest, and I don't want to write as if I already have the answer. What I do know is that working consistently within a scope I can actually handle will leave me with more tangible things in a year than waiting for full days of free time, which may never come.

## Summary

Starting a side studio while working full-time is possible if you set a rule that the day job comes first and nothing overlaps, use small but consistent time blocks with notes on where you stopped, choose products from problems you really understand and can build alone, and stay honest with yourself about scope. Kasion is still unfolding, and I'll keep sharing progress on this blog.
