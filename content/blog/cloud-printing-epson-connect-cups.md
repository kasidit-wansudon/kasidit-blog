---
title: "Cloud Printing ด้วย Epson Connect และดักจับ Print Job ผ่าน CUPS"
date: "2026-03-18"
excerpt: "สถาปัตยกรรม cloud printing ด้วย Epson Connect API คู่กับการดักจับ print job ผ่าน CUPS เพื่อสั่งพิมพ์จากเว็บแอปไปเครื่องพิมพ์สาขา พร้อม gotchas ที่เจอจริง"
tags: ["cloud-printing", "cups", "epson-connect", "architecture"]
---

งานพิมพ์ดูเป็นเรื่องเล็ก จนกระทั่งเว็บแอปบน cloud ต้องสั่งพิมพ์เอกสารไปยังเครื่องพิมพ์ที่อยู่คนละที่ ในงานที่ OPPO Mexico ผมต้องทำให้ระบบภายในสั่งพิมพ์ได้โดยไม่ต้องให้ user ดาวน์โหลด PDF แล้วกดพิมพ์เอง และต้องเก็บ print job ไว้ตรวจย้อนหลังได้ ทางออกที่ใช้คือ cloud printing ด้วย Epson Connect คู่กับการดักจับ print job ผ่าน CUPS บทความนี้อธิบายสถาปัตยกรรมและ gotchas ที่เจอ

## โจทย์

- เว็บแอปรันบน server ใน cloud ไม่ได้อยู่ในเครือข่ายเดียวกับเครื่องพิมพ์
- เครื่องพิมพ์อยู่หลายจุด
- ต้องการเก็บสำเนาของทุก job ที่พิมพ์ เพื่อ audit และพิมพ์ซ้ำได้
- บางโปรแกรมเดิมพิมพ์ผ่าน driver ปกติ เราแก้โค้ดมันไม่ได้

## สถาปัตยกรรมโดยรวม

ผมแยกเป็นสองเส้นทาง

**เส้นทางที่ 1: เว็บแอปสั่งพิมพ์ตรงผ่าน Epson Connect**

1. เว็บแอปสร้าง PDF ฝั่ง server
2. สร้าง job ใน queue ของเราเอง พร้อมบันทึกไฟล์และ metadata (ใคร, เมื่อไร, เครื่องไหน)
3. worker หยิบ job ไปเรียก Epson Connect API: ขอ token, สร้าง print job, upload ไฟล์, สั่ง execute
4. worker poll สถานะ job จนจบ แล้วอัปเดตผลกลับเข้า database

**เส้นทางที่ 2: โปรแกรมเดิมพิมพ์ผ่าน CUPS**

1. ตั้ง CUPS server เป็น "เครื่องพิมพ์เสมือน" ให้โปรแกรมเดิมพิมพ์เข้ามา
2. CUPS backend แบบ custom รับไฟล์ แล้วบันทึกสำเนาไว้
3. ส่งไฟล์ต่อเข้า queue เดียวกับเส้นทางที่ 1 แล้วไปจบที่ Epson Connect

ข้อดีคือทุก job ไม่ว่ามาจากไหน วิ่งผ่าน queue เดียว มี log เดียว และ retry ได้ด้วยกลไกเดียวกัน

## ดักจับ print job ด้วย CUPS backend

CUPS อนุญาตให้เขียน backend เป็น script ธรรมดาได้ ตัวอย่างโครงพื้นฐาน

```bash
#!/bin/bash
# /usr/lib/cups/backend/capture
# CUPS calls: backend job-id user title copies options [file]

if [ $# -eq 0 ]; then
  echo 'direct capture "Unknown" "Print capture backend"'
  exit 0
fi

JOB_ID="$1"; USER_NAME="$2"; TITLE="$3"
SPOOL_DIR="/var/spool/print-capture"
OUT="${SPOOL_DIR}/$(date +%Y%m%d%H%M%S)-${JOB_ID}.pdf"

if [ -n "$6" ]; then
  cp "$6" "$OUT"
else
  cat > "$OUT"
fi

# Hand off to the app queue (local HTTP endpoint)
curl -sf -X POST http://127.0.0.1:8080/print-jobs \
  --form-string "user=${USER_NAME}" \
  --form-string "title=${TITLE}" \
  -F "file=@${OUT}" || exit 1   # CUPS_BACKEND_FAILED

exit 0
```

จากนั้นสร้างเครื่องพิมพ์ที่ใช้ backend นี้ด้วย `lpadmin -p capture -E -v capture:/ -m everywhere` หรือกำหนด PPD ที่ output เป็น PDF ตามที่ระบบต้องการ

