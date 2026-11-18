---
title: "Checklist ย้าย PHP/MySQL จาก AWS ไป Alibaba Cloud ECS แบบไม่ล่ม"
date: "2026-08-26"
excerpt: "Checklist ย้ายระบบ PHP/MySQL production จาก AWS ไป Alibaba Cloud ECS ครบตั้งแต่ inventory ย้ายข้อมูล DNS cutover แผน rollback และ gotcha ที่ควรรู้ก่อนเริ่ม"
tags: ["devops", "alibaba-cloud", "aws", "migration", "mysql"]
---

ปีนี้ผมนำทีมย้ายระบบ production จาก AWS ไป Alibaba Cloud ECS ระบบส่วนใหญ่เป็น PHP กับ MySQL แบบที่หลายบริษัทยังใช้อยู่ งานแบบนี้ไม่ได้ยากที่ตัวคำสั่ง แต่ยากที่ "ลืม" อะไรสักอย่างแล้วไปเจอตอนตีสอง บทความนี้คือ checklist ย้าย AWS ไป Alibaba Cloud ที่ผมเรียบเรียงใหม่ให้เป็นแบบกลาง ๆ ใช้ได้กับ stack PHP/MySQL ทั่วไป

## เฟส 1: Inventory ก่อนแตะอะไรทั้งนั้น

ความผิดพลาดใหญ่ที่สุดของการย้าย cloud คือเริ่มจากการสร้างเครื่องใหม่ ทั้งที่ยังไม่รู้ว่าเครื่องเก่ามีอะไรบ้าง ผมเริ่มด้วยการทำตารางทุกอย่างที่ระบบพึ่งพา:

- **เครื่องและบริการ**: web server, PHP version, extension ที่ใช้, cron, queue worker, supervisor
- **ฐานข้อมูล**: version ของ MySQL, ขนาด, charset/collation, user และ grant
- **Storage**: ไฟล์ที่อยู่บนดิสก์, ไฟล์ที่อยู่บน object storage, path ที่ hardcode ในโค้ด
- **การเชื่อมต่อภายนอก**: API ที่ whitelist IP ของเรา, webhook ที่ยิงเข้ามา, SMTP
- **Secret และ config**: `.env`, key ที่ hardcode ในโค้ด (มีแทบทุกโปรเจกต์เก่า)
- **DNS และ SSL**: record ทั้งหมด, TTL ปัจจุบัน, วิธีต่ออายุ certificate

คำสั่งพื้นฐานที่ช่วยทำ inventory บนเครื่องเก่าได้เร็ว:

```bash
php -v && php -m                    # PHP version + extensions
crontab -l; ls /etc/cron.d/         # scheduled jobs
systemctl list-units --type=service --state=running
mysql -e "SELECT table_schema, ROUND(SUM(data_length+index_length)/1024/1024) AS mb
          FROM information_schema.tables GROUP BY table_schema;"
grep -rn "amazonaws.com" /var/www --include=*.php | head
```

บรรทัดสุดท้ายสำคัญมาก เพราะโค้ดเก่ามักผูกกับ endpoint ของ AWS ตรง ๆ โดยไม่ผ่าน config

## เฟส 2: เตรียมเครื่องปลายทาง

- สร้าง ECS ให้ OS และ PHP version ใกล้เครื่องเดิมที่สุด อย่าถือโอกาสอัปเกรด PHP ไปพร้อมการย้าย เพราะถ้าพังจะไม่รู้ว่าพังจากอะไร
- Security group เปิดเฉพาะพอร์ตที่ต้องใช้ SSH จำกัดเฉพาะจาก VPN (ผมเขียนวิธีไว้ใน [ย้าย SSH ไปหลัง VPN](/blog/vpn-only-ssh-access-small-team))
- ติดตั้งแล้ว deploy โค้ดชุดเดียวกับ production รันกับ database ทดสอบก่อน
- ทำ config ให้ทุกอย่างอ่านจาก `.env` ไม่มี hardcode ที่ชี้ไปเครื่องเก่า

## เฟส 3: ย้ายข้อมูล

สำหรับ MySQL ผมแยกเป็นสองรอบ: รอบซ้อม กับรอบจริง

```bash
# dump แบบไม่ล็อกตาราง (InnoDB)
mysqldump --single-transaction --routines --triggers --events \
  --default-character-set=utf8mb4 app_db | gzip > app_db.sql.gz

# ฝั่งปลายทาง
gunzip < app_db.sql.gz | mysql --default-character-set=utf8mb4 app_db
```

