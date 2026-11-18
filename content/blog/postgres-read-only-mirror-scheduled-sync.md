---
title: "ทำ read-only mirror ของตาราง warehouse ลง PostgreSQL ด้วย scheduled sync"
date: "2026-09-30"
excerpt: "ทำไมรายงานไม่ควร query ฐานข้อมูลหลักตรง ๆ และวิธีทำ read-only mirror ลง PostgreSQL ด้วย scheduled sync ใน Laravel พร้อมโค้ดและ pitfall ที่ต้องระวัง"
tags: ["postgresql", "laravel", "data", "reporting"]
---

ตอนเริ่มทำ Sell-in Dashboard ผมต้องใช้ข้อมูลจากระบบ warehouse ซึ่งเป็นฐานข้อมูลหลักที่ระบบปฏิบัติการใช้ทุกวัน ทางเลือกที่ง่ายที่สุดคือต่อเข้าไป query ตรง ๆ แต่ผมเลือกทำ **read-only mirror** ของตารางที่ต้องใช้ 20 ตาราง ลง **PostgreSQL** แล้วให้ **scheduled sync** ดึงข้อมูลตามรอบ โพสต์นี้จะเล่าเหตุผล การออกแบบ ตัว sync job และ pitfall ที่เจอ

## ทำไมไม่ query ฐานข้อมูลหลักตรง ๆ

**1. รายงานกับงานปฏิบัติการมีรูปแบบโหลดต่างกัน** ระบบ warehouse ต้องการ transaction สั้นและเร็ว ส่วน dashboard ต้องการ query ที่ aggregate ข้อมูลจำนวนมาก ถ้าทั้งสองแย่งทรัพยากรเดียวกัน คนที่เดือดร้อนคือพนักงานที่กำลังสแกนสินค้าเข้าคลัง

**2. ความเสี่ยงเรื่องสิทธิ์** ระบบรายงานไม่ควรมีสิทธิ์เขียนข้อมูลการปฏิบัติการเลย แม้แต่โดยอุบัติเหตุ

**3. อิสระในการปรับ schema ฝั่งรายงาน** บน mirror ผมเพิ่ม index ที่เหมาะกับรายงาน หรือสร้าง materialized view ได้โดยไม่ต้องขออนุญาตใครและไม่กระทบระบบหลัก

**4. ข้อมูลไม่จำเป็นต้อง real-time** ผู้ใช้ dashboard ดูยอดขายเพื่อวางแผน ข้อมูลที่ช้าไปไม่กี่นาทียอมรับได้ ถ้าคุยตกลงเรื่องนี้กับผู้ใช้ตั้งแต่ต้น การออกแบบจะง่ายขึ้นมาก

## การออกแบบ

โครงสร้างโดยรวมมีสามส่วน:

- **ต้นทาง** ฐานข้อมูล warehouse ใช้ user ที่มีสิทธิ์ `SELECT` อย่างเดียว เฉพาะตารางที่ต้องใช้
- **sync job** Laravel command ที่รันผ่าน scheduler ดึงข้อมูลที่เปลี่ยนตั้งแต่รอบที่แล้วมา upsert
- **ปลายทาง** PostgreSQL ที่แอปรายงานต่อด้วย role ที่อ่านได้อย่างเดียวเช่นกัน มีแค่ sync job ที่เขียนได้

แต่ละตารางผมกำหนด config ว่า primary key คืออะไร และใช้คอลัมน์ไหนบอกว่าแถวเปลี่ยน (ปกติคือ `updated_at`) ตารางเล็กที่ไม่มีคอลัมน์ติดตามการเปลี่ยนแปลง ผมให้ copy ใหม่ทั้งตารางแทน

ฝั่ง PostgreSQL แยก role ชัดเจน:

```sql
CREATE ROLE report_reader LOGIN PASSWORD '...';
GRANT CONNECT ON DATABASE reporting TO report_reader;
GRANT USAGE ON SCHEMA mirror TO report_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA mirror TO report_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA mirror GRANT SELECT ON TABLES TO report_reader;
```

`ALTER DEFAULT PRIVILEGES` สำคัญ เพราะถ้าลืม ตารางที่เพิ่มทีหลังจะอ่านไม่ได้ และจะกลายเป็น bug ที่หาสาเหตุยาก

## Sync job

นี่คือโครงของ command ที่ทำ incremental sync ทีละตาราง (ตัวอย่างใช้ตาราง `orders`):

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncMirror extends Command
{
    protected $signature = 'mirror:sync {table}';

    public function handle(): int
    {
        $table = $this->argument('table');
        $source = DB::connection('warehouse');
        $target = DB::connection('reporting');

        $since = $target->table('mirror.sync_state')
            ->where('table_name', $table)
            ->value('last_synced_at') ?? '1970-01-01 00:00:00';

        $startedAt = $source->selectOne('SELECT NOW() AS now')->now;

        $source->table($table)
            ->where('updated_at', '>=', $since)
            ->orderBy('id')
            ->chunkById(2000, function ($rows) use ($target, $table) {
                $payload = $rows->map(fn ($r) => (array) $r)->all();
                $columns = array_keys($payload[0]);

                $target->table("mirror.{$table}")
                    ->upsert($payload, ['id'], array_diff($columns, ['id']));
            });

        $target->table('mirror.sync_state')->updateOrInsert(
            ['table_name' => $table],
            ['last_synced_at' => $startedAt]
        );

        return self::SUCCESS;
    }
}
```

และตั้งรอบใน scheduler:

```php
Schedule::command('mirror:sync orders')
    ->everyTenMinutes()
    ->withoutOverlapping()
    ->onOneServer();
