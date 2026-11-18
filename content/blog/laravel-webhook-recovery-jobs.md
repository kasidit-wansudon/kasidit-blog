---
title: "ทำ Webhook ใน Laravel ให้เชื่อถือได้: Idempotency, Queue Retry, Recovery Job"
date: "2026-02-18"
excerpt: "วิธีทำ webhook ใน Laravel ให้เชื่อถือได้ ด้วย idempotency key, queue retry และ scheduled recovery job ที่ตามเก็บ event ที่หลุดหาย พร้อมตัวอย่างโค้ดใช้งานจริง"
tags: ["laravel", "webhook", "queue", "reliability", "php"]
---

Webhook ดูเรียบง่าย ระบบภายนอกยิง HTTP มา เราประมวลผล จบ แต่ในการใช้งานจริง ผมเจอทุกปัญหาที่เป็นไปได้ ทั้ง event มาซ้ำ มาผิดลำดับ มาตอน server กำลัง deploy พอดี หรือไม่มาเลย งานที่ผมดูแลมีการรับ webhook จากระบบอนุมัติของ DingTalk ซึ่งถ้า event หาย คำขอของพนักงานจะค้างอยู่โดยไม่มีใครรู้ จนเจ้าตัวมาถามว่าทำไมยังไม่อนุมัติ บทความนี้คือวิธีทำ webhook ใน Laravel ให้เชื่อถือได้ด้วยสี่ชั้น คือ รับเร็วแล้วตอบทันที, idempotency key, queue retry และ scheduled recovery job

## หลักคิด: อย่าเชื่อว่า webhook จะมาครบและมาครั้งเดียว

ผู้ให้บริการส่วนใหญ่รับประกันแค่ "at-least-once" คือส่งอย่างน้อยหนึ่งครั้ง บางรายไม่รับประกันอะไรเลย บางรายส่งซ้ำถ้าเราตอบช้า และบางรายเลิกส่งหลังลองไม่กี่ครั้ง ดังนั้นระบบเราต้องรับมือได้ทั้งสามกรณี

- event เดิมมาซ้ำหลายครั้ง
- event มาถึง แต่เราประมวลผลไม่สำเร็จ
- event ไม่มาถึงเราเลย

แต่ละชั้นที่จะเล่าต่อไปนี้แก้ปัญหาทีละข้อ และต้องมีครบทุกชั้น เพราะแต่ละชั้นปิดช่องโหว่ที่อีกชั้นปิดไม่ได้

## ชั้นที่ 1: รับเร็ว ตอบเร็ว แล้วค่อยทำงาน

controller ที่รับ webhook ควรทำแค่สามอย่าง คือ ตรวจ signature, บันทึก event ลง database, ส่งเข้า queue แล้วตอบ 200 ทันที ห้ามทำงานหนักหรือเรียก API อื่นใน request เพราะถ้าช้าเกิน timeout ของผู้ส่ง เขาจะถือว่าล้มเหลวแล้วยิงซ้ำ ซึ่งเพิ่มภาระให้เราอีก

ตาราง `webhook_events` ทำหน้าที่สองอย่างในตัวเดียว คือเป็น log ว่าได้รับอะไรมาบ้าง และเป็นตัวกันซ้ำ

## ชั้นที่ 2: Idempotency key ทั้งตอนรับและตอนประมวลผล

unique index บน `(source, event_id)` คือ idempotency key ถ้า event เดิมมาซ้ำ เราจะเจอ record เดิม ไม่สร้างใหม่ และไม่ dispatch job ซ้ำ

ถ้าผู้ส่งไม่มี event id ที่เสถียร ให้สร้าง key เองจากค่าที่ไม่เปลี่ยน เช่น hash ของ instance id + สถานะใหม่ + เวลาที่เปลี่ยนสถานะ ห้ามใช้ค่าที่สุ่มหรือเวลาที่เรารับ เพราะ event ซ้ำจะได้ key ต่างกัน

กรณีที่ request ซ้ำมาพร้อมกันเป๊ะ `firstOrCreate` อาจชน unique index แล้วโยน exception ได้ ให้จับ exception นั้นแล้วตอบ 200 ไปเลย เพราะแปลว่าอีก request บันทึกไว้แล้ว

จุดสำคัญอีกข้อ: **ตัว job เองต้อง idempotent ด้วย** เพราะ job อาจถูกรันซ้ำจาก retry หรือจาก recovery job ใช้วิธีเช็คสถานะก่อนทำ และทำทุกอย่างใน transaction เดียวกับการเปลี่ยนสถานะ

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

## ชั้นที่ 3: Queue retry ที่มี backoff

