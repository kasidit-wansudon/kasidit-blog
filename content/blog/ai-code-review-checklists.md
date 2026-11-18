---
title: "AI code review ด้วย checklist ตายตัว: security, database, state"
date: "2026-07-08"
excerpt: "ใช้ checklist ตายตัวกับ AI code review ด้าน security, database และ state เพื่อให้ทุกการรีวิวได้มาตรฐานเดียวกัน พร้อมตัวอย่าง checklist และ prompt ให้คัดลอกไปใช้"
tags: ["ai", "code-review", "claude-code", "security", "checklist"]
---

ผมใช้ AI ช่วยรีวิวโค้ดทุกวัน และเจอปัญหาเดียวกันซ้ำ ๆ: ถ้าสั่งแค่ว่า "ช่วยรีวิวโค้ดนี้หน่อย" ผลที่ได้แต่ละครั้งไม่เหมือนกันเลย บางครั้ง AI โฟกัสเรื่องชื่อตัวแปร บางครั้งพูดเรื่อง performance แต่ลืม SQL injection ที่อยู่ตรงหน้า วิธีแก้ที่ได้ผลที่สุดคือใช้ checklist ตายตัวกับ AI code review แยกเป็นสามหมวด: security, database และ state บทความนี้แชร์ checklist และวิธีใช้

## ทำไม "ช่วยรีวิวหน่อย" ถึงไม่พอ

AI ตอบตามสิ่งที่มันคิดว่าสำคัญ ณ ตอนนั้น ซึ่งขึ้นกับบริบทใน prompt ลำดับไฟล์ และความยาวของ diff ผลคือ:

- **ไม่สม่ำเสมอ** โค้ดแบบเดียวกัน รีวิวสองครั้งได้ผลต่างกัน
- **เน้นเรื่องผิว** เช่น format หรือชื่อ มากกว่าเรื่องที่ทำให้ระบบพังจริง
- **ตรวจไม่ได้ว่าครบ** เราไม่รู้ว่า AI ดูเรื่องไหนไปแล้วบ้าง

Checklist เปลี่ยน AI จาก "ผู้วิจารณ์อิสระ" เป็น "ผู้ตรวจตามรายการ" ทุกข้อต้องมีคำตอบ ทำให้เห็นได้ทันทีว่าข้อไหนผ่าน ข้อไหนไม่ผ่าน และข้อไหนไม่เกี่ยว

## Checklist ตัวอย่าง

ผมแยกเป็นไฟล์ตามหมวด เก็บไว้ใน repo เพื่อให้ทั้งทีมใช้ชุดเดียวกัน นี่คือเวอร์ชันย่อที่ใช้กับ Laravel และ Vue:

```markdown
# Review checklist v1

## A. Security
A1. Input จากผู้ใช้ผ่าน validation ก่อนใช้ทุกครั้งหรือไม่
A2. มี raw SQL ที่ต่อ string จาก input หรือไม่ (ต้องใช้ binding)
A3. ทุก endpoint ใหม่ตรวจ authentication และ authorization หรือไม่
A4. ผู้ใช้เข้าถึงข้อมูลของคนอื่นได้ด้วยการเปลี่ยน id ใน URL หรือไม่ (IDOR)
A5. มี secret, token หรือ password อยู่ในโค้ดหรือ log หรือไม่
A6. Output ที่แสดงบนหน้าเว็บ escape แล้วหรือไม่ (v-html, {!! !!})
A7. ไฟล์ upload ตรวจชนิด ขนาด และเก็บนอก public path หรือไม่

## B. Database
B1. มี query ใน loop (N+1) หรือไม่
B2. คอลัมน์ที่ใช้ใน WHERE / JOIN / ORDER BY ใหม่ มี index หรือไม่
B3. Migration ย้อนกลับได้ (มี down) และรันบนตารางใหญ่แล้วไม่ล็อกนานหรือไม่
B4. การเขียนหลายตารางที่ต้องสำเร็จพร้อมกัน อยู่ใน transaction หรือไม่
B5. query ที่ไม่มี LIMIT บนตารางที่โตได้เรื่อย ๆ มีหรือไม่

## C. State
C1. ค่าที่ cache ไว้ ถูกล้างเมื่อข้อมูลต้นทางเปลี่ยนหรือไม่
C2. งาน queue / webhook รันซ้ำแล้วผลยังถูกต้องหรือไม่ (idempotent)
C3. มี race condition เมื่อสอง request แก้ข้อมูลเดียวกันพร้อมกันหรือไม่
C4. State ฝั่ง frontend ตรงกับ server หลัง error หรือ refresh หรือไม่
C5. Timezone ของวันที่ถูกจัดการชัดเจนหรือไม่

## Output format
ตอบทุกข้อในรูปแบบ: <ID> PASS | FAIL | N/A — เหตุผลสั้น + file:line
FAIL ทุกข้อต้องมีข้อเสนอการแก้ และ confidence: verified / likely / guess
```

