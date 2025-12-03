// src/app/layout.tsx
// Comment in English
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kasidit Wansudon | Full‑stack Developer',
  description:
    'Kasidit Wansudon – Full‑stack developer in Bangkok. Sharing blog posts, real-world projects, and a guestbook for feedback.',
  metadataBase: new URL('https://kasidit-wans.com'),
  alternates: {
    canonical: 'https://kasidit-wans.com',
  },
  openGraph: {
    title: 'Kasidit Wansudon | Full‑stack Developer',
    description:
      'Personal blog, projects, and guestbook by Kasidit Wansudon.',
    url: 'https://kasidit-wans.com',
    siteName: 'Kasidit Wansudon',
    type: 'website',
    images: [
      {
        url: 'https://kasidit-wans.com/favicon.ico',
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
    images: ['https://kasidit-wans.com/favicon.ico'],
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="bg-slate-950 text-slate-50">
        {children}
      </body>
    </html>
  );
}
