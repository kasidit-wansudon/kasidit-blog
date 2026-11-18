---
title: "Reliable Laravel Webhooks: Idempotency, Queue Retry, Recovery Jobs"
date: "2026-02-18"
excerpt: "How to make Laravel webhooks reliable with idempotency keys, queue retry, and a scheduled recovery job that catches lost events, with working code examples."
tags: ["laravel", "webhook", "queue", "reliability", "php"]
---

Webhooks look simple: an external system fires an HTTP request, we process it, done. In real use, though, I have run into every problem possible: events arriving twice, arriving out of order, arriving just as the server is deploying, or not arriving at all. The work I manage includes receiving webhooks from DingTalk's approval system, and if an event is lost, an employee's request sits stuck with nobody knowing, until the person asks why it has not been approved. This post is how to make webhooks in Laravel reliable with four layers: accept fast and respond right away, idempotency keys, queue retry, and a scheduled recovery job.

## The mindset: do not trust that a webhook arrives complete and exactly once

Most providers only guarantee "at-least-once", meaning sent at least one time. Some guarantee nothing at all, some resend if we respond slowly, and some stop sending after a few attempts. So our system has to handle all three cases.

- The same event arrives several times
- The event arrives, but we fail to process it
- The event never reaches us at all

Each layer described below solves one of these, and all layers are needed, because each one closes a hole that the others cannot.

## Layer 1: Receive fast, respond fast, then do the work

The controller that receives a webhook should do only three things: verify the signature, store the event in the database, and push it to the queue, then respond 200 immediately. Never do heavy work or call other APIs inside the request, because if it takes longer than the sender's timeout, they treat it as failed and fire again, which adds more load on us.

The `webhook_events` table does two jobs in one: it is a log of what was received, and it is the duplicate guard.

## Layer 2: Idempotency key on both receiving and processing

A unique index on `(source, event_id)` is the idempotency key. If the same event arrives again, we find the existing record, do not create a new one, and do not dispatch the job again.

If the sender has no stable event id, build a key yourself from values that do not change, such as a hash of the instance id + new status + the time the status changed. Never use random values or the time we received it, because a duplicate event would then get a different key.

In the case where duplicate requests arrive at exactly the same moment, `firstOrCreate` may hit the unique index and throw an exception. Catch that exception and respond 200 right away, because it means the other request has already stored it.

Another key point: **the job itself must be idempotent too**, because a job can run again from a retry or from the recovery job. Check the status before acting, and do everything in the same transaction as the status change.

```php
// Migration
Schema::create('webhook_events', function (Blueprint $table) {
    $table->id();
    $table->string('source', 50);
    $table->string('event_id', 191);
    $table->string('type', 100);
    $table->json('payload');
    $table->string('status', 20)->default('pending'); // pending|processed|failed
    $table->unsignedInteger('attempts')->default(0);
    $table->text('last_error')->nullable();
    $table->timestamp('processed_at')->nullable();
    $table->timestamps();
    $table->unique(['source', 'event_id']);
    $table->index(['status', 'created_at']);
});

// Controller: verify, store, dispatch, answer fast
class ApprovalWebhookController extends Controller
{
    public function __invoke(Request $request)
    {
        abort_unless($this->validSignature($request), 401);

        try {
            $event = WebhookEvent::firstOrCreate(
                ['source' => 'approval', 'event_id' => (string) $request->input('event_id')],
                ['type' => (string) $request->input('type'), 'payload' => $request->all()]
            );
        } catch (UniqueConstraintViolationException $e) {
            return response()->json(['ok' => true]); // concurrent duplicate
        }

        if ($event->wasRecentlyCreated) {
            ProcessWebhookEvent::dispatch($event->id);
        }

        return response()->json(['ok' => true]);
    }
}

// Job: safe to run more than once
class ProcessWebhookEvent implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 5;

    public function __construct(public int $eventId) {}

    public function backoff(): array
    {
        return [10, 60, 300, 900];
    }

    public function handle(ApprovalService $service): void
    {
        $event = WebhookEvent::findOrFail($this->eventId);
        if ($event->status === 'processed') {
            return;
        }

        $event->increment('attempts');

        DB::transaction(function () use ($event, $service) {
            $service->apply($event->payload); // must be idempotent
            $event->update(['status' => 'processed', 'processed_at' => now(), 'last_error' => null]);
        });
    }

    public function failed(Throwable $e): void
    {
        WebhookEvent::whereKey($this->eventId)
            ->update(['status' => 'failed', 'last_error' => mb_substr($e->getMessage(), 0, 1000)]);
    }
}
```

