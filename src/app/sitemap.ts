import type { MetadataRoute } from 'next';
import { blogPath, getAllPosts, hasPost, SITE_URL } from '@/lib/blog';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const latest = posts[0]?.date ?? new Date().toISOString().slice(0, 10);
  return [
    { url: SITE_URL, lastModified: latest, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified: latest, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/en/blog`, lastModified: latest, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/resume`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/guestbook`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE_URL}/cascade`, changeFrequency: 'monthly', priority: 0.4 },
    ...posts.flatMap((p) => {
      const languages: Record<string, string> = { th: `${SITE_URL}${blogPath('th', p.slug)}` };
      if (hasPost(p.slug, 'en')) languages.en = `${SITE_URL}${blogPath('en', p.slug)}`;
      return Object.values(languages).map((url) => ({
        url,
        lastModified: p.date,
        changeFrequency: 'yearly' as const,
        priority: 0.7,
        alternates: { languages },
      }));
    }),
  ];
}
