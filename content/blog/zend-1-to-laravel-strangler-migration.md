---
title: "ย้าย Zend Framework 1.12 ไป Laravel ทีละโมดูลด้วย strangler pattern"
date: "2026-07-01"
excerpt: "ย้ายระบบ Zend Framework 1.12 ไป Laravel ทีละโมดูลด้วย strangler pattern: แยก routing, แชร์ session และ database ระหว่างสองระบบ และเลือกลำดับโมดูลที่ปลอดภัย"
tags: ["laravel", "zend", "legacy", "migration", "php"]
---

งานหนึ่งที่ผมนำอยู่ตอนนี้คือย้ายระบบ Sell-in และ WMS ที่เขียนด้วย Zend Framework 1.12 ไปเป็น Laravel ระบบนี้มีผู้ใช้ทุกวัน เก็บข้อมูลสำคัญอย่าง sales order, purchase order และ IMEI tracking การเขียนใหม่ทั้งหมดแล้วสลับทีเดียว (big bang rewrite) เสี่ยงเกินไป ผมจึงใช้ strangler pattern ย้ายจาก Zend 1 ไป Laravel ทีละโมดูล บทความนี้อธิบายโครงสร้าง routing การแชร์ session และ database และลำดับการย้ายโมดูล

## Strangler pattern คืออะไร

แนวคิดคือวางระบบใหม่ไว้ข้างระบบเก่า แล้วค่อย ๆ ย้ายทีละส่วนไปที่ระบบใหม่ ผู้ใช้เข้าที่ URL เดิม แต่บาง path ถูกส่งไป Laravel บาง path ยังไปที่ Zend จนสุดท้ายระบบเก่าไม่เหลือ path ให้ทำงาน และปิดได้

ข้อดีสำหรับระบบที่ต้องใช้งานทุกวัน:

- ย้ายทีละโมดูล ถ้าพังก็ย้อนกลับเฉพาะโมดูลนั้น
- ส่งมอบคุณค่าได้ตลอดทาง ไม่ต้องรอหลายเดือน
- ทีมได้เรียนรู้ระบบเก่าไปทีละส่วน แทนที่จะต้องเข้าใจทั้งหมดก่อนเริ่ม

## 1. Routing: ให้ web server เป็นคนแยก

วิธีที่ผมชอบที่สุดคือแยกที่ระดับ web server เพราะสองแอปไม่ต้องรู้จักกันเลย ตัวอย่างด้วย Nginx และ PHP-FPM:

```nginx
server {
    listen 80;
    server_name app.example.com;

    # โมดูลที่ย้ายแล้ว -> Laravel
    location ~ ^/(sales-orders|purchase-orders|api/v2)(/|$) {
        root /var/www/laravel/public;
        try_files $uri /index.php?$query_string;
    }

    # ทุกอย่างที่เหลือ -> Zend 1
    location / {
        root /var/www/zend/public;
        try_files $uri /index.php?$query_string;
    }

    location ~ \.php$ {
        # เลือก root ตาม prefix ที่ผ่านมา
        set $app_root /var/www/zend/public;
        if ($request_uri ~ ^/(sales-orders|purchase-orders|api/v2)(/|$)) {
            set $app_root /var/www/laravel/public;
        }
        fastcgi_pass unix:/run/php-fpm/www.sock;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $app_root/index.php;
    }
}
```

ถ้าใช้ Apache ก็ทำแบบเดียวกันได้ด้วย `RewriteRule` ที่ชี้ prefix เฉพาะไปยัง `public/index.php` ของ Laravel

ทุกครั้งที่ย้ายโมดูลเสร็จ แค่เพิ่ม prefix ใน regex แล้ว reload web server การ rollback ก็คือลบ prefix ออก ใช้เวลาไม่ถึงนาที

## 2. แชร์ session ระหว่างสองระบบ

ผู้ใช้ต้อง login ครั้งเดียวแล้วใช้ได้ทั้งสองฝั่ง แต่ Zend 1 ใช้ native PHP session ส่วน Laravel มี session ของตัวเองที่เข้ารหัส cookie คนละรูปแบบกัน สองแอปจึงอ่าน session ของกันและกันตรง ๆ ไม่ได้

ทางที่ผมเลือกคือให้ระบบเก่ายังเป็นเจ้าของการ login ไปก่อน ตอน login สำเร็จ Zend เขียน key เล็ก ๆ ลง Redis ที่แชร์กัน (session id ชี้ไปที่ user id) แล้วให้ Laravel อ่าน key นั้นผ่าน middleware แทนการ parse session ของ PHP ตรง ๆ:

