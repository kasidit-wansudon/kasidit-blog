import Link from 'next/link';

const ITEMS = [
  { href: '/blog', label: 'Blog' },
  { href: '/guestbook', label: 'Guestbook' },
  { href: '/resume', label: 'Resume' },
];

/** Floating pill nav for sub pages (blog, guestbook). `section` is shown after the logo. */
export default function SiteNav({ section, active }: { section?: string; active?: string }) {
  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border border-white/10 bg-black/60 py-2 pl-5 pr-2 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-white text-[11px] font-bold text-black">K</span>
          kasidit
          {section ? <span className="hidden text-white/35 sm:inline">/ {section}</span> : null}
        </Link>
        <div className="flex items-center gap-1">
          {ITEMS.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              aria-current={active === i.href ? 'page' : undefined}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                active === i.href ? 'bg-white text-black' : 'text-white/65 hover:bg-white/5 hover:text-white'
              }`}
            >
              {i.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
