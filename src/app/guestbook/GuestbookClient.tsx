'use client';

// Guestbook UI backed by the Cloudflare D1 API at guestbook.kasion.dev.
import { useCallback, useEffect, useState } from 'react';

import { useLanguage } from '@/components/LanguageProvider';
import type { Lang } from '@/lib/i18n';

const API = 'https://guestbook.kasion.dev/messages';

type Message = { id: number; name: string | null; message: string; created_at: string };

const T = {
  th: {
    title: 'ฝากข้อความ',
    hint: 'ข้อความจะแสดงแบบสาธารณะ ไม่ต้องใส่ชื่อก็ได้',
    name: 'ชื่อ',
    message: 'ข้อความ',
    placeholder: 'ทักทาย ถามคำถาม หรือเล่าว่ามาจากไหนก็ได้ครับ',
    send: 'ส่งข้อความ',
    sending: 'กำลังส่ง…',
    loading: 'กำลังโหลด…',
    count: (n: number) => `${n} ข้อความล่าสุด`,
    refresh: 'รีเฟรช',
    loadError: 'โหลดข้อความไม่สำเร็จ',
    empty: 'ยังไม่มีข้อความ — เป็นคนแรกเลยครับ',
    failed: 'ส่งไม่สำเร็จ ลองใหม่อีกครั้งครับ',
    offline: 'เชื่อมต่อไม่ได้ ลองใหม่อีกครั้งครับ',
    errors: {
      message_too_short: 'ข้อความสั้นเกินไป',
      too_many_links: 'ใส่ลิงก์ได้ไม่เกิน 1 ลิงก์',
      rate_limited: 'ส่งถี่เกินไป ลองใหม่อีก 10 นาทีครับ',
    } as Record<string, string>,
  },
  en: {
    title: 'Leave a message',
    hint: 'Messages are public. Your name is optional.',
    name: 'Name',
    message: 'Message',
    placeholder: 'Say hi, ask a question, or tell me where you are from',
    send: 'Send message',
    sending: 'Sending…',
    loading: 'Loading…',
    count: (n: number) => `${n} latest messages`,
    refresh: 'Refresh',
    loadError: 'Could not load messages',
    empty: 'No messages yet — be the first',
    failed: 'Could not send, please try again',
    offline: 'Connection failed, please try again',
    errors: {
      message_too_short: 'Message is too short',
      too_many_links: 'Only one link is allowed',
      rate_limited: 'Too many messages, try again in 10 minutes',
    } as Record<string, string>,
  },
};

function timeAgo(iso: string, lang: Lang): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  const en = lang === 'en';
  if (diff < 60) return en ? 'just now' : 'เมื่อสักครู่';
  if (diff < 3600) return en ? `${Math.floor(diff / 60)}m ago` : `${Math.floor(diff / 60)} นาทีที่แล้ว`;
  if (diff < 86400) return en ? `${Math.floor(diff / 3600)}h ago` : `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
  if (diff < 86400 * 30) return en ? `${Math.floor(diff / 86400)}d ago` : `${Math.floor(diff / 86400)} วันที่แล้ว`;
  return new Date(iso).toLocaleDateString(en ? 'en-US' : 'th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function GuestbookClient() {
  const { lang } = useLanguage();
  const t = T[lang];
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
        setError(t.errors[data.error] ?? t.failed);
        return;
      }
      if (data.message) setMessages((prev) => [data.message as Message, ...(prev ?? [])]);
      setText('');
    } catch {
      setError(t.offline);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[22rem_1fr]">
      <form onSubmit={submit} className="h-fit rounded-3xl border border-white/10 bg-[#0a0b0f] p-6 lg:sticky lg:top-28">
        <p className="text-lg font-medium">{t.title}</p>
        <p className="mt-1 text-sm text-white/45">{t.hint}</p>

        <label className="mt-5 block text-xs text-white/50" htmlFor="gb-name">
          {t.name}
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
          {t.message}
        </label>
        <textarea
          id="gb-message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          minLength={2}
          maxLength={500}
          rows={5}
          placeholder={t.placeholder}
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
          {sending ? t.sending : t.send}
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
            {messages === null ? t.loading : t.count(messages.length)}
          </p>
          <button type="button" onClick={load} className="text-sm text-white/45 transition hover:text-white">
            {t.refresh}
          </button>
        </div>

        {loadError ? <p className="mt-6 text-sm text-rose-300">{t.loadError}</p> : null}
        {messages && messages.length === 0 && !loadError ? (
          <div className="mt-6 rounded-3xl border border-dashed border-white/15 p-10 text-center text-white/45">
            {t.empty}
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
                  <p className="text-xs text-white/40">{timeAgo(m.created_at, lang)}</p>
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
