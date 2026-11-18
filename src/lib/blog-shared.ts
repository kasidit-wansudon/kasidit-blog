// Browser-safe blog helpers (no Node APIs) — usable from client components.
export type BlogLang = 'th' | 'en';

/** Public URL path for the blog index or a post in a language. */
export const blogPath = (lang: BlogLang, slug?: string) =>
  `${lang === 'en' ? '/en' : ''}/blog${slug ? `/${slug}` : ''}`;

export interface PostMeta {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  excerpt: string;
  tags: string[];
  readingMinutes: number;
}
