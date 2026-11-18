---
title: "ใช้ Claude Code hooks เป็น guardrail กันคำสั่งอันตราย"
date: "2026-10-21"
excerpt: "ใช้ Claude Code hooks เป็น guardrail ด้วย PreToolUse และ PostToolUse เพื่อบล็อกคำสั่ง destructive และตรวจงานอัตโนมัติ พร้อมตัวอย่าง settings.json และ script"
tags: ["claude-code", "ai", "hooks", "devops"]
---

ผมใช้ Claude Code ทุกวัน และสิ่งที่ทำให้ผมกล้าปล่อยให้ agent รันคำสั่งเองได้มากขึ้นคือ **Claude Code hooks** หลักคิดง่าย ๆ คือ คำสั่งใน prompt เป็นแค่ "คำขอ" model อาจลืมหรือตีความผิดได้ แต่ hook เป็น "กฎ" ที่ harness บังคับใช้ทุกครั้ง ไม่ว่า model จะคิดอะไรอยู่ ในโพสต์นี้ผมจะแชร์วิธีใช้ hook เป็น guardrail พร้อมตัวอย่างที่เอาไปใช้ได้เลย

## Hook คืออะไร ทำงานตอนไหน

hook คือคำสั่ง shell ที่ Claude Code รันให้อัตโนมัติเมื่อเกิด event ที่กำหนด event ที่ผมใช้บ่อยที่สุดมีสองตัว:

- **PreToolUse** รันก่อน agent ใช้ tool เช่น ก่อนรันคำสั่ง Bash หรือก่อนแก้ไฟล์ ใช้สำหรับ "บล็อก" สิ่งที่ไม่ควรเกิด
- **PostToolUse** รันหลัง tool ทำงานเสร็จ ใช้สำหรับ "ตรวจ" ผลลัพธ์ เช่น รัน linter หลังแก้ไฟล์

hook ได้รับข้อมูลของ tool call เป็น JSON ทาง stdin และสื่อสารกลับด้วย exit code ถ้า PreToolUse hook จบด้วย exit code `2` คำสั่งนั้นจะถูกบล็อก และข้อความใน stderr จะถูกส่งกลับไปให้ model อ่าน เพื่อให้มันรู้ว่าทำไมถูกห้ามและปรับวิธีทำ

## ตั้งค่าใน settings.json

hook ตั้งได้ทั้งระดับผู้ใช้ (`~/.claude/settings.json`) และระดับโปรเจกต์ (`.claude/settings.json`) ตัวอย่างนี้บล็อกคำสั่ง Bash ที่อันตราย และรัน formatter หลังแก้ไฟล์:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "python3 ~/.claude/hooks/block_destructive.py" }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "~/.claude/hooks/lint_changed.sh" }
        ]
      }
    ]
  }
}
```

`matcher` คือชื่อ tool ที่ hook จะทำงานด้วย ใส่หลายตัวคั่นด้วย `|` ได้

## Script บล็อกคำสั่ง destructive

นี่คือเวอร์ชันย่อของ script ที่ผมใช้ อ่าน JSON จาก stdin ดึงคำสั่ง Bash ออกมา แล้วเทียบกับ pattern อันตราย:

```python
#!/usr/bin/env python3
import json
import re
import sys

payload = json.load(sys.stdin)
command = payload.get("tool_input", {}).get("command", "")

BLOCKED = [
    (r"\brm\s+-[a-zA-Z]*r[a-zA-Z]*f", "rm -rf ไม่อนุญาต ให้ระบุไฟล์ทีละรายการหรือถามผู้ใช้"),
    (r"\bgit\s+push\b.*--force", "ห้าม force push"),
    (r"\bgit\s+reset\s+--hard", "ห้าม reset --hard โดยไม่ถามผู้ใช้"),
    (r"\bDROP\s+(TABLE|DATABASE)\b", "ห้าม DROP ผ่าน agent"),
    (r"\bdocker\s+volume\s+(rm|prune)", "ห้ามลบ docker volume"),
]

for pattern, reason in BLOCKED:
    if re.search(pattern, command, re.IGNORECASE):
        print(f"BLOCKED: {reason}", file=sys.stderr)
        sys.exit(2)

