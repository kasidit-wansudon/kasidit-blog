---
title: "Connecting a DingTalk Bot to an AI Sales Agent in Node.js/TypeScript"
date: "2026-06-17"
excerpt: "Architecture for connecting a DingTalk bot to an AI sales agent with Node.js and TypeScript: message flow, session handling and guardrails before going live."
tags: ["ai", "dingtalk", "nodejs", "typescript", "architecture"]
---

Most sales teams do not want to open a new app. They want to ask questions in the chat they already use every day. One piece of work I did as Lead Programmer was a bridge connecting a DingTalk bot to an AI sales agent, written in Node.js and TypeScript, supporting four languages: Spanish, Thai, English and Chinese. This post covers the architecture, the message flow and the guardrails I think are necessary for anyone building an AI sales agent on enterprise chat.

Everything in this post is generic, with no internal company details.

## Why a Bridge Instead of Putting AI Directly in the Bot

At the start it is very easy to write a webhook that receives a message and forwards it to the LLM immediately. But in real use you hit three problems:

- DingTalk limits how long you have to respond to a webhook. If the LLM thinks for a long time, the reply fails.
- You want to change the model or the prompt without touching the message-receiving code.
- You want to log every question and answer so quality can be checked later.

So I split it into layers: a bridge responsible only for "chat," and an agent responsible for "thinking and answering."

## Overall Architecture

The message sequence goes like this:

1. A user types a question to the bot in a group or private chat
2. DingTalk sends a callback to the bridge
3. The bridge verifies the signature, identifies the user and acknowledges immediately (ack)
4. The bridge puts a job into a queue with the necessary context
5. A worker picks up the job and calls the AI agent with the allowed tools
6. The answer comes back and passes through the output-side guardrail
7. The message is sent back through the DingTalk API and a trace is recorded

The heart of it is steps 3 and 4. Acknowledging first and processing asynchronously avoids timeout problems, and if the agent fails it can retry without the user having to ask again.

## Message Flow in Code

The main structure of the message-receiving handler looks roughly like this:

```typescript
import express from "express";
import { verifySignature } from "./dingtalk/signature";
import { enqueue } from "./queue";

type IncomingMessage = {
  conversationId: string;
  senderStaffId: string;
  text: { content: string };
  msgId: string;
};

const app = express();
app.use(express.json());

app.post("/dingtalk/callback", async (req, res) => {
  const timestamp = req.header("timestamp") ?? "";
  const sign = req.header("sign") ?? "";

  if (!verifySignature(timestamp, sign, process.env.BOT_APP_SECRET!)) {
    return res.status(401).end();
  }

  const msg = req.body as IncomingMessage;
  const question = msg.text?.content?.trim() ?? "";

  if (!question) {
    return res.json({ msgtype: "empty" });
  }

  // Ack fast, process later. msgId makes the job idempotent.
  await enqueue({
    jobId: msg.msgId,
    conversationId: msg.conversationId,
    staffId: msg.senderStaffId,
    question,
  });

  return res.json({ msgtype: "empty" });
});

app.listen(3000);
```

The point I care about is using `msgId` as the `jobId`, because chat platforms sometimes send callbacks twice. Without idempotency, the user gets two answers.

## Guardrails You Need

An AI sales agent differs from an ordinary chatbot in that it accesses business data, so guardrails are not an extra but part of the architecture. I split them into three layers.

**Input layer**
- Limit question length and rate limit per user
- Identify the user from the staff ID every time, and never trust the name the user types
- Strip out obvious prompt injection, such as text that tries to tell the agent to forget its system instructions

**Tools layer**
- The agent can call only tools that are read-only and go through an API with limited permissions
- Every tool filters data by the asker's permissions, not the bot's
- Tools return summarized data, not a dump of a whole table

**Output layer**
- If an answer contains sales figures, they must come from tool results only, and the model must not guess
- If there is no data, say plainly that there is none instead of making up an answer
- Answer in the same language as the question

The most important item for me is "filter by the asker's permissions," because a bot usually has broader access than any user. If the agent uses the bot's permissions directly, anyone can ask for data they should not see.

## Session and Context

Enterprise chat does not have a clear session concept like a web page. I use `conversationId` plus `staffId` as the key, and keep only the last few turns of history with a time-based expiry. The reason is that most sales questions are short and self-contained. Keeping context too long raises cost and confuses the model with old questions.

## Trace Every Answer

Every job records a trace: the question, the detected language, the tools called with their input and output, the final answer, and the time taken. These traces are what let me check answer quality systematically. I wrote about this separately in [Reviewing LLM answer quality from traces](/en/blog/trace-based-llm-answer-quality).

## Lessons From Real Use

- **Ack first, think later** solves almost all timeout problems
- **Start with few tools.** Three or four tools that answer the most frequent questions are better than ten tools that the model picks wrong.
- **Error messages must be friendly.** Users do not need to know the API is down, only that they should try again.
- **Open to a small group first,** and look at traces every day in the early period before opening wider

## Summary

Making a DingTalk bot and an AI sales agent work in practice is not about how clever the prompt is, but about the architecture: separate the bridge from the agent, acknowledge fast and process asynchronously, make jobs idempotent, filter data by the asker's permissions, and keep a trace of every answer. When these basics are solid, adjusting the model or prompt later is much easier and safer.
