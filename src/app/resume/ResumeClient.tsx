'use client';

// Client component for Resume page with language toggle
import { useState } from 'react';
import { resumeDataEN, resumeDataTH, resumeLabels } from '@/data/resume';
import {
  formatDateRange,
  formatExperienceDuration,
  groupSkillsByCategory,
  sortExperiencesForResume,
  sortEducation,
  ResumeSkill,
  ResumeProject,
} from '@/lib/resumeUtils';

type Lang = 'en' | 'th';

export default function ResumeClient() {
  const [lang, setLang] = useState<Lang>('en');

  const data = lang === 'en' ? resumeDataEN : resumeDataTH;
  const labels = resumeLabels[lang];
  const { profile, experiences, skills, education, languages, projects } = data;
  const sortedExperiences = sortExperiencesForResume(experiences);
  const groupedSkills = groupSkillsByCategory(skills);
  const sortedEducation = education ? sortEducation(education) : [];

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Language Toggle */}
        <div className="mb-6 flex justify-end">
          <div className="inline-flex rounded-lg border border-slate-700 p-1">
            <button
              onClick={() => setLang('en')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                lang === 'en'
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('th')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                lang === 'th'
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              TH
            </button>
          </div>
        </div>

        {/* Header */}
        <header className="mb-10 border-b border-slate-800 pb-8">
          <h1 className="text-4xl font-bold text-white">{profile.fullName}</h1>
          <p className="mt-2 text-xl text-sky-400">{profile.title}</p>

          {/* Contact Info */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
            {profile.location && (
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {profile.location}
              </span>
            )}
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="flex items-center gap-1 hover:text-sky-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {profile.email}
              </a>
            )}
            {profile.phone && (
              <a href={`tel:${profile.phone}`} className="flex items-center gap-1 hover:text-sky-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {profile.phone}
              </a>
            )}
            {profile.github && (
              <a href={profile.github} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-sky-400">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </a>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-sky-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Website
              </a>
            )}
          </div>

          {/* Summary */}
          {profile.summary && (
            <p className="mt-6 text-slate-300 leading-relaxed">{profile.summary}</p>
          )}

          {/* Download PDF */}
          <div className="mt-6">
            <a
              href="/Resume_Kasidit_wansudon.pdf"
              download
              className="inline-flex items-center gap-2 rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-sky-400"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {labels.downloadPdf}
            </a>
          </div>
        </header>

        {/* Skills */}
        <section className="mb-10">
          <h2 className="mb-6 text-2xl font-bold text-white">{labels.skills}</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(groupedSkills).map(([category, categorySkills]) => (
              <div key={category} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-sky-400">
                  {category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill: ResumeSkill) => {
                    const levelColors: Record<string, string> = {
                      expert: 'bg-sky-500 text-white',
                      advanced: 'bg-sky-700 text-white',
                      intermediate: 'bg-slate-700 text-slate-200',
                      beginner: 'bg-slate-800 text-slate-400',
                    };
                    const levelLabels: Record<string, string> = {
                      expert: '★★★★',
                      advanced: '★★★',
                      intermediate: '★★',
                      beginner: '★',
                    };
                    return (
                      <div
                        key={skill.name}
                        className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ${levelColors[skill.level]}`}
                      >
                        <span>{skill.name}</span>
                        <span className="text-xs opacity-75">{levelLabels[skill.level]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Experience */}
        <section className="mb-10">
          <h2 className="mb-6 text-2xl font-bold text-white">{labels.experience}</h2>
          <div className="space-y-8">
            {sortedExperiences.map((exp, index) => (
              <div key={index} className="relative border-l-2 border-slate-800 pl-6">
                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-sky-500 bg-slate-950" />
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-semibold text-white">{exp.role}</h3>
                  <span className="text-sm text-slate-500">
                    {formatDateRange(exp.start, exp.end)}
                    {' · '}
                    {formatExperienceDuration(exp)}
                  </span>
                </div>
                <p className="mt-1 text-sky-400">
                  {exp.company}
                  {exp.location && <span className="text-slate-500"> · {exp.location}</span>}
                  {exp.isRemote && (
                    <span className="ml-2 rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                      {labels.remote}
                    </span>
                  )}
                </p>
                {exp.techStack && exp.techStack.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {exp.techStack.map((tech) => (
                      <span key={tech} className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                <ul className="mt-3 space-y-1 text-sm text-slate-400">
                  {exp.highlights.map((highlight, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-sky-500">•</span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        {sortedEducation.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-6 text-2xl font-bold text-white">{labels.education}</h2>
            <div className="space-y-4">
              {sortedEducation.map((edu, index) => (
                <div key={index} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-lg font-semibold text-white">{edu.institution}</h3>
                    <span className="text-sm text-slate-500">
                      {formatDateRange(edu.start, edu.end)}
                    </span>
                  </div>
                  <p className="mt-1 text-sky-400">
                    {edu.degree}
                    {edu.field && ` ${lang === 'en' ? 'in' : ''} ${edu.field}`}
                  </p>
                  {edu.gpa && (
                    <p className="mt-1 text-sm text-slate-400">GPA: {edu.gpa}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-6 text-2xl font-bold text-white">{labels.languages}</h2>
            <div className="flex flex-wrap gap-4">
              {languages.map((langItem: { name: string; proficiency: string }) => (
                <div key={langItem.name} className="rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3">
                  <span className="font-medium text-white">{langItem.name}</span>
                  <span className="ml-2 text-sm text-slate-400">({langItem.proficiency})</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-6 text-2xl font-bold text-white">{labels.projects}</h2>
            <div className="space-y-4">
              {projects.map((project: ResumeProject, index: number) => (
                <div key={index} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-400 hover:text-sky-300"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{project.description}</p>
                  {project.techStack.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {project.techStack.map((tech: string) => (
                        <span key={tech} className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-sky-400"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {labels.backToHome}
          </a>
        </div>
      </div>
    </main>
  );
}