```php
<?php
// app/Http/Middleware/LegacySessionAuth.php
namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Support\Facades\Auth;

class LegacySessionAuth
{
    public function handle($request, Closure $next)
    {
        if (!Auth::check()) {
            $sid = $request->cookie(config('legacy.session_cookie', 'PHPSESSID'));
            $userId = $sid ? $this->readLegacyUserId($sid) : null;
            if (!$userId) {
                return redirect('/login'); // Zend login page
            }
            Auth::login(User::findOrFail($userId));
        }
        return $next($request);
    }

    private function readLegacyUserId(string $sid): ?int
    {
        if (!preg_match('/^[a-zA-Z0-9,-]{20,128}$/', $sid)) {
            return null;
        }
        // On login, the Zend app also writes "legacy_auth:<session id>" => user id
        // into a shared Redis, with the same TTL as its session.
        $userId = app('redis')->connection('legacy')->get('legacy_auth:' . $sid);
        return $userId ? (int) $userId : null;
    }
}
```

รายละเอียดจะต่างกันตามระบบ แต่หลักที่ต้องมีคือ:

- ข้อมูลที่แชร์ต้องอยู่ใน storage ที่ทั้งสองแอปเข้าถึงได้ เช่น Redis หรือ database ไม่ใช่ไฟล์บนเครื่อง
- ตอน logout หรือ session หมดอายุ Zend ต้องลบ key นี้ด้วย
- ตรวจรูปแบบ session id ก่อนใช้เสมอ
- ห้าม Laravel เขียนทับ session ของ Zend ให้อ่านอย่างเดียว
- เมื่อย้ายโมดูลไปมากพอแล้ว ค่อยกลับด้าน ให้ Laravel เป็นเจ้าของ login และให้ Zend อ่านแทน

## 3. แชร์ database อย่างมีวินัย

สองระบบใช้ database เดียวกันในช่วงเปลี่ยนผ่าน ซึ่งสะดวกแต่อันตราย กติกาที่ผมใช้:

- **ตารางหนึ่งมีเจ้าของคนเดียว** ในแต่ละช่วงเวลา ระบบที่เป็นเจ้าของเท่านั้นที่เปลี่ยน schema ได้
- **Laravel model ใช้ชื่อตารางเดิม** ด้วย `protected $table` และปิด timestamps ถ้าตารางเก่าไม่มีคอลัมน์ `created_at`/`updated_at`
- **Migration ต้องเข้ากันได้ย้อนหลัง** เพิ่มคอลัมน์ได้ แต่ห้ามลบหรือเปลี่ยนชื่อ จนกว่าโค้ด Zend ที่ใช้คอลัมน์นั้นจะหายไปหมด
- **Business logic อยู่ที่เดียว** ถ้าต้องคำนวณยอดหรือสถานะเหมือนกันทั้งสองฝั่ง ให้ย้ายไป Laravel แล้วให้ Zend เรียกผ่าน API ภายใน แทนการเขียนซ้ำสองที่

## 4. ลำดับการย้ายโมดูล

ลำดับที่ผิดทำให้งานทั้งโปรเจกต์ติด ผมเรียงตามหลักนี้:

1. **เริ่มจากโมดูลอ่านอย่างเดียว** เช่นรายงานหรือหน้าค้นหา ความเสี่ยงต่ำ และได้ทดสอบ routing กับ session จริง
2. **ต่อด้วยโมดูลที่แยกตัวได้** มี dependency กับโมดูลอื่นน้อย
3. **แล้วค่อยถึงโมดูลหลักที่เขียนข้อมูล** เช่น sales order และ purchase order ทำทีละโมดูล พร้อม feature flag สำหรับย้อนกลับ
4. **ทิ้งโมดูลที่ซับซ้อนที่สุดไว้ทีหลัง** เช่น IMEI tracking ที่เกี่ยวพันกับเกือบทุกส่วน เพราะตอนนั้นทีมจะเข้าใจระบบเก่ามากพอแล้ว
5. **สุดท้ายคือ auth และหน้าหลัก** แล้วจึงปิด Zend

ก่อนย้ายแต่ละโมดูล ผมให้ทีมเขียน characterization test ที่บันทึกพฤติกรรมเดิมไว้ก่อน แม้พฤติกรรมเดิมบางอย่างจะดูแปลก แต่ผู้ใช้อาจพึ่งพามันอยู่ เปลี่ยนพฤติกรรมเป็นงานแยกหลังย้ายเสร็จ

## สรุป

การย้าย Zend Framework 1.12 ไป Laravel ด้วย strangler pattern ทำให้ระบบที่ต้องใช้ทุกวันเปลี่ยนผ่านได้โดยไม่ต้องหยุด แยก routing ที่ web server เพื่อให้ rollback ได้ในหนึ่งนาที แชร์ session แบบอ่านอย่างเดียวผ่าน storage กลาง ให้ทุกตารางมีเจ้าของคนเดียว และเรียงโมดูลจากเสี่ยงน้อยไปเสี่ยงมาก ถ้าอยากอ่านเรื่องการออกแบบข้อมูลของโมดูลที่ซับซ้อนที่สุด ลองดู [ออกแบบ schema สำหรับ IMEI tracking](/blog/imei-tracking-schema-design)
