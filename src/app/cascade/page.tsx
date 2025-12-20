import Link from 'next/link';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Cascade Setup & MCP Customizations',
  description:
    'หน้าเอกสารสรุปการ setup Cascade, MCP customizations และเทมเพลตประวัติการใช้งาน',
};

function SectionCard({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/30"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-50">{title}</h2>
        {subtitle ? (
          <p className="text-sm leading-relaxed text-slate-400">{subtitle}</p>
        ) : null}
      </div>
      <div className="mt-4 text-sm text-slate-200">{children}</div>
    </section>
  );
}

export default function CascadeSetupPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-12">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-sky-400">
            Cascade / MCP
          </p>
          <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
            หน้าเอกสารการ setup Cascade + MCP
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-400">
            หน้านี้ตั้งใจทำเป็น “หน้าเดียวจบ” สำหรับทีม: วิธีตั้งค่า, แนวทาง customizations,
            และรูปแบบการบันทึกประวัติการใช้งานให้ตรวจสอบย้อนหลังได้ โดยจะหลีกเลี่ยงการใส่
            token/secret ลงใน repo
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href="#setup"
              className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:border-sky-500/70 hover:text-sky-200"
            >
              Setup
            </a>
            <a
              href="#mcp"
              className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:border-sky-500/70 hover:text-sky-200"
            >
              MCP Customizations
            </a>
            <a
              href="#history"
              className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:border-sky-500/70 hover:text-sky-200"
            >
              Usage History
            </a>
            <Link
              href="/"
              className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:border-sky-500/70 hover:text-sky-200"
            >
              กลับหน้าแรก
            </Link>
          </div>
        </header>

        <SectionCard
          id="setup"
          title="1) Setup Cascade (Checklist)"
          subtitle="ทำตามลำดับนี้เพื่อให้ใช้งานได้ และลดความเสี่ยงเรื่องข้อมูล/สิทธิ์"
        >
          <div className="space-y-4">
            <div>
              <p className="font-medium text-slate-50">Checklist ก่อนเริ่ม</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-300">
                <li>ยืนยันว่าโปรเจกต์เปิดใน IDE ถูก workspace (repo นี้)</li>
                <li>ตั้งกติกาเรื่องข้อมูล: ห้ามใส่ secrets/PII ลงในแชท หรือให้ tool ส่งออกนอกองค์กร</li>
                <li>
                  ถ้าจะใช้เครื่องมือภายนอก (เช่น search/web) ให้ระบุขอบเขตข้อมูลที่ส่งออก
                  ให้ชัดเจน
                </li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-slate-50">แนวทางการใช้งานในงานโค้ด</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-300">
                <li>เริ่มจากให้ Cascade สำรวจโครงสร้าง (code search) ก่อนแก้โค้ด</li>
                <li>
                  งานที่กระทบหลายไฟล์: ให้ทำเป็น plan (todo) แล้วค่อยลงมือทีละ milestone
                </li>
                <li>
                  เวลาขอให้รันคำสั่ง: แยก “คำสั่งปลอดภัย” vs “คำสั่งมีผลกระทบ” และขออนุมัติ
                </li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-slate-50">สิ่งที่ตรวจพบใน repo นี้</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-300">
                <li>โครงสร้างเว็บเป็น Next.js (App Router) อยู่ใน <code>src/app</code></li>
                <li>
                  มีหน้า/คอมโพเนนต์สรุป MCP อยู่แล้ว: <code>src/app/McpOverview.tsx</code>
                </li>
                <li>
                  ไม่พบโฟลเดอร์ <code>.windsurf</code> ใน repo (อาจเป็น config ที่อยู่ในเครื่องและไม่ได้ commit)
                </li>
              </ul>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          id="mcp"
          title="2) MCP Customizations (สิ่งที่ควรบันทึกไว้)"
          subtitle="ส่วนนี้เป็นโครงให้คุณกรอก/อัปเดต เพื่อสะท้อน config จริงในเครื่อง"
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <p className="text-sm font-semibold text-slate-50">MCP Servers ที่ใช้งาน</p>
              <p className="mt-1 text-sm text-slate-300">
                กรอกตามที่คุณเปิดใช้งานจริง (ตัวอย่างจากหน้า MCP เดิมในเว็บนี้):
              </p>
              <div className="mt-3 grid gap-2 text-xs text-slate-300 md:grid-cols-2">
                <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                  <p className="font-semibold text-slate-100">gdrive</p>
                  <p className="mt-1 text-slate-400">ค้น/อ่านไฟล์จาก Google Drive</p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                  <p className="font-semibold text-slate-100">brave-search</p>
                  <p className="mt-1 text-slate-400">ค้นเว็บ / local search (อาจติด rate limit)</p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                  <p className="font-semibold text-slate-100">deepwiki</p>
                  <p className="mt-1 text-slate-400">อ่าน/ถามโครงสร้าง repo บน GitHub</p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                  <p className="font-semibold text-slate-100">memory</p>
                  <p className="mt-1 text-slate-400">บันทึกกติกา/บริบทระยะยาว</p>
                </div>
              </div>
            </div>

            <div>
              <p className="font-medium text-slate-50">Custom Instructions / Rules</p>
              <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-slate-300">
                <p className="text-sm">
                  แนะนำให้จดหัวข้อเหล่านี้ไว้ในที่เดียว (เช่น README ภายในทีม หรือเอกสารภายนอก):
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  <li>แนวทางการตอบ/ภาษา/สไตล์การแก้โค้ด</li>
                  <li>สิ่งที่ห้ามทำ (เช่น ห้ามเก็บ secrets, ห้ามรันคำสั่งอันตรายโดยไม่ขออนุมัติ)</li>
                  <li>มาตรฐานการตั้งชื่อ branch/PR/commit</li>
                  <li>แนวทาง review (เช่น ต้องมี test, ต้องมี migration plan)</li>
                </ul>
              </div>
            </div>

            <div>
              <p className="font-medium text-slate-50">Workflows</p>
              <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-slate-300">
                <p className="text-sm">
                  ถ้าคุณมี workflow แบบไฟล์ในเครื่อง (เช่น <code>.windsurf/workflows</code>) แต่ไม่ได้อยู่ใน repo,
                  ให้ระบุ:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  <li>ชื่อ workflow (เช่น <code>/do</code>, <code>/how</code>)</li>
                  <li>วัตถุประสงค์</li>
                  <li>ขั้นตอนสำคัญ + เงื่อนไขความปลอดภัย</li>
                </ul>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          id="history"
          title="3) ประวัติการใช้งาน (Usage History)"
          subtitle="ใน repo นี้ยังไม่พบไฟล์ log ทางการ จึงทำเป็นเทมเพลตให้คุณบันทึกเอง"
        >
          <div className="space-y-4">
            <div>
              <p className="font-medium text-slate-50">รูปแบบที่แนะนำ (คัดลอกไปใช้ได้ทันที)</p>
              <pre className="mt-2 overflow-auto rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-xs text-slate-200">{`# Cascade Usage History

## 2025-__-__
- Work item: (สรุปงาน 1 บรรทัด)
- Repo/Path: (เช่น kasidit-blog)
- Scope: (หน้า/ฟีเจอร์/ไฟล์หลัก)
- Tools used:
  - code_search: (คำค้น)
  - grep_search: (คำค้น)
  - read_file: (ไฟล์สำคัญ)
  - apply_patch/write_to_file: (ไฟล์ที่แก้)
- Outcome:
  - (ทำอะไรสำเร็จ)
- Notes/Risks:
  - (สิ่งที่ต้องระวัง/สิ่งที่ยังค้าง)

## 2025-__-__
- ...`}</pre>
            </div>

            <div>
              <p className="font-medium text-slate-50">ถ้าต้องการ “ประวัติทั้งหมด” จริง ๆ</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-300">
                <li>
                  ต้องมีแหล่งข้อมูลจริง เช่น export จากระบบแชท/IDE หรือไฟล์บันทึกในทีม
                  (ผมยังไม่เห็นไฟล์นั้นใน repo)
                </li>
                <li>
                  ถ้าคุณมีไฟล์/ลิงก์ที่เก็บประวัติ (เช่น markdown/Notion/Drive) ส่ง path/URL มาได้
                  แล้วผมจะช่วยสรุป + จัดรูปแบบเป็นหน้านำเสนอให้
                </li>
              </ul>
            </div>
          </div>
        </SectionCard>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <p className="text-sm text-slate-300">
            ต้องการให้หน้านี้ “ดึงข้อมูลจริง” จากไฟล์ใน repo อัตโนมัติไหม?
            ถ้าต้องการ บอกชื่อไฟล์ที่คุณจะใช้เก็บ history (เช่น <code>docs/cascade-usage-history.md</code>)
            แล้วผมจะปรับหน้าให้ render จากไฟล์นั้นครับ
          </p>
        </div>
      </div>
    </main>
  );
}
