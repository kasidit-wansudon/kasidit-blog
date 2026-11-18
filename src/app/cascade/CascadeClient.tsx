'use client';

// Cascade/MCP setup notes — bilingual via the site-wide language setting.
import Link from 'next/link';
import type { ReactNode } from 'react';

import SiteNav from '@/components/SiteNav';
import { useLanguage } from '@/components/LanguageProvider';

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

export default function CascadeClient() {
  const { lang } = useLanguage();
  const L = (th: ReactNode, en: ReactNode) => (lang === 'en' ? en : th);
  return (
    <main className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <SiteNav section="cascade" />
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 pb-12 pt-32">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-sky-400">
            Cascade / MCP
          </p>
          <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
            {L('หน้าเอกสารการ setup Cascade + MCP', 'Cascade + MCP setup notes')}
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-400">
            {L(
              'หน้านี้ตั้งใจทำเป็น “หน้าเดียวจบ” สำหรับทีม: วิธีตั้งค่า, แนวทาง customizations, และรูปแบบการบันทึกประวัติการใช้งานให้ตรวจสอบย้อนหลังได้ โดยจะหลีกเลี่ยงการใส่ token/secret ลงใน repo',
              'A one-page reference for the team: how to set things up, how to customize, and how to log usage so it can be reviewed later — without putting any token or secret in the repo.',
            )}
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
              {L('กลับหน้าแรก', 'Back to home')}
            </Link>
          </div>
        </header>

        <SectionCard
          id="setup"
          title="1) Setup Cascade (Checklist)"
          subtitle={L('ทำตามลำดับนี้เพื่อให้ใช้งานได้ และลดความเสี่ยงเรื่องข้อมูล/สิทธิ์', 'Follow these steps in order to get working and reduce data and permission risk') as string}
        >
          <div className="space-y-4">
            <div>
              <p className="font-medium text-slate-50">{L('Checklist ก่อนเริ่ม', 'Before you start')}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-300">
                <li>{L('ยืนยันว่าโปรเจกต์เปิดใน IDE ถูก workspace (repo นี้)', 'Make sure the IDE has the right workspace (this repo) open')}</li>
                <li>{L('ตั้งกติกาเรื่องข้อมูล: ห้ามใส่ secrets/PII ลงในแชท หรือให้ tool ส่งออกนอกองค์กร', 'Set data rules: no secrets or PII in chat, and no tool sending them outside the organization')}</li>
                <li>
                  {L(
                    'ถ้าจะใช้เครื่องมือภายนอก (เช่น search/web) ให้ระบุขอบเขตข้อมูลที่ส่งออกให้ชัดเจน',
                    'If you use external tools (search/web), state clearly what data may leave',
                  )}
                </li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-slate-50">{L('แนวทางการใช้งานในงานโค้ด', 'Using it for code work')}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-300">
                <li>{L('เริ่มจากให้ Cascade สำรวจโครงสร้าง (code search) ก่อนแก้โค้ด', 'Have Cascade explore the structure (code search) before changing code')}</li>
                <li>
                  {L(
                    'งานที่กระทบหลายไฟล์: ให้ทำเป็น plan (todo) แล้วค่อยลงมือทีละ milestone',
                    'Multi-file changes: write a plan (todo) first, then work one milestone at a time',
                  )}
                </li>
                <li>
                  {L(
                    'เวลาขอให้รันคำสั่ง: แยก “คำสั่งปลอดภัย” vs “คำสั่งมีผลกระทบ” และขออนุมัติ',
                    'When running commands: separate safe commands from ones with side effects, and ask for approval',
                  )}
                </li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-slate-50">{L('สิ่งที่ตรวจพบใน repo นี้', 'What this repo contains')}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-300">
                <li>
                  {L('โครงสร้างเว็บเป็น Next.js (App Router) อยู่ใน', 'The site is Next.js (App Router) in')} <code>src/app</code>
                </li>
                <li>
                  {L('มีหน้า/คอมโพเนนต์สรุป MCP อยู่แล้ว:', 'An MCP summary component already exists:')} <code>src/app/McpOverview.tsx</code>
                </li>
                <li>
                  {L('ไม่พบโฟลเดอร์', 'There is no')} <code>.windsurf</code>{' '}
                  {L('ใน repo (อาจเป็น config ที่อยู่ในเครื่องและไม่ได้ commit)', 'folder in the repo (it may be local config that is not committed)')}
                </li>
              </ul>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          id="mcp"
          title={L('2) MCP Customizations (สิ่งที่ควรบันทึกไว้)', '2) MCP customizations (what to record)') as string}
          subtitle={L('ส่วนนี้เป็นโครงให้คุณกรอก/อัปเดต เพื่อสะท้อน config จริงในเครื่อง', 'A template to fill in and keep up to date so it matches your real local config') as string}
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <p className="text-sm font-semibold text-slate-50">{L('MCP Servers ที่ใช้งาน', 'MCP servers in use')}</p>
              <p className="mt-1 text-sm text-slate-300">
                {L('กรอกตามที่คุณเปิดใช้งานจริง (ตัวอย่างจากหน้า MCP เดิมในเว็บนี้):', 'Fill in what you actually have enabled (examples from the MCP page on this site):')}
              </p>
              <div className="mt-3 grid gap-2 text-xs text-slate-300 md:grid-cols-2">
                <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                  <p className="font-semibold text-slate-100">gdrive</p>
                  <p className="mt-1 text-slate-400">{L('ค้น/อ่านไฟล์จาก Google Drive', 'Search and read files in Google Drive')}</p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                  <p className="font-semibold text-slate-100">brave-search</p>
                  <p className="mt-1 text-slate-400">{L('ค้นเว็บ / local search (อาจติด rate limit)', 'Web / local search (may hit rate limits)')}</p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                  <p className="font-semibold text-slate-100">deepwiki</p>
                  <p className="mt-1 text-slate-400">{L('อ่าน/ถามโครงสร้าง repo บน GitHub', 'Read and ask about GitHub repo structure')}</p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                  <p className="font-semibold text-slate-100">memory</p>
                  <p className="mt-1 text-slate-400">{L('บันทึกกติกา/บริบทระยะยาว', 'Keep long-term rules and context')}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="font-medium text-slate-50">Custom Instructions / Rules</p>
              <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-slate-300">
                <p className="text-sm">
                  {L('แนะนำให้จดหัวข้อเหล่านี้ไว้ในที่เดียว (เช่น README ภายในทีม หรือเอกสารภายนอก):', 'Keep these topics in one place (an internal README or a shared doc):')}
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  <li>{L('แนวทางการตอบ/ภาษา/สไตล์การแก้โค้ด', 'Answer language and code-change style')}</li>
                  <li>{L('สิ่งที่ห้ามทำ (เช่น ห้ามเก็บ secrets, ห้ามรันคำสั่งอันตรายโดยไม่ขออนุมัติ)', 'What is not allowed (storing secrets, running dangerous commands without approval)')}</li>
                  <li>{L('มาตรฐานการตั้งชื่อ branch/PR/commit', 'Naming rules for branches, PRs and commits')}</li>
                  <li>{L('แนวทาง review (เช่น ต้องมี test, ต้องมี migration plan)', 'Review rules (tests required, migration plan required)')}</li>
                </ul>
              </div>
            </div>

            <div>
              <p className="font-medium text-slate-50">Workflows</p>
              <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-slate-300">
                <p className="text-sm">
                  {L('ถ้าคุณมี workflow แบบไฟล์ในเครื่อง (เช่น', 'If you keep workflows as local files (e.g.')}{' '}
                  <code>.windsurf/workflows</code>
                  {L(') แต่ไม่ได้อยู่ใน repo, ให้ระบุ:', ') outside the repo, record:')}
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  <li>
                    {L('ชื่อ workflow (เช่น', 'Workflow name (e.g.')} <code>/do</code>, <code>/how</code>)
                  </li>
                  <li>{L('วัตถุประสงค์', 'Purpose')}</li>
                  <li>{L('ขั้นตอนสำคัญ + เงื่อนไขความปลอดภัย', 'Key steps and safety conditions')}</li>
                </ul>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          id="history"
          title={L('3) ประวัติการใช้งาน (Usage History)', '3) Usage history') as string}
          subtitle={L('ใน repo นี้ยังไม่พบไฟล์ log ทางการ จึงทำเป็นเทมเพลตให้คุณบันทึกเอง', 'There is no official log file in this repo yet, so here is a template to keep one') as string}
        >
          <div className="space-y-4">
            <div>
              <p className="font-medium text-slate-50">{L('รูปแบบที่แนะนำ (คัดลอกไปใช้ได้ทันที)', 'Suggested format (copy and use)')}</p>
              <pre className="mt-2 overflow-auto rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-xs text-slate-200">{`# Cascade Usage History

## 2025-__-__
- Work item: (one-line summary)
- Repo/Path: (e.g. kasidit-blog)
- Scope: (page / feature / main files)
- Tools used:
  - code_search: (query)
  - grep_search: (query)
  - read_file: (key files)
  - apply_patch/write_to_file: (files changed)
- Outcome:
  - (what got done)
- Notes/Risks:
  - (risks / open items)

## 2025-__-__
- ...`}</pre>
            </div>

            <div>
              <p className="font-medium text-slate-50">{L('ถ้าต้องการ “ประวัติทั้งหมด” จริง ๆ', 'If you need the full history')}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-300">
                <li>
                  {L(
                    'ต้องมีแหล่งข้อมูลจริง เช่น export จากระบบแชท/IDE หรือไฟล์บันทึกในทีม',
                    'You need a real source, such as an export from the chat/IDE or a team log file',
                  )}
                </li>
                <li>
                  {L(
                    'เก็บไว้เป็น markdown, Notion หรือ Drive แล้วสรุปเป็นหน้านำเสนอภายหลังได้',
                    'Keep it in markdown, Notion or Drive and summarize it into a page later',
                  )}
                </li>
              </ul>
            </div>
          </div>
        </SectionCard>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <p className="text-sm text-slate-300">
            {L(
              'ต่อยอดได้: ให้หน้านี้ render จากไฟล์ history ใน repo อัตโนมัติ เช่น',
              'Next step: render this page from a history file in the repo, e.g.',
            )}{' '}
            <code>docs/cascade-usage-history.md</code>
          </p>
        </div>
      </div>
    </main>
  );
}
