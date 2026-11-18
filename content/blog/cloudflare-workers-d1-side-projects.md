---
title: "ทำไมผมรัน Side Project บน Cloudflare Workers + D1"
date: "2026-05-27"
excerpt: "เหตุผลที่ผมเลือก Cloudflare Workers + D1 สำหรับ side project ทั้งค่าใช้จ่าย flow การ deploy ด้วย wrangler ตัวอย่าง wrangler.jsonc และข้อจำกัดที่ควรรู้"
tags: ["cloudflare", "workers", "d1", "side-project", "serverless"]
---

ผมทำงานประจำเต็มเวลา และมี side studio ชื่อ Kasion ที่ทำแอปเล็ก ๆ หลายตัว เวลาสำหรับดูแลเซิร์ฟเวอร์จึงแทบไม่มี นี่คือเหตุผลหลักที่แอปเกือบทั้งหมดของ Kasion รันบน Cloudflare Workers + D1 โพสต์นี้จะเล่าว่าทำไมผมเลือก stack นี้สำหรับ side project, flow การ deploy ที่ใช้จริง และข้อจำกัดที่ควรรู้ก่อนตัดสินใจ

## ทำไมเป็น Workers + D1

**1. ไม่มีเซิร์ฟเวอร์ให้ดูแล**
งานประจำของผมเกี่ยวกับ deploy, rollback และดูแลระบบ production อยู่แล้ว ผมไม่อยากกลับบ้านมาเจอ VM ที่ต้อง patch, ต้องต่ออายุ SSL หรือต้องดูว่า disk เต็มหรือยัง Workers ตัดเรื่องพวกนี้ออกไปทั้งหมด

**2. ค่าใช้จ่ายเริ่มต้นต่ำมาก**
side project ส่วนใหญ่มีผู้ใช้น้อยในช่วงแรก และหลายตัวอาจไม่เคยโตเลย การจ่ายค่า VM รายเดือนสำหรับแอปที่มีคนใช้วันละไม่กี่คนเป็นเรื่องสิ้นเปลือง Workers คิดตามการใช้งาน และมี free tier ที่เพียงพอสำหรับการทดลองไอเดียส่วนใหญ่ ทำให้ผมกล้าเปิดแอปใหม่โดยไม่ต้องคิดหนัก ส่วนตัวเลขราคาและ quota ล่าสุด ควรเช็กจากหน้า pricing ของ Cloudflare โดยตรงเพราะเปลี่ยนได้

**3. D1 คือ SQLite ที่คุ้นมือ**
D1 เป็นฐานข้อมูลที่ใช้ SQLite ภายใต้ ผมเขียน SQL ได้ตามปกติ มี migration และไม่ต้องตั้ง connection pool สำหรับแอปที่ข้อมูลไม่ใหญ่มาก นี่คือความเรียบง่ายที่พอดี

**4. Deploy ไวและ rollback ง่าย**
คำสั่งเดียวขึ้น production และถ้าพังก็ย้อนเวอร์ชันได้ทันที สำหรับคนที่มีเวลาทำ side project แค่ช่วงค่ำ ความเร็วของรอบนี้สำคัญมาก

## ตัวอย่าง wrangler.jsonc

