'use client';

// Client-side tag filter + search over the (statically rendered) post list.
import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { PostMeta } from '@/lib/blog';

export default function BlogExplorer({ posts, dates }: { posts: PostMeta[]; dates: Record<string, string> }) {
  const [tag, setTag] = useState<string | null>(null);
  const [q, setQ] = useState('');

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
          <span className="sr-only">Search posts</span>
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
            placeholder="ค้นหาบทความ…"
            className="h-10 w-full rounded-full border border-white/10 bg-white/[0.03] pl-10 pr-4 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#2f6bff]/60"
          />
        </label>
      </div>

      {shown.length === 0 ? <p className="mt-16 text-center text-white/45">ไม่พบบทความ</p> : null}

      {Object.entries(byYear)
        .sort((a, b) => (a[0] < b[0] ? 1 : -1))
        .map(([year, list]) => (
          <section key={year} className="mt-14">
            <h2 className="flex items-center gap-4 text-sm font-medium text-white/40">
              {year}
              <span className="h-px flex-1 bg-white/10" />
              <span>{list.length} posts</span>
            </h2>
            <ul className="mt-4 divide-y divide-white/[0.06]">
              {list.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/blog/${p.slug}`}
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
                    <span className="text-xs text-white/35">{p.readingMinutes} นาที</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
    </div>
  );
}
