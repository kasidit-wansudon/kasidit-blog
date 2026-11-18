// /blog/[slug] — Thai article (static)
import type { Metadata } from 'next';
import PostView, { postMetadata } from '@/components/blog/PostView';
import { getAllPosts } from '@/lib/blog';

type Params = Promise<{ slug: string }>;
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts('th').map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return postMetadata((await params).slug, 'th');
}

export default async function Page({ params }: { params: Params }) {
  return <PostView slug={(await params).slug} lang="th" />;
}
