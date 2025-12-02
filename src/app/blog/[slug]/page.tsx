// src/app/blog/[slug]/page.tsx
// Comment in English
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { notFound } from 'next/navigation';

interface Props {
  params: { slug: string };
}

export default async function BlogPostPage({ params }: Props) {
  const supabase = await createSupabaseServerClient(); // <- ใส่ await

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('published', true)
    .single();

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-xs uppercase tracking-[0.25em] text-sky-400">
          Blog
        </p>
        <h1 className="mt-2 text-2xl font-semibold">{post.title}</h1>
        <p className="mt-1 text-xs text-slate-500">
          {new Date(post.created_at).toLocaleString('th-TH')}
        </p>

        <article className="prose prose-invert mt-6 max-w-none text-sm">
          {(post.content ?? '')
            .split('\n')
            .map((line: string, idx: number) => (
              <p key={idx}>{line}</p>
            ))}
        </article>
      </div>
    </main>
  );
}
