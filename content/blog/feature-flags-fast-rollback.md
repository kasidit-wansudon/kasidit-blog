---
title: "Feature Flags สำหรับ Rollback เร็วในทีมเล็ก: Flag แบบง่ายบน Database"
date: "2026-02-11"
excerpt: "ใช้ feature flags แบบเก็บใน database เพื่อ rollback ได้เร็วโดยไม่ต้อง deploy ใหม่ เหมาะกับทีมเล็ก พร้อมโค้ด Laravel และกติกาว่าเมื่อไรควรลบ flag ทิ้ง"
tags: ["feature-flags", "laravel", "deploy", "rollback"]
---

ในทีมเล็กที่ผมดูแล การ rollback ด้วยการ deploy เวอร์ชันเก่ากลับไปใช้เวลาหลายนาที และบางครั้งทำไม่ได้ง่าย ๆ เพราะมี migration ปนอยู่ สิ่งที่ช่วยลดความเครียดตรงนี้ได้มากคือ feature flags แบบง่าย ๆ ที่เก็บใน database กดปิดแล้ว feature ใหม่หายไปทันทีโดยไม่ต้อง deploy บทความนี้จะเล่าว่าทำ feature flags สำหรับ rollback เร็วยังไง ไม่ต้องซื้อบริการภายนอก และที่สำคัญคือเมื่อไรต้องลบมันทิ้ง

## Feature flag แก้ปัญหาอะไร

แนวคิดคือแยก "deploy code" ออกจาก "เปิดใช้ feature" code ใหม่ขึ้น production ได้ตั้งแต่เช้า แต่ยังปิดอยู่ พร้อมแล้วค่อยเปิด ถ้ามีปัญหาก็ปิด

ประโยชน์ที่ได้จริงในทีมเล็ก

- **Rollback ในไม่กี่วินาที** แทนการ deploy ย้อน
- **เปิดให้คนกลุ่มเล็กก่อน** เช่น ทีม IT หรือ user ที่อาสาทดสอบ
- **deploy ได้ถี่ขึ้น** เพราะ code ที่ยังไม่เสร็จ merge เข้า main ได้โดยปิด flag ไว้
- **ลดความเสี่ยงช่วง deploy freeze** ช่วงวันหยุดที่ไม่อยาก deploy เรายังปิด feature ที่มีปัญหาได้

## ทำไมเลือกแบบเก็บใน database

มีหลายทางเลือก ตั้งแต่ใส่ใน env, ใช้ไฟล์ config ไปจนถึงบริการ SaaS สำหรับทีมเล็ก ผมเลือก database เพราะ

- เปลี่ยนค่าได้ทันทีโดยไม่ต้อง deploy หรือ restart (env ต้อง restart และอาจต้อง clear config cache)
- ไม่มีค่าใช้จ่ายเพิ่มและไม่มี dependency ภายนอก
- มี audit ได้ว่าใครเปิดปิดเมื่อไร
- ทีมคุ้นเคยอยู่แล้ว

## โครงสร้างตารางและ service สำหรับเช็ค flag

ทั้งหมดมีแค่สามชิ้น คือตาราง, class เล็ก ๆ หนึ่งตัวสำหรับเช็คค่า และจุดที่เรียกใช้ใน code

```php
// Migration
Schema::create('feature_flags', function (Blueprint $table) {
    $table->id();
    $table->string('key', 100)->unique();
    $table->boolean('enabled')->default(false);
    $table->json('allowed_user_ids')->nullable(); // optional allowlist
    $table->string('owner', 100);                 // who is responsible
    $table->date('remove_by')->nullable();        // planned cleanup date
    $table->text('description')->nullable();
    $table->timestamps();
});

// Model FeatureFlag: protected $casts = ['enabled' => 'bool', 'allowed_user_ids' => 'array'];

// app/Support/Feature.php
namespace App\Support;

use App\Models\FeatureFlag;
use Illuminate\Support\Facades\Cache;

class Feature
{
    public static function enabled(string $key, ?int $userId = null): bool
    {
        $flag = Cache::remember("flag:{$key}", 30, fn () =>
            FeatureFlag::where('key', $key)->first()?->only(['enabled', 'allowed_user_ids'])
        );

        if (! $flag) {
            return false; // unknown flag = off (safe default)
        }

        if ($flag['enabled']) {
            return true;
        }

        $allowed = $flag['allowed_user_ids'] ?? [];
        return $userId !== null && in_array($userId, $allowed, true);
    }

    public static function forget(string $key): void
    {
        Cache::forget("flag:{$key}");
    }
}

// Usage in a controller
if (Feature::enabled('orders.new_export', auth()->id())) {
    return $this->newExport($request);
}
return $this->legacyExport($request);
```

