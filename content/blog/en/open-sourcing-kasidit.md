---
title: "Why and How I Open Sourced Kasidit Under the MIT License"
date: "2026-04-29"
excerpt: "Why and how I open sourced Kasidit, a framework for Claude Code, under MIT: writing the README, easy install, finding first users, and the lessons I learned."
tags: ["open-source", "kasidit", "claude-code", "ai", "side-project"]
---

This month I decided to open source Kasidit, a discipline framework for Claude Code that I use for my own work every day, under the MIT License. This post covers why I chose to release it instead of keeping it to myself, the steps I took from the README to installation, and what I learned from open sourcing the first serious project of my own.

## What Is Kasidit

In short, it is a set of rules and tools that makes an AI coding agent work with discipline. It has 8 specialist agents under a single orchestrator, refuses tasks with unclear scope, attaches confidence labels to conclusions, includes review checklists and runtime hooks that enforce key rules, and turns every bug fix or deploy into a reusable runbook.

It started from my own problem. I was tired of AI changing more than I asked, declaring it was done without testing, and looping on ghost bugs that did not exist. So I wrote rules for myself and gradually expanded them into a framework.

## Why Open Source

**1. If it helps me, it will probably help others**
The problems I ran into are not special. Everyone who uses an AI coding agent seriously hits the same ones. Keeping it to myself does not make it more valuable.

**2. Opening it forces me to make it better**
Code used by one person is full of shortcuts. Once I knew others would read it, I had to write documentation, separate my personal config, and make it installable on a machine that is not mine.

**3. I have always learned from open source**
I started writing code by reading other people's projects. This is my first chance to give something back.

## Why MIT

I wanted people to be able to use it without much thought, both personally and in companies, with no worries about conditions for open sourcing derived work. MIT is short, easy to understand, and well known. For a tool I want to spread widely, it is the most straightforward choice.

## Steps I Took Before Releasing

**Remove all personal and work information**
This took more time than I expected. The framework I used myself had personal paths, project names, and examples referring to real work mixed in. I searched every file, moved personal config outside the repo, and changed all examples to generic ones. Before the first push I searched again for anything that could be a secret, because what has already gone into git history is hard to take back.

**Write a README that answers three questions in 30 seconds**
- What is it, and what problem does it solve
- How to install it
- How to use it the first time

I moved long conceptual explanations out of the README into separate docs, because someone who just found the project does not care about philosophy yet. They want to know whether it works.

**Make it installable in a few commands**
Kasidit installs directly as a Claude Code plugin.

```bash
# In Claude Code
/plugin marketplace add kasidit-wansudon/kasidit
/plugin install kasidit@kasidit
```

Or clone the repo and run the install script, which I made idempotent, meaning it can be run repeatedly without breaking anything.

```bash
git clone https://github.com/kasidit-wansudon/kasidit.git
cd kasidit
bash plugins/kasidit/install.sh
```

Making the script re-runnable matters a lot, because users will definitely run it again when updating, or when they install for the first time and are not sure it worked.

## Finding the First Users

I had no ad budget and did not expect people to show up on their own. What I did:

- Kept using it every day and fixed problems immediately, because the most important first user is myself
- Shared it with developer friends who already use Claude Code and asked directly where they got stuck
- Built the website [kasi.kasion.dev](https://kasi.kasion.dev), which explains the idea briefly and links to the repo
- Wrote articles like this one, describing the problems it solves instead of promoting the tool itself

The most valuable early feedback was not praise but "I installed it and did not know what to do next." It led me to add a quick start section and a starter command that asks a single question.

## Measure It With Numbers

I did not want this framework to sell on feelings, so I tested it on SWE-bench against not using the framework. The result was 75% solved versus 63%. That number helps answer the first question everyone asks: "does it really help?" I wrote the details in [Kasidit and SWE-bench 75%](/en/blog/kasidit-swe-bench-75-percent).

## What I Learned

- **Documentation matters as much as code.** A feature nobody knows exists might as well not exist.
- **Defaults must be safe and light.** New users should not face the full framework right away, so I made multiple modes to choose from.
- **Do not expose more than you intend.** Check for secrets and work information before every push.
- **Release earlier than you feel ready.** If I waited for it to be perfect, I would never have released it. Real feedback teaches more than polishing alone.

## Summary

I open sourced Kasidit because the problem it solves is shared by people who use AI coding agents, and because opening it forced me to make it better. I chose MIT to make it as easy to use as possible, cleaned out personal data before release, wrote a README that answers questions in a few seconds, made it installable in a few commands, and listened seriously to feedback from the first users. If you have a tool you use every day, think about whether it might help others too.
