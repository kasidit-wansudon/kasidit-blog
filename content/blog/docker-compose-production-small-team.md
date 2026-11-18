---
title: "Docker Compose บน Production สำหรับทีมเล็ก: Healthcheck, Env, Deploy, Backup"
date: "2026-04-01"
excerpt: "รัน production ด้วย Docker Compose สำหรับทีมเล็กอย่างปลอดภัย ครอบคลุม healthcheck, env file, deploy แบบเกือบ zero-downtime และ backup พร้อมตัวอย่าง compose file"
tags: ["docker", "docker-compose", "devops", "deploy"]
---

หลายคนบอกว่า Docker Compose ไม่ควรใช้บน production แต่สำหรับทีมเล็กที่ดูแลระบบภายในไม่กี่ระบบ บนเครื่องไม่กี่เครื่อง Kubernetes มักเป็นภาระมากกว่าประโยชน์ ผมใช้ Docker Compose บน production มาหลายระบบ และพบว่ามันพอเพียงถ้าเราใส่ใจสี่เรื่อง คือ healthcheck, env file, วิธี deploy และ backup

## เมื่อไรที่ Docker Compose บน production เหมาะ

- ทีม 1–5 คน ไม่มีคนดูแล infra เต็มเวลา
- ระบบรันบนเครื่องเดียวหรือไม่กี่เครื่อง
- ยอมรับ downtime ระดับไม่กี่วินาทีตอน deploy ได้
- ต้องการให้ dev และ production หน้าตาเหมือนกัน

ถ้าต้อง auto-scale หลายสิบ node หรือต้องการ zero-downtime จริงจัง ตอนนั้นค่อยคิดเรื่อง orchestrator

## ตัวอย่าง compose file

นี่คือโครงที่ผมใช้กับ Laravel app ทั่วไป มี app, queue worker, nginx และ PostgreSQL

```yaml
services:
  app:
    image: registry.example.com/orders-app:${APP_TAG}
    env_file: .env.production
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "php", "artisan", "app:health"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 20s

  worker:
    image: registry.example.com/orders-app:${APP_TAG}
    env_file: .env.production
    restart: unless-stopped
    command: ["php", "artisan", "queue:work", "--tries=3", "--max-time=3600"]
    depends_on:
      app:
        condition: service_healthy

  nginx:
    image: nginx:1.27-alpine
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      app:
        condition: service_healthy

  db:
    image: postgres:16
    restart: unless-stopped
    env_file: .env.db
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  db_data:
```

## Healthcheck: อย่าให้ container "รัน" แต่ไม่ "พร้อม"

ปัญหาที่เจอบ่อยที่สุดคือ container ขึ้นสถานะ running แต่ app ยังต่อ database ไม่ได้ แล้ว nginx ก็ส่ง request เข้าไปจนได้ 502

healthcheck แก้ตรงนี้ จุดสำคัญคือ

- **เช็คของจริง** ไม่ใช่แค่ว่า process ยังอยู่ health endpoint ควรลองต่อ database และ cache สั้น ๆ
- **ใช้ `depends_on` กับ `condition: service_healthy`** เพื่อให้ลำดับการ start ถูกต้อง
- **ตั้ง `start_period`** ให้ app มีเวลาบูตก่อนนับความล้มเหลว
- **health check ต้องเร็ว** ถ้ามันช้ากว่า timeout จะกลายเป็น false alarm

## Env file: แยกให้ชัด และไม่เข้า git

กฎของผมมีไม่กี่ข้อ

- แยก env ตามบริการ (`.env.production`, `.env.db`) ไม่ให้ app เห็นรหัส superuser ของ database ถ้าไม่จำเป็น
- ไฟล์ env จริงอยู่บน server เท่านั้น ใน git มีแค่ `.env.example` ที่ไม่มีค่าจริง
- ตั้ง permission ให้อ่านได้เฉพาะ user ที่รัน deploy
- ค่าที่อ่อนไหวมาก เช่น key เข้ารหัสข้อมูลส่วนบุคคล ควรอยู่ใน secret manager แล้วดึงตอน runtime ซึ่งผมเล่าไว้ใน [เข้ารหัส PII ด้วย AES-256 และ Secrets Manager](/blog/encrypt-pii-aes-256-secrets-manager)
- ใช้ image tag ผ่านตัวแปร (`APP_TAG`) เพื่อให้ rollback คือการเปลี่ยน tag กลับเท่านั้น

