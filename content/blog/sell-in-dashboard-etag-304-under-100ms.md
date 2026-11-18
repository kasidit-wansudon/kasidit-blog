---
title: "Dashboard จาก ~300ms เหลือต่ำกว่า 100ms ด้วย Set lookup และ ETag/304 ใน Laravel"
date: "2026-10-07"
excerpt: "ลด latency ของ dashboard จากราว 300ms เหลือต่ำกว่า 100ms ด้วย Set lookup และ ETag/304 caching ใน Laravel พร้อมตัวอย่างโค้ดที่นำไปใช้ได้จริง"
tags: ["laravel", "performance", "caching", "php"]
---

ตอนทำ Sell-in Dashboard ที่ OPPO Mexico (Laravel 12 + PostgreSQL) ผู้ใช้บ่นว่าการกด filter แต่ละครั้ง "หน่วง" ไม่ได้ช้ามากจนใช้ไม่ได้ แต่ช้าพอให้รู้สึก ผมวัดแล้วได้ราว ~300ms ต่อ interaction หลังปรับสองเรื่องหลัก คือ **Set lookup** และ **ETag/304 caching** ใน Laravel ตัวเลขลงมาต่ำกว่า 100ms โพสต์นี้จะเล่าทั้งสองเทคนิคพร้อมโค้ดตัวอย่าง

## วัดก่อนแก้

ก่อนแตะโค้ด ผมแยกเวลาออกเป็นสามส่วน: เวลา query, เวลาประมวลผลใน PHP และเวลาส่งข้อมูลผ่าน network สิ่งที่เจอคือ query ไม่ได้ช้าอย่างที่คิด เพราะข้อมูลอยู่ใน PostgreSQL ที่มี index ดีแล้ว เวลาส่วนใหญ่ไปอยู่ที่ PHP ที่วนลูปจับคู่ข้อมูล และการส่ง JSON ก้อนเดิมซ้ำ ๆ ทั้งที่ข้อมูลไม่เปลี่ยน

ถ้าข้ามขั้นนี้ไป ผมคงเสียเวลาไปจูน query ที่ไม่ใช่ปัญหา

## เทคนิคที่ 1: เปลี่ยน in_array เป็น Set lookup

โค้ดเดิมมี pattern แบบนี้ซ่อนอยู่หลายจุด: วนลูปรายการขาย แล้วเช็กว่ารหัสสินค้าอยู่ในรายการที่ผู้ใช้เลือกหรือไม่

```php
// Before: in_array is O(n) per call -> O(n * m) overall
$selected = $request->input('product_ids', []);

$rows = $orders->filter(function ($order) use ($selected) {
    return in_array($order->product_id, $selected);
});

// After: build a hash set once, lookup is O(1)
$selectedSet = array_flip($request->input('product_ids', []));

$rows = $orders->filter(function ($order) use ($selectedSet) {
    return isset($selectedSet[$order->product_id]);
});
```

PHP ไม่มี Set type ในตัว แต่ array ที่ใช้ค่าเป็น key ทำงานเหมือน hash set `array_flip` สร้างครั้งเดียว แล้ว `isset` เช็กได้ในเวลาคงที่ ถ้ารายการที่เลือกมีหลายร้อยตัวและข้อมูลมีหลายหมื่นแถว ความต่างเห็นได้ชัด

ข้อควรระวัง: `array_flip` ใช้ได้กับค่าที่เป็น string หรือ integer เท่านั้น และถ้าค่ามาจาก request อาจเป็น string ขณะที่ข้อมูลจาก database เป็น integer PHP จะแปลง key ที่เป็นตัวเลขให้อัตโนมัติ แต่ควรทดสอบกรณีนี้ให้แน่ใจ

จุดอื่นที่ใช้หลักเดียวกัน คือการ join ข้อมูลใน memory: แทนที่จะใช้ `firstWhere` ในลูป ให้ใช้ `keyBy('id')` สร้าง map ครั้งเดียว แล้วดึงด้วย key

## เทคนิคที่ 2: ETag และ 304 Not Modified

dashboard ถูกเปิดค้างไว้ทั้งวัน และ frontend ดึงข้อมูลชุดเดิมซ้ำทุกครั้งที่สลับ tab หรือกด refresh แต่ข้อมูล sell-in เปลี่ยนแค่ตอนรอบ sync ตามตาราง ไม่ได้เปลี่ยนทุกวินาที

ETag แก้ปัญหานี้ได้พอดี server ส่ง hash ของ response ไปพร้อม header `ETag` browser จะเก็บไว้และส่งกลับมาใน `If-None-Match` ครั้งต่อไป ถ้า hash ตรงกัน server ตอบ `304 Not Modified` แบบไม่มี body browser ใช้ข้อมูลใน cache ของตัวเอง