`$tries` และ `backoff()` ทำให้ job ที่ล้มเหลวเพราะปัญหาชั่วคราว เช่น API ปลายทางล่มสั้น ๆ หรือ database lock ได้ลองใหม่โดยอัตโนมัติ ระยะห่างที่เพิ่มขึ้นเรื่อย ๆ ช่วยไม่ให้เราไปซ้ำเติมระบบที่กำลังมีปัญหาอยู่

ข้อควรระวังที่ผมเจอจริง

- **แยก error ถาวรออกจาก error ชั่วคราว** เช่น payload ผิดรูปแบบหรือหา record ที่อ้างถึงไม่เจอ retry อีกกี่ครั้งก็ไม่หาย ให้เรียก `$this->fail()` ทันทีแทนการลองซ้ำจนครบ
- **ตั้ง `retry_after` ของ queue connection ให้มากกว่าเวลารันสูงสุดของ job** ไม่งั้น job เดียวจะถูกหยิบไปรันสองรอบพร้อมกัน ซึ่งเป็นอีกเหตุผลที่ job ต้อง idempotent
- **สั่ง `php artisan queue:restart` ทุกครั้งที่ deploy** เพื่อให้ worker โหลด code ใหม่ ไม่งั้น worker จะรัน code เก่าต่อไปเรื่อย ๆ
- **อย่าเก็บ secret หรือข้อมูลส่วนบุคคลใน `last_error`** ข้อความ exception บางตัวมีข้อมูลจาก payload ติดมาด้วย

## ชั้นที่ 4: Scheduled recovery job สำหรับ event ที่หายไป

สามชั้นแรกจัดการ event ที่มาถึงเราแล้ว แต่ถ้า event ไม่มาเลย เช่น server เราล่มตอนผู้ส่งยิงมา หรือ network ระหว่างทางมีปัญหา และผู้ส่งไม่ retry เราจะไม่มีวันรู้ ทางแก้คือ recovery job ที่รันตามรอบ ทำสองอย่าง

1. หยิบ event ที่บันทึกไว้แล้วแต่ค้าง `pending` นานเกินเกณฑ์ กลับเข้า queue อีกรอบ
2. ไปถามสถานะจาก API ของผู้ส่งโดยตรง สำหรับรายการที่ฝั่งเรายังเปิดอยู่ แล้วแก้ให้ตรงกัน

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

ข้อสังเกตในการออกแบบ recovery job

- **ใช้ logic เดียวกับ webhook** recovery ต้องเรียก service ตัวเดียวกัน ไม่ใช่เขียน logic อัปเดตสถานะซ้ำอีกชุด ไม่งั้นสองทางจะค่อย ๆ ทำงานไม่เหมือนกัน
- **จำกัดช่วงเวลาที่ตรวจ** และเคารพ rate limit ของ API ผู้ส่ง ถ้ารายการเยอะให้แบ่งเป็น batch
- **ใช้ `withoutOverlapping()`** กันไม่ให้สองรอบรันทับกันถ้ารอบก่อนยังไม่จบ
- **log ทุกครั้งที่ recovery เจอของ** ถ้าตัวเลขนี้สูงผิดปกติ แปลว่า webhook มีปัญหาที่ต้องสืบต่อ recovery job คือตาข่ายรองรับ ไม่ใช่ทางหลัก

## Monitoring ขั้นต่ำ

- จำนวน event ที่ `status = failed`
- จำนวน event ที่ `pending` นานเกินเกณฑ์
- จำนวนรายการที่ recovery job แก้ได้ต่อวัน

ทั้งสามตัวควรมี alert เข้าช่องแชตของทีม และควรมีหน้าจอเล็ก ๆ ให้ admin กด reprocess event ที่ failed ได้หลังแก้สาเหตุแล้ว

## สรุป

Webhook ใน Laravel จะเชื่อถือได้เมื่อเราเลิกคาดหวังว่ามันจะมาครบและมาครั้งเดียว รับให้เร็วแล้วบันทึกลงตาราง ใช้ unique index เป็น idempotency key ทำให้ job ปลอดภัยต่อการรันซ้ำ ตั้ง queue retry พร้อม backoff และมี scheduled recovery job คอยตามเก็บ event ที่หลุดหายด้วยการถามสถานะจากต้นทาง สี่ชั้นนี้ทำให้คำขอของ user ไม่ค้างเงียบอีก หลักเดียวกันนี้ใช้ได้กับทุกระบบที่พึ่ง event จากภายนอก ไม่ว่าจะเป็น payment, การอนุมัติ หรือ marketplace
