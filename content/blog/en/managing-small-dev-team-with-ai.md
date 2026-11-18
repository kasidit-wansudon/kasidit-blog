---
title: "Managing a 4-Person Dev Team with AI Agents: Rules, Roles, Review Flow"
date: "2026-08-05"
excerpt: "How to manage a small dev team with AI agents: set shared rules, split work between AI and people, and build a review flow that keeps AI code safe."
tags: ["ai", "claude-code", "team-management", "code-review"]
---

As Technical Lead, I looked after a team of five. Four of us worked directly with code (2 programmers, 1 QA, and me), while the rest handled the helpdesk and infrastructure, but there were more than 6 systems to maintain. The question I had to answer every day was how to manage a small dev team with AI agents so we ship more without lowering quality. This post summarizes what I actually use: shared rules, work allocation, and a review flow.

## The Problem With Letting Everyone Use AI Their Own Way

At first everyone used AI on their own. The results:

- Code style was inconsistent because everyone prompted the AI differently
- The AI edited files beyond the requested scope and nobody noticed
- Some people trusted AI completely and some did not use it at all, so output varied a lot
- Strange bugs the AI invented, or the AI looping on a problem that did not exist

The problem was not the AI, it was that we had no shared rules.

## Shared Rules Everyone Uses

I wrote the rules in a single file that lives in every repo (for Claude Code, that is `CLAUDE.md`), and both people and AI read the same file. An example structure:

```markdown
# Team rules (apply to both people and AI)

## Scope
- Change only what the ticket asks for; no refactoring outside scope
- If the scope is unclear, ask first; do not guess

## Code
- PHP: PSR-12, Laravel conventions, no raw SQL built by concatenating input
- Vue: Composition API, every string goes through i18n
- Comments and variable names in English

## Safety
- Never commit secrets or .env
- Migrations must be reversible and have a down()
- Never run commands that delete data without confirmation

## Output
- Every AI answer must state its confidence: verified / likely / guess
- List all modified files at the end of the answer
```

The confidence label rule helps a lot, because it tells the reviewer immediately which parts the AI actually ran and tested and which parts are just guesses. I collected this whole approach into an open-source framework called Kasidit at https://kasi.kasion.dev

## What AI Does, What People Do

I split work by risk and by how much business context it needs:

**Mainly AI**
- Scaffolding CRUD, forms, and validation following existing patterns
- Writing tests from existing code
- First-pass i18n translation (reviewed by a person afterward)
- Reading logs or stack traces and proposing possible causes
- Drafting documents such as the deploy-list or handover notes

**Mainly people**
- Talking to users and turning requirements into scope
- Designing schemas and data flow across systems
- Deciding trade-offs, such as which feature to cut
- Deploying and rolling back on production
- Anything involving permissions, money, and personal data

The simple rule is that AI is good at "doing it fast", and people are responsible for "doing the right thing".

## The Review Flow We Actually Use

Code from AI goes through the same flow as code written by people, with no exceptions:

1. **Developer self-review first.** Read every line of the diff the AI produced. If you cannot explain what a line does, do not open a merge request.
2. **AI review with a checklist.** A second AI reviews the diff against a fixed checklist (security, database, state), not a vague "please review this". See an example checklist in [AI code review checklists](/en/blog/ai-code-review-checklists).
3. **Peer review by a person.** At least one person, focusing on business logic and impact on other systems.
4. **QA tests on staging** using test cases written from the ticket, not from the code.
5. **Deploy with the deploy-list**, by a person only.

Step 1 is the most important and the one skipped most often, so in reviews I always ask "why does this line exist?" If the answer is "the AI put it there", it is not ready.

## How I Measure Results

I do not measure by lines of code or number of commits, because AI makes those numbers inflate easily. What I look at:

- Tickets closed per week, and time from opening to production
- Number of rollbacks and hotfixes after deploys
- Number of rounds an MR needs to be fixed after review

If tickets close faster but rollbacks increase, the rules or the review flow have a hole. Go back and fix the rules instead of blaming people.

## Summary

Managing a small dev team with AI agents depends on three things: shared rules that people and AI read from the same file, work allocation where AI handles repetitive work and people make decisions, and a review flow where code from AI gets no exemptions. A team of four can work like a much larger team if everyone shares the discipline.
