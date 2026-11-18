---
title: "ย้าย DingTalk integration จาก TOP API เก่าไป API v1.0"
date: "2026-09-23"
excerpt: "แผนย้าย DingTalk integration จาก TOP API เก่าไป API v1.0 ตั้งแต่สำรวจจุดเรียกใช้ จัดการ access token ทดสอบ จนถึง rollout ทีละส่วนโดยไม่กระทบผู้ใช้"
tags: ["dingtalk", "api", "migration", "laravel"]
---

ระบบภายในหลายตัวที่ผมดูแลเชื่อมกับ DingTalk ทั้ง login, approval webhook และการส่งข้อความ หลายจุดเขียนไว้นานแล้วบน API รุ่นเก่า (ที่หลายคนเรียกว่า TOP API หรือ oapi) ปีนี้ผมนำการย้าย **DingTalk API จาก TOP ไป v1.0** โพสต์นี้คือแผนที่ใช้จริง ตั้งแต่การสำรวจ การจัดการ token การทดสอบ จนถึงการ rollout

## ทำไมต้องย้าย

API รุ่นใหม่ของ DingTalk (v1.0) มีรูปแบบที่สม่ำเสมอกว่า เป็น REST ที่ใช้ JSON ทั้ง request และ response และส่ง access token ผ่าน header แทน query string ฟีเจอร์ใหม่ ๆ มักออกมาบน v1.0 ก่อนหรือมีแค่บน v1.0 การอยู่บน API เก่าต่อไปจึงเป็นหนี้ทางเทคนิคที่ดอกเบี้ยเพิ่มขึ้นเรื่อย ๆ

แต่เหตุผลที่ทำให้ผมลงมือจริงคือ โค้ดเชื่อม DingTalk กระจายอยู่หลายระบบ แต่ละระบบเขียนวิธีขอ token เอง cache เอง และ handle error เอง การย้ายครั้งนี้จึงเป็นโอกาสรวมทุกอย่างเข้าที่เดียว

## ขั้นที่ 1: สำรวจทุกจุดที่เรียกใช้

ก่อนเขียนโค้ดใหม่ ผม grep ทุก repository หาการเรียก domain ของ API เก่า แล้วทำตาราง:

- ระบบไหนเรียก endpoint อะไร
- ใช้ทำอะไร (login, ข้อมูลผู้ใช้, approval, ข้อความ)
- endpoint นั้นมีตัวเทียบบน v1.0 หรือไม่ และ field ต่างกันอย่างไร
- ความสำคัญต่อธุรกิจ ถ้าพังแล้วใครเดือดร้อน

ตารางนี้กลายเป็นแผน rollout ในตัว endpoint ที่สำคัญน้อยและตัวเทียบชัดเจนย้ายก่อน ส่วน login และ approval ที่ทุกคนใช้ทุกวันย้ายทีหลังสุด

## ขั้นที่ 2: จัดการ access token ที่เดียว

API ทั้งสองรุ่นใช้ access token ที่มีอายุจำกัด ความผิดพลาดที่ผมเจอบ่อยในโค้ดเก่าคือขอ token ใหม่ทุก request ซึ่งทั้งช้าและเสี่ยงชน rate limit

บน v1.0 ขอ token ด้วย `appKey` และ `appSecret` แล้วส่งใน header `x-acs-dingtalk-access-token` ผมเขียน client กลางที่ cache token ไว้และต่ออายุก่อนหมด:

```php
<?php

namespace App\Services\DingTalk;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class DingTalkClient
{
    private const BASE = 'https://api.dingtalk.com';

    public function token(): string
    {
        return Cache::remember('dingtalk:v1:token', now()->addMinutes(100), function () {
            $res = Http::post(self::BASE . '/v1.0/oauth2/accessToken', [
                'appKey'    => config('services.dingtalk.app_key'),
                'appSecret' => config('services.dingtalk.app_secret'),
            ])->throw()->json();

            return $res['accessToken'];
        });
    }

    public function get(string $path, array $query = []): array
    {
        return $this->request()->get(self::BASE . $path, $query)->throw()->json();
    }

    public function post(string $path, array $body = []): array
    {
        return $this->request()->post(self::BASE . $path, $body)->throw()->json();
    }

    private function request()
    {
        return Http::withHeaders(['x-acs-dingtalk-access-token' => $this->token()])
            ->timeout(10)
            ->retry(2, 200);
    }
}
```

