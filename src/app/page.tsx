// src/app/page.tsx
import Link from 'next/link';

import { resumeDataEN } from '@/data/resume';
import {
  formatDateRange,
  formatExperienceDuration,
  getTopSkills,
  sortExperiencesForResume,
} from '@/lib/resumeUtils';

import McpOverview from './McpOverview';

const links = {
  github: 'https://github.com/kasidit-wansudon',
  youtube: 'https://www.youtube.com/@9KASIDIT',
  x: 'https://x.com/KasiditWans',
  email: 'mailto:kasidit.wans@gmail.com',
};

export default function Home() {
  const { profile, experiences, skills, languages } = resumeDataEN;
  const topExperiences = sortExperiencesForResume(experiences).slice(0, 2);
  const topSkills = getTopSkills(skills, 6);
  const languageSummary = languages?.map((lang) => lang.name).join(' · ');

  return (
    <main
      className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50"
      aria-labelledby="page-title"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-12">
        {/* Hero */}
        <section className="rounded-[30px] border border-slate-900/60 bg-slate-950/40 p-8 shadow-2xl shadow-black/20">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-sky-400">
              Kasidit Wansudon
            </p>
            <h1
              id="page-title"
              className="mt-3 text-3xl font-semibold leading-tight text-white md:text-5xl"
            >
              {profile.title} in Bangkok — building web & mobile systems end-to-end.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-300">
              {profile.summary ||
                'Full-stack developer ที่ชอบสร้างระบบจริง ตั้งแต่ออกแบบสถาปัตยกรรมจนถึง ship ให้ผู้ใช้จริง พร้อมเล่าเบื้องหลังผ่าน blog และ guestbook.'}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-300">
            <span className="inline-flex items-center gap-2 text-slate-200">
              <svg className="h-4 w-4 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
              </svg>
              {profile.location}
            </span>
            <span className="inline-flex items-center gap-2 text-slate-200">
              <svg className="h-4 w-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 5h2l3 5-2 3a13 13 0 006 6l3-2 5 3v2c0 1-1 2-2 2A16 16 0 013 5z"
                />
              </svg>
              {profile.phone}
            </span>
            <a href={links.email} className="inline-flex items-center gap-2 text-slate-200 hover:text-sky-400">
              <svg className="h-4 w-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2zm0 0l8 7 8-7" />
              </svg>
              {profile.email}
            </a>
          </div>

          {/* Primary actions */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/blog"
              className="inline-flex items-center rounded-full bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/30 transition hover:bg-sky-400"
            >
              อ่านบทความ
            </Link>
            <Link
              href="/resume"
              className="inline-flex items-center rounded-full border border-sky-500/70 px-5 py-2.5 text-sm font-semibold text-sky-300 transition hover:bg-sky-500/10"
            >
              ดู Resume
            </Link>
            <Link
              href="/guestbook"
              className="inline-flex items-center rounded-full border border-slate-700 px-5 py-2.5 text-sm text-slate-200 transition hover:border-sky-500/70 hover:text-sky-200"
            >
              ฝากข้อความ
            </Link>
            <Link
              href="/cascade"
              className="inline-flex items-center rounded-full border border-slate-800 px-5 py-2.5 text-sm text-slate-200 transition hover:border-sky-500/70 hover:text-sky-200"
            >
              Cascade / MCP
            </Link>
          </div>

          {/* Social */}
          <div className="mt-8 border-t border-slate-800 pt-4 text-xs text-slate-400">
            <p className="mb-2 font-semibold text-slate-300">Around the internet</p>
            <nav className="flex flex-wrap gap-4" aria-label="Social profiles">
              <a href={links.github} target="_blank" rel="noreferrer" className="hover:text-sky-400">
                GitHub
              </a>
              <a href={links.youtube} target="_blank" rel="noreferrer" className="hover:text-sky-400">
                YouTube
              </a>
              <a href={links.x} target="_blank" rel="noreferrer" className="hover:text-sky-400">
                X / Twitter
              </a>
              <a href={links.email} className="hover:text-sky-400">
                Email
              </a>
            </nav>
          </div>
        </section>

        {/* Stats */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="ประสบการณ์"
            value={`${profile.yearsOfExperience ?? 0}+ ปี`}
            caption="สร้างระบบ production"
          />
          <StatCard
            label="โฟกัส"
            value={profile.focusAreas?.slice(0, 2).join(', ') || 'Full-stack'}
            caption="เน้น Flutter, Node.js, Laravel, Vue.js"
          />
          <StatCard label="องค์กรปัจจุบัน" value={profile.currentCompany ?? '-'} caption="Full Stack Programmer" />
          <StatCard label="ภาษา" value={languageSummary ?? '-'} caption="พร้อมสื่อสารกับทีม" />
        </section>

        {/* Experience & skills */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <header className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-sky-400">Selected work</p>
                <h2 className="text-xl font-semibold text-white">Projects & impact</h2>
              </div>
              <Link href="/resume" className="text-sm text-slate-400 underline decoration-dotted hover:text-sky-400">
                ดูทั้งหมด
              </Link>
            </header>
            {topExperiences.map((exp) => (
              <article
                key={`${exp.company}-${exp.role}`}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <span>{formatDateRange(exp.start, exp.end)}</span>
                  {exp.location ? <span>{exp.location}</span> : null}
                </div>
                <h3 className="mt-2 text-lg font-semibold text-white">{exp.role}</h3>
                <p className="text-sm text-slate-300">{exp.company}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {formatExperienceDuration(exp)} · {exp.techStack?.slice(0, 4).join(', ')}
                </p>
                <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-300">
                  {exp.highlights.slice(0, 3).map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="space-y-4">
            <header>
              <p className="text-xs uppercase tracking-[0.25em] text-sky-400">Core skills</p>
              <h2 className="text-xl font-semibold text-white">Tech stack & tools</h2>
              <p className="mt-1 text-sm text-slate-400">ชุดทักษะที่ใช้จริงใน production และงาน consult</p>
            </header>
            <div className="grid gap-3 sm:grid-cols-2">
              {topSkills.map((skill) => (
                <div
                  key={skill.name}
                  className="rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-200"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-base font-semibold text-white">{skill.name}</p>
                    <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                      {skill.level}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {skill.category || 'General'} · {skill.years ?? 1}+ yrs
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Latest work */}
        <section className="rounded-3xl border border-slate-900/70 bg-linear-to-br from-slate-950/80 via-slate-900 to-slate-950/80 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Latest work</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Personal blog & guestbook</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            แพลตฟอร์มเดียวที่เล่า process การพัฒนา, เก็บโน้ตเทคนิค และให้คนฝากคอมเมนต์ได้แบบ real-time
            โดยเชื่อม Next.js 14, Supabase และ Cloudflare Pages เข้าด้วยกัน
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-300">
            {['Next.js 14', 'Supabase', 'Cloudflare Pages', 'TypeScript', 'Tailwind'].map((tag) => (
              <span key={tag} className="rounded-full bg-slate-900/80 px-3 py-1">
                {tag}
              </span>
            ))}
          </div>
        </section>

        {/* MCP overview */}
        <section className="rounded-[32px] border border-slate-900/50 bg-slate-950/30 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-sky-400">MCP stack</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Tools & workflows I automate</h2>
              <p className="mt-1 text-sm text-slate-400">
                สรุป server ที่ใช้งานจริง (gdrive, brave-search, deepwiki, memory) พร้อมวิธีทำงานร่วมกับทีม
              </p>
            </div>
            <Link
              href="/cascade"
              className="inline-flex items-center rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-sky-500/70 hover:text-sky-200"
            >
              เปิดเอกสารเต็ม
            </Link>
          </div>
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-900 bg-slate-950">
            <McpOverview />
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <div className="rounded-2xl border border-slate-900/60 bg-slate-950/40 p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="text-xs text-slate-400">{caption}</p>
    </div>
  );
}
