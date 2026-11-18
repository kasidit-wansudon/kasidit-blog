---
title: "เปิด auth gate แบบ log-only ก่อน enforce: rollout โดยไม่ล็อกผู้ใช้ออก"
date: "2026-09-16"
excerpt: "rollout auth gate ใหม่ในโหมด log-only ก่อน ใช้ log ไล่หาความล้มเหลวจาก app build เก่า แล้วค่อย enforce อย่างปลอดภัย พร้อมโค้ด middleware ใน Laravel"
tags: ["security", "laravel", "auth", "rollout"]
---

การเพิ่มการตรวจสิทธิ์ใหม่ในระบบที่มีคนใช้อยู่แล้วมีความเสี่ยงที่คนมักประเมินต่ำ: ถ้าตรวจเข้มเกินไปหรือมี client บางตัวที่ยังไม่พร้อม ผู้ใช้จริงจะถูกล็อกออกทันที ตอนผมเพิ่ม staff-token **auth gate** ให้ระบบภายใน ผมจึงเปิดมันในโหมด **log-only** ก่อน เก็บข้อมูลว่าใครจะถูกบล็อกบ้าง ไล่แก้จนเหลือศูนย์ แล้วค่อย enforce โพสต์นี้คือขั้นตอนทั้งหมด

## ทำไมไม่ enforce ทันที

ในระบบที่มีหลาย client เช่น เว็บ แอปมือถือหลายเวอร์ชัน script อัตโนมัติ และ webhook จากระบบภายนอก เราแทบไม่มีทางรู้ครบว่าใครเรียก endpoint ไหนด้วย header อะไร

แอปมือถือเป็นตัวปัญหาที่สุด เพราะผู้ใช้ไม่ได้อัปเดตแอปพร้อมกัน build เก่าที่ยังไม่ส่ง token ใหม่จะยังอยู่ในเครื่องผู้ใช้อีกหลายสัปดาห์ ถ้า enforce วันแรก คนกลุ่มนี้จะเปิดแอปแล้วใช้งานไม่ได้ทันที และทีม helpdesk จะรับสายไม่ทัน

log-only เปลี่ยนคำถามจาก "ถ้า enforce แล้วจะพังไหม" ซึ่งตอบไม่ได้ เป็น "ถ้า enforce วันนี้ จะมีกี่ request ถูกบล็อก และมาจากไหน" ซึ่งตอบได้ด้วยข้อมูลจริง

## Middleware ที่มีสองโหมด