นี่คือ config พื้นฐานที่ผมใช้เป็นจุดเริ่มต้นของเกือบทุกโปรเจกต์

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "my-side-app",
  "main": "src/index.ts",
  "compatibility_date": "2026-05-01",
  "compatibility_flags": ["nodejs_compat"],
  "observability": {
    "enabled": true
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "my-side-app-db",
      "database_id": "<your-database-id>",
      "migrations_dir": "migrations"
    }
  ],
  "vars": {
    "APP_ENV": "production"
  }
}
```

ข้อควรจำคือ secret อย่าใส่ใน `vars` ให้ใช้ `wrangler secret put` แทน เพราะไฟล์ config ถูก commit เข้า git

ฝั่งโค้ด Worker ใช้ D1 ผ่าน binding ได้ตรง ๆ

```typescript
export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/notes") {
      const { results } = await env.DB
        .prepare("SELECT id, title, created_at FROM notes ORDER BY created_at DESC LIMIT ?")
        .bind(20)
        .all();
      return Response.json(results);
    }

    return new Response("Not found", { status: 404 });
  },
};
```

ใช้ `prepare().bind()` เสมอ อย่าต่อ string เป็น SQL เอง เหมือนฐานข้อมูลทั่วไป

## Flow การ deploy ที่ผมใช้

1. สร้างฐานข้อมูล `wrangler d1 create my-side-app-db` แล้วนำ id ไปใส่ config
2. เขียน migration ในโฟลเดอร์ `migrations/` แล้วรัน `wrangler d1 migrations apply my-side-app-db --local` เพื่อทดสอบในเครื่อง
3. พัฒนาด้วย `wrangler dev` ซึ่งรัน D1 แบบ local ให้ด้วย
4. ก่อนขึ้นจริงรัน migration กับฐานข้อมูลจริง `wrangler d1 migrations apply my-side-app-db --remote`
5. `wrangler deploy`
6. เปิด logs ดูสักพักว่าไม่มี error

ผมเขียนขั้นตอนพวกนี้เป็น runbook ไว้ทุกโปรเจกต์ เพราะ side project ที่ไม่ได้แตะสามเดือน กลับมาอีกทีจะลืมหมด แนวคิดนี้ผมขยายไว้ใน [เปลี่ยนทุก deploy เป็น runbook](/blog/turn-every-deploy-into-runbook)

## ข้อจำกัดที่ควรรู้

Workers + D1 ไม่ได้เหมาะกับทุกงาน ข้อที่ผมเจอและคิดว่าควรรู้ก่อนเริ่มมีดังนี้

- **CPU time ต่อ request มีจำกัด** งานคำนวณหนัก ประมวลผลไฟล์ใหญ่ หรือ job ที่รันนาน ไม่เหมาะจะทำใน request เดียว ต้องแตกเป็น Queues หรือ Workflows
- **D1 มีขนาดฐานข้อมูลสูงสุด** เหมาะกับข้อมูลระดับแอปเล็กถึงกลาง ถ้าคาดว่าข้อมูลจะโตมาก ควรออกแบบให้แยกฐานข้อมูลได้ตั้งแต่แรก
- **ไม่ใช่ทุก npm package ทำงานได้** แม้ `nodejs_compat` จะช่วยได้มาก แต่ไลบรารีที่พึ่ง native module หรือ filesystem จะใช้ไม่ได้
- **การเขียนพร้อมกันจำนวนมาก** D1 ไม่ได้ออกแบบมาสำหรับ write throughput สูงแบบฐานข้อมูลใหญ่ ถ้าแอปเขียนหนักต้องคิดเรื่องนี้

ตัวเลข limit ที่แน่นอนขึ้นกับแผนที่ใช้และเปลี่ยนตามเวลา ผมแนะนำให้อ่านหน้า limits ในเอกสารทางการก่อนเลือก อย่าเชื่อตัวเลขจากบล็อกเก่า รวมถึงบล็อกนี้ด้วย

## เมื่อไรที่ผมไม่เลือก Workers

งานประจำของผมยังใช้ Laravel บนเซิร์ฟเวอร์ปกติและ Docker Compose เพราะมีระบบเดิมจำนวนมาก ต้องเชื่อมฐานข้อมูลภายใน และทีมคุ้นกับ stack นั้น การเลือก platform จึงไม่ใช่เรื่องว่าอะไรดีที่สุด แต่เป็นเรื่องว่าอะไรเหมาะกับข้อจำกัดของงานนั้น สำหรับ side project ข้อจำกัดใหญ่ที่สุดคือเวลาของผมเอง Workers จึงชนะ

## สรุป

ผมรัน side project บน Cloudflare Workers + D1 เพราะไม่ต้องดูแลเซิร์ฟเวอร์ ค่าใช้จ่ายเริ่มต้นต่ำ deploy ด้วย wrangler ได้ในคำสั่งเดียว และ D1 ใช้ SQL ที่คุ้นมือ แต่ต้องรู้ข้อจำกัดเรื่อง CPU time ขนาดฐานข้อมูล และความเข้ากันได้ของ package ก่อนเริ่ม ถ้างานของคุณอยู่ในขอบเขตนั้น นี่คือ stack ที่ให้คุณใช้เวลากับตัวผลิตภัณฑ์ แทนที่จะหมดไปกับเซิร์ฟเวอร์
