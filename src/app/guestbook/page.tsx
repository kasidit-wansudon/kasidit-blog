// src/app/guestbook/page.tsx
// Comment in English
export const runtime = 'edge';
import { revalidatePath } from 'next/cache';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

async function addMessage(formData: FormData) {
  'use server';

  const name = formData.get('name')?.toString().trim() || null;
  const message = formData.get('message')?.toString().trim() || '';

  if (!message) return;

  await createSupabaseBrowserClient().from('messages').insert({ name, message });
  revalidatePath('/guestbook');
}

export default async function GuestbookPage() {
  const { data: messages } = await createSupabaseBrowserClient()
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* Header */}
        <header className="mb-8 border-b border-slate-800 pb-5">
          <p className="text-xs uppercase tracking-[0.35em] text-sky-400">
            Kasidit Wansudon
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Guestbook
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            ฝากข้อความถึงผมได้เลย จะใส่ชื่อหรือไม่ก็ได้ ข้อความจะถูกแสดงด้านล่างแบบสาธารณะ.
          </p>
        </header>

        {/* Form */}
        <section className="mb-10 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/40 backdrop-blur">
          <form action={addMessage} className="space-y-4">
            <div className="flex flex-col gap-2 text-sm md:flex-row">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-slate-400">
                  ชื่อ (ไม่ใส่ก็ได้)
                </label>
                <input
                  name="name"
                  placeholder="Anonymous"
                  className="h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="text-sm">
              <label className="mb-1 block text-xs text-slate-400">
                ข้อความ
              </label>
              <textarea
                name="message"
                placeholder="อยากบอกอะไรกับผมเกี่ยวกับ dev, content หรือ feedback เว็บนี้ก็ได้เลย 🙂"
                className="min-h-[100px] w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                maxLength={500}
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>จำกัด 500 ตัวอักษร ป้องกันสแปมเล็กน้อย</span>
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-md bg-sky-500 px-4 py-1.5 text-xs font-medium text-slate-950 shadow-md shadow-sky-500/40 hover:bg-sky-400 active:scale-[0.98]"
              >
                ส่งข้อความ
              </button>
            </div>
          </form>
        </section>

        {/* Messages */}
        <section className="space-y-3">
          <h2 className="mb-2 text-sm font-medium text-slate-300">
            ข้อความล่าสุด
          </h2>

          {(!messages || messages.length === 0) && (
            <p className="text-sm text-slate-500">
              ยังไม่มีใครฝากข้อความ ลองเขียนอันแรกดูเลย 😄
            </p>
          )}

          {messages?.map((m) => (
            <article
              key={m.id}
              className="group rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-100 transition hover:border-sky-500/60 hover:bg-slate-900/80"
            >
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-200">
                    {m.name || 'Anonymous'}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-slate-600" />
                  <span className="text-[11px] text-slate-500">
                    {new Date(m.created_at).toLocaleString('th-TH')}
                  </span>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-slate-100">
                {m.message}
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
