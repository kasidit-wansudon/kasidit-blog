'use client';

// Guestbook UI backed by the Cloudflare D1 API at guestbook.kasion.dev.
import { useCallback, useEffect, useState } from 'react';

const API = 'https://guestbook.kasion.dev/messages';

type Message = { id: number; name: string | null; message: string; created_at: string };

const ERRORS: Record<string, string> = {
  message_too_short: 'ข้อความสั้นเกินไป',
  too_many_links: 'ใส่ลิงก์ได้ไม่เกิน 1 ลิงก์',
  rate_limited: 'ส่งถี่เกินไป ลองใหม่อีก 10 นาทีครับ',
};

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'เมื่อสักครู่';
  if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)} วันที่แล้ว`;
  return new Date(iso).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function GuestbookClient() {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API}?limit=50`, { cache: 'no-store' });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { messages: Message[] };
      setMessages(data.messages);
      setLoadError(false);
    } catch {
      setLoadError(true);
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setError('');
    setSending(true);
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message: text, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(ERRORS[data.error] ?? 'ส่งไม่สำเร็จ ลองใหม่อีกครั้งครับ');
        return;
      }
      if (data.message) setMessages((prev) => [data.message as Message, ...(prev ?? [])]);
      setText('');
    } catch {
      setError('เชื่อมต่อไม่ได้ ลองใหม่อีกครั้งครับ');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[22rem_1fr]">
      <form onSubmit={submit} className="h-fit rounded-3xl border border-white/10 bg-[#0a0b0f] p-6 lg:sticky lg:top-28">
        <p className="text-lg font-medium">ฝากข้อความ</p>
        <p className="mt-1 text-sm text-white/45">ข้อความจะแสดงแบบสาธารณะ ไม่ต้องใส่ชื่อก็ได้</p>

        <label className="mt-5 block text-xs text-white/50" htmlFor="gb-name">
          ชื่อ
        </label>
        <input
          id="gb-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          placeholder="Anonymous"
          className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-black px-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#2f6bff]/70"
        />

        <label className="mt-4 block text-xs text-white/50" htmlFor="gb-message">
          ข้อความ
        </label>
        <textarea
          id="gb-message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          minLength={2}
          maxLength={500}
          rows={5}
          placeholder="ทักทาย ถามคำถาม หรือเล่าว่ามาจากไหนก็ได้ครับ"
          className="mt-1.5 w-full resize-none rounded-xl border border-white/10 bg-black px-3.5 py-3 text-sm leading-relaxed text-white placeholder:text-white/30 outline-none focus:border-[#2f6bff]/70"
        />
        <p className="mt-1 text-right text-[11px] text-white/30">{text.length}/500</p>

        {/* Honeypot, hidden from people and assistive tech */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
          name="website"
        />

        {error ? <p className="mt-2 text-sm text-rose-300">{error}</p> : null}

        <button
          type="submit"
          disabled={sending || text.trim().length < 2}
          className="group mt-4 inline-flex w-full items-center justify-between rounded-full bg-white py-1.5 pl-5 pr-1.5 text-[15px] font-semibold text-black shadow-[0_18px_40px_-18px_rgba(47,107,255,0.85)] transition disabled:opacity-40"
        >
          {sending ? 'กำลังส่ง…' : 'ส่งข้อความ'}
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#2f6bff] text-white transition group-enabled:group-hover:rotate-45">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
              <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      </form>

      <section aria-live="polite">
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/45">
            {messages === null ? 'กำลังโหลด…' : `${messages.length} ข้อความล่าสุด`}
          </p>
          <button type="button" onClick={load} className="text-sm text-white/45 transition hover:text-white">
            รีเฟรช
          </button>
        </div>

        {loadError ? <p className="mt-6 text-sm text-rose-300">โหลดข้อความไม่สำเร็จ</p> : null}
        {messages && messages.length === 0 && !loadError ? (
          <div className="mt-6 rounded-3xl border border-dashed border-white/15 p-10 text-center text-white/45">
            ยังไม่มีข้อความ — เป็นคนแรกเลยครับ
          </div>
        ) : null}

        <ul className="mt-6 space-y-3">
          {(messages ?? []).map((m) => (
            <li key={m.id} className="rounded-2xl border border-white/10 bg-[#0a0b0f] p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-linear-to-br from-[#2f6bff] to-[#8fb0ff] text-sm font-semibold text-black">
                  {(m.name || 'A').slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-medium">{m.name || 'Anonymous'}</p>
                  <p className="text-xs text-white/40">{timeAgo(m.created_at)}</p>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words leading-relaxed text-white/75">{m.message}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
