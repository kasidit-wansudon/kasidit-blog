---
title: "เชื่อม DingTalk Bot กับ AI Sales Agent ด้วย Node.js + TypeScript"
date: "2026-06-17"
excerpt: "สถาปัตยกรรมการเชื่อม DingTalk bot กับ AI sales agent ด้วย Node.js และ TypeScript ตั้งแต่ message flow, การจัดการ session ไปจนถึง guardrails ก่อนใช้งานจริง"
tags: ["ai", "dingtalk", "nodejs", "typescript", "architecture"]
---

ทีมขายส่วนใหญ่ไม่อยากเปิดแอปใหม่ พวกเขาอยากถามคำถามในแชตที่ใช้อยู่ทุกวัน งานหนึ่งที่ผมทำในฐานะ Lead Programmer คือ bridge ที่เชื่อม DingTalk bot เข้ากับ AI sales agent เขียนด้วย Node.js และ TypeScript รองรับสี่ภาษา คือสเปน ไทย อังกฤษ และจีน โพสต์นี้จะเล่าสถาปัตยกรรม message flow และ guardrails ที่ผมคิดว่าจำเป็นสำหรับใครที่จะทำ AI sales agent บนแชตองค์กร

ทุกอย่างในโพสต์นี้เป็นแบบ generic ไม่มีรายละเอียดภายในของบริษัท

## ทำไมต้องเป็น bridge ไม่ใช่ใส่ AI เข้าไปใน bot ตรง ๆ

ตอนเริ่มต้นมันง่ายมากที่จะเขียน webhook รับข้อความ แล้วส่งต่อให้ LLM ทันที แต่พอใช้งานจริงจะเจอปัญหาสามอย่าง

- DingTalk มีข้อจำกัดเรื่องเวลาตอบ webhook ถ้า LLM คิดนาน การตอบกลับจะล้มเหลว
- ต้องการเปลี่ยน model หรือ prompt ได้โดยไม่แตะโค้ดฝั่งรับข้อความ
- ต้องการ log ทุกคำถามคำตอบไว้ตรวจคุณภาพภายหลัง

ผมจึงแยกเป็นชั้น bridge ที่รับผิดชอบเรื่อง "แชต" อย่างเดียว ส่วน agent รับผิดชอบเรื่อง "คิดและตอบ"

## สถาปัตยกรรมโดยรวม

ลำดับของข้อความเป็นแบบนี้

1. ผู้ใช้พิมพ์ถาม bot ในกลุ่มหรือแชตส่วนตัว
2. DingTalk ส่ง callback มาที่ bridge
3. bridge ตรวจ signature ระบุตัวผู้ใช้ และตอบรับทันที (ack)
4. bridge ใส่งานเข้า queue พร้อม context ที่จำเป็น
5. worker ดึงงาน เรียก AI agent พร้อม tools ที่อนุญาต
6. ได้คำตอบแล้วผ่าน guardrail ฝั่ง output
7. ส่งข้อความกลับผ่าน DingTalk API และบันทึก trace

หัวใจคือข้อ 3 กับ 4 การตอบรับก่อนแล้วค่อยประมวลผลแบบ async ทำให้ไม่ติดปัญหา timeout และถ้า agent ล้มก็ retry ได้โดยผู้ใช้ไม่ต้องถามซ้ำ

## Message flow ในโค้ด

โครงสร้างหลักของ handler ฝั่งรับข้อความหน้าตาประมาณนี้

```typescript
import express from "express";
import { verifySignature } from "./dingtalk/signature";
import { enqueue } from "./queue";

type IncomingMessage = {
  conversationId: string;
  senderStaffId: string;
  text: { content: string };
  msgId: string;
};

const app = express();
app.use(express.json());

app.post("/dingtalk/callback", async (req, res) => {
  const timestamp = req.header("timestamp") ?? "";
  const sign = req.header("sign") ?? "";

  if (!verifySignature(timestamp, sign, process.env.BOT_APP_SECRET!)) {
    return res.status(401).end();
  }

  const msg = req.body as IncomingMessage;
  const question = msg.text?.content?.trim() ?? "";

  if (!question) {
    return res.json({ msgtype: "empty" });
  }

  // Ack fast, process later. msgId makes the job idempotent.
  await enqueue({
    jobId: msg.msgId,
    conversationId: msg.conversationId,
    staffId: msg.senderStaffId,
    question,
  });

  return res.json({ msgtype: "empty" });
});

app.listen(3000);
```

