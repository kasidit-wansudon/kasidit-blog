---
title: "สร้างระบบ IT ticketing จาก requirement ถึง production ใน 2 วัน"
date: "2026-07-22"
excerpt: "เล่าวิธีสร้างระบบ IT ticketing จาก requirement ถึง demo และขึ้น production ใน 2 วัน ทั้งการตัด scope เลือก stack ออกแบบ schema และสิ่งที่ตัดสินใจไม่ทำ"
tags: ["laravel", "project-management", "mvp", "internal-tools"]
---

ช่วงที่เป็น Technical Lead ที่ OPPO Mexico คำขอจากฝ่ายต่าง ๆ ถึงทีม IT มาจากทุกทาง: แชต อีเมล เดินมาบอกที่โต๊ะ บางเรื่องหาย บางเรื่องถูกทำซ้ำ และไม่มีใครตอบได้ว่างานไหนค้างอยู่ ผมจึงสร้างระบบ IT ticketing สำหรับรับ requirement ตั้งแต่เก็บ requirement จนถึง demo และขึ้น production ภายใน 2 วัน บทความนี้เล่าวิธีตัด scope การเลือก stack และสิ่งที่ตั้งใจไม่ทำ

## ตั้งเป้าหมายให้แคบที่สุด

ก่อนเขียนโค้ด ผมเขียนประโยคเดียวที่อธิบายว่าระบบนี้ต้องแก้ปัญหาอะไร:

> ทุกคำขอถึง IT ต้องมีเลขที่ มีเจ้าของ และมีสถานะที่ผู้ขอดูเองได้

ทุกฟีเจอร์ที่เสนอเข้ามา ผมถามแค่ว่า "ช่วยให้ประโยคนี้เป็นจริงไหม" ถ้าไม่ ตัดออกไปไว้รอบหน้า

## Scope ที่เหลือหลังตัด

**ทำ (Must have)**
- ผู้ใช้ login ด้วยบัญชีที่มีอยู่แล้ว ไม่สร้างระบบสมาชิกใหม่
- ฟอร์มสร้าง ticket: หัวข้อ, ประเภท, ระบบที่เกี่ยวข้อง, ความเร่งด่วน, รายละเอียด, ไฟล์แนบ
- หน้ารายการ ticket ของฉัน พร้อมสถานะ
- หน้าจัดการสำหรับทีม IT: มอบหมายเจ้าของ เปลี่ยนสถานะ เขียน comment
- แจ้งเตือนเมื่อสถานะเปลี่ยน

**ไม่ทำในรอบแรก**
- SLA และการคำนวณเวลาตอบกลับ
- Dashboard และรายงาน
- Workflow อนุมัติหลายขั้น
- การแปลหลายภาษาเต็มรูปแบบ (ใช้ภาษาหลักก่อน)

การตัด dashboard ออกเป็นการตัดสินใจที่ยากที่สุด เพราะผู้บริหารอยากเห็น แต่ผมอธิบายว่าถ้ายังไม่มีข้อมูลที่ถูกต้องสะสมอยู่ในระบบ dashboard ก็ไม่มีความหมาย ข้อมูลต้องมาก่อน

## เลือก stack ที่ทีมคุ้นที่สุด

กติกาสำคัญของงานที่มีเวลาน้อยคือ **ห้ามเรียนของใหม่** ผมเลือก Laravel กับ MySQL ที่ทีมใช้ทุกวัน ใช้ template ฝั่ง server แทนการตั้งโปรเจกต์ frontend แยก และ deploy ด้วยกระบวนการ deploy เดิมของทีม

เวลาที่ประหยัดได้จากการไม่ต้องตั้งค่าอะไรใหม่ คือเวลาที่ใช้ทำฟีเจอร์ที่ผู้ใช้เห็นจริง

## Schema ที่เรียบที่สุดที่ใช้งานได้

