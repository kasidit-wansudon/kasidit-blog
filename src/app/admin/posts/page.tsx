// src/app/admin/posts/page.tsx
// Comment in English
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

async function createPost(formData: FormData) {
  'use server';

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const title = formData.get('title')?.toString().trim() || '';
  const slug = formData.get('slug')?.toString().trim() || '';
  const excerpt = formData.get('excerpt')?.toString().trim() || '';
  const content = formData.get('content')?.toString().trim() || '';

  if (!title || !slug || !content) return;

  await supabase.from('posts').insert({
    title,
    slug,
    excerpt,
    content,
  });

  revalidatePath('/');
  revalidatePath('/blog');
}

export default async function AdminPostsPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-semibold">Admin · Posts</h1>

        {/* Create form */}
        <section className="mb-8 rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="mb-3 text-sm font-medium text-slate-200">
            New post
          </h2>
          <form action={createPost} className="space-y-3 text-sm">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-slate-400">
                  Title
                </label>
                <input
                  name="title"
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">
                  Image URL (optional)
                </label>
                <input
                  name="image_url"
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  placeholder="https://example.com/image.png"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-400">
                  Slug (URL)
                </label>
                <input
                  name="slug"
                  placeholder="my-first-post"
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">
                Excerpt
              </label>
              <input
                name="excerpt"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">
                Content (Markdown or plain text)
              </label>
              <textarea
                name="content"
                className="min-h-[180px] w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                required
              />
            </div>

            <button
              type="submit"
              className="mt-2 rounded-md bg-sky-500 px-4 py-2 text-xs font-medium text-slate-950 hover:bg-sky-400"
            >
              Publish
            </button>
          </form>
        </section>

        {/* List posts */}
        <section className="space-y-3 text-sm">
          <h2 className="text-sm font-medium text-slate-200">
            Existing posts
          </h2>
          {posts?.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3"
            >
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-slate-500">
                  /blog/{p.slug}
                </p>
              </div>
              <span className="text-xs text-slate-500">
                {new Date(p.created_at).toLocaleDateString('th-TH')}
              </span>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
