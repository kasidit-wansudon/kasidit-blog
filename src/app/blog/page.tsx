// src/app/blog/page.tsx
export const runtime = 'edge';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import BlogList from './BlogList';

export default async function BlogPage() {
  const supabase = await createSupabaseServerClient();
  const { data: posts } = await supabase
    .from('posts')
    .select('id, slug, title, excerpt, content, created_at, image_url')
    .eq('published', true)
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-4 text-2xl font-semibold">Blog</h1>
        <p className="mb-6 text-sm text-slate-400">
          รวมบทความ dev, ระบบจริงที่ทำ และโน้ตการเรียนรู้ของ Kasidit Wansudon.
        </p>

        <BlogList posts={posts ?? []} />
      </div>
    </main>
  );
}
