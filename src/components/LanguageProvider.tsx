'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import type { Lang } from '@/lib/i18n';

type Ctx = {
  lang: Lang;
  /** `explicit` (default true) marks a choice the visitor made; blog pages only auto-switch on explicit choices. */
  setLang: (l: Lang, opts?: { explicit?: boolean }) => void;
};

const LanguageContext = createContext<Ctx | null>(null);

export const STORAGE_KEY = 'kw-lang';
export const EXPLICIT_KEY = 'kw-lang-explicit';

const read = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage blocked: language just won't persist */
  }
};

const detect = (): Lang => {
  if (typeof window === 'undefined') return 'th';
  const stored = read(STORAGE_KEY);
  if (stored === 'th' || stored === 'en') return stored;
  const nav = window.navigator?.language?.toLowerCase() ?? '';
  return nav.startsWith('th') ? 'th' : 'en';
};

/** The language the visitor picked themselves (via a toggle), or null. */
export function explicitLang(): Lang | null {
  if (typeof window === 'undefined' || read(EXPLICIT_KEY) !== '1') return null;
  const stored = read(STORAGE_KEY);
  return stored === 'th' || stored === 'en' ? stored : null;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('th');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLangState(detect());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    write(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang, hydrated]);

  const setLang = useCallback((next: Lang, opts?: { explicit?: boolean }) => {
    if (opts?.explicit !== false) {
      write(EXPLICIT_KEY, '1');
      write(STORAGE_KEY, next);
    }
    setLangState(next);
  }, []);

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return { lang: 'th', setLang: () => {} };
  }
  return ctx;
}
