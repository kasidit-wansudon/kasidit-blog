---
title: "เข้ารหัสข้อมูลส่วนบุคคลด้วย AES-256 ใน Laravel + AWS Secrets Manager"
date: "2026-08-19"
excerpt: "วิธีเข้ารหัสข้อมูลส่วนบุคคล (PII) ด้วย AES-256 ใน Laravel โดยเก็บ key ไว้ใน AWS Secrets Manager พร้อมโค้ดตัวอย่าง cast และแนวทาง key rotation ที่ทำได้จริง"
tags: ["laravel", "security", "encryption", "aws", "pii"]
---

ระบบ HR ที่ผมดูแลเก็บข้อมูลส่วนบุคคลของพนักงานจำนวนมาก ทั้งเลขประจำตัว เบอร์โทร ที่อยู่ และข้อมูลบัญชีธนาคาร ข้อมูลพวกนี้ถ้าหลุดออกไปจาก database เพียงครั้งเดียวก็เป็นเรื่องใหญ่ ผมจึงเข้ารหัสข้อมูลส่วนบุคคลด้วย AES-256 ในระดับ application ของ Laravel และเก็บ key ไว้ใน AWS Secrets Manager แทน `.env` บทความนี้อธิบายแนวทาง โค้ดตัวอย่าง และวิธีหมุน key

## ทำไมต้องเข้ารหัสที่ระดับ application

การเปิด encryption at rest ของดิสก์หรือ database ช่วยได้กรณีดิสก์หาย แต่ไม่ช่วยกรณีที่คนเข้าถึง database ได้ผ่าน SQL หรือได้ไฟล์ dump ออกไป เพราะข้อมูลจะถูกถอดรหัสให้อัตโนมัติ

การเข้ารหัสที่ระดับ application ทำให้:

- ไฟล์ dump หรือ backup ที่หลุดออกไป อ่านคอลัมน์สำคัญไม่ได้
- คนที่มีสิทธิ์อ่าน database แต่ไม่มี key ก็เห็นแค่ข้อความเข้ารหัส
- key อยู่คนละที่กับข้อมูล การเจาะต้องได้ทั้งสองอย่าง

ข้อแลกเปลี่ยนคือค้นหาด้วย `WHERE` บนคอลัมน์ที่เข้ารหัสตรง ๆ ไม่ได้ ต้องออกแบบเพิ่ม ซึ่งจะพูดถึงด้านล่าง

## ดึง key จาก AWS Secrets Manager

แนวคิดคือ ตอน boot แอปจะดึง key จาก Secrets Manager แล้ว cache ไว้ในหน่วยความจำ เครื่อง production ใช้ IAM role ที่มีสิทธิ์ `secretsmanager:GetSecretValue` เฉพาะ secret ตัวนี้ ไม่ต้องมี access key อยู่บนดิสก์

```php
<?php
// app/Support/PiiKeyProvider.php
namespace App\Support;

use Aws\SecretsManager\SecretsManagerClient;
use Illuminate\Support\Facades\Cache;

class PiiKeyProvider
{
    /** @return array<string,string> version => raw 32-byte key */
    public static function keys(): array
    {
        return Cache::store('array')->rememberForever('pii_keys', function () {
            $client = new SecretsManagerClient([
                'region'  => config('services.pii.region'),
                'version' => '2017-10-17',
            ]);
            $secret = $client->getSecretValue([
                'SecretId' => config('services.pii.secret_id'),
            ]);
            // Secret JSON: {"current":"v2","keys":{"v1":"base64...","v2":"base64..."}}
            $data = json_decode($secret['SecretString'], true);
            return array_map('base64_decode', $data['keys'])
                + ['__current' => $data['current']];
        });
    }

    public static function currentVersion(): string
    {
        return self::keys()['__current'];
    }

    public static function key(string $version): string
    {
        $keys = self::keys();
        if (!isset($keys[$version])) {
            throw new \RuntimeException("Unknown PII key version: {$version}");
        }
        return $keys[$version];
    }
}
```

ผมใช้ cache store แบบ `array` เพื่อให้ key อยู่ในหน่วยความจำของ request เท่านั้น ไม่ถูกเขียนลง Redis หรือไฟล์

## Cast สำหรับคอลัมน์ที่เข้ารหัส

Laravel มี `Encrypter` ที่ใช้ AES-256-CBC พร้อม MAC อยู่แล้ว (และรองรับ `aes-256-gcm` ซึ่งผมเลือกใช้ในตัวอย่างนี้) เราแค่สร้าง encrypter ด้วย key ของเราเอง แล้วเติม version ของ key ไว้หน้าข้อความ เพื่อรองรับการหมุน key

