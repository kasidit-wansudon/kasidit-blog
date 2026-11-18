---
title: "Discipline Beats Bigger Prompts: Mission, Checklist, Verification"
date: "2026-05-13"
excerpt: "Why discipline beats bigger prompts when working with AI coding agents: the mission, checklist and verification structure I use with Claude Code every day."
tags: ["ai", "claude-code", "prompt-engineering", "workflow", "kasidit"]
---

For a while I believed that if the AI did the wrong thing, my prompt was not detailed enough. So I made my prompts longer and longer, adding prohibitions, examples, and context, until some files ran to several pages. The results did not get better with length, and sometimes got worse. What really changed the results was discipline, not longer prompts, especially a three-part structure: mission, checklist, and verification.

This is the idea that became the core of the Kasidit framework, which I released as open source.

## Why long prompts do not work

Long prompts have three problems.

- **Instructions collide with each other.** The more you write, the more likely two lines contradict, and the model has to choose on its own.
- **Importance gets diluted.** When everything is "very important," nothing is important.
- **There is no checkpoint.** The prompt says what to do, but not how you will know it is done and correct.

The last one is the heart of it. Most problems in AI coding do not come from the model not knowing what to do, but from the model announcing "done" without having checked.

## Part 1: Mission

A mission is a short, clear scope of work, not a long description. I use a structure like this:

```markdown
## Mission
Goal: Fix duplicate rows in the orders export CSV
Scope: app/Exports/OrdersExport.php only
Out of scope: UI, other exports, refactoring
Done when:
  - Export of a test order with 3 lines returns exactly 3 rows
  - Existing export tests still pass
Risk: Low (read-only export, no schema change)
```

Notice there are "Out of scope" and "Done when". These two lines are worth more than a long context paragraph, because they tell the model where to stop. An AI without a clear boundary tends to change more than what was asked, which is the source of new bugs. I wrote about having the AI refuse work with an unclear scope in [AI agents should refuse vague scope](/en/blog/ai-agent-refuse-vague-scope).

## Part 2: Checklist

A checklist is a list of things to check every time for a given type of work. You do not rewrite it for every task, you reuse it. Here is an example checklist for database work:

- Is the migration reversible?
- Is there an index for columns used in the new `WHERE`?
- Does the change affect code that reads the existing column?
- Has it been tested with data close to production size?

The benefit of a checklist is that it is separate from the task's prompt. So the prompt gets shorter, and the checklist keeps improving: each time we hit a new problem, we just add one line. Knowledge accumulates in one place instead of being scattered across dozens of prompt files. I expand on using checklists for code review in [AI code review checklists](/en/blog/ai-code-review-checklists).

## Part 3: Verification

Verification is the evidence that the work is really done. My rule is that the runtime is the judge, not the model's confidence.

- If you fix a bug, there must be a run showing the bug is gone
- If you add a feature, there must be a test or at least a real run result
- If it cannot be verified, say plainly that it has not been verified

I also have the AI attach a confidence label to its conclusions, such as verified when it ran something and saw the result, or inferred when it deduced from reading code. This separation tells me immediately which parts need further checking.

## Hooks: making discipline not depend on memory

Discipline that depends on the memory of a person or a model will slip on a tired day. So I use Claude Code hooks to enforce some rules automatically, such as not committing on its own without asking permission, or warning when there is a command that deletes data. A rule enforced by a tool is always more reliable than a rule written in a prompt.

## Measured results

I tested Kasidit on SWE-bench against using no framework at all. The result was solving 75% of the tasks versus 63%, using the same model. The difference did not come from a longer prompt, but from a structure that forces you to define scope, check against a checklist, and confirm the result before declaring it done. Details are at [kasi.kasion.dev](https://kasi.kasion.dev).

## Start tomorrow

You can start without installing anything.

1. Before giving the AI a task, write all four lines: Goal, Scope, Out of scope, and Done when
2. Create one checklist file for the type of work you do most often
3. Do not accept the word "done" until you see a real run result
4. Each time you hit a repeated problem, add one line to the checklist instead of adding a paragraph to the prompt

## Summary

A longer prompt gives unpredictable results, but discipline gives repeatable results. Split work into a mission with clear scope, a checklist that accumulates knowledge, and verification where the runtime is the judge, then use tools to enforce the important rules. You will get an AI that works more professionally without writing a single extra line of prompt.
