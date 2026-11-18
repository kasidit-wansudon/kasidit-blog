'use client';

import { useLanguage } from '@/components/LanguageProvider';

const T = {
  th: {
    h1: 'ทักทายกันหน่อย',
    lead: 'อ่านบทความแล้วมีคำถาม อยากคุยเรื่อง AI agent หรือแค่แวะมาบอกว่ามาจากไหน — เขียนไว้ตรงนี้ได้เลยครับ',
  },
  en: {
    h1: 'Say hello',
    lead: 'Questions about a post, want to talk AI agents, or just dropping by to say where you are from — write it here.',
  },
};

export default function GuestbookHeader() {
  const { lang } = useLanguage();
  const t = T[lang];
  return (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8fb0ff]">Guestbook</p>
      <h1 className="animate-rise mt-4 text-5xl font-medium leading-[1.05] tracking-[-0.05em] md:text-7xl">{t.h1}</h1>
      <p className="mt-6 max-w-xl text-white/60 md:text-lg">{t.lead}</p>
    </>
  );
}