## Deploy แบบเกือบ zero-downtime

Compose ไม่มี rolling update ในตัว แต่ทำให้ downtime สั้นมากได้ด้วยขั้นตอนนี้

1. build และ push image ที่มี tag ใหม่จาก CI
2. บน server: `docker compose pull` ก่อน เพื่อให้เวลาดาวน์โหลดไม่อยู่ในช่วง downtime
3. รัน migration แบบ backward-compatible ก่อนสลับ code
4. `docker compose up -d --no-deps app worker` เพื่อ recreate เฉพาะ service ที่เปลี่ยน
5. รอ healthcheck ผ่าน แล้ว smoke test หน้าหลัก
6. ถ้าพัง: ตั้ง `APP_TAG` กลับเป็นค่าเดิมแล้ว `up -d` อีกรอบ

จุดที่ต้องระวังคือ migration ต้องไม่ทำให้ code เวอร์ชันเก่าพัง เช่น อย่าลบ column ในรอบเดียวกับที่หยุดใช้มัน ให้แยกเป็นสอง deploy

queue worker ก็ต้องระวัง ใช้ `--max-time` และสั่ง `queue:restart` ก่อน recreate เพื่อให้ job ที่ค้างทำงานจบก่อน

## Backup: ถ้าไม่เคย restore แปลว่ายังไม่มี backup

volume ของ database คือสิ่งเดียวที่หายแล้วเอาคืนไม่ได้ ผมทำ backup แบบนี้

- cron รัน `pg_dump` ผ่าน `docker compose exec` ทุกคืน บีบอัด และใส่วันที่ในชื่อไฟล์
- ส่งไฟล์ไปเก็บนอกเครื่อง เช่น object storage คนละที่กับ server
- เก็บย้อนหลังตามรอบที่ทีมตกลง และลบอันเก่าอัตโนมัติ
- **ทดสอบ restore เป็นประจำ** บน database ว่าง แล้วเช็คจำนวน row ของตารางหลัก

ขั้นตอนสุดท้ายคือสิ่งที่ทีมส่วนใหญ่ข้าม และเป็นสิ่งที่จะทำให้คุณรอดในวันที่แย่ที่สุด

## Log และการดูแลประจำวัน

ทีมเล็กไม่มีเวลานั่งดู dashboard ทั้งวัน สิ่งที่ผมตั้งไว้คือ

- กำหนด logging driver ให้ rotate เช่น `max-size` และ `max-file` ไม่งั้น log ของ container ที่ error วนซ้ำจะกิน disk จนเต็มภายในไม่กี่วัน
- ใช้ `docker compose ps` และ `docker compose logs --since 10m app` เป็นคำสั่งแรกเมื่อมีคนแจ้งปัญหา และเขียนไว้ใน runbook ให้ทุกคนในทีมรู้
- ตั้ง cron เล็ก ๆ เช็คว่ามี container ไหนสถานะ unhealthy แล้วส่งแจ้งเตือนเข้าช่องแชตของทีม
- ล้าง image เก่าที่ไม่ได้ใช้เป็นรอบ ๆ แต่เก็บ tag ล่าสุดสองสามตัวไว้เผื่อ rollback

## Checklist ก่อนเปิดใช้งานจริง

- ทุก service มี `restart: unless-stopped`
- ทุก service ที่มีคนพึ่งพามี healthcheck
- ไม่มี secret อยู่ใน compose file หรือ git
- port ของ database ไม่เปิดออกนอกเครื่อง
- log มีการ rotate ไม่ให้ disk เต็ม
- มี backup และเคย restore สำเร็จอย่างน้อยหนึ่งครั้ง
- rollback คือคำสั่งเดียว และทุกคนในทีมรู้

## สรุป

Docker Compose บน production ใช้ได้ดีสำหรับทีมเล็ก ถ้าเราไม่มองมันเป็นแค่เครื่องมือ dev ใส่ healthcheck ที่เช็คของจริง แยก env file ให้ปลอดภัย deploy ด้วย image tag เพื่อให้ rollback ง่าย และทดสอบ restore backup จริง เท่านี้ก็พอให้ระบบภายในเดินได้มั่นคงโดยไม่ต้องแบกความซับซ้อนของ orchestrator
