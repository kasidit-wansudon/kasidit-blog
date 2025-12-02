'use client';

// Comment in English
import { useState } from 'react';

type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  created_at: string;
  image_url?: string | null;
};

interface Props {
  posts: Post[];
}

export default function BlogList({ posts }: Props) {
  const [openPost, setOpenPost] = useState<Post | null>(null);

  return (
    <>
      <div className="space-y-4">
        {posts.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setOpenPost(p)}
            className="block w-full rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 text-left hover:border-sky-500/70"
          >
            <h2 className="text-base font-medium">{p.title}</h2>
            <p className="mt-1 text-xs text-slate-400">
              {p.excerpt}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              {new Date(p.created_at).toLocaleDateString('th-TH')}
            </p>
          </button>
        ))}
      </div>

      {/* Detail modal */}
      {openPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setOpenPost(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()} // prevent close when click inside
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-sky-400">
                  Blog
                </p>
                <h2 className="mt-1 text-xl font-semibold">
                  {openPost.title}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(openPost.created_at).toLocaleString('th-TH')}
                </p>
              </div>
              <button
                type="button"
                className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700"
                onClick={() => setOpenPost(null)}
              >
                Close
              </button>
            </div>

            {openPost.image_url && (
              <div className="mt-4 overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={openPost.image_url}
                  alt={openPost.title}
                  className="max-h-[320px] w-full object-cover"
                />
              </div>
            )}
            <article className="prose prose-invert mt-4 max-w-none text-sm">
              {(openPost.content ?? '')
                .split('\n')
                .map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
            </article>
          </div>
        </div >
      )
      }
    </>
  );
}
