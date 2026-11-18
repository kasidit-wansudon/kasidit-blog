---
title: "Thinking About AI Costs as a Developer: Tokens, Caching, Models"
date: "2026-05-20"
excerpt: "A developer's way to think about AI costs: counting tokens, using caching, choosing smaller models, and deciding when using AI is actually worth it."
tags: ["ai", "llm", "cost", "architecture", "claude"]
---

When I first put an LLM into a real system, I only thought about whether it answered well. Once real users arrived and automated jobs started running, the next question was "how much did we spend this month, and on what?" Thinking about AI costs as a developer is not the accounting department's job. It is part of system design, just like thinking about slow queries or bandwidth.

This post is the framework I use. It does not cite any provider's prices, because prices change often. Always check the latest pricing page.

## Start With the Right Unit: Tokens

Most LLM cost is charged by tokens on two sides, input and output. Output is usually more expensive per token than input. What developers tend to underestimate is input, because it is not just the user's question. It also includes:

- the system prompt
- conversation history
- documents from retrieval
- tool definitions
- tool results sent back in

In an agent system that calls tools over several rounds, every round resends the entire context, so cost grows much faster than you would expect.

## A Simple Estimation Formula

Before building a feature, I always estimate cost with this formula.

```text
cost_per_request = (input_tokens x input_price) + (output_tokens x output_price)
monthly_cost     = cost_per_request x requests_per_day x 30

Example (made-up numbers):
  input  = 3,000 tokens   (prompt + context + tools)
  output =   300 tokens
  requests_per_day = 500
  -> multiply by the real price of the chosen model, then compare with the value you get
```

The numbers do not need to be precise, but you need to know which variable is the biggest. Most of the time the answer is input tokens times the number of rounds, not output.

## Four Ways to Cut Cost That Really Work

**1. Prompt caching**
If the system prompt, tool definitions or reference documents are the same on every request, put the stable part at the start of the prompt and turn on caching. Many providers charge much less for the cached portion than for sending it fresh. The key rule is not to put data that changes every time, such as a timestamp or a username, before the stable part, because that stops the cache from being used.

**2. Cut unnecessary context**
- Keep only the last few rounds of chat history
- Have tools return a summary, not the raw data of the whole table
- Have retrieval take only documents with genuinely high scores

All of these reduce cost and often make answers better too, because the model gets less confused.

**3. Choose a model that fits the task**
Classification, language checking, short summaries or extracting information from text do not need the largest model. A small model does well enough at a much lower price, and faster. I keep the large model for work that needs multi-step thinking or planning. I wrote more about this in [Using Opus, Sonnet and Haiku for the right job](/en/blog/opus-sonnet-haiku-model-tiers).

**4. Cache answers at the app level**
Some questions are asked very often and the answer does not change over a short period, such as questions about term definitions or work procedures. Storing the answer in a cache under a normalized key reduces model calls. But be careful not to cache answers that depend on user permissions or data that changes quickly.

## Measure Before You Tune

Every request should log the number of input and output tokens, along with the model used and the feature name. When you total them daily, you immediately see which feature eats the most budget. Often I find most of the cost comes from a single background job, not from users typing questions. Measuring lets you tune the right place, instead of cutting quality from the feature users like the most.

## When Using AI Is Worth It

A more important question than "how do I cut cost" is "should this task use AI in the first place?" I use three questions.

1. **Can plain code do it?** If a regex, SQL or a simple rule does it more accurately, do not use an LLM.
2. **Is the value per use clearly greater than the cost per use?** For example, it saves a person several minutes per question while the cost is a fraction of a cent.
3. **How bad is a mistake?** Work that cannot be wrong needs extra verification, which is a hidden cost you must count.

If the answer to question 1 is yes, stop there. If question 2 is unclear, build a small prototype and measure for real first.

## The Cost of AI Coding Counts Too

I use Claude Code every day, and I have noticed that the cost of AI coding is not only in tokens. It is also in the time lost fixing wrong results. A clear prompt and a narrow task scope reduce both. This is the origin of the [Kasidit](https://kasi.kasion.dev) framework I built.

## Summary

Think about AI cost the way you think about performance. Count tokens on both sides, estimate before you build, use caching, cut context, choose the right model for the task, and log so you can measure for real. Most importantly, always ask first whether the task needs AI at all. Sometimes the cheapest approach is not to call a model.
