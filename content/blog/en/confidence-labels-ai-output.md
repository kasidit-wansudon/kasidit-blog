---
title: "Confidence Labels on AI Answers: verified, likely, guess"
date: "2026-10-14"
excerpt: "How tagging AI answers with confidence labels (verified, likely, guess) cuts ghost bugs and wasted reviews, and how to use them with Claude Code and your team."
tags: ["ai", "claude-code", "code-review", "kasidit"]
---

The biggest problem with working with AI is not that it is wrong, but that it is **wrong in the same tone as when it is right**. The sentence "the cause of the bug is an expired cache" sounds equally confident whether the model ran the code or just guessed from a function name. The fix I have used all year, and built into Kasidit, is the **confidence label**: every conclusion from the AI must state how confident it is.

## The three levels

I use only three levels, because with more than that people stop paying attention.

- **verified**: checked with the runtime. For example, ran the test and it passed, ran the query and saw the result, opened the log and found that error.
- **likely**: there is evidence from reading code or docs, but it has not been proven by running it. For example, read a function and saw that it does not handle null.
- **guess**: a hypothesis with no direct evidence yet. For example, "probably a timezone issue" because the bug happens at midnight.

An example of an answer with labels:

```text
[verified] test OrderTotalTest::test_discount fails with 90.00 instead of 85.00
[likely]   DiscountCalculator rounds before multiplying by quantity (line 42)
[guess]    bug may have started after the rounding config change, haven't checked git log
Plan: write a test confirming item 2 before fixing
```

Just by reading these lines, I know immediately what to trust and what still needs checking.

## Where ghost bugs come from

A ghost bug is a bug that does not actually exist, but the team wastes time chasing it because the AI said it was there. I wrote about this in detail in [AI hallucination and ghost bugs](/en/blog/ai-hallucination-ghost-bugs), but the short mechanism is:

1. The model guesses a cause
2. Without a label, the guess is presented as fact
3. The model or a person builds a fix on that hypothesis
4. The fix does not work, so a new cause is guessed on top of it
5. The loop continues until the code is full of unnecessary fixes

The confidence label breaks this cycle at step 2. When a hypothesis is tagged guess, everyone knows not to change anything until it is promoted to verified.

## How it reduces wasted reviews

Before using labels, when I reviewed AI work I had to re-check every statement, because I did not know which ones had already been checked. After using labels, review changed like this:

- **verified**: glance at the evidence, such as a passing test output, and move on
- **likely**: most of the time goes here, reading the cited code to confirm
- **guess**: not reviewed at all, but I ask "how would you prove it?"

The result is that review time lands on the points with real risk, instead of being spread evenly over every line. More importantly, work that arrives with a lot of guesses gets sent back before I waste time reviewing the whole chunk of code.

## How to start with Claude Code

You can start without installing anything. Put this rule in the project's `CLAUDE.md`:

```markdown
## Confidence labels
Every conclusion about the cause of a bug or the behavior of code must start with:
- [verified] when a command/test was run and the result was actually seen (attach a short output)
- [likely] when there is evidence from the code (cite file and line)
- [guess] when there is no evidence yet
Do not change code based on a [guess] conclusion until it can be confirmed.
```

The last line is the heart of it. A label that has no effect on action becomes mere decoration.

## Tips from real use

- **Watch for fake verified.** The model sometimes tags verified without having run anything. Require that verified always attaches real output. If there is no output, treat it as likely.
- **A guess is not a mistake.** Do not make agents or people on the team feel that stating a guess is a failure. An open guess is always better than a hidden one.
- **Use it with people too.** I started using the labels when talking with the team to summarize incidents or report progress. It makes cross-language communication much clearer, because the labels are short and do not depend on language ability.
- **Put it in the done checklist.** Before saying work is done, the main conclusions must all be verified.

## An example from real work

Suppose a user reports that yesterday's sales report does not match the source system. Without labels, the AI's first answer is often "the problem is timezone, fix the time conversion in the query," and it starts changing code right away.

With labels, the same answer becomes `[guess] may be timezone`, which forces the next step to be proving it, not fixing it. For example, query the rows near midnight and compare both sides. If the result confirms it, the label moves up to verified and the fix has evidence behind it. If it does not, we have just saved the time we would have spent changing code that was not wrong, and we do not have to undo what we already changed.

My team uses the short question "what label?" in daily conversation. It has become a way of asking for evidence that nobody feels is fault-finding.

## Summary

The confidence label solves the problem of AI stating what it guessed in the same tone as what it knows. Use three levels, verified, likely, guess, require that verified has evidence from the runtime, and do not change code on the basis of a guess. The result is a clear drop in ghost bugs, and review time going to the points with real risk. This rule is part of Kasidit. Learn more at https://kasi.kasion.dev
