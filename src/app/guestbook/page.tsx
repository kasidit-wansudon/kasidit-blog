// src/app/guestbook/page.tsx — guestbook backed by Cloudflare D1 (guestbook.kasion.dev)
import type { Metadata } from 'next';

import SiteNav from '@/components/SiteNav';
import { SITE_URL } from '@/lib/blog';
import GuestbookClient from './GuestbookClient';

export const metadata: Metadata = {
  title: 'Guestbook | Kasidit Wansudon',
  description: 'ฝากข้อความถึง Kasidit Wansudon — ทักทาย ถามเรื่อง AI, coding หรือการทำงานที่เม็กซิโกได้เลย',
  alternates: { canonical: `${SITE_URL}/guestbook` },
};

export default function GuestbookPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <SiteNav section="guestbook" active="/guestbook" />
      <section className="relative px-4 pb-10 pt-36 md:pt-40">
        <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute left-1/2 top-20 h-[340px] w-[640px] max-w-full -translate-x-1/2 rounded-full bg-[#2f6bff]/20 blur-[120px]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8fb0ff]">Guestbook</p>
          <h1 className="animate-rise mt-4 text-5xl font-medium leading-[1.05] tracking-[-0.05em] md:text-7xl">
            ทักทายกันหน่อย
          </h1>
          <p className="mt-6 max-w-xl text-white/60 md:text-lg">
            อ่านบทความแล้วมีคำถาม อยากคุยเรื่อง AI agent หรือแค่แวะมาบอกว่ามาจากไหน — เขียนไว้ตรงนี้ได้เลยครับ
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-4 pb-28">
        <GuestbookClient />
      </section>
    </main>
  );
}
