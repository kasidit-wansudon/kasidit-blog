'use client';

import Link from 'next/link';

import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from './LanguageProvider';
import type { Lang } from '@/lib/i18n';

const LABELS: Record<Lang, { blog: string; guestbook: string; resume: string }> = {
  th: { blog: 'บทความ', guestbook: 'สมุดเยี่ยม', resume: 'Resume' },
  en: { blog: 'Blog', guestbook: 'Guestbook', resume: 'Resume' },
};

/**
 * Floating pill nav for sub pages. `section` is shown after the logo.
 * `langHrefs` + `pageLang` are for pages with a URL per language (blog): the toggle then navigates.
 */
export default function SiteNav({
  section,
  active,
  langHrefs,
  pageLang,
}: {
  section?: string;
  active?: string;
  langHrefs?: Partial<Record<Lang, string | null>>;
  pageLang?: Lang;
}) {
  const { lang: saved } = useLanguage();
  const lang = pageLang ?? saved;
  const l = LABELS[lang];
  const items = [
    { key: '/blog', href: lang === 'en' ? '/en/blog' : '/blog', label: l.blog },
    { key: '/guestbook', href: '/guestbook', label: l.guestbook },
    { key: '/resume', href: '/resume', label: l.resume },
  ];

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-2 rounded-full border border-white/10 bg-black/60 py-2 pl-4 pr-2 backdrop-blur-xl sm:pl-5">
        <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-white text-[11px] font-bold text-black">K</span>
          <span className="hidden sm:inline">kasidit</span>
          {section ? <span className="hidden text-white/35 md:inline">/ {section}</span> : null}
        </Link>
        <div className="flex items-center gap-1">
          {items.map((i) => (
            <Link
              key={i.key}
              href={i.href}
              aria-current={active === i.key ? 'page' : undefined}
              className={`rounded-full px-2.5 py-1.5 text-sm transition sm:px-3 ${
                active === i.key ? 'bg-white text-black' : 'text-white/65 hover:bg-white/5 hover:text-white'
              }`}
            >
              {i.label}
            </Link>
          ))}
          <LanguageToggle className="ml-1" hrefs={langHrefs} current={pageLang} />
        </div>
      </nav>
    </header>
  );
}
