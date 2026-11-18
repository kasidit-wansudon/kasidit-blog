---
title: "AI Hallucination and Ghost Bugs: Phantom Variables, Endless Loops"
date: "2026-01-14"
excerpt: "AI hallucination in coding creates ghost bugs: phantom variables and endless fix loops. How to spot them, verify AI claims, and stop before you lose a day."
tags: ["ai", "debugging", "claude-code", "workflow"]
---

Anyone who has coded with AI for a while has probably hit this situation: the AI says it fixed the bug, you run it, and it still breaks. The AI apologizes and fixes it again, and it still breaks. On the third round it goes back to the same fix as the first. An hour later everything is where it was, or worse. I call this kind of problem a ghost bug, and most of the time its root is AI hallucination. This post is how I spot it and stop it.

## What AI Hallucination Looks Like in Code

AI hallucination is when a model produces information that sounds plausible but does not exist. In code it usually appears in forms like these:

- **Variables or properties that do not exist**, such as calling `$order->customer_name` when the table only has `customer_id`
- **Library methods that do not exist**, or that exist in another version, not the one the project uses
- **Made-up config keys or env vars** that look very real because they follow naming conventions
- **Files or functions the AI "remembers" seeing**, when it has not opened them in this round
- **Descriptions of results that were never actually run**, such as "the tests pass now" with no run output attached

What makes this dangerous is that all of it comes in the same confident tone as a correct answer.

## How Ghost Bugs Happen

A ghost bug is a bug we keep chasing while the real cause is not where we are looking. The cycle I see most often is:

1. The AI guesses the cause from the error message without reading all the relevant code
2. It fixes based on the guess, which may change how the error looks but does not remove it
3. It sees the new error, guesses a new cause, and stacks another fix on top
4. After several rounds the code has layered fixes and nobody knows what the original was

The longer the context, the more likely the AI is to misremember what it already fixed and loop back to the same fix.

## Warning Signs of a Ghost Bug

I stop immediately when I see any of these:

- The same issue has been "fixed" more than twice and is still not gone
- The AI proposes a fix that was already tried
- The diff starts touching files unrelated to the original error
- The AI starts adding `try/catch` or `if` to "guard against" the error instead of finding the cause
- I myself cannot say how the code now differs from when we started

## How to Verify: Evidence First, Fix Later

Once I have stopped, I switch from "fix" mode to "prove" mode. The first step is to confirm that what the AI refers to actually exists, by searching the code myself, not by asking the AI.

```bash
# Does this name actually exist, and where is it defined?
grep -rn "customer_name" app/ database/migrations/

# Does this method exist in the library version we use?
composer show laravel/framework | grep versions
grep -rn "function whereFullText" vendor/laravel/framework/src/
```

The second step is to reproduce the bug in the smallest form, such as one test or a one-line command that fails every time. If you cannot reproduce it yet, you should not fix it yet.

The third step is to read the actual full log and stack trace, not just the first line. Often the line that shows the real cause is deep in the trace.

## How to Stop: Reset and Start From Facts

If we have looped for several rounds, what works best for me is:

1. **Roll the code back to the starting point** with `git stash` or `git checkout`, discarding all the layered fixes
2. **Start a new session** so the context is clean, with no wrong memories from the previous round
3. **Send only facts**, such as the full error, the code that is actually relevant, and how to reproduce the bug
4. **Ask the AI to explain the cause before fixing**, and to say how confident it is, which points are verified and which are still guesses

Point 4 matters a lot. When you force a separation between "what has been verified" and "what is guessed," you can immediately see what a confident-sounding answer is built on.

## Better to Prevent It

- Always have the AI read the relevant files before editing, instead of letting it write from memory
- State the framework and library versions in the prompt
- Ask for small diffs so wrong guesses show up early
- Run tests after every change, instead of making several changes and running once

## Summary

AI hallucination does not mean AI is unusable, but it does mean we need ways to catch it. Spot the signs of a ghost bug early, such as fixing in circles more than twice or a diff that spreads into other files. When you see them, stop, verify that what the AI claims really exists, make the bug reproducible, then restart with a clean context and only facts. Evidence from an actual run always beats confidence.
