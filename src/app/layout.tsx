// src/app/layout.tsx
// Comment in English
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kasidit Wansudon',
  description: 'Personal blog and guestbook of Kasidit Wansudon',
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
