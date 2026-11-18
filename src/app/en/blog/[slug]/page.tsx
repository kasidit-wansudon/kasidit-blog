// /en/blog/[slug] — English article (static)
import type { Metadata } from 'next';
import PostView, { postMetadata } from '@/components/blog/PostView';
import { getAllPosts } from '@/lib/blog';

type Params = Promise<{ slug: string }>;
export const dynamicParams = false;

export function generateStaticParams() {
  const posts = getAllPosts('en');
  // Next needs at least one param for a static route; fall back to a placeholder that 404s.
  return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: 'coming-soon' }];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return postMetadata((await params).slug, 'en');
}

export default async function Page({ params }: { params: Params }) {
  return <PostView slug={(await params).slug} lang="en" />;
}
