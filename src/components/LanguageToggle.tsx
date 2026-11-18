'use client';

import { useLanguage } from './LanguageProvider';
import { LANGS } from '@/lib/i18n';

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { lang, setLang } = useLanguage();
  return (
    <div
      role="group"
      aria-label="Language switch"
      className={`inline-flex overflow-hidden rounded-full border border-white/15 text-xs font-semibold ${className}`}
    >
      {LANGS.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`px-3 py-1 uppercase tracking-[0.18em] transition ${
            lang === code
              ? 'bg-white text-black'
              : 'bg-transparent text-slate-300 hover:bg-slate-900 hover:text-sky-300'
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
