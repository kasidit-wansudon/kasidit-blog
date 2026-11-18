// src/app/guestbook/page.tsx — guestbook backed by Cloudflare D1 (guestbook.kasion.dev)
import type { Metadata } from 'next';

import SiteNav from '@/components/SiteNav';
import { SITE_URL } from '@/lib/blog';
import GuestbookClient from './GuestbookClient';
import GuestbookHeader from './GuestbookHeader';

export const metadata: Metadata = {
  title: 'Guestbook | Kasidit Wansudon',
  description:
    'Guestbook ของ Kasidit Wansudon — ฝากข้อความ ทักทาย หรือถามเรื่อง AI และ coding / Leave a message, say hi or ask about AI and coding.',
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
          <GuestbookHeader />
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-4 pb-28">
        <GuestbookClient />
      </section>
    </main>
  );
}
