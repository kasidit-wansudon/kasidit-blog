---
title: "Why an AI Coding Agent Should Refuse a Vague Scope"
date: "2026-10-28"
excerpt: "Why an AI coding agent should refuse a vague scope, how to write a clear mission, and vague versus good instruction examples that cut over-editing and bugs."
tags: ["ai", "claude-code", "prompting", "kasidit"]
---

One of the first rules I put into Kasidit is that **an AI coding agent must refuse a vague scope**. It sounds counterintuitive, because we want an assistant that "just does it." But from using Claude Code every day, I have found that the most time-consuming work is not the hard work. It is work that starts from an unclear instruction, where the agent guesses what we want.

## The Problem With an Agent That "Helps Too Much"

Today's models are good enough to guess intent fairly accurately. The problem is that "fairly accurately" is not enough for production code. When the instruction is vague, an agent usually does one of these three things:

1. **Over-editing.** It sees neighboring code that is not pretty and refactors it too. The diff gets bigger, review gets harder, and things that were working are at risk of breaking.
2. **Fixing the wrong place.** It treats the symptom instead of the cause, for example adding a null check to hide a problem when the source data is wrong.
3. **Inventing context.** It assumes a function or config exists when it does not, then builds the fix on that assumption.

All three end at the same point: we spend more time reviewing and reverting than the agent saved us.

## What a Clear Mission Looks Like

In Kasidit every task starts from a short mission with five parts:

```text
GOAL:      the desired outcome, measurable or checkable
CONTEXT:   related files / endpoints / screens
IN SCOPE:  what may be changed
OUT SCOPE: what must not be touched
DONE WHEN: the condition that counts as finished (tests pass, observable result)
```

If the agent cannot fill in one of these fields from the instruction and the code it has read, it must ask back, not guess. That is what "refuse a vague scope" means. It does not refuse the work. It refuses to start work without a checkable goal.

## Examples: Vague vs. Clear Instructions

**Example 1: a bug**

- Vague: "The orders page is slow, can you take a look?"
- Clear: "The `/orders` page takes several seconds to load when filtering by date. Find out whether it is the query or the frontend. Change only `OrderController@index` and the related query. Do not change the response format. Done when the slow query uses an index and the controller tests pass."

**Example 2: a feature**

- Vague: "Add an Excel export."
- Clear: "Add a button on the admin page that exports the `users` list as `.xlsx`, using a library the project already has. Columns: name, email, department, created date. Respect the filters currently applied on the page. No background-job export needed."

**Example 3: a refactor**

- Vague: "Clean up the payment code."
- Clear: "Extract the discount calculation logic from `CheckoutController` into a `DiscountCalculator` class. Behavior must stay identical in every case. Do not edit any file other than these two and the tests. Write unit tests covering the existing cases before moving the code."

Notice that the clear instructions are not much longer, but each one answers what "done" looks like and what is "off limits."

## How to Write a Mission Quickly

Many people say writing a mission wastes time. I understand, but there are shortcuts:

- **Start from DONE WHEN.** If you cannot answer what done means, you yourself do not know what you want yet, which is very valuable information.
- **OUT SCOPE is the most worthwhile part.** A single line like "do not edit old migrations" prevents more damage than a long explanation.
- **Let the agent draft the mission first.** Give a rough goal and let the agent read the code and propose a mission back. You only review and edit, which is faster than writing it all yourself.
- **Split big tasks.** If IN SCOPE runs longer than five lines, it usually means the task should be split into several missions.

## How the Agent Should Ask Back

A good "refusal" is not answering "unclear, can't do it." It is asking back in a way that is easy to answer. Here is the kind of reply I want from an agent when it gets "the orders page is slow":

- Is it slow on first page load, or when you click a filter?
- Is it slow for every user, or only users with a lot of data?
- I read `OrderController` and see two suspicious queries. Can I start there?

Questions like these are short, offer options, and show the agent has already read the code, rather than throwing all the thinking back at the human.

## When the Agent Can Decide on Its Own

Not every task needs a full mission. Small, easily reversible tasks, such as fixing a typo, renaming a variable in a single file, or writing a throwaway script for an experiment, can be left to the agent. My rule is that the more files a task touches, the more it touches real data, or the harder it is to undo, the clearer the scope needs to be.

This rule is one of the main reasons Kasidit did well on SWE-bench, which I wrote about in [Kasidit on SWE-bench: from 63% to 75%](/en/blog/kasidit-swe-bench-75-percent).

## Summary

A good AI coding agent is not one that takes every instruction and acts immediately, but one that knows when to stop and ask. Give every task a GOAL, CONTEXT, IN SCOPE, OUT SCOPE and DONE WHEN. If you cannot fill them in yet, ask first. You will spend less time reviewing and get diffs that are smaller, easier to read and more trustworthy.
