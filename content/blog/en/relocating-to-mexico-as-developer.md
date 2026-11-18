---
title: "Moving From Bangkok to Mexico City as a Developer: Work, Time, Language"
date: "2026-03-11"
excerpt: "Notes on relocating from Bangkok to Mexico City as a developer: work setup, a 13-hour time zone gap, learning Spanish, and keeping productivity up."
tags: ["relocation", "remote-work", "productivity", "career"]
---

At the start of 2026 I moved from Bangkok to Mexico City as a developer who had been maintaining systems for OPPO in several countries from Bangkok. Now I sit close to the real users of the system. This article is not a city review, but a practical record of what a developer moving abroad has to handle to keep working right away, from equipment to time, language, and keeping productivity up.

## Before the Move: Make Your Work Setup "Portable"

What I did before boarding the plane was make sure all my work was not tied to any machine or network in Bangkok.

- **All code is in a git remote.** No branch exists only on my machine.
- **Dotfiles and config** are kept in a separate repo, so a new machine can be set up in a few commands.
- **Password manager and 2FA:** check that backup codes work, and that 2FA is not tied to a phone number that may not work abroad.
- **VPN and server access:** test from another network before traveling, because some access is tied to the old IP.
- **Spare equipment:** a plug adapter (Mexico uses type A/B plugs at 127V), a spare charging cable, and an SSD backup.

The lesson is that if your machine is lost on the first day you arrive, you must be able to get back to work within one day. If you cannot, your setup is not ready for the move.

## Time Zone: 13 Hours Apart

Mexico City is 13 hours behind Bangkok (Mexico has dropped daylight saving time in most of the country, which makes the calculation easier). That means my morning is the night of the team in Thailand, and my evening is their morning.

What actually helped:

- **Define a clear overlap window.** The early morning or evening in Mexico that matches Asian working hours is used for things that need a live conversation. Everything else is done asynchronously.
- **Write instead of talk.** Turn questions I used to ask across the desk into messages with full context, so the reader can answer without asking back.
- **Watch timestamps in systems.** Every time I look at a log or report, I need to know whether it is UTC, Thai time, or Mexican time. I set logs and the database to use UTC and convert only when displaying.
- **Rethink deploy windows.** "After work" in one place is "rush hour" in another, so check which country the system's main users are in.

## Language: English Is Enough to Work, but Spanish Keeps Work Moving

At work I communicate in English, Spanish, Chinese, and Thai, depending on who I am talking to. English is enough for talking with the tech team, but many operations users are more comfortable in Spanish.

What I do:

- Learn Spanish as "vocabulary used at work" first, such as words on the system screens, warehouse terms, and approvals
- Write important messages in English first, then use AI to translate into Spanish, but ask someone on the team to check anything where a mistake cannot be allowed
- In the systems I build, do i18n from day one, without waiting for someone to ask

On leading a multilingual team, I wrote separately in [Leading a Team in Four Languages](/en/blog/leading-team-in-four-languages).

## Keeping Productivity Up During the Adjustment

The first month is when productivity drops most easily, because everything is new: housing, commuting, food, and the people around you. What helped me:

**Build a routine as fast as possible.** Wake-up time, start of work, and exercise time: lock them in within the first week. A routine keeps your brain from deciding small things all day.

**Pick a first task that is small and finishable.** Do not start with a big project. Choose work that can be delivered in a few days, to build momentum and trust with the new team.

**Rest on purpose.** Jet lag from 13 hours does not go away in a day. I do not force deep work while my body is still confused about the time, and I use that period for lower-effort work, such as reading documents and taking inventory of the systems.

**Use AI as an assistant, not a shortcut.** During the adjustment, I used Claude Code to help read an unfamiliar codebase and summarize Spanish documents, but every change still had to be reviewed and tested for real.

**The city's altitude.** Mexico City is about 2,200 meters above sea level. At first I got tired more easily than usual, so drink more water and do not overexert yourself yet.

## Checklist for a Developer About to Move Abroad

- All work is on a remote, and a new machine can be set up within a day
- 2FA and backup codes are not tied to a number that may not work
- VPN and access have been tested from another network
- You know the overlap window with every side of the team
- Logs and the database use UTC
- Learn the local-language vocabulary used at work first
- Plan a first task that can be finished in a few days

## Summary

Whether moving from Bangkok to Mexico City as a developer succeeds does not depend on coding skill, but on preparing a portable setup, handling the time zone by working asynchronously, learning the language used in real work, and building a routine quickly. If you prepare these four things well, your first week in the new country will be a week where you get work done, not a week lost chasing setup problems.