middleware ใน Laravel:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetETag
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (! $request->isMethod('GET') || $response->getStatusCode() !== 200) {
            return $response;
        }

        $etag = '"' . md5($response->getContent()) . '"';
        $response->headers->set('ETag', $etag);
        $response->headers->set('Cache-Control', 'private, no-cache');

        if ($request->headers->get('If-None-Match') === $etag) {
            $response->setNotModified();
        }

        return $response;
    }
}
```

`Cache-Control: private, no-cache` บอก browser ว่าเก็บได้ แต่ต้องถาม server ทุกครั้งก่อนใช้ ซึ่งคือสิ่งที่เราต้องการ ข้อมูลไม่มีวันเก่า แต่ไม่ต้องส่งซ้ำ `private` สำคัญเพราะข้อมูลขึ้นกับสิทธิ์ของผู้ใช้ ห้าม proxy กลางทางเก็บไว้แชร์

Laravel มี middleware `cache.headers` ที่รองรับ option `etag` อยู่แล้ว ถ้าความต้องการตรงกัน ใช้ตัวนั้นได้เลย ผมเขียนเองเพราะต้องการควบคุม header ให้ตรงกับกรณีของเรา

## ทำให้ ETag ถูกกว่านี้อีก

middleware ข้างบนยังต้องสร้าง response ทั้งก้อนก่อนจะ hash ได้ ส่วนที่ประหยัดคือ network และการ parse JSON ฝั่ง client ถ้าอยากประหยัดฝั่ง server ด้วย ให้สร้าง ETag จาก "เวอร์ชันของข้อมูล" แทน เช่น เวลาที่ sync ล่าสุดรวมกับ filter ของ request แล้วเช็ก `If-None-Match` **ก่อน** query เลย ถ้าตรงกันก็ตอบ 304 ทันที

วิธีนี้ใช้ได้ดีเมื่อข้อมูลเปลี่ยนตามรอบที่รู้แน่นอน เช่น ระบบที่ดึงข้อมูลจาก read-only mirror ที่ sync ตามตาราง ซึ่งผมเล่าไว้ใน [read-only mirror ของ PostgreSQL ที่ sync ตามตาราง](/blog/postgres-read-only-mirror-scheduled-sync)

## ตรวจว่า ETag ทำงานจริง

หลัง deploy ผมเปิด DevTools แท็บ Network แล้วดูสองอย่าง: request แรกต้องได้ `200` พร้อม header `ETag` ส่วน request ถัดไปที่ข้อมูลไม่เปลี่ยนต้องได้ `304` และขนาด response เหลือเพียงไม่กี่ร้อยไบต์ ถ้ายังได้ `200` ทุกครั้ง สาเหตุที่พบบ่อยคือ response มีค่าที่เปลี่ยนทุก request ปนอยู่ เช่น timestamp ที่สร้างตอนตอบ หรือ CSRF token ทำให้ hash ไม่เคยตรงกัน อีกสาเหตุคือ proxy หรือ compression บางตัวแก้ ETag ระหว่างทาง ต้องตรวจทั้งเส้นทาง ไม่ใช่แค่ใน Laravel

## ผลลัพธ์และสิ่งที่เรียนรู้

หลังรวมสองเทคนิค interaction ส่วนใหญ่ของ dashboard ลงมาจาก ~300ms เหลือต่ำกว่า 100ms ผู้ใช้เลิกบ่นเรื่องหน่วง โดยไม่ต้องเพิ่ม server หรือเปลี่ยนสถาปัตยกรรม

บทเรียนที่ผมได้:

- **วัดแยกส่วนก่อนเสมอ** สิ่งที่ช้าอาจไม่ใช่ database
- **O(n × m) ซ่อนอยู่ในโค้ดที่ดูไร้พิษภัย** `in_array` และ `firstWhere` ในลูปคือผู้ต้องสงสัยอันดับแรก
- **ข้อมูลที่ไม่เปลี่ยน ไม่ต้องส่งซ้ำ** ETag/304 เพิ่มโค้ดไม่กี่บรรทัด แต่ได้ผลกับทุก request ที่ซ้ำ
- **ระวังเรื่องสิทธิ์** response ที่ขึ้นกับผู้ใช้ต้องเป็น `private` เสมอ

## สรุป

การทำให้ dashboard เร็วขึ้นไม่ต้องเริ่มจากการเปลี่ยน stack ในกรณีของผม สองเทคนิคพื้นฐาน คือเปลี่ยน array lookup เป็น Set ด้วย `array_flip` และ `isset` กับเพิ่ม ETag/304 caching ใน Laravel ก็พอพา latency จาก ~300ms ลงมาต่ำกว่า 100ms ได้แล้ว เริ่มจากวัดให้รู้ว่าเวลาไปอยู่ตรงไหน แล้วแก้ตรงนั้น