sys.exit(0)
```

เมื่อ agent พยายามรัน `rm -rf build/` มันจะได้รับข้อความกลับไปว่าถูกบล็อกเพราะอะไร ส่วนใหญ่ model จะเปลี่ยนไปใช้วิธีที่ปลอดภัยกว่า หรือหยุดถามผู้ใช้ ซึ่งคือพฤติกรรมที่เราต้องการ

## Guardrail อื่นที่ผมใช้จริง

**1. ป้องกันการแตะไฟล์ secret** PreToolUse บน `Read|Edit|Write` ที่เช็กว่า path เป็น `.env`, ไฟล์ key หรือโฟลเดอร์ credential หรือไม่ ถ้าใช่ให้บล็อก ป้องกันไม่ให้ค่า secret หลุดเข้าไปใน context โดยไม่ตั้งใจ

**2. ห้าม commit อัตโนมัติ** บล็อก `git commit` และ `git push` เว้นแต่ผู้ใช้สั่งเอง ผมไม่อยากให้มีอะไรขึ้น remote โดยที่ผมยังไม่ได้อ่าน diff

**3. ตรวจภาษาของคำตอบ** ผมมี hook ที่ตรวจว่า output ใช้ภาษาที่ตั้งไว้ เพราะเคยเจอ model สลับภาษาเองกลางบทสนทนา

**4. Lint หลังแก้ไฟล์** PostToolUse ที่รัน linter หรือ formatter เฉพาะไฟล์ที่เพิ่งแก้ ถ้ามี error ก็ส่งกลับให้ model แก้ทันที แทนที่จะไปเจอตอน CI

## เริ่มจากตรงไหนดี

ถ้ายังไม่เคยใช้ hook ผมแนะนำให้เริ่มจากสองตัวเท่านั้น คือบล็อก `rm -rf` กับ force push เพราะเป็นสองอย่างที่พลาดครั้งเดียวแล้วเจ็บที่สุด ใช้ไปสักสัปดาห์ ดูว่า hook ทำงานบ่อยแค่ไหน และ model ตอบสนองต่อข้อความบล็อกอย่างไร แล้วค่อยเพิ่มกฎทีละข้อจากเหตุการณ์จริงที่เจอ

hook ที่ดีที่สุดมักเกิดจากความผิดพลาดที่เคยเกิดขึ้นแล้ว ทุกครั้งที่ agent ทำอะไรที่ผมไม่อยากให้เกิดอีก ผมถามตัวเองว่า "กฎนี้ควรเป็นคำแนะนำ หรือควรเป็น hook" ถ้าคำตอบคือห้ามเกิดอีกเด็ดขาด ก็เขียนเป็น hook และเก็บ script ไว้ใน repository เพื่อให้ทั้งทีมใช้กฎชุดเดียวกัน

## ข้อควรระวัง

- **pattern matching ไม่ใช่ security boundary ที่สมบูรณ์** คำสั่งอันตรายเขียนได้หลายรูปแบบ hook ช่วยลดอุบัติเหตุ แต่ไม่ได้แทนที่การจำกัดสิทธิ์จริง เช่น ไม่ให้ agent ใช้ credential ของ production เลย
- **hook ต้องเร็ว** มันรันทุก tool call ถ้าช้า ทุกอย่างช้าตาม เลี่ยงการเรียก network ใน hook
- **ข้อความใน stderr ต้องบอกทางออก** แค่ "BLOCKED" ไม่พอ ต้องบอกว่าควรทำอะไรแทน model จะได้ไม่วนพยายามซ้ำ
- **ทดสอบ hook ก่อนใช้** ส่ง JSON ตัวอย่างเข้า script ด้วย `echo '{...}' | python3 block_destructive.py; echo $?` เพื่อดูว่า exit code ถูกต้อง
- **อย่าบล็อกมากเกินไป** ถ้า hook ห้ามทุกอย่าง agent จะทำงานไม่ได้ และคุณจะเริ่มปิด hook ทิ้ง ให้บล็อกเฉพาะสิ่งที่ย้อนกลับไม่ได้

## Hook ใน Kasidit

ใน Kasidit ผมใช้ runtime hook เป็นหนึ่งในชั้นของวินัย ควบคู่กับ scope ที่ชัดและ confidence label แนวคิดคือ อะไรที่ "ต้อง" เกิดทุกครั้ง ให้เป็น hook อะไรที่ต้องใช้วิจารณญาณ ให้เป็นคำแนะนำใน prompt ดูรายละเอียดเพิ่มได้ที่ https://kasi.kasion.dev และถ้าสนใจหลักคิดเบื้องหลัง ลองอ่าน [กฎการทำ AI pair programming](/blog/ai-pair-programming-rules)

## สรุป

Claude Code hooks เปลี่ยนคำขอให้เป็นกฎ ใช้ PreToolUse บล็อกสิ่งที่ย้อนกลับไม่ได้ เช่น `rm -rf`, force push, DROP TABLE และไฟล์ secret ใช้ PostToolUse ตรวจงานทันทีหลังแก้ ให้ข้อความตอนบล็อกบอกทางออกเสมอ และจำไว้ว่า hook คือเข็มขัดนิรภัย ไม่ใช่สิ่งทดแทนการจำกัดสิทธิ์ที่ระดับระบบ
