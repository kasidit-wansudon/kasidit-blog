'use client';

import { useRouter } from 'next/navigation';

import { useLanguage } from './LanguageProvider';
import { LANGS, type Lang } from '@/lib/i18n';

/**
 * TH / EN switch. Saves the choice (localStorage, shared by every page).
 * When `hrefs` is given (pages that have a separate URL per language, like the blog),
 * it also navigates to that language's URL.
 */
export function LanguageToggle({
  className = '',
  hrefs,
  current,
}: {
  className?: string;
  hrefs?: Partial<Record<Lang, string | null>>;
  /** Language of the page itself (URL-based pages); defaults to the saved language. */
  current?: Lang;
}) {
  const { lang, setLang } = useLanguage();
  const router = useRouter();
  const active = current ?? lang;

  const choose = (code: Lang) => {
    setLang(code);
    const href = hrefs?.[code];
    if (href && code !== current) router.push(href);
  };

  return (
    <div
      role="group"
      aria-label="Language switch"
      className={`inline-flex overflow-hidden rounded-full border border-white/15 text-xs font-semibold ${className}`}
    >
      {LANGS.map((code) => {
        const disabled = hrefs !== undefined && code !== current && !hrefs[code];
        return (
          <button
            key={code}
            type="button"
            onClick={() => choose(code)}
            disabled={disabled}
            aria-pressed={active === code}
            className={`px-3 py-1 uppercase tracking-[0.18em] transition disabled:opacity-30 ${
              active === code ? 'bg-white text-black' : 'bg-transparent text-slate-300 hover:bg-slate-900 hover:text-sky-300'
            }`}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
