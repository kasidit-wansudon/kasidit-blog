---
title: "Using Claude Code Hooks as Guardrails Against Dangerous Commands"
date: "2026-10-21"
excerpt: "Use Claude Code hooks as guardrails with PreToolUse and PostToolUse to block destructive commands and check work automatically, with settings and script."
tags: ["claude-code", "ai", "hooks", "devops"]
---

I use Claude Code every day, and what gave me the confidence to let the agent run more commands on its own is **Claude Code hooks**. The idea is simple: an instruction in a prompt is only a "request," and the model may forget it or misread it, but a hook is a "rule" that the harness enforces every time, no matter what the model is thinking. In this post I share how I use hooks as guardrails, with examples you can use right away.

## What a Hook Is and When It Runs

A hook is a shell command that Claude Code runs automatically when a specified event happens. The two events I use most are:

- **PreToolUse** runs before the agent uses a tool, such as before running a Bash command or editing a file. Use it to "block" things that should not happen.
- **PostToolUse** runs after a tool finishes. Use it to "check" the result, such as running a linter after a file edit.

A hook receives the tool call data as JSON on stdin and communicates back through its exit code. If a PreToolUse hook exits with code `2`, that command is blocked, and the message on stderr is sent back for the model to read, so it knows why it was forbidden and can change its approach.

## Configuring in settings.json

Hooks can be set at the user level (`~/.claude/settings.json`) and the project level (`.claude/settings.json`). This example blocks dangerous Bash commands and runs a formatter after file edits:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "python3 ~/.claude/hooks/block_destructive.py" }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "~/.claude/hooks/lint_changed.sh" }
        ]
      }
    ]
  }
}
```

`matcher` is the name of the tool the hook runs for. You can list several separated by `|`.

## A Script That Blocks Destructive Commands

This is a shortened version of the script I use. It reads JSON from stdin, extracts the Bash command, and compares it against dangerous patterns:

```python
#!/usr/bin/env python3
import json
import re
import sys

payload = json.load(sys.stdin)
command = payload.get("tool_input", {}).get("command", "")

BLOCKED = [
    (r"\brm\s+-[a-zA-Z]*r[a-zA-Z]*f", "rm -rf is not allowed. Name files one by one or ask the user"),
    (r"\bgit\s+push\b.*--force", "Force push is not allowed"),
    (r"\bgit\s+reset\s+--hard", "reset --hard is not allowed without asking the user"),
    (r"\bDROP\s+(TABLE|DATABASE)\b", "DROP is not allowed through the agent"),
    (r"\bdocker\s+volume\s+(rm|prune)", "Deleting docker volumes is not allowed"),
]

for pattern, reason in BLOCKED:
    if re.search(pattern, command, re.IGNORECASE):
        print(f"BLOCKED: {reason}", file=sys.stderr)
        sys.exit(2)

sys.exit(0)
```

When the agent tries to run `rm -rf build/`, it gets a message back saying why it was blocked. Most of the time the model switches to a safer approach, or stops and asks the user, which is the behavior we want.

## Other Guardrails I Actually Use

**1. Protect secret files.** A PreToolUse on `Read|Edit|Write` that checks whether the path is `.env`, a key file or a credentials folder. If so, block it. This keeps secret values from leaking into the context by accident.

**2. No automatic commits.** Block `git commit` and `git push` unless the user issues them. I do not want anything going to the remote before I have read the diff.

**3. Check the response language.** I have a hook that checks the output uses the configured language, because I have seen a model switch languages on its own mid-conversation.

**4. Lint after edits.** A PostToolUse that runs a linter or formatter only on the file just edited. If there is an error, it is sent back for the model to fix immediately, instead of being found in CI.

## Where to Start

If you have never used hooks, I recommend starting with just two: block `rm -rf` and force push, because those are the two where a single slip hurts the most. Use them for a week, see how often the hooks fire and how the model responds to the block message, then add rules one at a time from real incidents.

The best hooks usually come from mistakes that already happened. Every time the agent does something I do not want to happen again, I ask myself "should this rule be advice, or should it be a hook?" If the answer is that it must never happen again, write it as a hook and keep the script in the repository so the whole team uses the same rules.

## Cautions

- **Pattern matching is not a perfect security boundary.** Dangerous commands can be written in many forms. Hooks reduce accidents but do not replace real permission limits, such as not giving the agent production credentials at all.
- **Hooks must be fast.** They run on every tool call, so if they are slow, everything is slow. Avoid network calls in hooks.
- **The stderr message must show the way out.** Just "BLOCKED" is not enough. Say what to do instead so the model does not keep retrying.
- **Test hooks before using them.** Feed sample JSON into the script with `echo '{...}' | python3 block_destructive.py; echo $?` to check that the exit code is correct.
- **Do not block too much.** If a hook forbids everything, the agent cannot work and you will start turning hooks off. Block only what cannot be undone.

## Hooks in Kasidit

In Kasidit I use runtime hooks as one layer of discipline, alongside a clear scope and confidence labels. The idea is: anything that "must" happen every time should be a hook, and anything that needs judgment should be advice in the prompt. See more at https://kasi.kasion.dev, and if you are interested in the thinking behind it, read [My rules for pair programming with AI](/en/blog/ai-pair-programming-rules).

## Summary

Claude Code hooks turn requests into rules. Use PreToolUse to block things that cannot be undone, such as `rm -rf`, force push, DROP TABLE and secret files. Use PostToolUse to check work right after edits. Always make the block message show a way out, and remember that a hook is a seatbelt, not a substitute for limiting permissions at the system level.
