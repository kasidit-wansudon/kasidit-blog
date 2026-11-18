// Blog index page body, shared by /blog (th) and /en/blog (en).
import type { Metadata } from 'next';
import Link from 'next/link';

import SiteNav from '@/components/SiteNav';
import { blogPath, formatDate, getAllPosts, SITE_URL, type BlogLang } from '@/lib/blog';
import BlogExplorer from './BlogExplorer';
import BlogLangSync from './BlogLangSync';
import LangSwitch from './LangSwitch';
import { BLOG_TEXT } from './text';

export function blogIndexMetadata(lang: BlogLang): Metadata {
  const tx = BLOG_TEXT[lang];
  const url = `${SITE_URL}${blogPath(lang)}`;
  return {
    title: tx.metaTitle,
    description: tx.metaDesc,
    alternates: {
      canonical: url,
      languages: { th: `${SITE_URL}/blog`, en: `${SITE_URL}/en/blog`, 'x-default': `${SITE_URL}/blog` },
      types: { 'application/rss+xml': `${url}/rss.xml` },
    },
    openGraph: {
      type: 'website',
      url,
      title: tx.metaTitle,
      description: tx.metaDesc,
      locale: lang === 'en' ? 'en_US' : 'th_TH',
      images: ['/og-image.png'],
    },
  };
}

export default function BlogIndex({ lang }: { lang: BlogLang }) {
  const tx = BLOG_TEXT[lang];
  const posts = getAllPosts(lang);
  const [latest] = posts;
  const dates = Object.fromEntries(posts.map((p) => [p.slug, formatDate(p.date, lang)]));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Kasidit Wansudon — Blog',
    url: `${SITE_URL}${blogPath(lang)}`,
    inLanguage: lang,
    author: { '@type': 'Person', name: 'Kasidit Wansudon', url: SITE_URL },
    blogPost: posts.slice(0, 20).map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      datePublished: p.date,
      url: `${SITE_URL}${blogPath(lang, p.slug)}`,
    })),
  };

  return (
    <main lang={lang} className="min-h-screen overflow-x-hidden bg-black text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteNav section="blog" active="/blog" pageLang={lang} langHrefs={{ th: '/blog', en: '/en/blog' }} />
      <BlogLangSync lang={lang} otherHref={lang === 'th' ? '/en/blog' : '/blog'} />

      <section className="relative px-4 pb-10 pt-36 md:pt-40">
        <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute left-1/2 top-20 h-[360px] w-[680px] max-w-full -translate-x-1/2 rounded-full bg-[#2f6bff]/20 blur-[120px]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8fb0ff]">{tx.eyebrow}</p>
            <LangSwitch lang={lang} thHref="/blog" enHref="/en/blog" />
          </div>
          <h1 className="animate-rise mt-4 text-5xl font-medium leading-[1.05] tracking-[-0.05em] md:text-7xl">
            {tx.h1a}
            <br />
            <span className="text-white/45">{tx.h1b}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-white/60 md:text-lg">{tx.lead}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/45">
            <span>{tx.count(posts.length)}</span>
            <span className="h-3 w-px bg-white/15" />
            <a href={`${blogPath(lang)}/rss.xml`} className="inline-flex items-center gap-1.5 transition hover:text-white">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                <path d="M5 11a8 8 0 0 1 8 8M5 5a14 14 0 0 1 14 14" strokeLinecap="round" />
                <circle cx="6" cy="18" r="1.4" fill="currentColor" />
              </svg>
              RSS
            </a>
          </div>

          {latest ? (
            <Link
              href={blogPath(lang, latest.slug)}
              className="group relative mt-12 block overflow-hidden rounded-3xl border border-[#2f6bff]/40 bg-linear-to-br from-[#2f6bff]/15 via-[#0a0b0f] to-[#0a0b0f] p-7 transition hover:border-[#8fb0ff] md:p-10"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b9ccff]">
                {tx.latest} · {formatDate(latest.date, lang)}
              </p>
              <h2 className="mt-3 max-w-3xl text-2xl font-medium leading-snug tracking-[-0.03em] md:text-4xl">{latest.title}</h2>
              <p className="mt-3 max-w-2xl text-white/60">{latest.excerpt}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white/85 group-hover:text-white">
                {tx.readMore}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                  <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-28">
        <BlogExplorer posts={posts} dates={dates} lang={lang} />
      </section>
    </main>
  );
}