## Layer 3: Queue retry with backoff

`$tries` and `backoff()` let a job that failed because of a temporary problem, such as the target API being briefly down or a database lock, retry automatically. The growing intervals keep us from piling more load on a system that is already having trouble.

Cautions I have actually run into:

- **Separate permanent errors from temporary ones.** For example, a malformed payload or a referenced record that cannot be found will not be fixed by any number of retries. Call `$this->fail()` right away instead of retrying until the limit.
- **Set the queue connection's `retry_after` higher than the job's maximum run time.** Otherwise a single job gets picked up and run twice at the same time, which is another reason jobs must be idempotent.
- **Run `php artisan queue:restart` on every deploy** so workers load the new code. Otherwise workers keep running the old code.
- **Do not store secrets or personal data in `last_error`.** Some exception messages carry data from the payload with them.

## Layer 4: Scheduled recovery job for events that went missing

The first three layers handle events that have reached us. But if an event never arrives, for example our server was down when the sender fired, or the network in between had a problem and the sender does not retry, we will never know. The fix is a recovery job that runs on a schedule and does two things.

1. Re-queue events that were stored but have been stuck at `pending` for longer than a threshold
2. Ask the sender's API directly for the status of items still open on our side, and reconcile them

```php
// routes/console.php (Laravel 11+)
Schedule::job(new RecoverMissedApprovals)->everyFifteenMinutes()->withoutOverlapping();

class RecoverMissedApprovals implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(ApprovalApi $api, ApprovalService $service): void
    {
        // 1. Re-dispatch events we stored but never finished
        WebhookEvent::where('status', 'pending')
            ->where('created_at', '<', now()->subMinutes(10))
            ->pluck('id')
            ->each(fn ($id) => ProcessWebhookEvent::dispatch($id));

        // 2. Ask the provider about requests still open on our side
        $open = $service->openRequests()->where('created_at', '>', now()->subDays(7));

        foreach ($open as $request) {
            $remote = $api->getStatus($request->external_id);
            if ($remote->isFinal() && $remote->status !== $request->status) {
                $service->applyRemoteStatus($request, $remote); // same idempotent path
                Log::info('approval.recovered', ['id' => $request->id]);
            }
        }
    }
}
```

Design notes for the recovery job:

- **Use the same logic as the webhook.** Recovery must call the same service, not a second copy of the status-update logic, or the two paths will slowly drift apart.
- **Limit the time window you check** and respect the sender API's rate limit. If there are many items, split them into batches.
- **Use `withoutOverlapping()`** so two runs do not overlap if the previous one has not finished.
- **Log every time recovery finds something.** If this number is unusually high, the webhook has a problem to investigate. The recovery job is a safety net, not the main path.

## Minimum monitoring

- Number of events with `status = failed`
- Number of events stuck at `pending` past the threshold
- Number of items the recovery job fixed per day

All three should alert into the team's chat channel, and there should be a small screen where an admin can reprocess failed events after the cause has been fixed.

## Summary

Webhooks in Laravel become reliable once we stop expecting them to arrive complete and exactly once. Receive fast and store in a table, use a unique index as the idempotency key, make jobs safe to run again, set up queue retry with backoff, and have a scheduled recovery job that catches lost events by asking the source for status. These four layers keep users' requests from getting stuck silently. The same principles apply to any system that depends on external events, whether payments, approvals, or marketplaces.
