---
title: "วินัย deploy: deploy-list, branch-merge policy และ deploy freeze ช่วงวันหยุด"
date: "2026-08-12"
excerpt: "วินัย deploy สำหรับทีมเล็ก: template deploy-list, branch-merge policy และ holiday deploy freeze ที่ผมใช้จริงกับระบบภายใน 6 ระบบ พร้อม template ให้คัดลอกไปใช้"
tags: ["devops", "deploy", "git", "team-management", "process"]
---

ตอนเป็น Technical Lead ที่ OPPO Mexico ผมดูแลการ deploy และ rollback ของระบบภายในกว่า 6 ระบบทุกวัน ทั้ง WMS, Canteen, Sellout, Attendance และอื่น ๆ ผู้ใช้ back-office ราว 200 คนพึ่งพาระบบเหล่านี้ทุกเช้า สิ่งที่ทำให้ทีมเล็กของเราไม่ล่มบ่อยไม่ใช่เครื่องมือแพง แต่เป็นวินัย deploy สามอย่าง: deploy-list, branch-merge policy และ deploy freeze ช่วงวันหยุด บทความนี้แชร์ทั้งสามแบบพร้อม template

## ปัญหาที่เจอก่อนมีวินัย deploy

ก่อนจะมีกติกา อาการที่เจอบ่อยคือ:

- deploy ไปแล้วไม่มีใครรู้ว่ามีอะไรขึ้นไปบ้าง พอระบบพังต้องไล่ดู commit ทีละตัว
- branch ของสองคนถูก merge พร้อมกัน แล้วตีกันบน production
- มีคน deploy เย็นวันศุกร์ก่อนวันหยุดยาว แล้วไม่มีใครอยู่แก้

ทั้งหมดนี้แก้ได้ด้วยกระบวนการง่าย ๆ ที่ทุกคนทำเหมือนกัน

## 1. Deploy-list template

ทุกการ deploy ขึ้น production ต้องมี deploy-list หนึ่งใบ เขียนก่อน deploy ไม่ใช่หลัง ผมให้ทีมโพสต์ในกลุ่มแชตของทีมหรือแนบใน merge request

```markdown
## Deploy: <system> — <YYYY-MM-DD HH:mm>
Owner: <ชื่อคน deploy>
Reviewer: <ชื่อคนรีวิว>

### Changes
- [ ] <ticket/MR> สั้น ๆ ว่าเปลี่ยนอะไร
- [ ] <ticket/MR> ...

### Risk
- DB migration: yes / no  (ถ้า yes: reversible? ใช้เวลาเท่าไร?)
- Config/env change: yes / no
- Affects users: <กลุ่มผู้ใช้ / หน้าไหน>

### Steps
1. git pull origin main (tag: vX.Y.Z)
2. composer install --no-dev / npm ci && npm run build
3. php artisan migrate --force
4. clear cache / restart queue worker

### Verify (หลัง deploy 10 นาที)
- [ ] login ได้
- [ ] หน้าหลักที่เปลี่ยนทำงาน
- [ ] error log ไม่มี error ใหม่

### Rollback
- git checkout vX.Y.(Z-1) + ขั้นตอนย้อน migration (ถ้ามี)
```

ส่วนที่สำคัญที่สุดคือ **Rollback** ถ้าเขียนส่วนนี้ไม่ได้ แปลว่ายังไม่พร้อม deploy

ข้อดีที่ตามมาคือ deploy-list กลายเป็นประวัติที่ค้นย้อนหลังได้ เวลามีคนถามว่า "ฟีเจอร์นี้ขึ้นไปเมื่อไร" ตอบได้ในไม่กี่วินาที และเมื่อเก็บไว้นานพอ มันจะกลายเป็น runbook ตามแนวคิดใน [ทำทุก deploy ให้เป็น runbook](/blog/turn-every-deploy-into-runbook)

## 2. Branch-merge policy

ทีมเล็กไม่จำเป็นต้องใช้ git flow เต็มรูปแบบ แต่ต้องมีกติกาที่ชัด นี่คือ policy ที่ผมใช้:

