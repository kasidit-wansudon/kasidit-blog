---
title: "Sign Request ของ TikTok Shop API ด้วย HMAC-SHA256 ใน PHP และ Node.js"
date: "2026-03-25"
excerpt: "วิธี sign request ของ TikTok Shop API ด้วย HMAC-SHA256 ทั้งใน PHP และ Node.js อธิบาย canonical string, ข้อผิดพลาดที่เจอบ่อย และวิธีทดสอบให้ถูกตั้งแต่ครั้งแรก"
tags: ["api", "hmac", "php", "nodejs", "tiktok-shop"]
---

ตอนต่อ TikTok Shop API ครั้งแรก ผมเสียเวลาไปกับ error `invalid sign` มากกว่าเวลาเขียน logic จริงเสียอีก ปัญหาไม่ได้อยู่ที่ HMAC-SHA256 แต่อยู่ที่การประกอบ string ที่จะ sign ให้ตรงกับฝั่ง server ทุกตัวอักษร บทความนี้สรุปหลักการ sign request ของ TikTok Shop API พร้อมโค้ด PHP และ Node.js และวิธีทดสอบที่ทำให้ผมไม่ต้องเดาอีก

หมายเหตุ: รายละเอียดสเปกอาจเปลี่ยนตามเวอร์ชัน API ให้ตรวจกับเอกสารทางการของ TikTok Shop ที่ใช้อยู่เสมอ โค้ดด้านล่างคือโครงหลักการที่ผมใช้

## HMAC signing ทำงานยังไง

แนวคิดคือ ทั้งเรากับ server มี app secret ตัวเดียวกัน เราสร้าง "canonical string" จาก request แล้วคำนวณ HMAC-SHA256 ด้วย secret ได้ผลเป็น signature แนบไปกับ request ฝั่ง server ทำแบบเดียวกันแล้วเทียบ ถ้าตรงแปลว่า request มาจากเราและไม่ถูกแก้ระหว่างทาง

ดังนั้นสิ่งเดียวที่ต้องทำให้ถูกคือ **canonical string ต้องเหมือนกันทุก byte**

## ประกอบ canonical string

โครงทั่วไปของ TikTok Shop API มีขั้นตอนประมาณนี้

1. เอา query parameters ทั้งหมด ยกเว้น `sign` และ `access_token`
2. เรียงตาม key แบบตัวอักษร (ASCII order)
3. ต่อกันเป็น `key` + `value` โดยไม่มีตัวคั่น
4. นำ API path มาไว้ข้างหน้า
5. ถ้ามี request body ที่ไม่ใช่ multipart ให้ต่อ body (JSON string) ไว้ท้าย
6. ห่อด้วย app secret ทั้งหน้าและหลัง
7. คำนวณ HMAC-SHA256 ด้วย app secret แล้วแปลงเป็น hex ตัวพิมพ์เล็ก

## โค้ด PHP

```php
<?php

function tiktokSign(string $path, array $query, string $body, string $secret): string
{
    unset($query['sign'], $query['access_token']);
    ksort($query, SORT_STRING);

    $input = $path;
    foreach ($query as $key => $value) {
        $input .= $key . $value;
    }
    $input .= $body;

    $input = $secret . $input . $secret;

    return hash_hmac('sha256', $input, $secret);
}

$query = [
    'app_key'   => 'your_app_key',
    'timestamp' => (string) time(),
    'shop_cipher' => 'your_shop_cipher',
];
$body = json_encode(['page_size' => 20], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

$query['sign'] = tiktokSign('/order/202309/orders/search', $query, $body, getenv('TIKTOK_APP_SECRET'));
```

## โค้ด Node.js

```javascript
import crypto from "node:crypto";

export function tiktokSign(path, query, body, secret) {
  const keys = Object.keys(query)
    .filter((k) => k !== "sign" && k !== "access_token")
    .sort();

  let input = path;
  for (const k of keys) input += k + String(query[k]);
  input += body ?? "";
  input = secret + input + secret;

  return crypto.createHmac("sha256", secret).update(input, "utf8").digest("hex");
}

const query = {
  app_key: "your_app_key",
  timestamp: Math.floor(Date.now() / 1000).toString(),
  shop_cipher: "your_shop_cipher",
};
const body = JSON.stringify({ page_size: 20 });
query.sign = tiktokSign("/order/202309/orders/search", query, body, process.env.TIKTOK_APP_SECRET);
```

## ข้อผิดพลาดที่เจอบ่อย