ข้อที่จับปัญหาได้บ่อยที่สุดในทีมผมคือ A4 (IDOR), B1 (N+1) และ C2 (idempotent) สามข้อนี้เป็นปัญหาที่โค้ดดูถูกต้องตอนอ่าน แต่พังตอนใช้งานจริง

## Prompt ที่ใช้

```text
You are reviewing a diff. Use ONLY the checklist in review_checklist.md.
For every item, answer PASS, FAIL or N/A with a one-line reason and file:line.
Do not comment on style or naming unless it causes a FAIL.
Do not suggest refactors outside the diff.
If you are unsure, mark the item "likely" or "guess", never invent code that is not in the diff.

<diff>
...git diff output...
</diff>
```

สองบรรทัดที่สำคัญคือ "ใช้เฉพาะ checklist" และ "ห้ามแต่งโค้ดที่ไม่อยู่ใน diff" บรรทัดหลังช่วยลดอาการที่ AI รายงานปัญหาในโค้ดที่ไม่มีอยู่จริง ซึ่งผมเจอบ่อยตอนแรก

## วิธีนำไปใช้ในทีม

1. **เริ่มจากข้อน้อย ๆ** checklist ที่ยาวเกินไปทำให้ AI ตอบผิวเผินทุกข้อ ผมเริ่มที่ประมาณ 15 ข้อ
2. **เพิ่มข้อจากเหตุการณ์จริง** ทุกครั้งที่มี bug หลุดขึ้น production ถามว่า "checklist ข้อไหนควรจับได้" ถ้าไม่มี ให้เพิ่มข้อใหม่
3. **ใส่ version** ให้ checklist เพื่อรู้ว่ารีวิวไหนใช้ชุดไหน
4. **รีวิวแยกหมวด** สำหรับ diff ขนาดใหญ่ ให้ AI รีวิวทีละหมวดแทนทั้งหมดในครั้งเดียว ผลจะละเอียดกว่า
5. **คนยังต้องรีวิว** checklist ของ AI จับเรื่องกลไกได้ดี แต่ไม่รู้ว่าเงื่อนไขทางธุรกิจถูกหรือผิด peer review โดยคนยังจำเป็นเสมอ

## ผลที่เห็น

หลังใช้ checklist ทีมของผมได้สิ่งที่ "ช่วยรีวิวหน่อย" ไม่เคยให้: ผลรีวิวที่เทียบกันได้ทุกครั้ง คนรีวิวรู้ว่าต้องดูข้อ FAIL ก่อน และ developer รู้ล่วงหน้าว่าโค้ดจะถูกตรวจเรื่องอะไร หลายคนเริ่มเช็กเองก่อนเปิด merge request ด้วยซ้ำ ซึ่งเป็นผลพลอยได้ที่ดีที่สุด

แนวคิด checklist นี้เป็นส่วนหนึ่งของ Kasidit framework ที่ผมทำเป็น open source สำหรับ Claude Code ดูรายละเอียดได้ที่ https://kasi.kasion.dev และถ้าอยากเห็นภาพรวมของการใช้ AI ในทีม ลองอ่าน [บริหารทีม dev เล็กร่วมกับ AI](/blog/managing-small-dev-team-with-ai)

## สรุป

AI code review จะสม่ำเสมอเมื่อมี checklist ตายตัว แยกหมวด security, database และ state บังคับให้ AI ตอบทุกข้อเป็น PASS, FAIL หรือ N/A พร้อมตำแหน่งในโค้ด ห้าม AI แต่งโค้ดที่ไม่อยู่ใน diff และเพิ่มข้อใหม่ทุกครั้งที่มี bug หลุด checklist ที่ดีคือ checklist ที่โตไปพร้อมกับบทเรียนของทีม
