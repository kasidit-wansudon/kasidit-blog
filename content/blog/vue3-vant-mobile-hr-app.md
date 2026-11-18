---
title: "สร้าง Mobile HR App ด้วย Vue 3 + Vant: i18n 4 ภาษา, Form, Offline"
date: "2026-02-25"
excerpt: "บทเรียนจากการสร้าง mobile-first HR app ด้วย Vue 3 และ Vant รองรับ i18n 4 ภาษา, ออกแบบ form ที่กรอกง่ายบนมือถือ และ pattern ที่ทำให้แอปใช้ได้แม้เน็ตไม่ดี"
tags: ["vue", "vant", "i18n", "mobile", "frontend"]
---

ระบบ HR ภายในที่ผมดูแลที่ OPPO Mexico ใช้ Laravel เป็น backend และ Vue 3 + Vant เป็นหน้าบ้าน ผู้ใช้ส่วนใหญ่เปิดจากมือถือ หลายคนอยู่ในคลังสินค้าหรือหน้าร้านที่สัญญาณไม่ดี และต้องรองรับ 4 ภาษา (สเปน อังกฤษ จีน ไทย) บทความนี้สรุปสิ่งที่ผมเรียนรู้จากการสร้าง mobile HR app ด้วย Vue 3 + Vant ในสามเรื่อง คือ i18n, form และ offline-friendly patterns

## ทำไมเลือก Vue 3 + Vant

Vant เป็น component library ที่ออกแบบมาเพื่อมือถือโดยตรง มี component อย่าง `van-field`, `van-picker`, `van-calendar`, `van-uploader`, `van-pull-refresh` ที่ใช้นิ้วกดได้สะดวก ขนาดเล็ก และรองรับ locale หลายภาษาในตัว จับคู่กับ Vue 3 Composition API แล้วเขียน logic ที่ใช้ซ้ำได้ง่าย

สำหรับแอปภายในที่ไม่ต้องขึ้น App Store การทำเป็น mobile web (หรือเปิดผ่านแอปแชตขององค์กร) เร็วกว่าการทำ native มาก

## i18n 4 ภาษา: วางโครงตั้งแต่วันแรก

ผมใช้ `vue-i18n` คู่กับ locale ของ Vant สิ่งสำคัญคือต้องเปลี่ยนทั้งสองพร้อมกัน ไม่งั้นข้อความของเราเป็นสเปน แต่ปุ่มใน date picker ยังเป็นอังกฤษ

```javascript
// i18n.js
import { createI18n } from "vue-i18n";
import { Locale } from "vant";
import esES from "vant/es/locale/lang/es-ES";
import enUS from "vant/es/locale/lang/en-US";
import zhCN from "vant/es/locale/lang/zh-CN";
import thTH from "vant/es/locale/lang/th-TH";
import es from "./locales/es.json";
import en from "./locales/en.json";
import zh from "./locales/zh.json";
import th from "./locales/th.json";

const vantLocales = { es: ["es-ES", esES], en: ["en-US", enUS], zh: ["zh-CN", zhCN], th: ["th-TH", thTH] };

export const i18n = createI18n({
  legacy: false,
  locale: "es",
  fallbackLocale: "en",
  messages: { es, en, zh, th },
});

export function setLanguage(lang) {
  i18n.global.locale.value = lang;
  const [code, pack] = vantLocales[lang] ?? vantLocales.en;
  Locale.use(code, pack);
  document.documentElement.lang = lang;
  try { localStorage.setItem("lang", lang); } catch {}
}
```

บทเรียนเรื่อง i18n

- **ใช้ key ที่มีความหมาย** เช่น `leave.form.startDate` ไม่ใช่ `text1` คนแปลจะเข้าใจบริบท
- **ตั้ง fallback เป็นอังกฤษ** ถ้าคำแปลยังไม่ครบ user จะเห็นอังกฤษแทน key ดิบ
- **ระวังความยาวข้อความ** ภาษาสเปนมักยาวกว่าอังกฤษ ส่วนจีนสั้นมาก ทดสอบ layout ทุกภาษา โดยเฉพาะปุ่มและ tab
- **วันที่และตัวเลขใช้ `Intl`** อย่า format เอง เพราะแต่ละประเทศเรียงวัน/เดือนต่างกัน
- **ข้อความ error จาก backend** ให้ backend ส่ง error code แล้วให้ frontend แปล แทนการส่งข้อความภาษาเดียวมา
- **ฟอนต์ไทยและจีน** ตรวจว่าฟอนต์ที่ใช้แสดงผลทั้งสองภาษาได้สวย ไม่ตกไปใช้ฟอนต์ระบบแบบปนกัน

เรื่องการทำงานกับทีมหลายภาษาในเชิงคน ผมเล่าไว้ใน [นำทีมใน 4 ภาษา](/blog/leading-team-in-four-languages)

