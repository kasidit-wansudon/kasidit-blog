---
title: "Kasidit on SWE-bench: 63% to 75% with Discipline, Not Longer Prompts"
date: "2026-11-11"
excerpt: "Kasidit's SWE-bench result: 75% resolved vs 63% without the framework. What scope, checklist, and confidence-label discipline changed, and how to read it."
tags: ["ai", "claude-code", "benchmark", "kasidit"]
---

Since I started Kasidit in April 2026, the question I get asked most is "does it really help, or does it just feel like it helps?" The most direct answer I have now is the SWE-bench result: running Claude Code with Kasidit gave **75% resolved**, compared with **63%** when running without the framework. In this post I will explain where that gap comes from and, just as important, how to read benchmark numbers like this without fooling yourself.

## What SWE-bench measures, and what "resolved" means

SWE-bench is a set of tasks pulled from real issues in open source repositories. Each task has a codebase, a problem description, and a set of tests that decide the outcome. The agent has to change the code so that tests that used to fail now pass, without breaking the existing tests. If everything passes, it counts as "resolved".

What I like about this kind of measurement is that the runtime is the judge, not a reviewer's feeling. It does not matter how pretty the code looks if the tests do not pass, which matches one of Kasidit's principles exactly.

## Where the 12-point gap comes from

I did not change the model and I did not write a longer prompt. What changed is the agent's "working discipline", which breaks down into three main things.

### 1. A clear scope before touching code

The most common mistake when running without a framework is the agent changing more than the issue asks for, for example seeing a neighboring function that "looks bad" and refactoring it too. The result is that existing tests break even though the main bug was fixed correctly.

Kasidit makes the agent write a mission first: what the problem is, which files are likely involved, and what is "out of scope". If it cannot write that, it must stop and read more code, not guess and fix. I wrote about this in detail in [Why AI agents should refuse vague scope](/en/blog/ai-agent-refuse-vague-scope).

### 2. A checklist before saying it is done

Most agents tend to announce "fixed" too early. Kasidit makes every mission end with a short checklist:

```text
[ ] Reproduce the bug before fixing (or write a test that fails)
[ ] Change only files that are in scope
[ ] Run the relevant tests and they pass
[ ] Run neighboring tests that might be affected and they pass
[ ] The diff contains no unintended changes
```

It sounds very basic, but forcing it every time is the difference, because the model is already capable of doing every item. The problem is that it does not do them.

### 3. Confidence labels

Every conclusion from the agent must carry a label: verified (run and saw the real result), likely (evidence from the code but not run), or guess. When the agent has to label its own hypothesis as a guess, it stops building fixes on a foundation that does not exist, which is the cause of many ghost bugs.

## Reading benchmark results honestly

This is the part I want everyone who reads AI benchmark numbers to remember, including my own numbers.

**Compare only under the same conditions.** The 75% and 63% mean something because they use the same model, the same task set, and the same judging method, changing only whether the framework is present. You cannot compare this number to someone else's leaderboard that uses a different setup.

**Look at the gap, not the raw number.** What this result really says is that "discipline clearly raises the success rate on this kind of task". It does not say that Kasidit makes AI fix 75% of bugs in your project.

**A benchmark is not all of real work.** Issues in SWE-bench have clear descriptions and tests that decide the outcome. Much real work has neither. So I see this result as evidence that the working principles function, not as a guarantee of outcomes.

**Report what did not improve too.** On some tasks the framework did not help, and some took more time because the agent had to complete the checklist. This is a trade-off that should be stated plainly.

**Let others reproduce it.** Kasidit is open source (MIT), so anyone who wants to test it themselves can. I believe a number that cannot be reproduced should not carry much weight.

## Lessons that apply even without Kasidit

If you do not want to install anyone's framework, these principles work right away:

- Write a scope for the agent every time, including what must not be touched
- Have the agent reproduce the problem before fixing
- Force running tests before accepting the work, and do not trust the word "done"
- Ask the agent to say which conclusions were checked and which were guesses

This is all the same idea I wrote about in [Discipline beats bigger prompts](/en/blog/discipline-beats-bigger-prompts).

## Summary

The gap from 63% to 75% did not come from a smarter model or a cleverer prompt, but from forcing the agent to do what good engineers already do: set a scope, check against a checklist, and separate what is known from what is guessed. When reading benchmarks, look at the comparison conditions, look at the gap, and always remember that a benchmark is evidence, not a promise. If you are interested, you can try it at https://kasi.kasion.dev
