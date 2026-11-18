import Link from 'next/link';

type Icon = 'back' | 'arrow' | 'down' | 'download' | 'doc';

const PATHS: Record<Icon, React.ReactNode> = {
  back: <path d="M19 12H5m6-6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />,
  arrow: <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />,
  down: <path d="M12 5v14m-6-6 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />,
  download: <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14" strokeLinecap="round" strokeLinejoin="round" />,
  doc: <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Zm0 0v5h5M9 13h6M9 17h4" strokeLinecap="round" strokeLinejoin="round" />,
};

/**
 * Secondary "luxury" button: gradient hairline border, frosted glass fill,
 * inner highlight, and an icon chip that turns white on hover.
 */
export default function LuxButton({
  href,
  children,
  icon = 'arrow',
  iconSide = 'right',
  size = 'md',
  external = false,
  download = false,
  className = '',
}: {
  href: string;
  children: React.ReactNode;
  icon?: Icon;
  iconSide?: 'left' | 'right';
  size?: 'sm' | 'md';
  external?: boolean;
  download?: boolean;
  className?: string;
}) {
  const chip = (
    <span className={`btn-lux-icon btn-lux-icon-${icon}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
        {PATHS[icon]}
      </svg>
    </span>
  );
  const cls = `btn-lux ${size === 'sm' ? 'btn-lux-sm' : ''} ${iconSide === 'left' ? 'btn-lux-left' : ''} ${className}`;
  const body = (
    <>
      {iconSide === 'left' ? chip : null}
      <span className="whitespace-nowrap">{children}</span>
      {iconSide === 'right' ? chip : null}
    </>
  );

  if (href.startsWith('/') && !download) {
    return (
      <Link href={href} className={cls}>
        {body}
      </Link>
    );
  }
  return (
    <a
      href={href}
      className={cls}
      download={download || undefined}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
    >
      {body}
    </a>
  );
}