```

จุดที่ตั้งใจออกแบบ:

- **ใช้เวลาจากต้นทาง** `$startedAt` อ่านจากฐานข้อมูลต้นทาง ไม่ใช่นาฬิกาของ app server ป้องกันปัญหานาฬิกาไม่ตรงกัน
- **บันทึกเวลาเริ่ม ไม่ใช่เวลาจบ** แถวที่ถูกแก้ระหว่าง sync จะถูกดึงอีกครั้งในรอบถัดไป ใช้ `>=` ด้วยเหตุผลเดียวกัน ข้อมูลซ้ำไม่เป็นไรเพราะ upsert
- **chunk** ไม่ดึงทั้งตารางเข้า memory ทีเดียว
- **withoutOverlapping** ถ้ารอบก่อนยังไม่จบ รอบใหม่จะไม่ซ้อน

## เลือกรอบ sync อย่างไร

รอบ sync ที่ถี่เกินไปไม่ได้ทำให้ข้อมูลดีขึ้นเสมอ แต่เพิ่มโหลดให้ต้นทางแน่นอน ผมเริ่มจากถามผู้ใช้ว่า "ข้อมูลช้าได้กี่นาทีโดยไม่กระทบการตัดสินใจ" แล้วเลือกรอบที่สั้นกว่านั้นเล็กน้อย ตารางที่เปลี่ยนบ่อยและสำคัญ sync ถี่ ส่วนตาราง master data ที่แทบไม่เปลี่ยน เช่น รายการคลังหรือประเภทสินค้า sync วันละไม่กี่ครั้งก็พอ การแยกรอบตามตารางแบบนี้ลดโหลดได้มาก และยังทำให้ดูได้ง่ายว่าตารางไหนใช้เวลา sync นานผิดปกติ

## Pitfall ที่เจอ

**แถวที่ถูกลบ** incremental sync ด้วย `updated_at` มองไม่เห็นการลบ ถ้าต้นทางใช้ soft delete ก็ไม่มีปัญหา ถ้าเป็น hard delete ต้องมีรอบ reconcile แยก เช่น เทียบรายการ `id` วันละครั้งแล้วลบส่วนที่หายไป

**`updated_at` ไม่ถูกอัปเดตเสมอ** โค้ดเก่าบางจุดแก้ข้อมูลด้วย raw SQL โดยไม่แตะ `updated_at` ต้องตรวจให้แน่ใจก่อนเชื่อคอลัมน์นี้ และมี full resync ไว้เป็นทางสำรอง

**ชนิดข้อมูลและ timezone** วันที่ค่าศูนย์ (`0000-00-00`) ที่บางระบบยอมให้เก็บ ใส่ลง PostgreSQL ไม่ได้ ต้องแปลงเป็น `NULL` ส่วน timestamp ต้องตกลงให้ชัดว่าเก็บเป็น UTC หรือเวลาท้องถิ่น

**schema ต้นทางเปลี่ยน** ถ้ามีคนเพิ่มคอลัมน์ที่ต้นทาง upsert จะพังเพราะคอลัมน์ไม่มีที่ปลายทาง ผมเลือกระบุรายการคอลัมน์ใน config ชัด ๆ แทนการ copy ทุกคอลัมน์ เพื่อให้พังแบบรู้ตัวมากกว่าพังแบบเงียบ

**ไม่รู้ว่า sync หยุด** สิ่งที่แย่ที่สุดคือ dashboard แสดงข้อมูลเก่าโดยไม่มีใครรู้ ผมแสดง `last_synced_at` บนหน้า dashboard และตั้งแจ้งเตือนเมื่อไม่มีการ sync เกินเวลาที่กำหนด

ข้อดีอีกข้อของการมีรอบ sync ที่ชัดเจน คือใช้เป็นเวอร์ชันของข้อมูลสำหรับ cache ได้ ซึ่งผมใช้ทำ ETag ใน [dashboard ที่ลดเหลือต่ำกว่า 100ms](/blog/sell-in-dashboard-etag-304-under-100ms)

## สรุป

read-only mirror ลง PostgreSQL แยกโหลดรายงานออกจากระบบปฏิบัติการ จำกัดสิทธิ์ได้ชัด และให้อิสระในการปรับ schema ฝั่งรายงาน หัวใจของ scheduled sync คือ ใช้เวลาจากต้นทาง บันทึกเวลาเริ่ม upsert เป็น chunk และกันรอบซ้อน ส่วนสิ่งที่ต้องวางแผนตั้งแต่ต้นคือ การลบ, `updated_at` ที่เชื่อไม่ได้, ชนิดข้อมูล และการแจ้งเตือนเมื่อ sync หยุด
