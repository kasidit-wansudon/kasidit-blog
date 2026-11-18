'use client';

// Keeps the blog in the visitor's saved language:
// - if they explicitly chose the other language before and this page has a counterpart, go there
// - otherwise align the site-wide language with this page (without marking it as a choice)
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { explicitLang, useLanguage } from '@/components/LanguageProvider';
import type { BlogLang } from '@/lib/blog-shared';

const isBot = () => typeof navigator !== 'undefined' && /bot|crawl|spider|slurp|lighthouse/i.test(navigator.userAgent);

export default function BlogLangSync({ lang, otherHref }: { lang: BlogLang; otherHref: string | null }) {
  const router = useRouter();
  const { setLang } = useLanguage();

  useEffect(() => {
    const chosen = explicitLang();
    if (chosen && chosen !== lang && otherHref && !isBot()) {
      router.replace(otherHref);
      return;
    }
    setLang(lang, { explicit: false });
  }, [lang, otherHref, router, setLang]);

  return null;
}