คอลัมน์ `owner` และ `remove_by` ไม่ได้เกี่ยวกับการทำงานของ flag เลย แต่สำคัญที่สุดในระยะยาว จะอธิบายในหัวข้อสุดท้าย

จุดออกแบบที่สำคัญ

- **ค่า default เป็นปิด** ถ้าลืมสร้าง record หรือ database มีปัญหา ระบบจะกลับไปใช้ทางเดิมที่ปลอดภัย
- **cache สั้น ๆ** ไม่ให้ทุก request ยิง database แต่ยังสะท้อนการเปลี่ยนแปลงภายในไม่กี่สิบวินาที และเรียก `forget` ทันทีเมื่อมีการแก้ค่า
- **ทาง legacy ต้องยังทำงาน** flag ไม่มีประโยชน์ถ้าทางเดิมพังไปแล้ว
- **บันทึกการเปลี่ยนแปลง** ทุกครั้งที่มีคนเปิดปิด ให้ log ว่าใคร เมื่อไร เปลี่ยนจากอะไรเป็นอะไร

## Flag กับ migration

flag ไม่ได้ช่วยถ้า migration ทำลาย schema ที่ code เดิมใช้ ให้ทำ migration แบบ expand ก่อน คือเพิ่ม column หรือตารางใหม่โดยไม่แตะของเดิม เปิด flag ใช้ของใหม่ พอมั่นใจแล้วค่อยทำ contract คือลบของเดิมใน deploy ถัดไป ลำดับนี้ทำให้การปิด flag ยังเป็น rollback ที่ปลอดภัยจริง

## เมื่อไรควรใช้ flag และเมื่อไรไม่ควร

ใช้เมื่อ

- feature ใหม่ที่กระทบ user จำนวนมาก
- การเปลี่ยน logic สำคัญ เช่น การคำนวณ การ export รายงาน
- การเปลี่ยนไปเรียก API ภายนอกตัวใหม่

ไม่ต้องใช้เมื่อ

- แก้ bug เล็ก ๆ ที่ rollback ด้วย deploy ปกติได้
- เปลี่ยนข้อความหรือ style
- งานที่จะทำให้มีหลายทางซ้อนกันจน test ไม่ครบ

## เมื่อไรต้องลบ flag

นี่คือส่วนที่ทีมส่วนใหญ่พลาด flag ที่ไม่ถูกลบจะกลายเป็นหนี้ทางเทคนิค code มีสองทางที่ต้องดูแล test ต้องครอบคลุมทั้งสองแบบ และสักวันจะมีคนเผลอปิด flag ที่เปิดมาเป็นปีแล้วพาระบบกลับไปใช้ code เก่าที่ไม่มีใครจำได้

กติกาที่ผมใช้

1. **ทุก flag ต้องมี owner และ `remove_by`** ตั้งแต่ตอนสร้าง ปกติคือ 2–4 สัปดาห์หลังเปิดเต็ม
2. **เมื่อเปิดเต็มแล้วไม่มีปัญหาครบหนึ่งรอบการใช้งาน** เช่น ผ่านสิ้นเดือนสำหรับงานรายงาน ให้เปิด ticket ลบ flag
3. **ลบเป็นสอง deploy** รอบแรกลบการเช็ค flag และ code ทางเก่าออก รอบสองลบ record ในตาราง
4. **มี command แจ้งเตือน** flag ที่เลย `remove_by` แล้วส่งรายชื่อเข้าช่องทีมทุกสัปดาห์

```php
// app/Console/Commands/StaleFlags.php (handle method)
$stale = FeatureFlag::whereNotNull('remove_by')
    ->where('remove_by', '<', now()->toDateString())
    ->get(['key', 'owner', 'remove_by']);

foreach ($stale as $flag) {
    $this->warn("{$flag->key} (owner: {$flag->owner}) overdue since {$flag->remove_by}");
}
```

กฎง่าย ๆ ที่ผมบอกทีม: flag เป็นนั่งร้าน ไม่ใช่ส่วนหนึ่งของบ้าน สร้างเสร็จแล้วต้องรื้อ

## สรุป

Feature flags แบบเก็บใน database เป็นเครื่องมือ rollback ที่ถูกและได้ผลที่สุดสำหรับทีมเล็ก ตั้งค่า default เป็นปิด ใช้ cache สั้น ๆ เก็บ log การเปลี่ยนแปลง และคู่กับ migration แบบ expand/contract แต่สิ่งที่ทำให้มันไม่กลายเป็นหนี้คือวินัยในการลบ ทุก flag ต้องมี owner และวันที่จะลบตั้งแต่วันแรก ถ้าอยากต่อยอดเรื่องกติกาการ deploy ทั้งระบบ อ่านต่อได้ที่ [deploy freeze และ branch-merge policy](/blog/deploy-freeze-branch-merge-policy)