```sql
CREATE TABLE tickets (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20) NOT NULL UNIQUE,      -- เช่น IT-2026-0001
  requester_id  BIGINT UNSIGNED NOT NULL,
  assignee_id   BIGINT UNSIGNED NULL,
  category      VARCHAR(30) NOT NULL,             -- bug, access, new_feature, hardware
  system        VARCHAR(50) NULL,
  priority      TINYINT NOT NULL DEFAULT 2,       -- 1 high, 2 normal, 3 low
  status        VARCHAR(20) NOT NULL DEFAULT 'open',
  title         VARCHAR(200) NOT NULL,
  description   TEXT NOT NULL,
  created_at    TIMESTAMP NULL,
  updated_at    TIMESTAMP NULL,
  closed_at     TIMESTAMP NULL,
  INDEX idx_status_assignee (status, assignee_id),
  INDEX idx_requester (requester_id, created_at)
);

CREATE TABLE ticket_events (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ticket_id   BIGINT UNSIGNED NOT NULL,
  user_id     BIGINT UNSIGNED NOT NULL,
  type        VARCHAR(20) NOT NULL,   -- comment, status_change, assign
  body        TEXT NULL,
  meta        JSON NULL,              -- {"from":"open","to":"in_progress"}
  created_at  TIMESTAMP NULL,
  INDEX idx_ticket (ticket_id, created_at)
);
```

ผมรวม comment, การเปลี่ยนสถานะ และการมอบหมายไว้ในตาราง `ticket_events` ตารางเดียว ทำให้หน้ารายละเอียดแสดง timeline ได้ด้วย query เดียว และวันหลังถ้าอยากทำรายงานเวลาตอบกลับ ข้อมูลก็มีครบอยู่แล้ว นี่คือเหตุผลที่กล้าตัด dashboard ออกจากรอบแรก

สถานะใช้ string ธรรมดาแทน enum ของ database เพราะเพิ่มสถานะใหม่ทีหลังได้โดยไม่ต้อง migrate

## แผนสองวัน

**วันที่ 1**
- เช้า: คุยกับตัวแทนผู้ใช้สองถึงสามฝ่าย สรุปประโยคเป้าหมายและ scope ให้ทุกคนยืนยัน
- บ่าย: migration, model, ฟอร์มสร้าง ticket, หน้ารายการของผู้ใช้
- เย็น: หน้าจัดการของทีม IT และ timeline

**วันที่ 2**
- เช้า: แจ้งเตือน, ไฟล์แนบ, จำกัดสิทธิ์ (ผู้ใช้เห็นเฉพาะ ticket ของตัวเอง)
- ก่อนเที่ยง: demo ให้ผู้ใช้ตัวแทนลองใช้จริง เก็บ feedback
- บ่าย: แก้เฉพาะสิ่งที่ขวางการใช้งาน, QA ทดสอบ, เขียน deploy-list
- เย็น: deploy ขึ้น production และส่งลิงก์พร้อมคู่มือหนึ่งหน้า

ผมใช้ AI ช่วย scaffold ส่วนที่เป็น pattern ซ้ำ ๆ เช่น form request, validation และหน้า list แต่เรื่องสิทธิ์การเข้าถึงผมเขียนและรีวิวเอง เพราะเป็นจุดที่ผิดไม่ได้

## สิ่งที่ทำให้สองวันเป็นไปได้

- **ตัดสินใจเร็ว มีคนตัดสินใจคนเดียว** ไม่มีการประชุมยืดเยื้อเรื่อง scope
- **demo เร็ว** ให้ผู้ใช้เห็นของจริงก่อนเที่ยงวันที่สอง feedback จากของจริงดีกว่าจากเอกสาร
- **ใช้ของเดิมให้มากที่สุด** ทั้ง login, stack และ pipeline การ deploy
- **ยอมรับว่ามันไม่สมบูรณ์** และบอกผู้ใช้ตรง ๆ ว่ารอบหน้าจะมีอะไร

หลังขึ้น production ทีมเริ่มมีข้อมูลจริงว่าคำขอมาจากฝ่ายไหน เรื่องอะไรมากที่สุด ข้อมูลนี้ช่วยตอนวางแผนงานระยะยาว ซึ่งผมเล่าไว้ใน [แผนโปรเจกต์ IT 25 สัปดาห์](/blog/25-week-it-project-plan)

## สรุป

การสร้างระบบ IT ticketing ใน 2 วันไม่ได้มาจากการเขียนโค้ดเร็ว แต่มาจากการตัด scope ให้เหลือประโยคเดียว เลือก stack ที่ทีมรู้จักดีที่สุด ออกแบบ schema ที่เก็บข้อมูลครบพอให้ต่อยอดได้ และ demo ให้ผู้ใช้เห็นของจริงให้เร็วที่สุด สิ่งที่ตัดออกไม่ได้หายไป แค่รอให้มีข้อมูลจริงมารองรับก่อน
