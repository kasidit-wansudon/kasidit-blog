import Link from 'next/link';
import type { BlogLang } from '@/lib/blog-shared';

/** TH / EN pill linking to the same page in the other language (or null when there is no counterpart). */
export default function LangSwitch({
  lang,
  thHref,
  enHref,
}: {
  lang: BlogLang;
  thHref: string | null;
  enHref: string | null;
}) {
  const item = (code: BlogLang, href: string | null) => {
    const active = code === lang;
    const cls = `px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] transition ${
      active ? 'bg-white text-black' : 'text-white/60 hover:bg-white/5 hover:text-white'
    }`;
    if (active || !href) {
      return (
        <span key={code} className={`${cls} ${!active && !href ? 'opacity-30' : ''}`} aria-current={active ? 'page' : undefined}>
          {code}
        </span>
      );
    }
    return (
      <Link key={code} href={href} hrefLang={code} className={cls}>
        {code}
      </Link>
    );
  };
  return (
    <div role="group" aria-label="Language" className="inline-flex overflow-hidden rounded-full border border-white/15">
      {item('th', thHref)}
      {item('en', enHref)}
    </div>
  );
}
