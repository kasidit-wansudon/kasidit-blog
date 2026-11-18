---
title: "AI Code Review With Fixed Checklists: Security, Database, State"
date: "2026-07-08"
excerpt: "Use fixed checklists for AI code review on security, database and state so every review meets one standard, with an example checklist and a prompt you can copy."
tags: ["ai", "code-review", "claude-code", "security", "checklist"]
---

I use AI to help review code every day, and I keep running into the same problem: if I just say "please review this code," the result is different every time. Sometimes the AI focuses on variable names, sometimes it talks about performance but misses the SQL injection right in front of it. The fix that worked best is to use fixed checklists for AI code review, split into three categories: security, database and state. This post shares the checklist and how I use it.

## Why "Please Review This" Is Not Enough

The AI answers based on whatever it thinks is important at that moment, which depends on the context in the prompt, the order of the files and the length of the diff. The result is:

- **Inconsistent.** Reviewing the same code twice gives different results.
- **Surface-level.** It cares about formatting or naming more than the things that actually break the system.
- **Impossible to verify for completeness.** We do not know which topics the AI has already looked at.

A checklist turns the AI from a "free-form critic" into an "inspector working through a list." Every item must have an answer, so you can immediately see which items pass, which fail and which are not relevant.

## Example Checklist

I split it into files by category and keep them in the repo so the whole team uses the same set. This is the short version I use with Laravel and Vue:

```markdown
# Review checklist v1

## A. Security
A1. Is user input validated before every use?
A2. Is there any raw SQL that concatenates strings from input? (bindings are required)
A3. Does every new endpoint check authentication and authorization?
A4. Can a user reach someone else's data by changing the id in the URL? (IDOR)
A5. Are there any secrets, tokens or passwords in the code or logs?
A6. Is output shown on the page escaped? (v-html, {!! !!})
A7. Are uploaded files checked for type and size, and stored outside the public path?

## B. Database
B1. Is there any query inside a loop (N+1)?
B2. Do new columns used in WHERE / JOIN / ORDER BY have an index?
B3. Is the migration reversible (has down) and does it avoid long locks on large tables?
B4. Are writes to multiple tables that must succeed together inside a transaction?
B5. Are there any queries without LIMIT on tables that keep growing?

## C. State
C1. Are cached values invalidated when the source data changes?
C2. If a queue job / webhook runs twice, is the result still correct? (idempotent)
C3. Is there a race condition when two requests modify the same data at once?
C4. Does frontend state match the server after an error or refresh?
C5. Are date timezones handled explicitly?

## Output format
Answer every item as: <ID> PASS | FAIL | N/A - short reason + file:line
Every FAIL needs a suggested fix and a confidence: verified / likely / guess
```

The items that catch the most problems on my team are A4 (IDOR), B1 (N+1) and C2 (idempotent). These three are problems where the code looks correct when you read it but breaks in real use.

## The Prompt I Use

```text
You are reviewing a diff. Use ONLY the checklist in review_checklist.md.
For every item, answer PASS, FAIL or N/A with a one-line reason and file:line.
Do not comment on style or naming unless it causes a FAIL.
Do not suggest refactors outside the diff.
If you are unsure, mark the item "likely" or "guess", never invent code that is not in the diff.

<diff>
...git diff output...
</diff>
```

The two important lines are "use only the checklist" and "do not invent code that is not in the diff." The latter reduces the AI reporting problems in code that does not exist, which I ran into often at first.

## How to Adopt It in a Team

1. **Start with few items.** A checklist that is too long makes the AI answer every item superficially. I started with about 15 items.
2. **Add items from real incidents.** Every time a bug reaches production, ask "which checklist item should have caught it?" If there is none, add a new one.
3. **Version the checklist** so you know which review used which set.
4. **Review by category.** For large diffs, have the AI review one category at a time instead of everything at once. The result is more thorough.
5. **Humans still review.** The AI checklist is good at mechanical issues but does not know whether a business rule is right or wrong. Peer review by people is still necessary.

## What I Saw

After adopting the checklist, my team got what "please review this" never gave: review results that are comparable every time. Reviewers know to look at the FAIL items first, and developers know in advance what their code will be checked for. Many people even started checking by themselves before opening a merge request, which is the best side effect.

This checklist idea is part of the Kasidit framework, which I made open source for Claude Code. You can see the details at https://kasi.kasion.dev, and if you want a bigger picture of using AI in a team, read [Managing a small dev team with AI](/en/blog/managing-small-dev-team-with-ai).

## Summary

AI code review becomes consistent when you use fixed checklists, split into security, database and state. Force the AI to answer every item with PASS, FAIL or N/A and a location in the code, forbid it from inventing code that is not in the diff, and add a new item every time a bug slips through. A good checklist is one that grows with the team's lessons.
