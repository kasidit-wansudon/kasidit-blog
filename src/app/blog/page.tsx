// /blog — Thai blog index (static)
import BlogIndex, { blogIndexMetadata } from '@/components/blog/BlogIndex';

export const metadata = blogIndexMetadata('th');

export default function Page() {
  return <BlogIndex lang="th" />;
}