token มีอายุราวสองชั่วโมง ผม cache ไว้สั้นกว่านั้นเพื่อเผื่อเวลา ถ้ามีหลาย server ต้องใช้ cache ที่แชร์กัน เช่น Redis ไม่ใช่ file cache แยกเครื่อง ไม่อย่างนั้นแต่ละเครื่องจะขอ token ของตัวเอง

`appKey` และ `appSecret` อ่านจาก config ที่มาจาก environment หรือ secrets manager ห้าม hardcode ในโค้ด

## ขั้นที่ 3: Adapter แทนการแก้ทุกจุด

แทนที่จะแก้ทุกจุดที่เรียก API เก่าให้เรียก API ใหม่ ผมสร้าง interface กลาง เช่น `getUser`, `sendWorkNotice` แล้วมี implementation สองตัว ตัวหนึ่งเรียก API เก่า อีกตัวเรียก v1.0 โค้ดของแต่ละระบบเรียกผ่าน interface เท่านั้น

ข้อดีคือ:

- สลับรุ่นได้ด้วย config ต่อฟีเจอร์ ไม่ต้อง deploy ใหม่
- แปลง field ที่ต่างกันในที่เดียว เช่น ชื่อ field ที่เปลี่ยนรูปแบบ
- rollback คือเปลี่ยน config กลับ ซึ่งผมเล่าแนวคิดนี้ไว้ใน [feature flag เพื่อ rollback ได้เร็ว](/blog/feature-flags-fast-rollback)

ช่วงเดียวกันผมรวม QR login และ JSAPI signing ไว้เป็น service กลางที่ใช้ร่วมกันด้วย ระบบใหม่ไม่ต้องเขียนส่วนนี้เองอีก

## ขั้นที่ 4: ทดสอบ

- **contract test** เรียก endpoint จริงด้วย app สำหรับทดสอบ เทียบ output ของ adapter ทั้งสองตัวว่าได้ข้อมูลเดียวกันหลังแปลง field
- **shadow call** ช่วงแรกให้ระบบเรียกทั้งสองรุ่น ใช้ผลจากรุ่นเก่า แต่ log ความต่างของผลจากรุ่นใหม่ วิธีนี้จับกรณีขอบที่ไม่อยู่ในเอกสารได้หลายกรณี
- **ทดสอบ token หมดอายุ** ลบ cache ระหว่างใช้งาน แล้วดูว่า client ขอใหม่ได้ถูกต้องโดยผู้ใช้ไม่เห็น error
- **ทดสอบ error** ตรวจว่า error ของ v1.0 ซึ่งรูปแบบต่างจากรุ่นเก่า ถูกแปลงเป็นข้อความที่ระบบเราเข้าใจ

## ขั้นที่ 5: Rollout ทีละส่วน

ลำดับที่ผมใช้:

1. endpoint อ่านข้อมูลที่ไม่สำคัญ เช่น ข้อมูลแผนก
2. การส่งข้อความแจ้งเตือน
3. approval webhook ซึ่งมี scheduled recovery job คอยเก็บตกเหตุการณ์ที่พลาดอยู่แล้ว
4. login เป็นอันสุดท้าย เปิดให้กลุ่มเล็กก่อน แล้วค่อยขยาย

แต่ละขั้นเว้นระยะให้ใช้งานจริงสักพัก ดู log ของ error และ latency ก่อนไปขั้นต่อไป และหลีกเลี่ยงช่วงที่มี deploy freeze

## สรุป

การย้าย DingTalk จาก TOP API ไป v1.0 ไม่ใช่แค่การเปลี่ยน URL เริ่มจากสำรวจทุกจุดที่เรียกใช้ รวมการจัดการ access token ไว้ที่ client กลางที่ cache อย่างถูกต้อง ใช้ adapter เพื่อสลับรุ่นด้วย config ทดสอบด้วย shadow call และ rollout จากส่วนที่สำคัญน้อยไปหาส่วนที่สำคัญที่สุด ทำแบบนี้แล้วผู้ใช้แทบไม่รู้ว่ามีการย้ายเกิดขึ้น