จุดที่ผมให้ความสำคัญคือใช้ `msgId` เป็น `jobId` เพราะแพลตฟอร์มแชตบางครั้งส่ง callback ซ้ำ ถ้าไม่ทำ idempotent ผู้ใช้จะได้คำตอบสองครั้ง

## Guardrails ที่ต้องมี

AI sales agent ต่างจาก chatbot ทั่วไปตรงที่มันเข้าถึงข้อมูลธุรกิจ guardrails จึงไม่ใช่ของเสริม แต่เป็นส่วนหนึ่งของสถาปัตยกรรม ผมแบ่งเป็นสามชั้น

**ชั้น input**
- จำกัดความยาวคำถาม และ rate limit ต่อผู้ใช้
- ระบุตัวตนจาก staff ID ทุกครั้ง ไม่เชื่อชื่อที่ผู้ใช้พิมพ์มา
- ตัด prompt injection แบบชัดเจนออก เช่น ข้อความที่พยายามสั่งให้ลืมคำสั่งระบบ

**ชั้น tools**
- agent เรียกได้เฉพาะ tool ที่เป็น read-only และผ่าน API ที่มีสิทธิ์จำกัด
- ทุก tool กรองข้อมูลตามสิทธิ์ของผู้ถาม ไม่ใช่สิทธิ์ของ bot
- tool คืนค่าเป็นข้อมูลสรุป ไม่ใช่ dump ทั้งตาราง

**ชั้น output**
- ถ้าคำตอบมีตัวเลขยอดขาย ต้องมาจากผล tool เท่านั้น ห้าม model เดาเอง
- ถ้าไม่มีข้อมูล ให้ตอบตรง ๆ ว่าไม่มี แทนการแต่งคำตอบ
- ตอบในภาษาเดียวกับที่ถาม

ข้อที่สำคัญที่สุดสำหรับผมคือ "กรองตามสิทธิ์ของผู้ถาม" เพราะ bot มักมีสิทธิ์กว้างกว่าผู้ใช้ทุกคน ถ้าให้ agent ใช้สิทธิ์ของ bot ตรง ๆ ใครก็ถามข้อมูลที่ตัวเองไม่ควรเห็นได้

## Session และ context

แชตองค์กรไม่ได้มีแนวคิด session ชัดเจนเหมือนหน้าเว็บ ผมใช้ `conversationId` บวก `staffId` เป็น key แล้วเก็บประวัติแค่ไม่กี่รอบล่าสุดพร้อมหมดอายุตามเวลา เหตุผลคือคำถามฝ่ายขายส่วนใหญ่สั้นและจบในตัว การเก็บ context ยาวเกินไปทำให้ทั้งค่าใช้จ่ายสูงขึ้นและ model สับสนกับคำถามเก่า

## Trace ทุกคำตอบ

ทุก job บันทึก trace ไว้ ได้แก่ คำถาม ภาษาที่ตรวจพบ tools ที่ถูกเรียกพร้อม input/output คำตอบสุดท้าย และเวลาที่ใช้ trace เหล่านี้คือสิ่งที่ทำให้ผมตรวจคุณภาพคำตอบได้อย่างเป็นระบบ รายละเอียดเรื่องนี้ผมเขียนแยกไว้ใน [การรีวิวคุณภาพคำตอบ LLM จาก trace](/blog/trace-based-llm-answer-quality)

## บทเรียนจากการใช้งานจริง

- **ack ก่อน คิดทีหลัง** แก้ปัญหา timeout ได้เกือบหมด
- **เริ่มด้วย tools น้อย ๆ** สามถึงสี่ tool ที่ตอบคำถามบ่อยที่สุด ดีกว่ามีสิบ tool ที่ model เลือกผิด
- **ข้อความ error ต้องเป็นมิตร** ผู้ใช้ไม่ต้องรู้ว่า API ล่ม แค่รู้ว่าให้ลองใหม่อีกครั้ง
- **เปิดให้กลุ่มเล็กใช้ก่อน** แล้วดู trace ทุกวันในช่วงแรก ก่อนเปิดกว้าง

## สรุป

การเชื่อม DingTalk bot กับ AI sales agent ให้ใช้งานได้จริงไม่ได้อยู่ที่ prompt เก่งแค่ไหน แต่อยู่ที่สถาปัตยกรรม แยก bridge ออกจาก agent ตอบรับเร็วแล้วประมวลผลแบบ async ทำ idempotent กรองข้อมูลตามสิทธิ์ของผู้ถาม และเก็บ trace ทุกคำตอบ เมื่อพื้นฐานพวกนี้แน่น การปรับ model หรือ prompt ภายหลังจะง่ายและปลอดภัยกว่ามาก