หัวใจคือ middleware ตัวเดียวที่ทำงานได้ทั้งสองโหมด สลับด้วย config:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class StaffTokenGate
{
    public function handle(Request $request, Closure $next): Response
    {
        $mode = config('auth_gate.mode', 'log'); // off | log | enforce

        if ($mode === 'off') {
            return $next($request);
        }

        $failure = $this->check($request);

        if ($failure !== null) {
            Log::channel('auth_gate')->warning('auth_gate.fail', [
                'reason'      => $failure,
                'mode'        => $mode,
                'route'       => optional($request->route())->getName(),
                'app_version' => $request->header('X-App-Version', 'unknown'),
                'platform'    => $request->header('X-Platform', 'unknown'),
                'user_id'     => optional($request->user())->id,
            ]);

            if ($mode === 'enforce') {
                return response()->json(['message' => 'Unauthorized'], 401);
            }
        }

        return $next($request);
    }

    private function check(Request $request): ?string
    {
        $token = $request->bearerToken();

        if (! $token) {
            return 'missing_token';
        }

        if (! app(StaffTokenVerifier::class)->verify($token)) {
            return 'invalid_token';
        }

        return null;
    }
}
```

จุดที่ตั้งใจ:

- **มีโหมด `off`** เป็นทางถอยสุดท้ายถ้า middleware เองมี bug
- **log เหตุผลแยกประเภท** `missing_token` กับ `invalid_token` บอกปัญหาคนละแบบ ตัวแรกมักเป็น client เก่า ตัวหลังอาจเป็น bug ฝั่งออก token หรือการโจมตี
- **log เวอร์ชันแอปและ platform** ข้อมูลนี้คือสิ่งที่ทำให้ไล่ปัญหาได้จริง
- **ไม่ log ตัว token** log มีคนอ่านได้มากกว่าที่คิด ห้ามเก็บ credential ลงไป

## ไล่ความล้มเหลวจาก log

หลังเปิด log-only ผมสรุป log ทุกวัน จัดกลุ่มตาม `reason`, `app_version`, `platform` และ `route` ภาพที่ออกมาชัดมาก:

1. **build เก่าของแอปมือถือ** เกือบทั้งหมดของ `missing_token` มาจากแอปเวอร์ชันก่อนที่จะเพิ่มการส่ง token ทางแก้คือบังคับอัปเดตแอปขั้นต่ำ และแจ้งผู้ใช้ล่วงหน้า
2. **script และ integration ภายใน** มี job อัตโนมัติบางตัวที่เรียก endpoint เดียวกันโดยไม่มี token เลย บางตัวไม่มีใครจำได้ว่ามีอยู่ ทางแก้คือแยกให้ใช้ credential ของ service แทน
3. **endpoint ที่ไม่ควรอยู่หลัง gate** บาง route เช่น health check หรือ webhook จากภายนอก ไม่ควรตรวจ staff token ตั้งแต่แรก ต้องย้ายออกไปใช้การตรวจแบบอื่น
4. **bug จริงในการออก token** มี `invalid_token` จำนวนเล็กน้อยที่เกิดจาก token หมดอายุแล้วแอปไม่ refresh ถ้า enforce ไปก่อน bug นี้จะถูกมองว่าเป็นปัญหาผู้ใช้

แต่ละกลุ่มกลายเป็นงานหนึ่งงาน มีเจ้าของและกำหนดเสร็จ ผมติดตามจำนวน fail ต่อวันจนลดลงจนเหลือแต่สิ่งที่ตั้งใจบล็อกจริง

## รู้ได้อย่างไรว่าพร้อม enforce

ผมตั้งเกณฑ์ไว้ล่วงหน้า ไม่ตัดสินจากความรู้สึก เกณฑ์ที่ใช้คือ log-only ต้องรันครบหลายวันทำการ รวมช่วงต้นเดือนและสิ้นเดือนที่มีงานพิเศษ เพราะ job บางตัวรันแค่เดือนละครั้ง request ที่ fail ต้องเหลือแต่กลุ่มที่เรารู้จักและตั้งใจบล็อก และเวอร์ชันแอปขั้นต่ำต้องถูกบังคับใช้แล้ว ถ้าข้อใดข้อหนึ่งยังไม่ผ่าน ก็ยังไม่ enforce แม้จะเลยกำหนดการที่วางไว้ก็ตาม

## Enforce อย่างปลอดภัย

เมื่อตัวเลขนิ่งแล้ว การ enforce คือการเปลี่ยน config ค่าเดียว แต่ผมยังทำเป็นขั้น:

1. **enforce ทีละกลุ่ม route** เริ่มจาก route ที่ log สะอาดที่สุด
2. **เลือกช่วงเวลาที่ทีมพร้อม** ไม่ enforce วันศุกร์เย็น หรือช่วง deploy freeze
3. **เตรียม rollback** การถอยกลับคือเปลี่ยนโหมดเป็น `log` ซึ่งทำได้ในไม่กี่วินาที เขียนไว้ใน runbook ตั้งแต่ก่อนเริ่ม
4. **แจ้ง helpdesk ล่วงหน้า** พร้อมคำตอบสำเร็จรูปสำหรับผู้ใช้ที่ยังไม่อัปเดตแอป
5. **เก็บ log ต่อหลัง enforce** request ที่ถูกบล็อกยังต้องถูกบันทึก เพื่อดูว่ามีกลุ่มใหม่โผล่มาหรือไม่

แนวคิดเดียวกันนี้ใช้ได้กับ rollout อื่น ๆ ที่ย้อนกลับยาก ผมเขียนเรื่องการใช้ flag เป็นทางถอยไว้ใน [feature flag เพื่อ rollback ได้เร็ว](/blog/feature-flags-fast-rollback)

## สรุป

การเพิ่ม auth gate ในระบบที่มีผู้ใช้อยู่แล้ว ให้เริ่มจากโหมด log-only ที่บันทึกเหตุผล เวอร์ชันแอป platform และ route ของทุก request ที่จะถูกบล็อก ใช้ข้อมูลนั้นไล่แก้ทีละกลุ่ม ทั้ง app build เก่า script ที่ถูกลืม และ route ที่ไม่ควรอยู่หลัง gate แล้วค่อย enforce ทีละส่วนพร้อมทางถอยที่เปลี่ยนได้ในไม่กี่วินาที ความปลอดภัยที่เพิ่มขึ้นไม่ควรแลกมาด้วยผู้ใช้ที่ถูกล็อกออกโดยไม่จำเป็น
