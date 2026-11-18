---
title: "A Tech Lead Who Coaches with Questions and Avoids Being a Bottleneck"
date: "2026-07-29"
excerpt: "Tech lead coaching with questions instead of ready-made answers helps the team think for themselves and avoid a bottleneck, with questions to use now."
tags: ["leadership", "team-management", "coaching", "tech-lead"]
---

When I first became a Technical Lead, I was proud of answering the team's questions quickly. Whenever someone got stuck, I could tell them the fix in a few minutes. But within a few weeks I started to see the problem: the queue of questions waiting for me grew longer every day, and the team solved the same kind of problem again by coming back to ask me. I had become the team's bottleneck without realizing it. This post is about how I switched to tech lead coaching with questions instead of giving answers.

## Why answering fast is a trap

Giving an answer right away feels good for both sides. The person asking gets an answer, and the person answering feels useful. But the long-term results are:

- **The team does not build their own way of thinking.** They get the answer to that one problem, not the method for finding answers.
- **The lead becomes a bottleneck.** Every decision has to go through one person. Work stops when the lead is in a meeting or on leave.
- **The lead has no time for high-level work,** such as planning, looking at risks, or talking to stakeholders.
- **Knowledge does not spread.** If the lead moves to other work, the team is stuck immediately.

I thought of a simple question: if I disappeared for a week, could the team keep working? If the answer is no, I am not doing the lead's job fully.

## The coaching questions I use

When someone comes to ask, I do not refuse to help, but I change from telling the answer to asking questions that lead them to the answer themselves. The questions I use most:

**Understand the problem**
- What is the actual symptom you see? Is there an error message or a log?
- What did you expect to happen, and what happened instead?
- When did it start? Did anything change before that?

**Let them work out the solution**
- What have you tried so far, and what was the result?
- If you had to guess two causes, what would you guess?
- How would you prove which one is right?

**Decide**
- How many options are there, and what does each one cost?
- If you choose wrong, is it easy to go back?
- If it were your call, which would you choose?

The last question is very important. Many times they already have the answer and are just not confident. Asking "if it were you, what would you choose?" and then replying "I agree, go for it" builds more confidence than telling them the answer myself.

## Not everything needs coaching

Asking questions every time is also a problem. I split it by situation:

- **Production is down.** Answer directly and start fixing immediately, then do a review afterward.
- **Specific knowledge they cannot find on their own,** such as where a password is or who owns a system. Answer right away and write it down in the docs.
- **General technical problems.** Use coaching questions.
- **Design decisions.** Have them propose options first, then discuss.

The rule is: if the issue will recur and they should be able to handle it themselves in the future, use coaching. If it is urgent or purely factual, answer.

## Reduce the bottleneck with systems, not effort

Beyond how I talk, I changed how I work:

1. **Set time for questions.** I have two short office hours a day. Non-urgent matters get saved up for those, and the rest of the time I can focus.
2. **Write before asking.** Use a short template: the problem, what you tried, what you think the cause is. Often they solve it themselves while writing.
3. **Any answer asked twice must become a document,** and the person who just understood it writes it, not me.
4. **Delegate decision authority in levels.** For example, anything easy to reverse they can decide on their own. Anything affecting production or data needs a conversation first.
5. **Let the team use AI as the first line,** but they must verify what the AI says themselves. I wrote the guidelines in [AI pair programming rules](/en/blog/ai-pair-programming-rules).

Item 3 changed the team the most, because the person who writes the document understands the topic more deeply, and the next person does not need to ask again.

## Signs it is working

After changing my approach for a while, here is what I saw:

- Fewer questions reach me, and they are harder questions
- The team comes with proposals, not just bare problems
- I have more time for long-term planning and talking to users
- When I am on leave or in meetings all day, work keeps moving

## Cautions

Coaching is not letting people drown. If they are stuck too long, for example more than half a day on a single problem, I step in directly and explain the reasoning as I go. Also watch your tone. Questions should sound like you want to help, not like an exam. People will ask less if they feel they are being tested.

## Summary

A good tech lead is not someone who can answer every question, but someone who enables the team to answer without waiting. Use coaching questions for problems that will recur, answer directly when it is urgent, and build systems like office hours, documentation, and decision levels so you are not the bottleneck. Measure it with one question: if you disappeared for a week, could the team keep working?