```php
<?php
// app/Casts/EncryptedPii.php
namespace App\Casts;

use App\Support\PiiKeyProvider;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Encryption\Encrypter;

class EncryptedPii implements CastsAttributes
{
    private const CIPHER = 'aes-256-gcm';

    public function get($model, string $key, $value, array $attributes)
    {
        if ($value === null) return null;
        [$version, $payload] = explode(':', $value, 2);
        $enc = new Encrypter(PiiKeyProvider::key($version), self::CIPHER);
        return $enc->decryptString($payload);
    }

    public function set($model, string $key, $value, array $attributes)
    {
        if ($value === null) return null;
        $version = PiiKeyProvider::currentVersion();
        $enc = new Encrypter(PiiKeyProvider::key($version), self::CIPHER);
        return $version . ':' . $enc->encryptString((string) $value);
    }
}
```

ใช้งานใน model:

```php
protected $casts = [
    'national_id'  => \App\Casts\EncryptedPii::class,
    'phone'        => \App\Casts\EncryptedPii::class,
    'bank_account' => \App\Casts\EncryptedPii::class,
];
```

คอลัมน์ใน database ควรเป็น `TEXT` เพราะข้อความเข้ารหัสยาวกว่าข้อมูลจริงหลายเท่า

## ค้นหาข้อมูลที่เข้ารหัส

ถ้าต้องค้นหาด้วยค่าตรงตัว เช่นหาพนักงานจากเลขประจำตัว ให้เพิ่มคอลัมน์ "blind index" เก็บ HMAC-SHA256 ของค่านั้นด้วย key แยกอีกตัว แล้วค้นจากคอลัมน์นั้นแทน การค้นแบบ `LIKE` หรือค้นบางส่วนทำไม่ได้ ต้องคุยกับผู้ใช้ตั้งแต่ต้นว่าฟิลด์ไหนจำเป็นต้องค้น

## Key rotation

เพราะเราเก็บ version ไว้หน้าข้อความ การหมุน key จึงทำได้แบบไม่ต้องหยุดระบบ:

1. สร้าง key ใหม่ (32 byte สุ่มจาก CSPRNG) เพิ่มเข้า secret เป็น `v3` แล้วเปลี่ยน `current` เป็น `v3`
2. Deploy หรือ restart worker ข้อมูลที่เขียนใหม่จะใช้ `v3` ทันที ข้อมูลเก่ายังอ่านได้ด้วย `v1`, `v2`
3. รัน job re-encrypt ทีละ chunk: อ่านแถวที่ยังขึ้นต้นด้วย version เก่า แล้ว save ใหม่
4. ตรวจว่าไม่เหลือแถวที่ใช้ version เก่า แล้วค่อยลบ key เก่าออกจาก secret

ขั้นที่ 4 ต้องรอให้แน่ใจจริง ๆ เพราะถ้าลบ key ก่อนข้อมูลถูก re-encrypt ครบ ข้อมูลนั้นจะหายไปตลอดกาล backup เก่าที่เข้ารหัสด้วย key นั้นก็จะอ่านไม่ได้ด้วย ต้องกำหนดนโยบายให้สอดคล้องกับอายุของ backup

## ข้อควรระวัง

- **อย่า log ค่าที่ถอดรหัสแล้ว** ตรวจ exception handler และ debug bar ให้ดี
- **API response** ส่งเฉพาะฟิลด์ที่หน้าจอต้องใช้ และ mask ส่วนที่ไม่จำเป็น
- **Local dev** ใช้ key แยกที่ไม่เกี่ยวกับ production เด็ดขาด
- **ทดสอบการ restore backup** ร่วมกับ key อย่างน้อยปีละครั้ง

ถ้าคุณใช้ AI ช่วยเขียนโค้ดส่วนนี้ ผมแนะนำให้ใช้ checklist ด้านความปลอดภัยตรวจทุกครั้ง แบบที่เล่าไว้ใน [ใช้ checklist กับ AI code review](/blog/ai-code-review-checklists)

## สรุป

เข้ารหัสข้อมูลส่วนบุคคลด้วย AES-256 ที่ระดับ application ทำให้ข้อมูลปลอดภัยแม้ dump จะหลุด เก็บ key ไว้ใน AWS Secrets Manager แล้วให้เครื่องดึงผ่าน IAM role ใส่ version ของ key ไว้หน้าข้อความเพื่อให้หมุน key ได้โดยไม่หยุดระบบ และวางแผนเรื่องการค้นหากับ backup ตั้งแต่วันแรก
