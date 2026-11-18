---
title: "My AI Pair Programming Rules: Small Diffs, Tests First, Read All"
date: "2026-01-21"
excerpt: "My daily AI pair programming rules: ask for small diffs, write tests first, reject unverified code and read every line before commit, so AI speeds you up."
tags: ["ai", "claude-code", "workflow", "testing"]
---

I pair-code with AI every day, and I admit it really does make me faster. But early on I actually lost more time than before, because I accepted big chunks of code without reading them and then had to chase bugs I did not write. After that I set a few pair programming rules for myself and have used them ever since. This post is that set of rules.

## Treat AI as a Pair Partner, Not a Replacement

In traditional pair programming, one person is the driver who types and the other is the navigator who thinks about the big picture and checks the work. When working with AI, I let the AI be the driver who types very fast, and I must always be the navigator. The moment I stop being the navigator, it is no longer pair programming. It is handing the work to a machine and hoping.

## Rule 1: Ask for Small Diffs

I do not say "build the whole export system for me." I break it into steps, such as:

1. Add a method in the service that fetches data by date range
2. Add an endpoint that calls that method
3. Add the CSV conversion
4. Add a button on the screen

Each step must be small enough that I can finish reading the diff in a few minutes. The reason is simple: with a three-hundred-line diff people just "skim," but with a thirty-line diff people actually read, and bugs hide in big diffs more easily every time.

Another benefit is that if a step is wrong, I can throw away just that step and start again, without tearing down the whole thing.

## Rule 2: Tests First

Before letting the AI change important logic, I have it write a test that describes the desired behavior first. Then I read that test to see whether it matches what I have in mind. Only after that do I let it write code to make the test pass.

```php
public function test_export_only_includes_orders_in_date_range(): void
{
    Order::factory()->create(['created_at' => '2025-12-31']);
    $inRange = Order::factory()->create(['created_at' => '2026-01-10']);

    $rows = app(OrderExportService::class)
        ->rows('2026-01-01', '2026-01-31');

    $this->assertCount(1, $rows);
    $this->assertSame($inRange->id, $rows[0]['id']);
}
```

A test like this is much easier to read than the real code, and it is a clear contract between me and the AI. If the AI misunderstood the task, I see it while reading the test, before it writes a whole block of wrong code.

One thing to watch: make sure the AI is not "fixing the test to pass" instead of fixing the code. If you see a diff touching the test file after we agreed on it, stop and ask right away.

## Rule 3: Do Not Accept Code That Has Not Been Verified

"Done" from the AI does not mean done. I count it as done only when:

- The tests actually pass on my machine, not the AI saying "they should pass"
- I have run the app and tried that flow myself at least once
- There are no new errors in the log

The runtime is the judge, not the AI's confidence and not my feeling. An AI can explain wrong code very confidently, so you cannot trust an explanation over the result of a run.

## Rule 4: Read Every Line Before Committing

This sounds boring but is the most important. If I commit code I have not read, I am putting my name on something I do not know the function of. What I look for when reading:

- Variable, function or method names that do not exist in the codebase
- Edits to files I did not ask to change
- Exceptions silently swallowed by an empty `try/catch`
- Queries that may cause N+1 or fetch more data than needed
- Hardcoded values such as URLs or credentials

If I read a line and do not understand it, I ask the AI to explain it. If I still do not understand, I rewrite it more simply. Code the team does not understand is debt that comes back to collect interest at night.

## Rule 5: State the Scope Clearly, and What Must Not Be Touched

My good prompts usually have three parts: what the problem is, which files are involved, and what does not need to change. For example, "Change only `OrderExportService`, do not refactor the controller and do not change the date format." That last sentence goes a long way toward keeping the AI from over-fixing out of "good intentions."

## When to Stop Using AI for a While

If the AI loops on the same bug for more than two rounds, I stop and go back to reading the code myself, together with the real logs. I wrote about this in detail in [AI hallucination and ghost bugs](/en/blog/ai-hallucination-ghost-bugs). In short: when the tool starts guessing, we have to come back to being the one holding the evidence.

## Summary

My pair programming rules with AI are five: ask for small diffs, write tests first, do not accept code that has not been verified by actually running it, read every line before committing, and state the scope, including what must not be touched, clearly. AI makes us type faster, but responsibility for the code is still 100% ours.
