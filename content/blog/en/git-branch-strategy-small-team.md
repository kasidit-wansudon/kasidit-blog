---
title: "A Simple Git Branch Strategy for Small Teams That Deploy Daily"
date: "2026-01-28"
excerpt: "A Git branch strategy small teams can use when deploying daily: main, develop, feature branches, release tags, and a hotfix flow, with commands and easy rules."
tags: ["git", "workflow", "team-management", "deploy"]
---

Small teams rarely have time to sit and debate Git branch strategy, but once the system grows and deploys get more frequent, the same old problems start to appear: unfinished code slips into production, a hotfix gets merged and then disappears in the next release, and nobody can say which commit the running version is. This post is the Git branch strategy I think suits a team of two to five people who ship every day. It is not fancy, but it can be agreed on in one sitting.

## The idea: let the branch tell you the state of the code

I want everyone on the team to look at a branch name and know immediately what state the code is in.

- `main` is only what is running on production
- `develop` is what has been merged and is being tested on staging
- `feature/*` is work in progress
- `hotfix/*` is an urgent fix on production

Just these four are enough. I do not recommend a separate `release/*` branch for a small team that deploys daily, because release cycles are so short that the cost of maintaining an extra branch is not worth it. Using tags is simpler.

## Feature branches: small and short-lived

The single most important rule is that feature branches must be short-lived. Past two or three days, conflicts start to pile up and code review gets harder and harder.

```bash
# Always start new work from the latest develop
git switch develop
git pull --ff-only
git switch -c feature/order-export-csv

# While working, pull develop in often
git fetch origin
git rebase origin/develop

# Push and open a merge request into develop
git push -u origin feature/order-export-csv
```

If the work is too big to finish in a few days, slice it into small pieces that can be merged one at a time, and hide the parts that are not ready behind a simple config or flag. That is better than holding a big branch for a week.

Extra rules I use:

- The branch name says what the work is, not who does it (`feature/order-export-csv`, not `somchai-work`)
- Merge into `develop` only through a merge request; no direct pushes
- At least one other person must read it, and the pipeline must pass

## develop and staging

Every merge into `develop` makes CI deploy to staging automatically. QA or the owner of the work tests there. The benefit is that staging always reflects `develop`, and nobody has to ask "whose code is on staging right now?"

If you find a bug on staging, fix it with a new feature branch and merge into `develop` as usual. There is no need to revert the whole batch unless it affects other people's work.

## Release: merge into main and tag

When it is time to deploy, which for a team that deploys daily might be every afternoon, merge `develop` into `main` and add a tag.

```bash
git switch main
git pull --ff-only
git merge --no-ff develop -m "release: 2026.01.28"
git tag -a v2026.01.28 -m "release 2026-01-28"
git push origin main --follow-tags
```

For internal systems I prefer naming tags by date (`v2026.01.28`) rather than semantic versions, because the team already talks in days. "This bug started with Tuesday's release" is easier to understand than "since 3.14.2". If there are two releases in one day, append `.2`.

Tags make rollback very easy, because we know exactly which tag the previous version was. A rollback is deploying the old tag back, not sitting and guessing which commit to revert.

## Hotfix flow

When production is broken and you cannot wait for the normal release, branch from `main`, not from `develop`, because `develop` may contain work that is not ready for production.

```bash
git switch main
git pull --ff-only
git switch -c hotfix/fix-order-total-rounding
# ... fix + commit ...
git switch main
git merge --no-ff hotfix/fix-order-total-rounding
git tag -a v2026.01.28.1 -m "hotfix: order total rounding"
git push origin main --follow-tags

# Most important: bring the hotfix back into develop too
git switch develop
git merge --no-ff hotfix/fix-order-total-rounding
git push origin develop
```

The last step is the one teams forget most often. If you do not merge the hotfix back into `develop`, the next release brings the same bug back, so I put this in the checklist for every hotfix.

## Rules that make this work in practice

No branch strategy helps, however good, if the team does not follow it. What I found helps a lot:

1. **Protect branches.** Configure `main` and `develop` so direct pushes are blocked and everything goes through a merge request.
2. **One release owner per release.** This person is responsible for merging into `main`, tagging, and watching until the system settles.
3. **A list of what will be deployed.** Before merging, write briefly what is in this release and which migrations must run.
4. **No deploying right before the end of the day or before a day off.** If it breaks, nobody will be around to fix it.

## Summary

A Git branch strategy for a small team does not need to be complicated. Use `main` for production, `develop` for staging, short-lived `feature/*` for new work, and `hotfix/*` branched from `main` and merged back both ways. Tag every deploy so a rollback takes a single command. The rest is team discipline, which always matters more than the tools.
