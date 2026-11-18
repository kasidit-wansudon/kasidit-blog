// Article page body + metadata, shared by /blog/[slug] (th) and /en/blog/[slug] (en).
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import SiteNav from '@/components/SiteNav';
import { blogPath, formatDate, getAllPosts, getPost, getRelated, hasPost, SITE_URL, type BlogLang } from '@/lib/blog';
import LangSwitch from './LangSwitch';
import { BLOG_TEXT } from './text';

export function postMetadata(slug: string, lang: BlogLang): Metadata {
  const post = getPost(slug, lang);
  if (!post) return {};
  const url = `${SITE_URL}${blogPath(lang, post.slug)}`;
  const languages: Record<string, string> = {};
  if (hasPost(post.slug, 'th')) languages.th = `${SITE_URL}${blogPath('th', post.slug)}`;
  if (hasPost(post.slug, 'en')) languages.en = `${SITE_URL}${blogPath('en', post.slug)}`;
  if (languages.th) languages['x-default'] = languages.th;
  return {
    title: `${post.title} | Kasidit Wansudon`,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: 'Kasidit Wansudon', url: SITE_URL }],
    alternates: { canonical: url, languages },
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      authors: ['Kasidit Wansudon'],
      tags: post.tags,
      locale: lang === 'en' ? 'en_US' : 'th_TH',
      images: ['/og-image.png'],
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.excerpt, site: '@KasiditWans' },
  };
}

export default function PostView({ slug, lang }: { slug: string; lang: BlogLang }) {
  const tx = BLOG_TEXT[lang];
  const post = getPost(slug, lang);
  if (!post) notFound();
  const other: BlogLang = lang === 'th' ? 'en' : 'th';
  const otherHref = hasPost(post.slug, other) ? blogPath(other, post.slug) : null;

  const all = getAllPosts(lang);
  const idx = all.findIndex((p) => p.slug === post.slug);
  const newer = idx > 0 ? all[idx - 1] : null;
  const older = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
  const related = getRelated(post, lang);
  const url = `${SITE_URL}${blogPath(lang, post.slug)}`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      dateModified: post.date,
      inLanguage: lang,
      keywords: post.tags.join(', '),
      mainEntityOfPage: url,
      url,
      image: `${SITE_URL}/og-image.png`,
      author: { '@type': 'Person', name: 'Kasidit Wansudon', url: SITE_URL },
      publisher: { '@type': 'Person', name: 'Kasidit Wansudon', url: SITE_URL },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}${blogPath(lang)}` },
        { '@type': 'ListItem', position: 3, name: post.title, item: url },
      ],
    },
  ];

  return (
    <main lang={lang} className="min-h-screen overflow-x-hidden bg-black text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteNav section="blog" active="/blog" />

      <header className="relative px-4 pb-10 pt-36 md:pt-40">
        <div
          className="pointer-events-none absolute left-1/2 top-16 h-[320px] w-[640px] max-w-full -translate-x-1/2 rounded-full bg-[#2f6bff]/15 blur-[110px]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-white/40">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link href={blogPath(lang)} className="hover:text-white">
              Blog
            </Link>
            <span className="ml-auto">
              <LangSwitch
                lang={lang}
                thHref={lang === 'th' ? null : otherHref}
                enHref={lang === 'en' ? null : otherHref}
              />
            </span>
          </nav>
          <h1 className="mt-5 text-3xl font-medium leading-[1.2] tracking-[-0.035em] md:text-5xl">{post.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-white/60">{post.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/45">
            <span className="text-white/75">Kasidit Wansudon</span>
            <span className="h-3 w-px bg-white/15" />
            <time dateTime={post.date}>{formatDate(post.date, lang)}</time>
            <span className="h-3 w-px bg-white/15" />
            <span>{tx.readTime(post.readingMinutes)}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {post.tags.map((t) => (
              <span key={t} className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-white/55">
                {t}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-20 lg:grid-cols-[1fr_15rem]">
        <article className="article mx-auto w-full max-w-3xl" dangerouslySetInnerHTML={{ __html: post.html }} />

        {post.headings.length > 2 ? (
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-2xl border border-white/10 bg-[#0a0b0f] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">{tx.toc}</p>
              <ol className="mt-3 space-y-2 text-sm">
                {post.headings.map((hd) => (
                  <li key={hd.id}>
                    <a href={`#${hd.id}`} className="text-white/55 transition hover:text-white">
                      {hd.text}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        ) : null}
      </div>

      <section className="mx-auto max-w-3xl px-4 pb-24">
        <div className="rounded-3xl border border-[#2f6bff]/40 bg-linear-to-br from-[#2f6bff]/12 to-[#0a0b0f] p-6 md:p-8">
          <p className="text-lg font-medium">{tx.ctaTitle}</p>
          <p className="mt-1 text-white/55">{tx.ctaBody}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/guestbook" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black">
              {tx.ctaGuestbook}
            </Link>
            <a
              href="https://x.com/KasiditWans"
              target="_blank"
              rel="noopener"
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/85 hover:border-white/40"
            >
              X / @KasiditWans
            </a>
          </div>
        </div>

        <nav className="mt-10 grid gap-3 sm:grid-cols-2" aria-label="Post navigation">
          {older ? (
            <Link href={blogPath(lang, older.slug)} className="rounded-2xl border border-white/10 p-5 transition hover:border-white/30">
              <span className="text-xs text-white/40">{tx.prev}</span>
              <span className="mt-1 block font-medium leading-snug">{older.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {newer ? (
            <Link
              href={blogPath(lang, newer.slug)}
              className="rounded-2xl border border-white/10 p-5 text-right transition hover:border-white/30"
            >
              <span className="text-xs text-white/40">{tx.next}</span>
              <span className="mt-1 block font-medium leading-snug">{newer.title}</span>
            </Link>
          ) : null}
        </nav>

        {related.length ? (
          <div className="mt-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8fb0ff]">{tx.related}</p>
            <ul className="mt-4 divide-y divide-white/[0.06]">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={blogPath(lang, r.slug)} className="group block py-4">
                    <span className="font-medium transition group-hover:text-[#b9ccff]">{r.title}</span>
                    <span className="mt-1 block text-sm text-white/45">{formatDate(r.date, lang)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </main>
  );
}
