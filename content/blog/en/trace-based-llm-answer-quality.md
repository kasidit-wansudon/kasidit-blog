---
title: "Reviewing LLM Answer Quality from Traces: Find the Root Cause First"
date: "2026-06-10"
excerpt: "How to review LLM answer quality from traces: what to log and how to separate retrieval, prompt, and data causes before you randomly rewrite the prompt."
tags: ["ai", "llm", "observability", "quality", "debugging"]
---

When someone says "the AI answered wrong", most developers' first reaction is to open the prompt file and add one more line. I did the same, and found that it fixed one case but broke others. Reviewing LLM answer quality from traces is what I use instead of guessing, especially while maintaining an AI sales agent that answers questions through DingTalk in four languages.

The idea is simple: a wrong answer has only a few kinds of root cause, and a good trace tells you which kind it is.

## Why Traces and Not Just Logs

A regular log tells you "what happened", but a trace tells you "in what order it happened and what each step received". In an LLM application, one answer goes through many steps, from interpreting the question and searching for data to calling tools and composing the answer. If you only see the question and the final answer, you have no way of knowing where it broke.

## What to Log

I defined this minimum trace for every request:

```json
{
  "trace_id": "tr_01",
  "user_ref": "hashed-user-id",
  "question": "How much did model X sell this month?",
  "detected_language": "th",
  "model": "model-name",
  "prompt_version": "sales-agent-v12",
  "retrieval": [
    { "source": "product_catalog", "doc_id": "p-123", "score": 0.82 }
  ],
  "tool_calls": [
    {
      "name": "get_sales_summary",
      "input": { "product": "X", "period": "this_month" },
      "output_summary": "rows=1",
      "latency_ms": 240
    }
  ],
  "answer": "...",
  "tokens": { "input": 1800, "output": 220 },
  "total_latency_ms": 3100,
  "feedback": null
}
```

A field people often forget but that matters a lot is `prompt_version`, because if you don't know which prompt version produced an answer, you can't compare before and after a fix.

Another matter is privacy. I store the user as a hash and keep a summary of tool output instead of storing all the raw data. A trace is for debugging, not a copy of the database.

## Three Main Root Causes: Retrieval, Prompt, Data

When I find a wrong answer, I check in this order:

**1. Wrong retrieval**
Check whether the documents or tool results that came back contain the correct answer. If they don't have it at all, the problem isn't the model. Common signals are:
- All document scores are low
- A tool was called with wrong parameters, such as the wrong time period or a model name spelled differently
- The question is in one language but the documents are in another, so nothing is found

**2. Wrong prompt**
The correct data is already in the context, but the model still answers wrong, for example picking the number from the wrong row, answering in the wrong language, or inventing extra details. Only in this case is it time to fix the prompt.

**3. Wrong data**
The model's answer matches the data exactly, but the source data is wrong or out of date. No amount of prompt editing will fix this. You have to fix the source system, or add the data's update date to the answer so users know.

In my experience, most problems aren't in the prompt but in retrieval and data, which is why rushing to fix the prompt often doesn't work.

## Weekly Review Process

I don't review every trace. I use systematic sampling:

1. Pull all traces that received negative feedback
2. Sample a number of normal traces, split by language, to make sure no language is being neglected
3. Pull traces with unusually high latency or token counts
4. Label each case as retrieval, prompt, data, or "actually correct"
5. Count by label and fix the largest group first

Step 4 gets the team talking in the same language. Instead of saying "the AI isn't smart", we say "this week retrieval missed Chinese model names", which can be fixed precisely.

## Build a Regression Set from Traces

For every case I fix, I save the question and the expected answer into a regression set. Before deploying any new prompt, I run this set to see whether old cases still pass. No complex tooling is needed. A JSON file and a script that runs and compares results is enough. What matters is having it before making changes, not after things break.

I use the same idea when working with AI coding. If you're interested in making AI state its own confidence, read [confidence labels for AI output](/en/blog/confidence-labels-ai-output).

## A Short Checklist

- Traces include `prompt_version`, model, language, retrieval, tool calls, and tokens
- User data is hashed or abbreviated
- Every wrong answer is labeled with one of the three root causes
- Fix the largest group first
- Fixed cases go into the regression set

## Summary

Reviewing LLM answer quality from traces turns problem-solving from guessing into diagnosis. Log enough to see every step, separate the root cause into retrieval, prompt, or data, and fix the right spot. Most of the time you'll find the prompt isn't the culprit, and knowing that saves a lot of time.
