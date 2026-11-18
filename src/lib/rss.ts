// RSS 2.0 builder for a blog language.
import { blogPath, getAllPosts, SITE_URL, type BlogLang } from '@/lib/blog';
import { BLOG_TEXT } from '@/components/blog/text';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function rssResponse(lang: BlogLang): Response {
  const posts = getAllPosts(lang);
  const base = `${SITE_URL}${blogPath(lang)}`;
  const items = posts
    .map((p) => {
      const link = `${SITE_URL}${blogPath(lang, p.slug)}`;
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(`${p.date}T09:00:00-06:00`).toUTCString()}</pubDate>
      <description>${esc(p.excerpt)}</description>
${p.tags.map((t) => `      <category>${esc(t)}</category>`).join('\n')}
    </item>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Kasidit Wansudon — Blog</title>
    <link>${base}</link>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml" />
    <description>${esc(BLOG_TEXT[lang].rssDesc)}</description>
    <language>${lang}</language>
${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