```text
main        = สิ่งที่อยู่บน production เท่านั้น
develop     = รวมงานเพื่อทดสอบบน staging
feature/*   = งานใหม่ แตกจาก develop
hotfix/*    = แก้ด่วน แตกจาก main แล้ว merge กลับทั้ง main และ develop

กติกา:
1. ห้าม push ตรงเข้า main และ develop ทุกอย่างผ่าน merge request
2. ทุก MR ต้องมี reviewer อย่างน้อย 1 คน ที่ไม่ใช่คนเขียน
3. MR หนึ่งอันแก้เรื่องเดียว ถ้าเกิน ~400 บรรทัดให้แยก
4. merge เข้า main ได้เฉพาะคน deploy ของรอบนั้น และต้องมี deploy-list
5. ทุกครั้งที่ merge เข้า main ให้ติด tag เวอร์ชัน
6. QA ผ่านบน staging ก่อน merge เข้า main เสมอ ยกเว้น hotfix ที่ระบุเหตุผล
```

ข้อ 4 กับข้อ 5 ช่วยได้มากที่สุดในทางปฏิบัติ เพราะทำให้รู้เสมอว่าบน production คือ tag อะไร และ rollback ทำได้ด้วยการ checkout tag ก่อนหน้า ผมเขียนรายละเอียดเรื่อง branch ไว้เพิ่มใน [git branch strategy สำหรับทีมเล็ก](/blog/git-branch-strategy-small-team)

## 3. Holiday deploy freeze

ช่วงวันหยุดยาวหรือช่วงที่ธุรกิจมีงานสำคัญ เช่นปิดงบสิ้นเดือน ความเสี่ยงของการ deploy สูงกว่าปกติมาก เพราะคนแก้ไม่อยู่ และผู้ใช้ไม่มีความอดทนเหลือ ผมจึงประกาศ deploy freeze ล่วงหน้า

```markdown
## Deploy Freeze: <ชื่อช่วง>
ช่วงเวลา: <วันเริ่ม 18:00> ถึง <วันสิ้นสุด 09:00>
ระบบที่ครอบคลุม: ทุกระบบ production

อนุญาตเฉพาะ:
- Hotfix ที่ระบบใช้งานไม่ได้ หรือข้อมูลผิดพลาด
- ต้องได้รับอนุมัติจาก Tech Lead ก่อน
- ต้องมี deploy-list + reviewer + คนอยู่เฝ้าหลัง deploy 1 ชั่วโมง

Deploy วันสุดท้ายก่อน freeze: <วัน> ก่อน 14:00
On-call: <ชื่อ / ช่องทางติดต่อ>
```

กฎเพิ่มเติมที่ผมใช้ตลอดปีคือ **ไม่ deploy หลังบ่ายสองโมงของวันศุกร์** ถ้าไม่ใช่ hotfix เหตุผลง่าย ๆ คือถ้าพัง เราต้องมีเวลาแก้ก่อนเลิกงาน

## ทำให้ทีมยอมทำตาม

กติกาที่ดีแต่ไม่มีใครทำก็ไม่มีประโยชน์ สิ่งที่ช่วยให้ทีมทำตามคือ:

- **ทำให้ง่าย**: template อยู่ในที่เดียว คัดลอกแล้วกรอกได้ทันที
- **Lead ทำเป็นตัวอย่าง**: ผมเขียน deploy-list ทุกครั้งแม้จะเป็นงานเล็ก
- **บังคับด้วยเครื่องมือ**: ตั้ง protected branch บน GitLab หรือ GitHub ไม่ให้ push ตรงเข้า main
- **ทบทวนหลังเหตุการณ์**: ทุกครั้งที่ rollback ให้ดูว่ากติกาไหนช่วยหรือขาดอะไร แล้วปรับ template

## สรุป

วินัย deploy ของทีมเล็กมีแค่สามอย่างที่ต้องทำให้ได้: deploy-list ที่มีขั้นตอน rollback ทุกครั้ง, branch-merge policy ที่ทำให้ main ตรงกับ production เสมอ และ deploy freeze ในช่วงที่ความเสี่ยงสูง ทั้งหมดนี้ใช้เวลาเพิ่มไม่กี่นาทีต่อการ deploy แต่ช่วยลดเหตุการณ์ระบบล่มได้ชัดเจน คัดลอก template ไปปรับใช้กับทีมคุณได้เลย
