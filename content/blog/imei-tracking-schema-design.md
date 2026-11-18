---
title: "ออกแบบ Database Schema สำหรับ IMEI Tracking ให้ตามเครื่องได้ทุกจุด"
date: "2026-06-24"
excerpt: "วิธีออกแบบ database schema สำหรับ IMEI tracking ที่เชื่อม purchase order, sales order และ stock movement พร้อมตัวอย่าง SQL, index และ uniqueness ที่ใช้ได้จริง"
tags: ["database", "sql", "schema-design", "inventory", "laravel"]
---

ระบบขายมือถือมีจุดที่ต่างจากระบบ inventory ทั่วไปอยู่ข้อหนึ่ง คือเราไม่ได้นับแค่ "จำนวน" แต่ต้องรู้ว่า "เครื่องไหน" อยู่ที่ไหน การออกแบบ database schema สำหรับ IMEI tracking จึงเป็นงานที่ถ้าวางผิดตั้งแต่แรก จะกลายเป็นหนี้ทางเทคนิคที่จ่ายไม่หมด ตอนนี้ผมกำลังนำการย้ายระบบ Sell-in/WMS จาก Zend 1.12 ไป Laravel ซึ่งมีส่วน sales order, purchase order และ IMEI tracking อยู่ด้วย เลยอยากสรุปหลักคิดที่ใช้ออกแบบ schema ส่วนนี้

ตัวอย่างในโพสต์นี้เป็น schema แบบ generic ไม่ใช่โค้ดภายในของบริษัท แต่หลักการเหมือนกัน

## ปัญหาที่ IMEI tracking ต้องตอบ

ก่อนเขียน `CREATE TABLE` ผมจะเขียนคำถามที่ระบบต้องตอบได้ก่อนเสมอ

- เครื่อง IMEI นี้เข้ามาจาก purchase order ไหน วันไหน
- ตอนนี้อยู่ที่คลังไหน หรือขายไปแล้วกับ sales order ไหน
- เครื่องนี้เคยถูกคืน ย้ายคลัง หรือเปลี่ยนสถานะมากี่ครั้ง
- ในคลัง A มีเครื่องรุ่น X ที่พร้อมขายกี่เครื่อง

คำถามสามข้อแรกเป็นเรื่อง "ประวัติ" ส่วนข้อสุดท้ายเป็นเรื่อง "สถานะปัจจุบัน" ถ้าเราพยายามตอบทั้งสองแบบจากตารางเดียว query จะช้าและซับซ้อน ผมจึงแยกเป็นสองชั้นชัดเจน

## โครงสร้างหลัก: สถานะปัจจุบัน + ประวัติการเคลื่อนไหว

แนวคิดคือมีตาราง `devices` เก็บสถานะล่าสุดของแต่ละเครื่อง (หนึ่ง IMEI หนึ่งแถว) และมีตาราง `device_movements` เป็น append-only log ที่บันทึกทุกการเปลี่ยนแปลง

```sql
CREATE TABLE devices (
    id              BIGSERIAL PRIMARY KEY,
    imei            VARCHAR(15) NOT NULL,
    product_id      BIGINT NOT NULL REFERENCES products(id),
    warehouse_id    BIGINT REFERENCES warehouses(id),
    status          VARCHAR(20) NOT NULL DEFAULT 'in_stock',
    purchase_order_line_id BIGINT REFERENCES purchase_order_lines(id),
    sales_order_line_id    BIGINT REFERENCES sales_order_lines(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT devices_imei_unique UNIQUE (imei),
    CONSTRAINT devices_status_check CHECK (
        status IN ('in_stock', 'reserved', 'sold', 'returned', 'in_transit', 'scrapped')
    )
);

CREATE TABLE device_movements (
    id              BIGSERIAL PRIMARY KEY,
    device_id       BIGINT NOT NULL REFERENCES devices(id),
    movement_type   VARCHAR(20) NOT NULL,
    from_warehouse_id BIGINT REFERENCES warehouses(id),
    to_warehouse_id   BIGINT REFERENCES warehouses(id),
    reference_type  VARCHAR(30) NOT NULL,
    reference_id    BIGINT NOT NULL,
    created_by      BIGINT REFERENCES users(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_devices_wh_product_status
    ON devices (warehouse_id, product_id, status);

CREATE INDEX idx_movements_device_time
    ON device_movements (device_id, created_at);

CREATE INDEX idx_movements_reference
    ON device_movements (reference_type, reference_id);
```

`devices` ตอบคำถาม "ตอนนี้อยู่ไหน" ได้ทันทีด้วย index เดียว ส่วน `device_movements` ตอบคำถาม "เคยไปไหนมาบ้าง" โดยไม่ต้องไปแตะตารางที่ถูกอ่านบ่อย

## Uniqueness: เรื่องที่คนมักมองข้าม

IMEI ควรจะ unique ทั่วโลก แต่ในโลกจริงข้อมูลที่เข้าระบบไม่ได้สะอาดเสมอ มีทั้งพิมพ์ผิด สแกนซ้ำ หรือไฟล์ upload ที่มีแถวซ้ำ ผมจึงตั้งกติกาไว้แบบนี้

