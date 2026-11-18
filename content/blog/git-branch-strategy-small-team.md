---
title: "Git branch strategy แบบเรียบง่าย สำหรับทีมเล็กที่ deploy ทุกวัน"
date: "2026-01-28"
excerpt: "Git branch strategy ที่ทีมเล็กใช้ได้จริงเมื่อต้อง deploy ทุกวัน: main, develop, feature branch, release tag และ hotfix flow พร้อมคำสั่งและกติกาที่ตกลงกันง่าย"
tags: ["git", "workflow", "team-management", "deploy"]
---

ทีมเล็กมักไม่มีเวลามานั่งถกเรื่อง Git branch strategy แต่พอระบบโตและ deploy บ่อยขึ้น ปัญหาเดิม ๆ ก็เริ่มโผล่: โค้ดที่ยังไม่เสร็จหลุดขึ้น production, hotfix ถูก merge แล้วหายไปในรอบถัดไป, ไม่มีใครตอบได้ว่าเวอร์ชันที่รันอยู่ตอนนี้คือ commit ไหน โพสต์นี้คือ Git branch strategy ที่ผมคิดว่าเหมาะกับทีมสองถึงห้าคนที่ส่งงานขึ้นทุกวัน ไม่หรูหรา แต่ตกลงกันได้ในครั้งเดียว

## หลักคิด: ให้ branch บอกสถานะของโค้ด

ผมอยากให้ทุกคนในทีมมองชื่อ branch แล้วรู้ทันทีว่าโค้ดตรงนั้นอยู่ในสถานะไหน

- `main` คือสิ่งที่รันอยู่บน production เท่านั้น
- `develop` คือสิ่งที่รวมแล้วและกำลังทดสอบบน staging
- `feature/*` คืองานที่ยังทำไม่เสร็จ
- `hotfix/*` คือการแก้ด่วนบน production

แค่สี่แบบนี้ก็พอ ผมไม่แนะนำให้มี `release/*` branch แยกสำหรับทีมเล็กที่ deploy ทุกวัน เพราะรอบ release สั้นจนไม่คุ้มกับต้นทุนการดูแล branch เพิ่ม ใช้ tag แทนง่ายกว่า

## Feature branch: เล็ก อายุสั้น

กติกาข้อเดียวที่สำคัญที่สุดคือ feature branch ต้องมีอายุสั้น ถ้าเกินสองถึงสามวัน conflict จะเริ่มสะสม และ code review จะยากขึ้นเรื่อย ๆ

```bash
# เริ่มงานใหม่จาก develop ล่าสุดเสมอ
git switch develop
git pull --ff-only
git switch -c feature/order-export-csv

# ระหว่างทำงาน ดึง develop มารวมบ่อย ๆ
git fetch origin
git rebase origin/develop

# ส่งขึ้นไปเปิด merge request เข้า develop
git push -u origin feature/order-export-csv
```

ถ้างานใหญ่เกินจะเสร็จในไม่กี่วัน ให้หั่นเป็นชิ้นเล็กที่ merge ได้ทีละชิ้น และซ่อนส่วนที่ยังไม่พร้อมไว้หลัง config หรือ flag ง่าย ๆ ดีกว่าถือ branch ใหญ่ไว้เป็นสัปดาห์

กติกาเสริมที่ผมใช้:

- ชื่อ branch บอกว่าทำอะไร ไม่ใช่ชื่อคน (`feature/order-export-csv` ไม่ใช่ `somchai-work`)
- merge เข้า `develop` ผ่าน merge request เท่านั้น ห้าม push ตรง
- ต้องมีคนอื่นอ่านอย่างน้อยหนึ่งคน และ pipeline ต้องผ่าน

## develop และ staging

ทุกครั้งที่มีการ merge เข้า `develop` ระบบ CI จะ deploy ขึ้น staging อัตโนมัติ QA หรือเจ้าของงานทดสอบตรงนั้น ข้อดีคือ staging สะท้อน `develop` เสมอ ไม่มีใครต้องถามว่า "บน staging ตอนนี้เป็นโค้ดของใคร"

