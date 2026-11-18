'use client';

// src/app/page.tsx — home, dark "growth" style: floating pill nav, dot-grid hero,
// stack marquee, two pillars, big stats, products grid, experience, MCP, contact.
import { useState } from 'react';
import Link from 'next/link';

import { LanguageToggle } from '@/components/LanguageToggle';
import { useLanguage } from '@/components/LanguageProvider';
import { resumeDataEN } from '@/data/resume';
import { productsContent, t, ui } from '@/lib/i18n';
import {
  formatDateRange,
  formatExperienceDuration,
  getTopSkills,
  sortExperiencesForResume,
} from '@/lib/resumeUtils';

import McpOverview from './McpOverview';

const links = {
  github: 'https://github.com/kasidit-wansudon',
  linkedin: 'https://www.linkedin.com/in/kasidit-wansudon/',
  youtube: 'https://www.youtube.com/@Kasidit_Wansudon',
  tiktok: 'https://www.tiktok.com/@kasidit.wans',
  x: 'https://x.com/KasiditWans',
  email: 'mailto:kasidit.wans@gmail.com',
  kasidit: 'https://kasi.kasion.dev',
};

const STACK = [
  'Laravel', 'Vue.js', 'Go', 'Flutter', 'Node.js', 'Next.js', 'MySQL', 'Docker',
  'AWS', 'Cloudflare', 'Claude Code', 'Kubernetes', 'Firebase', 'MQTT',
];

const NAV = [
  { href: '/blog', label: { th: 'บทความ', en: 'Blog' } },
  { href: '/resume', label: { th: 'Resume', en: 'Resume' } },
  { href: '/guestbook', label: { th: 'สมุดเยี่ยม', en: 'Guestbook' } },
  { href: '/cascade', label: { th: 'Cascade', en: 'Cascade' } },
];