## Gotchas ที่เจอจริง

**Permission ของ backend** CUPS รัน backend ด้วย user ที่จำกัดสิทธิ์ ถ้าไฟล์ backend มี permission กว้างเกินไป CUPS อาจรันมันเป็น user ที่ไม่ตรงกับที่เราคาด ให้ตั้ง owner และ mode ตามเอกสารของ CUPS แล้วตรวจว่า spool directory เขียนได้จริง

**Format ที่ได้ไม่ใช่ PDF เสมอ** ขึ้นกับ driver และ filter ที่โปรแกรมต้นทางใช้ บางครั้งได้ PostScript หรือ raster ต้องกำหนด filter chain ให้แปลงเป็น PDF ก่อนเข้า backend หรือแปลงเองใน worker

**AppArmor หรือ SELinux บล็อก** backend ที่เรียก network หรือเขียนไฟล์นอก path ปกติ อาจถูกบล็อกเงียบ ๆ ดู log ของ security module ด้วย ไม่ใช่แค่ log ของ CUPS

**Token ของ Epson Connect หมดอายุ** worker ต้องจัดการ refresh token เอง และต้องไม่ให้หลาย worker refresh พร้อมกันจนชนกัน ผมใช้ lock สั้น ๆ รอบขั้นตอน refresh

**สถานะ job ไม่ได้มาทันที** การสั่ง execute สำเร็จไม่ได้แปลว่าพิมพ์สำเร็จ ต้อง poll สถานะต่อ และกำหนด timeout ว่านานแค่ไหนถึงถือว่าล้มเหลว เช่น เครื่องพิมพ์ปิดหรือกระดาษหมด

**ขนาดไฟล์และจำนวนหน้า** ไฟล์ใหญ่ upload ช้าและอาจเกินขีดจำกัดของ API ควรบีบอัด PDF หรือแบ่ง job ก่อนส่ง

**ข้อมูลส่วนบุคคลในไฟล์ที่เก็บ** สำเนาที่เราดักไว้มักมีข้อมูลพนักงานหรือลูกค้า ต้องกำหนดระยะเวลาเก็บ ลบอัตโนมัติ และจำกัดคนที่เข้าถึง spool directory

**Retry ซ้ำแล้วพิมพ์ซ้ำ** ถ้า worker ตายหลังสั่งพิมพ์แต่ก่อนบันทึกผล รอบ retry อาจพิมพ์ซ้ำ ให้บันทึก job id ของ Epson Connect ทันทีหลังสร้าง แล้ว retry โดยเช็คสถานะ job เดิมก่อนสร้างใหม่ หลักเดียวกับที่ผมใช้กับ webhook ใน [ทำ webhook ให้เชื่อถือได้ใน Laravel](/blog/laravel-webhook-recovery-jobs)

## ลำดับการ rollout ที่ผมแนะนำ

อย่าเปิดทุกเครื่องพิมพ์พร้อมกัน ผมเริ่มจากเครื่องเดียวที่อยู่ใกล้ทีม IT ให้ user กลุ่มเล็กลองใช้จริงหนึ่งถึงสองสัปดาห์ เก็บปัญหาที่เจอ เช่น ขนาดกระดาษผิด, ขอบเอกสารถูกตัด, ภาษาที่มีอักษรพิเศษแสดงไม่ถูก แล้วค่อยขยายทีละจุด ระหว่างนั้นยังให้ทางเดิม คือดาวน์โหลด PDF แล้วพิมพ์เอง ใช้ได้อยู่เสมอ เพื่อให้ถ้า cloud printing มีปัญหา งานหน้าร้านไม่หยุด

## Monitoring ขั้นต่ำ

- จำนวน job ค้างใน queue เกินเวลาที่กำหนด
- อัตรา job ล้มเหลวต่อเครื่องพิมพ์ (เครื่องไหนเสียบ่อย)
- disk ของ spool directory
- token refresh ล้มเหลว

## สรุป

Cloud printing ที่ใช้ได้จริงคือการรวมทุกเส้นทางการพิมพ์เข้าสู่ queue เดียว ใช้ Epson Connect API เป็นปลายทาง และใช้ CUPS backend ดักจับ job จากโปรแกรมเดิมที่แก้ไม่ได้ ส่วนที่ต้องระวังไม่ได้อยู่ที่ API แต่อยู่ที่ permission, format ของไฟล์, การ poll สถานะ, การกัน retry พิมพ์ซ้ำ และการดูแลข้อมูลส่วนบุคคลในสำเนาที่เก็บไว้
