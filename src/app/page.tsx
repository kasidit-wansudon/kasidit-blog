// src/app/page.tsx
// Comment in English
import Link from 'next/link';

const links = {
  github: 'https://github.com/kasidit-wansudon',
  youtube: 'https://www.youtube.com/@9KASIDIT',
  x: 'https://x.com/KasiditWans',
  email: 'mailto:kasidit.wans@gmail.com',
};

export default function Home() {
  return (
    <main
      className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50"
      aria-labelledby="page-title"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-12 md:flex-row md:items-center">
        {/* Left: intro */}
        <section className="flex-1 space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-sky-400">
              Kasidit Wansudon
            </p>
            <h1
              id="page-title"
              className="mt-2 text-3xl font-semibold leading-tight md:text-4xl"
            >
              Full‑stack developer in Bangkok,
              <br className="hidden md:block" />
              building web & mobile products.
            </h1>
          </div>

          <p className="max-w-xl text-sm leading-relaxed text-slate-400">
            สวัสดีครับ ผมกษิดิศ วันสุดล ทำงานสาย Full‑stack
            ชอบสร้างระบบจริงด้วย Next.js, NestJS, Flutter และฐานข้อมูล
            ที่เน้น performance. เว็บนี้ใช้สำหรับแชร์บทความ, โปรเจกต์
            และเป็นที่ให้ทุกคนฝากข้อความถึงผม.
          </p>

          {/* Primary actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/blog"
              className="inline-flex items-center rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 shadow-md shadow-sky-500/30 hover:bg-sky-400"
            >
              Read my blog
            </Link>
            <Link
              href="/guestbook"
              className="inline-flex items-center rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-sky-500/70 hover:text-sky-200"
            >
              Leave a message
            </Link>
          </div>

          {/* Social / external links */}
          <div className="pt-4 text-xs text-slate-400">
            <p className="mb-1 font-medium text-slate-300">
              Around the internet
            </p>
            <nav
              className="flex flex-wrap gap-4"
              aria-label="Social profiles"
            >
              <a
                href={links.github}
                target="_blank"
                rel="noreferrer"
                className="hover:text-sky-400"
              >
                GitHub
              </a>
              <a
                href={links.youtube}
                target="_blank"
                rel="noreferrer"
                className="hover:text-sky-400"
              >
                YouTube
              </a>
              <a
                href={links.x}
                target="_blank"
                rel="noreferrer"
                className="hover:text-sky-400"
              >
                X / Twitter
              </a>
              <a
                href={links.email}
                className="hover:text-sky-400"
              >
                Email
              </a>
            </nav>
          </div>
        </section>

        {/* Right: highlight card */}
        <section className="flex-1">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/40">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              Latest work
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-50">
              Personal blog &amp; guestbook
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              เว็บนี้ถูกสร้างด้วย Next.js, Supabase และ Cloudflare
              เป็นโปรเจกต์ที่รวม blog ส่วนตัว, guestbook และระบบ feedback
              จากผู้ใช้งานจริงเข้าไว้ด้วยกัน.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-300">
              <span className="rounded-full bg-slate-800 px-3 py-1">
                Next.js 14
              </span>
              <span className="rounded-full bg-slate-800 px-3 py-1">
                Supabase
              </span>
              <span className="rounded-full bg-slate-800 px-3 py-1">
                Cloudflare Pages
              </span>
              <span className="rounded-full bg-slate-800 px-3 py-1">
                TypeScript
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
