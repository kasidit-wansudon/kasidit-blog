---
title: "My First Paid Gig: A LINE Complaint Chatbot for Sisaket Municipality"
date: "2025-12-17"
excerpt: "My first paid gig: a LINE chatbot for Sisaket Municipality that takes complaints, filters them with AI, and has a dashboard. Lessons from a real client."
tags: ["line", "chatbot", "freelance", "career"]
---

Everyone has a first paid job writing code. Mine was a LINE chatbot for receiving complaints for Sisaket Municipality, built as a freelance project in 2021 while I was still studying Software Engineering at Sisaket Rajabhat University. Looking back, it taught me more than any class did, not because the technology was hard, but because it was the first time real people used something I built.

## The Problem: Make Reporting as Easy as Possible

People in the city already use LINE every day, so reporting through a LINE chatbot was easier than asking them to install a new app or visit a website. The system had three main parts.

1. **LINE chatbot** lets citizens submit a complaint along with photos and a location
2. **AI filtering** screens out messages that are not real complaints, such as greetings, irrelevant messages, or impolite ones
3. **Dashboard and approval step** lets officials review, approve, and track the status of each case

## Why an AI Filter Was Needed

When I started, I assumed every incoming message was a complaint. In reality, a channel that anyone can type into gets all kinds of messages. If every message went to the dashboard, officials would drown in messages that need no action and eventually stop using the system.

So the AI in this project acts as a first gate, not a decision maker. Messages that pass still need approval from an official as a second layer. This is a key lesson I still apply every day: let AI reduce the workload, but let people decide anything that affects others.

## LINE Webhook Basics Every Beginner Should Know

When a user sends a message to the bot, LINE sends a webhook to our server. The first thing to do is verify that the request really came from LINE by checking the signature in the `x-line-signature` header, which is the HMAC-SHA256 of the body using the channel secret, encoded as base64.

```js
const crypto = require('crypto');

function isValidLineSignature(rawBody, signature, channelSecret) {
  const expected = crypto
    .createHmac('sha256', channelSecret)
    .update(rawBody)
    .digest('base64');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature || '');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
```

A mistake beginners often make, myself included back then, is verifying the signature against a body that has already been parsed as JSON. You must use the raw body exactly as received, otherwise the signature will not match.

Another point is that a webhook should respond quickly. If there is heavy work, such as calling the AI or saving images, accept the request first and process it afterward instead of making LINE wait.

## What a Beginner Learns From a Real Client

### 1. Real users do not behave the way you expect

I designed the flow so users send a photo first and then type the details, but real users send everything in any order. Some type a long message in one go, and some send several photos without typing anything. The system has to be flexible enough to accept all of it.

### 2. There are two groups of users, and both matter equally

Citizens are the obvious users, but the officials who use the dashboard every day decide whether the system survives or gets abandoned. If the dashboard is hard to use, cases pile up, and citizens stop reporting.

### 3. A developer's "done" is not the client's "done"

I used to think the work was done when the code ran. For the client, it is done when the officials can use it and the system does not go down on a day when many cases come in. I learned to allow time for training, for changes based on feedback, and for support after handover.

### 4. Communicate in the client's language

The client does not care which webhook or database you use. They care how many minutes it takes for a complaint to reach an official and how they can track its status. Talking in terms of outcomes made conversations much easier.

## What I Would Do Differently

- Write short usage documentation from day one
- Keep readable logs for tracing problems on the day something goes wrong
- Agree on the scope in writing before starting, so the work does not grow without anyone noticing

Around the same time I also did another freelance job, integrating a payment gateway for a hospital using RSA encryption, which taught me to be careful about security early in my career. Before that I worked in logistics and construction, which I wrote about in [From Logistics and Construction to Writing Code](/en/blog/from-logistics-to-code).

## Summary

The LINE chatbot for Sisaket Municipality was my first paid gig. What I gained was not just chatbot and webhook skills, but an understanding that real users do not follow what we expect, that AI should help filter while people decide, and that work is truly done when the client can use it, not when the code passes. If you are about to take your first job, just start. The best lessons always come from real clients.
