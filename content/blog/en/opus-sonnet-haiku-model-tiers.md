---
title: "Using Model Tiers Wisely: Opus Plans, Sonnet Builds, Haiku Searches"
date: "2026-05-06"
excerpt: "How to use Claude model tiers to balance quality and cost: Opus plans, Sonnet writes code, Haiku searches files, with selection criteria and subagent examples."
tags: ["ai", "claude-code", "claude", "cost", "workflow"]
---

When I started with Claude Code, I used the best model for everything, from planning architecture to searching for which file a function lives in. The quality was good, but it was slow and wasteful for no reason. After some trial and error, I split work by model tiers in a simple way: Opus plans, Sonnet builds, Haiku searches. I found it balances quality and cost much better.

This post does not quote prices, because they change over time, so check the official documentation, but the principles for choosing stay the same.

## Why Split by Tier

Software work is not equally hard at every step. Look at them separately:

- **Planning** requires understanding the big picture, weighing trade-offs, and seeing risks. A mistake here is expensive, because every later step builds on the plan.
- **Building** once the plan is clear, writing code to the plan needs accuracy but not as much deep thinking as planning.
- **Searching** finding files, reading structure, grepping for patterns. The volume is high, but each instance is easy.

If you use the largest model for all three, you are paying the price of deep thinking for work that does not need it.

## Opus: Planning and Decisions

I use Opus when:

- The task touches many files or changes the data structure
- Design is needed before writing, such as a new schema or a system migration flow
- I need to find the root cause of a complex bug that has already been chased through several rounds without success
- I need to review security work or changes that are hard to reverse

What I ask Opus for is a plan with a file list, step order, risks, and the condition for when it counts as done, not code.

## Sonnet: Building to the Plan

Sonnet is the main model I use most. Suitable work:

- Writing code from a plan that is already clear
- Fixing bugs whose cause is already known
- Writing tests and migrations, or adjusting the UI as specified

The key is that the plan must be clear enough. If Sonnet has to guess a lot, the planning step is not finished, so go back to Opus instead of letting Sonnet keep guessing.

## Haiku: Searching and High-Volume Work

Haiku is fast and cheap. It suits:

- Finding which file a function or config lives in
- Summarizing folder structure
- Checking repeated patterns across many files
- Categorization or structured data extraction

Having Haiku go search and send back a summary also keeps the main model's context clean, because it does not have to read all the long search results itself.

## Configuring It in Claude Code With Subagents

Claude Code lets you define a subagent along with its model in a markdown file with frontmatter. An example subagent for searching:

```markdown
---
name: code-searcher
description: Find files, functions, and config locations. Use for any "where is X" question. Returns paths and short excerpts only.
tools: Read, Grep, Glob
model: haiku
---

You locate code. Search broadly, then narrow down.
Return: file paths with line numbers and a one-line note each.
Do not edit files. Do not propose fixes.
```

And a subagent for planning:

```markdown
---
name: planner
description: Plan before code for changes touching more than 2 files. Returns steps, file list, risks, and done criteria. Does not write code.
tools: Read, Grep, Glob
model: opus
---

Produce a numbered plan with: goal, files to change, order of steps,
risks, and how to verify each step. Mark assumptions as inferred.
```

The main session, running on Sonnet, then hands search work to `code-searcher` and planning work to `planner` as appropriate. I included this pattern in the Kasidit framework as a cascade command that is ready to use. See [kasi.kasion.dev](https://kasi.kasion.dev).

## Quick Selection Criteria

When I am unsure, I ask myself three questions:

1. **If it is wrong, how many files need fixing?** If many files or hard to reverse, use a higher tier.
2. **Does this task need a decision, or just following one?** Deciding takes Opus, following takes Sonnet.
3. **How many times will it repeat?** High-volume, easy work goes to Haiku.

## Cautions

- **Do not save in the wrong place.** Using a small model to plan and getting a wrong plan costs many times more than the tokens saved.
- **Always check the output of lower tiers.** Haiku may not search completely, so if the result matters, verify it again.
- **Do not split work too small.** A one-line fix does not need to go through three tiers, and delegating itself has a cost.

On thinking about overall cost, I wrote about it in [Thinking About AI Cost as a Developer](/en/blog/ai-cost-thinking-for-developers).

## Summary

Model tiers are not only about saving money, but about matching capability to the difficulty of the work. Let Opus plan and decide things that are expensive when wrong, let Sonnet build to a clear plan, and let Haiku search and handle high-volume work. Set it up once as subagents and use it every day. You get better quality and a reasonable cost.
