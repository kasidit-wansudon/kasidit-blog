---
title: "Encrypting PII with AES-256 in Laravel + AWS Secrets Manager"
date: "2026-08-19"
excerpt: "How to encrypt personal data (PII) with AES-256 in Laravel, keeping the key in AWS Secrets Manager, with a sample cast and a practical key rotation approach."
tags: ["laravel", "security", "encryption", "aws", "pii"]
---

The HR system I look after stores a lot of personal data about employees, including ID numbers, phone numbers, addresses, and bank account details. If this data leaks from the database even once, it is a big deal. So I encrypt personal data with AES-256 at the Laravel application level and keep the key in AWS Secrets Manager instead of `.env`. This post explains the approach, sample code, and how to rotate the key.

## Why encrypt at the application level

Turning on disk or database encryption at rest helps if a disk is lost, but not if someone gets into the database through SQL or walks away with a dump file, because the data is decrypted automatically.

Encrypting at the application level means:

- A leaked dump or backup file cannot be read for the sensitive columns
- Someone with permission to read the database but no key sees only ciphertext
- The key lives somewhere other than the data, so an attacker needs to get both

The trade-off is that you cannot run `WHERE` directly on an encrypted column, so extra design is needed, which I cover below.

## Fetching the key from AWS Secrets Manager

The idea is that at boot the app fetches the key from Secrets Manager and caches it in memory. Production machines use an IAM role with `secretsmanager:GetSecretValue` permission for just this secret, so no access key needs to be on disk.

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

I use the `array` cache store so the key stays only in the request's memory and is never written to Redis or a file.

## A cast for encrypted columns

Laravel already has an `Encrypter` that uses AES-256-CBC with a MAC (and it supports `aes-256-gcm`, which I chose for this example). We just create an encrypter with our own key and prepend the key version to the text, to support key rotation.

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

Using it in a model:

```php
protected $casts = [
    'national_id'  => \App\Casts\EncryptedPii::class,
    'phone'        => \App\Casts\EncryptedPii::class,
    'bank_account' => \App\Casts\EncryptedPii::class,
];
```

The database column should be `TEXT`, because ciphertext is several times longer than the real data.

## Searching encrypted data

If you need to search by exact value, such as finding an employee by ID number, add a "blind index" column that stores the HMAC-SHA256 of that value with a separate key, and search on that column instead. `LIKE` or partial searches cannot be done, so you need to talk with users from the start about which fields really need to be searchable.

## Key rotation

Because we store the version in front of the text, rotating a key can be done without stopping the system:

1. Create a new key (32 random bytes from a CSPRNG), add it to the secret as `v3`, and change `current` to `v3`
2. Deploy or restart the workers. Newly written data uses `v3` immediately, and old data can still be read with `v1` and `v2`.
3. Run a re-encrypt job chunk by chunk: read rows that still start with an old version, and save them again
4. Check that no rows remain using an old version, and only then remove the old keys from the secret

Step 4 must wait until you are really sure, because if you delete a key before all data is re-encrypted, that data is gone forever. Old backups encrypted with that key become unreadable too, so you need to set a policy consistent with how long backups are kept.

## Cautions

- **Do not log decrypted values.** Check the exception handler and debug bar carefully.
- **API responses:** send only the fields the screen needs and mask what is unnecessary
- **Local dev:** use a separate key that has absolutely nothing to do with production
- **Test restoring backups** together with the key at least once a year

If you use AI to help write this part of the code, I recommend checking it with a security checklist every time, as described in [Using checklists for AI code review](/en/blog/ai-code-review-checklists).

## Summary

Encrypting personal data with AES-256 at the application level keeps the data safe even if a dump leaks. Keep the key in AWS Secrets Manager and have machines fetch it through an IAM role, put the key version in front of the text so you can rotate keys without stopping the system, and plan for searching and backups from day one.