1. **ใส่ `UNIQUE` ที่ระดับ database เสมอ** อย่าพึ่ง validation ในโค้ดอย่างเดียว เพราะสอง request ที่มาพร้อมกันจะผ่าน validation ทั้งคู่ได้
2. **normalize ก่อน insert** ตัดช่องว่าง ตัดขีด และเช็กว่าเป็นตัวเลข 15 หลัก ถ้าต้องการเข้มขึ้นก็เช็ก Luhn checksum ด้วย
3. **เครื่องที่ถูกคืนแล้วนำกลับมาขายใหม่ ไม่สร้างแถวใหม่** ให้เปลี่ยน `status` แล้วบันทึก movement แทน ถ้าสร้างแถวใหม่ constraint จะพัง และประวัติจะขาดตอน

สำหรับเครื่องสองซิมที่มี IMEI สองชุด ผมแนะนำให้มีตาราง `device_identifiers` แยก แล้วใส่ unique ที่ตารางนั้น ให้ `devices` มี IMEI หลักเพียงตัวเดียว จะ query ง่ายกว่าการใส่สองคอลัมน์แล้วต้องเช็ก unique ข้ามคอลัมน์

## เชื่อมกับ purchase order และ sales order

จุดที่ต้องตัดสินใจคือจะผูก IMEI ไว้กับ "order" หรือ "order line" ผมเลือก order line เพราะ order หนึ่งมีหลายรุ่น และเราต้องการเช็กได้ว่าจำนวน IMEI ที่สแกนตรงกับจำนวนในบรรทัดนั้นหรือไม่

```sql
-- เช็กว่า sales order line ไหนสแกน IMEI ยังไม่ครบ
SELECT sol.id, sol.quantity, COUNT(d.id) AS scanned
FROM sales_order_lines sol
LEFT JOIN devices d ON d.sales_order_line_id = sol.id
WHERE sol.sales_order_id = :order_id
GROUP BY sol.id, sol.quantity
HAVING COUNT(d.id) <> sol.quantity;
```

query แบบนี้เป็นด่านสุดท้ายก่อนยืนยันการส่งของ ช่วยกันเคสส่งของเกินหรือขาดได้ดีมาก

## เขียนสถานะกับประวัติใน transaction เดียว

กฎที่สำคัญที่สุดของ schema แบบสองชั้นคือ ทุกครั้งที่เปลี่ยน `devices` ต้องเขียน `device_movements` ใน transaction เดียวกัน ถ้าแยกกัน วันหนึ่งข้อมูลสองตารางจะไม่ตรงกันแน่นอน

ใน Laravel ผมรวม logic นี้ไว้ใน service class เดียว เช่น `DeviceMovementService::move()` แล้วห้ามโค้ดส่วนอื่น update `devices.status` ตรง ๆ วิธีนี้ทำให้ทุกการเปลี่ยนสถานะผ่านจุดเดียว ตรวจสอบง่าย และใส่ `SELECT ... FOR UPDATE` เพื่อกัน race condition ตอนสองคนสแกนเครื่องเดียวกันพร้อมกันได้ในที่เดียว

## Index ที่ใช้จริง

อย่าใส่ index ทุกคอลัมน์ ให้ดูจาก query ที่รันบ่อยจริง ในระบบลักษณะนี้มักมีแค่สามแบบ

- **ค้นหาด้วย IMEI** ได้ฟรีจาก unique constraint
- **นับสต็อกตามคลัง รุ่น และสถานะ** ใช้ composite index `(warehouse_id, product_id, status)` เรียงตาม selectivity และลำดับที่ใช้ใน `WHERE`
- **ดูประวัติของเครื่อง** ใช้ `(device_id, created_at)`

ถ้าตาราง movement โตมาก ค่อยพิจารณา partition ตามเดือน แต่ไม่ต้องทำตั้งแต่วันแรก

## Checklist ก่อนขึ้น production

- มี `UNIQUE` บน IMEI ที่ระดับ database
- มี `CHECK` constraint หรือ enum สำหรับ status
- การเปลี่ยนสถานะทุกแบบผ่าน service เดียวและอยู่ใน transaction
- มี query ตรวจความครบของ IMEI ต่อ order line
- ทดสอบเคสคืนสินค้าและขายซ้ำ
- ทดสอบสแกนพร้อมกันสอง session

ถ้าคุณกำลังย้ายระบบเก่าแบบค่อยเป็นค่อยไป ผมเขียนแนวทางไว้ใน [Zend 1 ไป Laravel ด้วย strangler pattern](/blog/zend-1-to-laravel-strangler-migration) ซึ่งเข้ากับการแยก schema แบบนี้ได้ดี

## สรุป

Schema สำหรับ IMEI tracking ที่ดีคือการแยก "สถานะปัจจุบัน" ออกจาก "ประวัติ" ใส่ uniqueness ที่ระดับ database ผูก IMEI กับ order line และบังคับให้ทุกการเปลี่ยนแปลงผ่าน transaction เดียว ทำสี่ข้อนี้ให้ได้ตั้งแต่แรก ระบบจะตอบคำถามว่า "เครื่องนี้อยู่ไหน" ได้เร็วและเชื่อถือได้ไปอีกนาน
