---
title: "From Logistics and Construction to Code: What Manual Work Taught Me"
date: "2025-12-10"
excerpt: "From logistics and construction to coding: what manual work taught me about software, working under pressure, safety, and planning before you start building."
tags: ["career", "mindset", "software-engineering", "lessons"]
---

Before I wrote code for a living, I worked in logistics and construction. Many people assume that moving from manual work to being a developer means starting over from zero, but the longer I work in software, the more I find that what manual work taught me still applies every day, especially about working under pressure. This post covers the lessons from logistics and construction that I carry into writing code.

## Logistics taught me about flow

Logistics is about moving things from one point to another correctly, completely, and on time. What stood out most is that work is not slow because everything is slow, but because of a single bottleneck. All the trucks arrive, but there is only one loading bay, so every truck waits.

Software is the same. A system is slow because of one query, and a team is slow because everything waits for review from one person. Fixes that work start by finding the bottleneck, not by speeding up everything at once.

### Count at every handoff

In a warehouse, counting goods at every handoff is normal. Without counting, when something goes missing there is no way to know at which point it was lost.

This is where my habit of caring about logs and data checks comes from, at every point where data crosses systems, such as receiving a webhook, importing a file, or syncing between databases. If the numbers at the source and the destination do not match, we need to be able to tell where it was lost along the way.

```text
Checklist for every data handoff
- Count before sending and after receiving
- Record the time, source, and destination
- If they do not match, stop and report; do not skip past it silently
```

## Construction taught me about blueprints and safety

In construction, nobody pours concrete before looking at the plans, and nobody goes up high without protective equipment. Some mistakes cannot be fixed: pour in the wrong place and you have to tear it out, and some accidents give you no chance to make up for it.

### Design before you build

This habit is why I dislike starting to write code without knowing which files will change, how the data flows, and what must not be touched. It does not need a long document. Sometimes five lines of notes is enough, but it has to exist before you start.

### Some things cannot be undone

In software we tend to think everything can be undone, but that is not always true. Deleting data on production, running a migration that drops a column, or sending a message to a large number of customers are all irreversible. Construction taught me to pause for a beat before doing something that cannot be undone and ask myself whether I have a backup plan yet.

## Pressure in manual work and pressure in software

Pressure in manual work is tangible: a truck waiting for goods, workers waiting for materials, rain about to fall. Everyone sees the problem in front of them and has to decide fast.

Pressure in software is invisible but just as heavy: the system goes down at night, a user reports wrong numbers, a deadline is closing in. What I found is that the principles for handling it are very similar.

1. **Take a breath first.** Rushing without thinking makes the problem bigger almost every time.
2. **Make it safe before fixing.** On a work site that means cordoning off the area; in software it means rolling back or turning off the broken feature.
3. **Communicate short and clear.** Say what happened, what you are doing, and when you will update again.
4. **Find the cause later.** Analyze once the situation is stable, not while everything is still broken.

## Working with all kinds of people

Both logistics and construction had me working with very different people in background, age, and way of thinking. What I learned is that instructions that are clear and respectful work better than long or harsh ones. When explaining a task to someone, I try to say both "what to do" and "why", not just "what to do".

## Patience with repetitive work

Manual work is mostly repetition: lifting the same things and checking the same things every day. Coding has a fair share of this too, such as chasing bugs, writing tests, and fixing data. Patience with repetitive work keeps me from skipping steps that are boring but necessary, and when I run into enough repetition, I know it is time to write a script or build a tool to help.

## For anyone about to change careers

If you come from a job outside IT, do not treat your past experience as worthless. Skills like planning, working with people, handling pressure, and being accountable for what you deliver are what many teams need, and they are harder to teach than a programming language. How my first paid coding job went, I tell in the next post, or if you want to know why I started this blog, read [Why I started writing this blog](/en/blog/why-i-write-this-blog).

## Summary

Logistics taught me to look for bottlenecks and count at every handoff. Construction taught me to design before building and to respect what cannot be undone. Both taught how to handle pressure: stop and think, make it safe, communicate clearly, then find the cause. These lessons are still in every deploy and every problem I solve today.
