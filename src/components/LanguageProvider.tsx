'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import type { Lang } from '@/lib/i18n';

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
};

const LanguageContext = createContext<Ctx | null>(null);

const STORAGE_KEY = 'kw-lang';

const detect = (): Lang => {
  if (typeof window === 'undefined') return 'th';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'th' || stored === 'en') return stored;
  const nav = window.navigator?.language?.toLowerCase() ?? '';
  return nav.startsWith('th') ? 'th' : 'en';
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('th');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLangState(detect());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang, hydrated]);

  const setLang = (next: Lang) => setLangState(next);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return { lang: 'th', setLang: () => {} };
  }
  return ctx;
}
