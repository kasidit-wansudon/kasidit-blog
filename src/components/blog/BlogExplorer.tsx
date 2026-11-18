'use client';

// Client-side tag filter + search over the (statically rendered) post list.
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { blogPath, type BlogLang, type PostMeta } from '@/lib/blog-shared';
import { BLOG_TEXT } from './text';

/** Compact age of a post: 3d, 2w, 5mo, 1y (computed in the browser so it never goes stale). */
function age(date: string, now: number): string {
  const days = Math.max(0, Math.floor((now - new Date(`${date}T12:00:00Z`).getTime()) / 86_400_000));
  if (days < 1) return 'today';
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}w`;
  if (days < 365) return `${Math.floor(days / 30.44)}mo`;
  return `${Math.floor(days / 365.25)}y`;
}

export default function BlogExplorer({
  posts,
  dates,
  lang,
}: {
  posts: PostMeta[];
  dates: Record<string, string>;
  lang: BlogLang;
}) {
  const tx = BLOG_TEXT[lang];
  const [tag, setTag] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);

  const tags = useMemo(() => {
    const count = new Map<string, number>();
    posts.forEach((p) => p.tags.forEach((t) => count.set(t, (count.get(t) ?? 0) + 1)));
    return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14);
  }, [posts]);

  const shown = posts.filter((p) => {
    if (tag && !p.tags.includes(tag)) return false;
    if (!q.trim()) return true;
    const s = q.trim().toLowerCase();
    return p.title.toLowerCase().includes(s) || p.excerpt.toLowerCase().includes(s) || p.tags.some((t) => t.includes(s));
  });

  // Group by year for a timeline feel.
  const byYear = shown.reduce<Record<string, PostMeta[]>>((acc, p) => {
    (acc[p.date.slice(0, 4)] ??= []).push(p);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTag(null)}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
              !tag ? 'border-white bg-white text-black' : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white'
            }`}
          >
            All <span className={!tag ? 'text-black/50' : 'text-white/30'}>{posts.length}</span>
          </button>
          {tags.map(([t, n]) => (
            <button
              key={t}
              type="button"
              onClick={() => setTag(t === tag ? null : t)}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                t === tag ? 'border-white bg-white text-black' : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white'
              }`}
            >
              {t} <span className={t === tag ? 'text-black/50' : 'text-white/30'}>{n}</span>
            </button>
          ))}
        </div>
        <label className="relative block md:w-64">
          <span className="sr-only">{tx.search}</span>
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tx.search}
            className="h-10 w-full rounded-full border border-white/10 bg-white/[0.03] pl-10 pr-4 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#2f6bff]/60"
          />
        </label>
      </div>

      {shown.length === 0 ? <p className="mt-16 text-center text-white/45">{tx.empty}</p> : null}

      {Object.entries(byYear)
        .sort((a, b) => (a[0] < b[0] ? 1 : -1))
        .map(([year, list]) => (
          <section key={year} className="mt-14">
            <h2 className="flex items-center gap-4 text-sm font-medium text-white/40">
              {year}
              <span className="h-px flex-1 bg-white/10" />
              <span>
                {list.length} {tx.posts}
              </span>
            </h2>
            <ul className="mt-4 divide-y divide-white/[0.06]">
              {list.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={blogPath(lang, p.slug)}
                    className="group grid gap-2 py-5 transition md:grid-cols-[7.5rem_1fr_auto] md:items-baseline md:gap-6"
                  >
                    <time dateTime={p.date} className="text-sm text-white/40">
                      {dates[p.slug]}
                    </time>
                    <span>
                      <span className="block text-lg font-medium tracking-tight text-white transition group-hover:text-[#b9ccff]">
                        {p.title}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-white/50">{p.excerpt}</span>
                    </span>
                    <span
                      className="text-xs tabular-nums text-white/35 md:min-w-10 md:text-right"
                      title={tx.readTime(p.readingMinutes)}
                    >
                      {now ? age(p.date, now) : ''}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
    </div>
  );
}