**1. Body ที่ sign ไม่ใช่ body ที่ส่ง** นี่คือสาเหตุอันดับหนึ่ง เราคำนวณ signature จาก JSON string หนึ่ง แต่ HTTP client ไป serialize ใหม่อีกรอบ ลำดับ key หรือ whitespace เปลี่ยน signature ก็ผิด วิธีแก้คือ serialize ครั้งเดียว แล้วส่ง string เดียวกันนั้นเป็น raw body

**2. JSON escape ต่างกันระหว่างภาษา** PHP `json_encode` ค่า default จะ escape `/` เป็น `\/` และ escape อักษร unicode ส่วน Node ไม่ทำ ถ้าใช้ PHP ให้ใส่ `JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE` เสมอ

**3. Sort แบบ locale** ใช้ `ksort` กับ `SORT_STRING` และ `.sort()` ปกติใน JS ห้ามใช้ `localeCompare` เพราะลำดับอาจไม่ใช่ ASCII

**4. Timestamp ผิดหน่วยหรือนาฬิกาเพี้ยน** ส่งเป็นวินาที ไม่ใช่มิลลิวินาที และ server ต้อง sync เวลาด้วย NTP ถ้านาฬิกาเลื่อนมาก request จะถูกปฏิเสธ

**5. Path ไม่ตรง** อย่าใส่ domain หรือ query string ใน path ที่ sign และระวัง `/` ท้าย path

**6. Value ที่ไม่ใช่ string** boolean หรือ number บางภาษาแปลงเป็น string ต่างกัน (`true` กับ `1`) แปลงให้เป็น string อย่างชัดเจนเองก่อน sign

## Test strategy

ผมไม่ทดสอบ signing ด้วยการยิง API จริงเป็นอย่างแรก เพราะ error จาก server บอกแค่ว่า "ผิด" ไม่บอกว่าผิดตรงไหน ขั้นตอนที่ใช้คือ

- **Golden test**: เตรียม input ชุดตายตัว (path, query, body, secret ปลอม) แล้วคำนวณ signature ที่คาดหวังไว้ เขียน unit test ทั้งฝั่ง PHP และ Node ให้ได้ค่าเดียวกัน ถ้าสองภาษาไม่ตรงกัน ปัญหาอยู่ที่ canonical string แน่นอน
- **Log canonical string ใน dev** พิมพ์ string ก่อน hash ออกมาดู (เฉพาะ dev และห้ามมี secret จริงใน log) จะเห็นทันทีว่า body ถูก escape หรือไม่
- **Test ค่าพิเศษ** body ว่าง, ภาษาไทยหรือสเปนใน body, parameter ที่มีค่าเป็นตัวเลข
- **Integration test กับ endpoint อ่านอย่างเดียว** เช่น ดึงข้อมูลร้าน ก่อนลองกับ endpoint ที่เขียนข้อมูล

## วางโค้ด signing ไว้ที่เดียว

อีกบทเรียนคือ อย่าให้แต่ละ endpoint ประกอบ signature เอง ผมทำ HTTP client wrapper ตัวเดียวที่รับ path, query และ body แล้วจัดการทุกอย่างตามลำดับ คือ เติม `app_key` และ `timestamp`, serialize body, คำนวณ sign, แนบ access token ใน header แล้วส่ง ข้อดีคือ

- แก้บั๊กเรื่อง signing ครั้งเดียว ทุก endpoint ได้ผลพร้อมกัน
- log request แบบตัดค่าอ่อนไหวออกได้จากจุดเดียว
- เพิ่ม retry สำหรับ error ชั่วคราว เช่น rate limit ได้ง่าย โดยต้องสร้าง timestamp และ sign ใหม่ทุกครั้งที่ retry ไม่ใช่ส่ง sign เดิมซ้ำ

ส่วน secret ต้องอยู่ใน env หรือ secret manager เท่านั้น ห้าม hardcode ในโค้ดหรือใส่ใน test fixture ที่เป็นค่าจริง

## สรุป

HMAC-SHA256 เป็นส่วนที่ง่าย ส่วนที่ยากคือทำให้ canonical string ตรงกับ server ทุก byte ให้ serialize body ครั้งเดียวแล้วส่ง string เดิม ระวังการ escape JSON ใน PHP เรียง key แบบ ASCII ส่ง timestamp เป็นวินาที และเขียน golden test ที่ทั้งสองภาษาต้องได้ผลตรงกัน ทำแบบนี้แล้ว error `invalid sign` จะกลายเป็นเรื่องที่ debug ได้ในไม่กี่นาที
