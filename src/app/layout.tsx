// src/app/layout.tsx
// Comment in English
import type { Metadata } from 'next';
import { Inter, Noto_Sans_Thai } from 'next/font/google';
import { LanguageProvider } from '@/components/LanguageProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const notoThai = Noto_Sans_Thai({ subsets: ['thai'], variable: '--font-thai', display: 'swap' });

export const metadata: Metadata = {
  title: 'Kasidit Wansudon | Full‑stack Developer',
  description:
    'Kasidit Wansudon – Full‑stack developer & PM based in Mexico City. Sharing blog posts, real-world projects, and a guestbook for feedback.',
  metadataBase: new URL('https://kasidit-wans.com'),
  alternates: {
    canonical: 'https://kasidit-wans.com',
  },
  keywords: [
    'Kasidit Wansudon',
    'Full-stack Developer',
    'Bangkok',
    'Thailand',
    'Blog',
    'Projects',
    'Guestbook',
    'กษิดิศ วันสุดล',
  ],
  openGraph: {
    title: 'Kasidit Wansudon | Full‑stack Developer',
    description:
      'Personal blog, projects, and guestbook by Kasidit Wansudon.',
    url: './', // use metadataBase + relative URL
    siteName: 'Kasidit Wansudon',
    type: 'website',
    locale: 'th_TH',
    images: [
      {
        url: '/og-image.png', // สร้างไฟล์ทีหลังได้ ตอนนี้จะชี้ path นี้ไว้ก่อน
        width: 1200,
        height: 630,
        alt: 'Kasidit Wansudon | Full‑stack Developer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kasidit Wansudon | Full‑stack Developer',
    description:
      'Blog, projects, and guestbook by Kasidit Wansudon.',
    site: '@KasiditWans',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/png', sizes: '32x32' }],
    shortcut: ['/favicon.ico'],
    apple: [{ url: '/favicon.ico', type: 'image/png' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${inter.variable} ${notoThai.variable}`}>
      <body className="bg-slate-950 text-slate-50">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
