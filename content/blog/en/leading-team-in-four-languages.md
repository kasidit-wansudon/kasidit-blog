---
title: "Leading a Four-Language Team: Written Specs, Glossary, AI Translation"
date: "2026-07-15"
excerpt: "How to lead a team working in English, Spanish, Chinese, and Thai using written specs, a shared glossary, async updates, and careful AI translation."
tags: ["leadership", "communication", "remote-work", "ai", "team-management"]
---

At OPPO Mexico I coordinate every day in four languages: English with the team and some executives, Spanish with users and the local team, Chinese with headquarters, and Thai with some colleagues. Some of the systems the team maintains also have to display in several languages. I am not fluent in every language, but I learned that leading a multilingual team well does not depend on language skill, it depends on the communication system. This post summarizes the four tools I use.

## The real problem of multilingual teams

The problem is not "I cannot understand", it is "we think we understand each other, but we actually do not". Examples I run into often:

- One person's "close" means closing a ticket, another's means closing the books
- A verbal meeting ends and everyone nods, but each person remembers the action items differently
- A message translated by a tool looks grammatically fine, but the business meaning is wrong

All of these can be fixed by relying less on memory and speech, and adding more that is written down.

## 1. Specs are always written

My first rule: **anything not written down is not yet agreed.** Every requirement needs a short document in the common language (mostly English) with the same structure every time:

```markdown
## Request: <short name>
Requester: <department / name>
Problem: the current problem in 2-3 sentences
Expected: the desired outcome (measurable)
Out of scope: what we will not do this round
Example: real sample data, or a screenshot
Acceptance:
  - [ ] Condition 1
  - [ ] Condition 2
```

The **Example** section matters most in a multilingual team. A screenshot or one row of real data communicates more clearly than several paragraphs of explanation, because numbers and pictures do not need translating.

Sentences in a spec should be short, one sentence per meaning, avoiding idioms and abbreviations. People who use English as a second or third language read faster, and translation tools translate more accurately too.

## 2. A shared glossary

I keep a glossary table of frequently used business terms, one term per row, four languages, with a short explanation:

```text
| term (EN)    | ES                 | ZH    | TH              | meaning in our systems                       |
|--------------|--------------------|-------|-----------------|----------------------------------------------|
| sell-in      | sell-in            | 进货   | sell-in         | Volume the distributor buys in from the company |
| sell-out     | sell-out           | 出货   | sell-out        | Volume the shop sells to end customers          |
| demo unit    | equipo demo        | 演示机 | เครื่องโชว์       | A device used for in-store display, not for sale |
| close (ticket)| cerrar (ticket)   | 关闭   | ปิด ticket       | Work is done and the requester has confirmed    |
```

This glossary is used in three ways: the team uses it as a reference, new people use it to learn, and it serves as input to the AI when translating, which I cover below. In code, we also use terms from the glossary as variable names and i18n keys, so the language in documents, in code, and on screen all match.

## 3. Async updates

Live meetings in a multilingual team are more tiring than usual, because everyone has to listen and translate in their head at the same time. So I reduced live meetings and use written updates instead:

- **A three-line daily update** in the team chat: what I did yesterday, what I will do today, what is blocking me
- **A summary after every meeting** as a list, with action items, owner names, and due dates, sent the same day
- **A decision log** where every important decision is recorded in one place, with the reason

Writing gives readers time to use a translation tool, reread, and ask back about what they are unsure of, which live speech does not allow. Another benefit is that people in a different timezone can keep up without waking up for a meeting.

## 4. Using AI translation carefully

AI translates languages very well, and I use it every day, but I set some rules:

- **Always send the glossary with the message.** Tell the AI which terms must be translated a certain way, or not translated at all.
- **Have the AI translate back** (back-translation) for important text such as announcements or specs. If the meaning changes on the way back, there is something to fix.
- **Check numbers, dates, and system names by eye** every time. AI sometimes changes the date format or units without saying so.
- **Text that users see in the system** must be reviewed by a native speaker before going to production.
- **Do not send confidential data** or personal data into translation tools the company has not approved.

An example of a prompt I use often:

```text
Translate the message below from English to Spanish (Mexico).
Use this glossary exactly; do not translate terms marked KEEP:
- sell-in: KEEP
- demo unit: equipo demo
- close (ticket): cerrar
Keep numbers, dates (YYYY-MM-DD) and system names unchanged.
Then translate your Spanish back to English so I can check meaning.
```

I wrote about the technical side of multilingual LLMs in [Multilingual LLMs for ES/TH/EN/ZH](/en/blog/multilingual-llm-es-th-en-zh).

## What language cannot fix

All of these tools help with meaning, but they do not replace respect for different working cultures. Some teams prefer you to be direct, others want context first. I try to learn basic phrases in each language and use them when greeting or thanking people. This small thing clearly makes people more open to talking with me.

## Summary

Leading a four-language team well depends on the system, not on the leader's language skill. Write a spec every time with real examples, build a shared glossary used in both documents and code, move updates to async, and use AI translation with the glossary and back-translation as checks. When everything is written down, misunderstandings drop on their own.