ถ้าเจอ bug บน staging ให้แก้ด้วย feature branch ใหม่แล้ว merge เข้า `develop` ตามปกติ ไม่ต้อง revert ทั้งก้อนยกเว้นมันกระทบงานคนอื่น

## Release: merge เข้า main แล้วติด tag

เมื่อถึงรอบ deploy ซึ่งสำหรับทีมที่ deploy ทุกวันอาจเป็นช่วงบ่ายของทุกวัน ให้ merge `develop` เข้า `main` แล้วติด tag

```bash
git switch main
git pull --ff-only
git merge --no-ff develop -m "release: 2026.01.28"
git tag -a v2026.01.28 -m "release 2026-01-28"
git push origin main --follow-tags
```

ผมชอบตั้งชื่อ tag ตามวันที่ (`v2026.01.28`) มากกว่า semantic version สำหรับระบบภายใน เพราะคนในทีมคุยกันเป็นวันอยู่แล้ว "บั๊กนี้เริ่มตั้งแต่ release วันอังคาร" ฟังเข้าใจง่ายกว่า "ตั้งแต่ 3.14.2" ถ้าวันเดียวมีสองรอบก็เติม `.2` ต่อท้าย

tag ทำให้ rollback ง่ายมาก เพราะเรารู้แน่ชัดว่าเวอร์ชันก่อนหน้าคือ tag ไหน การ rollback คือการ deploy tag เก่ากลับไป ไม่ใช่การนั่งเดาว่าควร revert commit ไหน

## Hotfix flow

เมื่อ production พังและรอรอบ release ปกติไม่ได้ ให้แตก branch จาก `main` ไม่ใช่จาก `develop` เพราะ `develop` อาจมีงานที่ยังไม่พร้อมขึ้น production ปนอยู่

```bash
git switch main
git pull --ff-only
git switch -c hotfix/fix-order-total-rounding
# ... แก้ + commit ...
git switch main
git merge --no-ff hotfix/fix-order-total-rounding
git tag -a v2026.01.28.1 -m "hotfix: order total rounding"
git push origin main --follow-tags

# สำคัญที่สุด: นำ hotfix กลับเข้า develop ด้วย
git switch develop
git merge --no-ff hotfix/fix-order-total-rounding
git push origin develop
```

ขั้นสุดท้ายคือจุดที่ทีมลืมบ่อยที่สุด ถ้าไม่ merge hotfix กลับเข้า `develop` รอบ release ถัดไปจะนำ bug เดิมกลับมา ผมจึงใส่ข้อนี้ไว้ใน checklist ของ hotfix ทุกครั้ง

## กติกาที่ทำให้ระบบนี้ใช้ได้จริง

branch strategy จะดีแค่ไหนก็ไม่ช่วย ถ้าทีมไม่ทำตาม สิ่งที่ผมพบว่าช่วยได้มาก:

1. **Protect branch** ตั้งค่าให้ `main` และ `develop` push ตรงไม่ได้ ต้องผ่าน merge request เท่านั้น
2. **เจ้าของ release หนึ่งคนต่อรอบ** คนนี้รับผิดชอบการ merge เข้า `main`, ติด tag และดูแลจนกว่าระบบนิ่ง
3. **รายการสิ่งที่จะ deploy** ก่อน merge ให้เขียนสั้น ๆ ว่ารอบนี้มีอะไรบ้าง และ migration อะไรที่ต้องรัน
4. **ไม่ deploy ก่อนเลิกงานหรือก่อนวันหยุด** ถ้าพังจะไม่มีคนอยู่แก้

## สรุป

Git branch strategy สำหรับทีมเล็กไม่จำเป็นต้องซับซ้อน ใช้ `main` สำหรับ production, `develop` สำหรับ staging, `feature/*` อายุสั้นสำหรับงานใหม่ และ `hotfix/*` ที่แตกจาก `main` แล้ว merge กลับทั้งสองทาง ติด tag ทุกครั้งที่ deploy เพื่อให้ rollback ทำได้ในคำสั่งเดียว ที่เหลือคือวินัยของทีม ซึ่งสำคัญกว่าเครื่องมือเสมอ