export default function Home() {
  const { lang } = useLanguage();
  const [mcpOpen, setMcpOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { profile, experiences, skills } = resumeDataEN;
  const topExperiences = sortExperiencesForResume(experiences).slice(0, 3);
  const topSkills = getTopSkills(skills, 12);
  const h = ui.home;

  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white" aria-labelledby="page-title">
      {/* Floating pill nav */}
      <header className="fixed inset-x-0 top-3 z-50 px-3">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border border-white/10 bg-black/60 py-2 pl-5 pr-2 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-white text-[11px] font-bold text-black">
              K
            </span>
            kasidit
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-full px-3.5 py-1.5 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                {t(n.label, lang)}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block">
              <LanguageToggle />
            </span>
            <PillCta href={links.email} label={t(h.ctaPrimary, lang)} small />
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label="Menu"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 md:hidden"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </nav>
        {menuOpen ? (
          <div className="mx-auto mt-2 max-w-6xl rounded-3xl border border-white/10 bg-black/90 p-3 backdrop-blur-xl md:hidden">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="block rounded-2xl px-4 py-3 text-white/80 hover:bg-white/5">
                {t(n.label, lang)}
              </Link>
            ))}
            <div className="px-4 py-3">
              <LanguageToggle />
            </div>
          </div>
        ) : null}
      </header>

      {/* Hero */}
      <section className="relative px-4 pb-16 pt-36 md:pt-44">
        <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute left-1/2 top-24 h-[420px] w-[720px] max-w-full -translate-x-1/2 rounded-full bg-[#2f6bff]/20 blur-[120px]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <a
            href={links.kasidit}
            target="_blank"
            rel="noreferrer"
            className="animate-rise inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] py-1.5 pl-1.5 pr-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-white/25"
          >
            <span className="flex -space-x-2">
              {['K', '8', 'AI'].map((x) => (
                <span
                  key={x}
                  className="grid h-6 w-6 place-items-center rounded-full border border-black bg-linear-to-br from-white/90 to-white/50 text-[9px] font-bold text-black"
                >
                  {x}
                </span>
              ))}
            </span>
            {t(h.badge, lang)}
            <span aria-hidden>→</span>
          </a>

          <h1
            id="page-title"
            className="animate-rise mt-8 text-[40px] font-medium leading-[1.05] tracking-[-0.05em] sm:text-6xl md:text-7xl"
            style={{ animationDelay: '80ms' }}
          >
            {t(h.headline1, lang)}
            <br />
            <span className="bg-linear-to-r from-white via-white to-[#8fb0ff] bg-clip-text text-transparent">
              {t(h.headline2, lang)}
            </span>
          </h1>

          <p
            className="animate-rise mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60 md:text-lg"
            style={{ animationDelay: '160ms' }}
          >
            {t(h.sub, lang)}
          </p>

          <div
            className="animate-rise mt-10 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: '240ms' }}
          >
            <PillCta href={links.email} label={t(h.ctaPrimary, lang)} />
            <a
              href="#work"
              className="rounded-full border border-white/15 px-6 py-3.5 text-[15px] font-medium text-white/85 transition hover:border-white/40 hover:text-white"
            >
              {t(h.ctaSecondary, lang)}
            </a>
          </div>

          <p className="mt-8 flex items-center justify-center gap-2 text-sm text-white/45">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px] shadow-emerald-400" />
            {profile.location}
          </p>
        </div>
      </section>

      {/* Stack marquee */}
      <section className="border-y border-white/[0.06] py-8">
        <p className="mb-6 text-center text-sm text-white/45">{t(h.stackNote, lang)}</p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
          <div className="animate-marquee flex w-max gap-14 pr-14">
            {[...STACK, ...STACK].map((s, i) => (
              <span
                key={`${s}-${i}`}
                className="whitespace-nowrap text-2xl font-semibold tracking-tight text-white/35 md:text-3xl"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl flex-col gap-24 px-4 py-24">
        {/* Two pillars */}
        <section className="grid gap-4 md:grid-cols-2">
          <Pillar
            eyebrow={t(h.pillarDayEyebrow, lang)}
            title={t(h.pillarDayTitle, lang)}
            body={t(h.pillarDayBody, lang)}
            tags={['Laravel', 'Vue.js', 'Zend → Laravel', 'MySQL', 'DingTalk']}
            href="/resume"
            cta={t(h.learnMore, lang)}
            icon="building"
          />
          <Pillar
            eyebrow={t(h.pillarOssEyebrow, lang)}
            title={t(h.pillarOssTitle, lang)}
            body={t(h.pillarOssBody, lang)}
            tags={['Claude Code', '8 agents', 'Runbooks', 'MIT']}
            href={links.kasidit}
            cta={t(h.learnMore, lang)}
            icon="spark"
            external
          />
        </section>

        {/* Big stats */}
        <section className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 lg:grid-cols-4">
          <BigStat value={`${profile.yearsOfExperience ?? 4}+`} label={t(h.statYears, lang)} />
          <BigStat value="5" label={t(h.statTeam, lang)} />
          <BigStat value="174" label={t(h.statRepos, lang)} />
          <BigStat value="75%" label={t(h.statBench, lang)} />
        </section>

        {/* Products */}
        <section id="work" className="scroll-mt-28">
          <SectionHead
            eyebrow={t(ui.products.eyebrow, lang)}
            title={t(ui.products.title, lang)}
            lead={t(ui.products.lead, lang)}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {productsContent.map((p) => (
              <a
                key={p.title}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0a0b0f] p-6 transition duration-300 hover:-translate-y-0.5 hover:border-[#2f6bff]/50"
              >
                <span
                  className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#2f6bff]/0 blur-3xl transition duration-500 group-hover:bg-[#2f6bff]/25"
                  aria-hidden
                />
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">{t(p.eyebrow, lang)}</p>
                <h3 className="mt-3 text-xl font-medium tracking-tight">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-white/55">{t(p.description, lang)}</p>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {p.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] text-white/50">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <ArrowDot />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Experience + skills */}
        <section className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <SectionHead
              eyebrow={t(ui.selectedWork.eyebrow, lang)}
              title={t(ui.selectedWork.title, lang)}
              action={
                <Link href="/resume" className="text-sm text-white/50 transition hover:text-white">
                  {t(ui.selectedWork.seeAll, lang)} →
                </Link>
              }
            />
            <ol className="mt-8 border-l border-white/10">
              {topExperiences.map((exp, i) => (
                <li key={`${exp.company}-${exp.role}`} className="relative pb-10 pl-8 last:pb-0">
                  <span
                    className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ${
                      i === 0 ? 'bg-[#2f6bff] shadow-[0_0_14px] shadow-[#2f6bff]' : 'bg-white/30'
                    }`}
                  />
                  <p className="text-xs text-white/40">
                    {formatDateRange(exp.start, exp.end)} · {formatExperienceDuration(exp)}
                  </p>
                  <h3 className="mt-1.5 text-lg font-medium tracking-tight">{exp.role}</h3>
                  <p className="text-sm text-white/55">{exp.company}</p>
                  <ul className="mt-3 space-y-1.5 text-sm text-white/60">
                    {exp.highlights.slice(0, 3).map((hl) => (
                      <li key={hl} className="flex gap-2">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/30" />
                        {hl}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <SectionHead eyebrow={t(ui.skills.eyebrow, lang)} title={t(ui.skills.title, lang)} lead={t(ui.skills.lead, lang)} />
            <div className="mt-8 flex flex-wrap gap-2">
              {topSkills.map((s) => (
                <span
                  key={s.name}
                  className={`rounded-full border px-3.5 py-1.5 text-sm ${
                    s.level === 'expert'
                      ? 'border-[#2f6bff]/50 bg-[#2f6bff]/10 text-white'
                      : 'border-white/10 text-white/65'
                  }`}
                >
                  {s.name}
                  <span className="ml-2 text-[11px] text-white/35">{s.years ?? 1}y</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* MCP overview */}
        <section className="rounded-3xl border border-white/10 bg-[#0a0b0f] p-6 md:p-10">
          <SectionHead
            eyebrow={t(ui.mcp.eyebrow, lang)}
            title={t(ui.mcp.title, lang)}
            lead={t(ui.mcp.lead, lang)}
            action={
              <Link
                href="/cascade"
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:border-white/40"
              >
                {t(ui.mcp.cta, lang)}
              </Link>
            }
          />
          <button
            type="button"
            onClick={() => setMcpOpen((prev) => !prev)}
            aria-expanded={mcpOpen}
            aria-controls="mcp-overview-panel"
            className="mt-6 text-sm text-[#8fb0ff] transition hover:text-white"
          >
            {mcpOpen ? '−' : '+'} {lang === 'th' ? 'ดู MCP overview' : 'Show MCP overview'}
          </button>
          <div
            id="mcp-overview-panel"
            className={`mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black ${mcpOpen ? '' : 'hidden'}`}
          >
            <McpOverview />
          </div>
        </section>

        {/* Contact CTA */}
        <section className="relative overflow-hidden rounded-[32px] border border-white/10 px-6 py-16 text-center md:py-24">
          <div className="dot-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
          <div
            className="pointer-events-none absolute bottom-0 left-1/2 h-60 w-[600px] max-w-full -translate-x-1/2 translate-y-1/2 rounded-full bg-[#2f6bff]/30 blur-[100px]"
            aria-hidden
          />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/45">{t(h.contactEyebrow, lang)}</p>
            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-medium leading-tight tracking-[-0.04em] md:text-5xl">
              {t(h.contactTitle, lang)}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-white/55">{t(h.contactBody, lang)}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <PillCta href={links.email} label={t(h.ctaPrimary, lang)} />
              <a
                href={links.x}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/15 px-6 py-3.5 text-[15px] font-medium text-white/85 transition hover:border-white/40"
              >
                X / @KasiditWans
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-4 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 text-sm text-white/45 md:flex-row">
          <p>© {new Date().getFullYear()} {profile.fullName}</p>
          <nav className="flex flex-wrap justify-center gap-5" aria-label="Social profiles">
            {(
              [
                ['GitHub', links.github],
                ['LinkedIn', links.linkedin],
                ['X', links.x],
                ['YouTube', links.youtube],
                ['TikTok', links.tiktok],
                ['Email', links.email],
              ] as const
            ).map(([label, href]) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('mailto') ? undefined : '_blank'}
                rel="noreferrer"
                className="transition hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </main>
  );
}

/** White pill CTA with blue arrow dot and blue under-glow (ref style). */
function PillCta({ href, label, small = false }: { href: string; label: string; small?: boolean }) {
  return (
    <a
      href={href}
      className={`group inline-flex items-center rounded-full bg-white font-semibold tracking-tight text-[#0a0b0f] shadow-[0_18px_40px_-18px_rgba(47,107,255,0.85),0_4px_14px_-4px_rgba(0,0,0,0.55)] transition hover:shadow-[0_18px_50px_-12px_rgba(47,107,255,1)] ${
        small ? 'gap-2 py-1 pl-4 pr-1 text-sm' : 'gap-3 py-1.5 pl-6 pr-1.5 text-[15px]'
      }`}
    >
      <span className="whitespace-nowrap">{label}</span>
      <span
        className={`grid place-items-center rounded-full bg-[#2f6bff] text-white transition group-hover:rotate-45 ${
          small ? 'h-7 w-7' : 'h-10 w-10'
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </a>
  );
}

function ArrowDot() {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 text-white/60 transition group-hover:border-[#2f6bff] group-hover:bg-[#2f6bff] group-hover:text-white">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
        <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function SectionHead({
  eyebrow,
  title,
  lead,
  action,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8fb0ff]">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-medium tracking-[-0.04em] md:text-4xl">{title}</h2>
        {lead ? <p className="mt-3 text-white/55">{lead}</p> : null}
      </div>
      {action}
    </div>
  );
}

function Pillar({
  eyebrow,
  title,
  body,
  tags,
  href,
  cta,
  icon,
  external = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  tags: string[];
  href: string;
  cta: string;
  icon: 'building' | 'spark';
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel="noreferrer"
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0a0b0f] p-7 transition hover:border-white/25 md:p-9"
    >
      <div className="dot-grid pointer-events-none absolute inset-x-0 top-0 h-48 opacity-40" aria-hidden />
      <p className="relative flex items-center gap-2 text-sm text-white/50">
        {icon === 'building' ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 21V5l8-3v19M12 9l8 3v9M2 21h20M8 8v.01M8 12v.01M8 16v.01M16 15v.01M16 18v.01" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" strokeLinecap="round" />
          </svg>
        )}
        {eyebrow}
      </p>
      <h3 className="relative mt-5 text-2xl font-medium leading-snug tracking-[-0.03em] md:text-[28px]">{title}</h3>
      <p className="relative mt-4 flex-1 leading-relaxed text-white/55">{body}</p>
      <div className="relative mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/55">
              {tag}
            </span>
          ))}
        </div>
        <span className="inline-flex items-center gap-2 text-sm font-medium text-white/80 group-hover:text-white">
          {cta}
          <ArrowDot />
        </span>
      </div>
    </a>
  );
}

function BigStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-black p-6 md:p-8">
      <p className="text-4xl font-medium tracking-[-0.05em] md:text-6xl">{value}</p>
      <p className="mt-2 text-sm text-white/45">{label}</p>
    </div>
  );
}
