'use client';

// Resume page — same dark "growth" style as the home page.
// Language comes from the site-wide LanguageProvider (TH/EN toggle shared with home).
import Link from 'next/link';

import { LanguageToggle } from '@/components/LanguageToggle';
import { useLanguage } from '@/components/LanguageProvider';
import { resumeDataEN, resumeDataTH, resumeLabels } from '@/data/resume';
import { storyChapters, t } from '@/lib/i18n';
import { PinIcon } from '@/components/Icons';
import LuxButton from '@/components/LuxButton';
import {
  formatDateRange,
  formatExperienceDuration,
  groupSkillsByCategory,
  sortExperiencesForResume,
  sortEducation,
  ResumeSkill,
  ResumeProject,
} from '@/lib/resumeUtils';

const PDFS = [
  { href: '/Resume_Kasidit_Wansudon_2026.pdf', key: 'downloadPdf', primary: true },
  { href: '/Resume_Kasidit_Wansudon_2026_TH.pdf', key: 'downloadPdfTh', primary: false },
] as const;

export default function ResumeClient() {
  const { lang } = useLanguage();

  const data = lang === 'en' ? resumeDataEN : resumeDataTH;
  const labels = resumeLabels[lang];
  const { profile, experiences, skills, education, languages, projects } = data;
  const sortedExperiences = sortExperiencesForResume(experiences);
  const groupedSkills = groupSkillsByCategory(skills);
  const sortedEducation = education ? sortEducation(education) : [];

  const contacts = [
    profile.email && { label: profile.email, href: `mailto:${profile.email}` },
    profile.linkedin && { label: 'LinkedIn', href: profile.linkedin },
    profile.github && { label: 'GitHub', href: profile.github },
    { label: 'X', href: 'https://x.com/KasiditWans' },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      {/* Top bar */}
      <header className="fixed inset-x-0 top-3 z-50 px-3">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border border-white/10 bg-black/60 py-2 pl-5 pr-2 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-white text-[11px] font-bold text-black">K</span>
            kasidit
            <span className="hidden text-white/35 sm:inline">/ resume</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <LuxButton href="/" icon="back" iconSide="left" size="sm" className="hidden sm:inline-flex">
              {labels.backToHome}
            </LuxButton>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative px-4 pb-14 pt-36 md:pt-40">
        <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute left-1/2 top-20 h-[360px] w-[680px] max-w-full -translate-x-1/2 rounded-full bg-[#2f6bff]/20 blur-[120px]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl">
          <p className="flex items-center gap-2 text-sm text-white/50">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px] shadow-emerald-400" />
            {profile.location}
          </p>
          <h1 className="animate-rise mt-4 text-5xl font-medium leading-[1.02] tracking-[-0.05em] md:text-7xl">
            {profile.fullName}
          </h1>
          <p className="mt-4 text-lg text-[#8fb0ff] md:text-xl">{profile.title}</p>
          {profile.summary ? (
            <p className="mt-6 max-w-3xl leading-relaxed text-white/60 md:text-lg">{profile.summary}</p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {PDFS.map((pdf) =>
              pdf.primary ? (
                <a
                  key={pdf.href}
                  href={pdf.href}
                  download
                  className="group inline-flex items-center gap-3 rounded-full bg-white py-1.5 pl-6 pr-1.5 text-[15px] font-semibold tracking-tight text-[#0a0b0f] shadow-[0_18px_40px_-18px_rgba(47,107,255,0.85),0_4px_14px_-4px_rgba(0,0,0,0.55)] transition hover:shadow-[0_18px_50px_-12px_rgba(47,107,255,1)]"
                >
                  {labels[pdf.key]}
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[#2f6bff] text-white transition group-hover:translate-y-0.5">
                    <DownloadIcon />
                  </span>
                </a>
              ) : (
                <LuxButton key={pdf.href} href={pdf.href} icon="download" download>
                  {labels[pdf.key]}
                </LuxButton>
              ),
            )}
          </div>

          <nav className="mt-8 flex flex-wrap gap-2" aria-label="Contact">
            {contacts.map((c) => (
              <a
                key={c.href}
                href={c.href}
                target={c.href.startsWith('mailto') ? undefined : '_blank'}
                rel="noreferrer"
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-sm text-white/70 transition hover:border-white/30 hover:text-white"
              >
                {c.label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-16 px-4 pb-24 pt-10 lg:grid-cols-[1.6fr_1fr]">
        {/* Experience */}
        <section>
          <Eyebrow>{labels.experience}</Eyebrow>
          <ol className="mt-8 border-l border-white/10">
            {sortedExperiences.map((exp) => (
              <li key={`${exp.company}-${exp.role}`} className="relative pb-12 pl-8 last:pb-0">
                <span
                  className={`absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full ${
                    !exp.end ? 'bg-[#2f6bff] shadow-[0_0_14px] shadow-[#2f6bff]' : 'bg-white/30'
                  }`}
                />
                <p className="text-xs text-white/40">
                  {formatDateRange(exp.start, exp.end)} · {formatExperienceDuration(exp)}
                  {exp.location ? ` · ${exp.location}` : ''}
                </p>
                <h3 className="mt-2 text-xl font-medium tracking-tight md:text-2xl">{exp.role}</h3>
                <p className="mt-1 text-white/55">
                  {exp.companyUrl ? (
                    <a href={exp.companyUrl} target="_blank" rel="noreferrer" className="hover:text-white">
                      {exp.company} ↗
                    </a>
                  ) : (
                    exp.company
                  )}
                  {exp.isRemote ? (
                    <span className="ml-2 rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-white/45">
                      {labels.remote}
                    </span>
                  ) : null}
                </p>
                <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-white/65">
                  {exp.highlights.map((hl) => (
                    <li key={hl} className="flex gap-3">
                      <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-white/35" />
                      {hl}
                    </li>
                  ))}
                </ul>
                {exp.techStack?.length ? (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {exp.techStack.map((tech) => (
                      <span key={tech} className="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] text-white/50">
                        {tech}
                      </span>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
          {/* Small origin note: how far it has come */}
          <div className="mt-10 rounded-2xl border border-dashed border-white/15 px-5 py-4">
            <p className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
              <PinIcon className="h-3.5 w-3.5 text-[#8fb0ff]" /> {lang === 'th' ? 'จุดเริ่มต้น' : 'Where it all started'} · {storyChapters[0].start.slice(0, 4)} ·{' '}
              {t(storyChapters[0].place, lang)}
            </p>
            <p className="mt-1.5 text-sm text-white/60">
              {t(storyChapters[0].role, lang)} →{' '}
              <span className="text-[#b9ccff]">
                {profile.title.split(' · ')[0]} {lang === 'th' ? `ในอีก ${profile.yearsOfExperience} ปีต่อมา` : `${profile.yearsOfExperience} years later`}
              </span>
            </p>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="space-y-6">
          <Card>
            <Eyebrow>{labels.skills}</Eyebrow>
            <div className="mt-5 space-y-5">
              {Object.entries(groupedSkills).map(([category, list]) => (
                <div key={category}>
                  <p className="text-xs font-medium text-white/40">{category}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(list as ResumeSkill[]).map((skill) => (
                      <span
                        key={skill.name}
                        title={skill.level}
                        className={`rounded-full border px-3 py-1 text-[13px] ${
                          skill.level === 'expert'
                            ? 'border-[#2f6bff]/60 bg-[#2f6bff]/15 text-white'
                            : skill.level === 'advanced'
                              ? 'border-white/20 text-white/85'
                              : 'border-white/10 text-white/50'
                        }`}
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-4 border-t border-white/10 pt-4 text-[11px] text-white/45">
              <Legend className="border-[#2f6bff]/60 bg-[#2f6bff]/15" label="Expert" />
              <Legend className="border-white/20" label="Advanced" />
              <Legend className="border-white/10" label="Intermediate+" />
            </div>
          </Card>

          {sortedEducation.length > 0 ? (
            <Card>
              <Eyebrow>{labels.education}</Eyebrow>
              {sortedEducation.map((edu) => (
                <div key={edu.institution} className="mt-4">
                  <p className="font-medium">{edu.institution}</p>
                  <p className="mt-1 text-sm text-white/55">
                    {edu.degree}
                    {edu.field ? ` ${lang === 'en' ? 'in ' : ''}${edu.field}` : ''}
                  </p>
                  <p className="mt-1 text-xs text-white/40">
                    {formatDateRange(edu.start, edu.end)}
                    {edu.gpa ? ` · GPA ${edu.gpa}` : ''}
                  </p>
                </div>
              ))}
            </Card>
          ) : null}

          {languages?.length ? (
            <Card>
              <Eyebrow>{labels.languages}</Eyebrow>
              <ul className="mt-4 space-y-2">
                {languages.map((l) => (
                  <li key={l.name} className="flex items-baseline justify-between gap-4 text-sm">
                    <span className="font-medium">{l.name}</span>
                    <span className="text-right text-white/45">{l.proficiency}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </aside>

        {/* Projects */}
        {projects?.length ? (
          <section className="lg:col-span-2">
            <Eyebrow>{labels.projects}</Eyebrow>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p: ResumeProject) => (
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col rounded-3xl border border-white/10 bg-[#0a0b0f] p-6 transition hover:-translate-y-0.5 hover:border-[#2f6bff]/50"
                >
                  <h3 className="font-mono text-[15px] font-medium">{p.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-white/55">{p.description}</p>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {p.techStack.map((tech) => (
                        <span key={tech} className="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] text-white/50">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 text-white/60 transition group-hover:border-[#2f6bff] group-hover:bg-[#2f6bff] group-hover:text-white">
                      ↗
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <footer className="border-t border-white/[0.06] px-4 py-10 text-center text-sm text-white/45">
        <Link href="/" className="inline-flex items-center gap-1.5 transition hover:text-white">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path d="M19 12H5m6-6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {labels.backToHome}
        </Link>
        <span className="mx-3">·</span>
        <a href="/Resume_Kasidit_wansudon.pdf" download className="transition hover:text-white">
          {labels.downloadPdfLegacy}
        </a>
      </footer>
    </main>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8fb0ff]">{children}</p>;
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl border border-white/10 bg-[#0a0b0f] p-6">{children}</div>;
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full border ${className}`} />
      {label}
    </span>
  );
}

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