## Form บนมือถือ: ลดการพิมพ์ให้มากที่สุด

แบบฟอร์ม HR เช่น ขอลา ขอเอกสาร แก้ข้อมูลส่วนตัว คือหัวใจของแอป หลักที่ผมใช้

- **เลือกแทนพิมพ์** ใช้ `van-picker`, `van-calendar`, `van-radio-group` ทุกที่ที่ทำได้
- **ตั้ง `type` ของ input ให้ถูก** `tel`, `number`, `email` เพื่อให้มือถือแสดงคีย์บอร์ดที่เหมาะ
- **ใช้ `van-form` กับ `rules`** validate ทันทีที่ blur และแสดงข้อความใต้ช่องนั้นเลย ไม่ใช่ alert รวมตอนกดส่ง
- **ปุ่มส่งอยู่ด้านล่างและใหญ่** นิ้วโป้งกดถึงง่าย
- **ป้องกันกดซ้ำ** ใช้ `loading` บนปุ่มระหว่างส่ง และส่ง idempotency key ไปกับ request
- **อัปโหลดรูป** ใช้ `van-uploader` แล้วบีบอัดรูปฝั่ง client ก่อนส่ง เพราะรูปจากกล้องมือถือใหญ่มาก
- **ข้อมูลส่วนบุคคล** ฝั่ง backend เข้ารหัสข้อมูลอ่อนไหวก่อนเก็บ และไม่เก็บข้อมูลเหล่านั้นไว้ใน local storage ของเครื่อง

## Offline-friendly patterns

ผมไม่ได้ทำแอปให้ offline ได้เต็มรูปแบบ เพราะซับซ้อนเกินจำเป็น แต่ทำให้ "เน็ตไม่ดีแล้วไม่พัง" ด้วย pattern เหล่านี้

**1. Draft อัตโนมัติ** บันทึกค่าที่กรอกลงใน local storage ระหว่างพิมพ์ (เฉพาะข้อมูลที่ไม่อ่อนไหว) ถ้าเน็ตหลุดหรือปิดแอปไป กลับมาก็ยังอยู่

```javascript
// useDraft.js
import { ref, watch } from "vue";

export function useDraft(key, initial) {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(key)); } catch {}
  const form = ref({ ...initial, ...(saved ?? {}) });

  watch(form, (val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }, { deep: true });

  const clear = () => { try { localStorage.removeItem(key); } catch {} };
  return { form, clear };
}
```

**2. Retry พร้อมบอก user** ถ้าส่งไม่สำเร็จเพราะ network ให้แสดงสถานะ "รอส่ง" และปุ่มลองใหม่ แทนที่จะโยน error แล้วล้างฟอร์ม

**3. Cache ข้อมูลอ่านอย่างเดียว** เช่น วันลาคงเหลือ รายการวันหยุด แสดงค่าล่าสุดที่ cache ไว้พร้อมเวลาที่อัปเดต แล้วค่อย refresh เบื้องหลัง

**4. ตรวจสถานะเครือข่าย** ใช้ `navigator.onLine` และ event `online`/`offline` แสดงแถบเตือนเล็ก ๆ ด้านบน

**5. Service worker สำหรับ asset** cache ไฟล์ JS/CSS ให้แอปเปิดได้เร็วแม้สัญญาณแย่

## ทดสอบบนเครื่องจริง ไม่ใช่แค่ DevTools

โหมดมือถือใน DevTools ช่วยได้ระดับหนึ่ง แต่ไม่เหมือนเครื่องจริง ผมทดสอบบนมือถือราคาประหยัดที่พนักงานใช้กันจริง เพราะมันเผยปัญหาที่เครื่องแรง ๆ ซ่อนไว้ เช่น bundle ใหญ่ทำให้เปิดช้า, คีย์บอร์ดเด้งขึ้นมาบังปุ่มส่ง, หรือ date picker กระตุก และลองจำกัดความเร็วเน็ตเป็นระดับ 3G เพื่อดูว่า draft และ retry ทำงานตามที่ออกแบบไว้จริง

## สรุป

Vue 3 + Vant เหมาะกับ mobile HR app ภายในองค์กรมาก จุดที่ต้องลงแรงคือวาง i18n ตั้งแต่วันแรกโดยเปลี่ยน locale ของ Vant ไปพร้อมกัน ออกแบบ form ให้เลือกแทนพิมพ์และ validate ทันที และใช้ offline-friendly patterns อย่าง draft อัตโนมัติ, retry ที่บอก user และ cache ข้อมูลอ่านอย่างเดียว เท่านี้แอปก็ใช้ได้จริงในที่ที่เน็ตไม่ดีและผู้ใช้พูดคนละภาษา