รอบซ้อมใช้วัดว่าการ dump และ restore ใช้เวลาเท่าไร ตัวเลขนี้คือ downtime ขั้นต่ำของรอบจริง ถ้านานเกินรับได้ค่อยพิจารณาตั้ง replication แทน

หลัง restore ให้เทียบจำนวนแถวของตารางสำคัญทั้งสองฝั่ง และเช็ก charset ให้ตรงกัน ภาษาไทย สเปน หรือจีนที่กลายเป็นเครื่องหมายคำถามคือสัญญาณว่า collation ไม่ตรง

ไฟล์บนดิสก์ใช้ `rsync` ซ้ำหลายรอบก่อนวันจริง รอบสุดท้ายจะเหลือแค่ส่วนต่างเล็ก ๆ

## เฟส 4: DNS cutover

- **ลด TTL ล่วงหน้าอย่างน้อย 24–48 ชั่วโมง** เหลือ 60–300 วินาที
- ประกาศ maintenance window ให้ผู้ใช้รู้ล่วงหน้า
- วันจริง: เปิด maintenance mode บนเครื่องเก่า หยุด cron และ queue worker ก่อน dump รอบสุดท้าย
- Restore ข้อมูล rsync รอบสุดท้าย แล้วทดสอบเครื่องใหม่ด้วยการแก้ `/etc/hosts` บนเครื่องเราเอง
- ผ่านแล้วค่อยเปลี่ยน DNS เปิด cron และ worker บนเครื่องใหม่

ห้ามเปิด cron ทั้งสองฝั่งพร้อมกันเด็ดขาด ไม่งั้นงานบางอย่างจะรันซ้ำ เช่นส่งอีเมลสองรอบ หรือ sync ข้อมูลทับกัน

## เฟส 5: แผน rollback

แผน rollback ต้องเขียนก่อนวันจริง ไม่ใช่คิดตอนระบบพัง สิ่งที่ผมใส่ในแผน:

- **เงื่อนไขที่จะ rollback** เช่น login ไม่ได้ หรือ error rate สูงเกินกำหนดภายใน 30 นาทีแรก
- **คนตัดสินใจ** หนึ่งคน ไม่ต้องประชุม
- **ขั้นตอน**: ชี้ DNS กลับ เปิดเครื่องเก่า และจัดการข้อมูลที่เขียนเข้าเครื่องใหม่ระหว่างนั้น
- **เก็บเครื่องเก่าไว้** อย่างน้อยหนึ่งถึงสองสัปดาห์ หยุดเครื่องได้แต่อย่าเพิ่งลบ

## Gotcha ที่ควรรู้

- **IP whitelist ของบุคคลที่สาม** ต้องแจ้ง IP ใหม่ล่วงหน้า บางเจ้าใช้เวลาหลายวัน
- **Object storage API ไม่เหมือนกัน 100%** แม้จะบอกว่า S3-compatible ให้ทดสอบ upload, presigned URL และ ACL จริง
- **SMTP พอร์ต 25** มักถูกปิดบน cloud ใหม่ ใช้พอร์ต 465/587 หรือบริการส่งอีเมลแทน
- **Timezone ของ OS และ MySQL** เช็กให้ตรงกัน ไม่งั้นรายงานรายวันจะเพี้ยน
- **Package ของ OS ต่างกัน** distro ของ cloud แต่ละเจ้ามี repository ต่างกัน การติดตั้ง PHP บางเวอร์ชันอาจต้องหา repo เพิ่ม
- **Hostname อาจถูก reset** หลัง reboot จาก cloud-init ถ้าแอปอ้างอิง hostname ต้องตั้งให้ถาวร

ทุกขั้นที่ทำ ผมจดเป็น runbook ไปพร้อมกัน ตามแนวคิดใน [ทำทุก deploy ให้เป็น runbook](/blog/turn-every-deploy-into-runbook) รอบต่อไปที่ต้องย้ายระบบอื่นจะเร็วขึ้นมาก

## สรุป

การย้ายจาก AWS ไป Alibaba Cloud ECS ให้สำเร็จขึ้นกับการเตรียมตัวมากกว่าการลงมือ: ทำ inventory ให้ครบ ซ้อมย้ายข้อมูลเพื่อวัดเวลา ลด TTL ล่วงหน้า เขียนแผน rollback ก่อนวันจริง และเก็บเครื่องเก่าไว้สักพัก อย่าอัปเกรดอะไรพร้อมกับการย้าย เปลี่ยนทีละอย่าง แล้วระบบจะบอกเราเองว่าอะไรพัง
