// Blog posts are Markdown files in /content/blog (frontmatter + body).
// Read at build time only (server components / static generation).
import fs from 'node:fs';
import path from 'node:path';
import { Marked } from 'marked';

export const SITE_URL = 'https://kasidit-wans.com';
const POSTS_DIR = path.join(process.cwd(), 'content', 'blog');

import { blogPath, type BlogLang, type PostMeta } from './blog-shared';
export { blogPath, type BlogLang, type PostMeta };

/** Thai posts live in content/blog, English translations in content/blog/en (same slug). */
const dirFor = (lang: BlogLang) => (lang === 'en' ? path.join(POSTS_DIR, 'en') : POSTS_DIR);



export interface Heading {
  id: string;
  text: string;
}

export interface Post extends PostMeta {
  html: string;
  headings: Heading[];
}

/** Minimal frontmatter parser for our fixed schema (title/date/excerpt/tags). */
function parseFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: raw };
  const data: Record<string, unknown> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    const [, key, value] = kv;
    try {
      data[key] = JSON.parse(value);
    } catch {
      data[key] = value.replace(/^["']|["']$/g, '');
    }
  }
  return { data, body: m[2] };
}

/** Thai has no spaces between words, so estimate by characters (~ 900 chars/min) plus Latin words. */
function readingMinutes(text: string): number {
  const thaiChars = (text.match(/[฀-๿]/g) ?? []).length;
  const latinWords = (text.match(/[A-Za-z0-9]+/g) ?? []).length;
  return Math.max(1, Math.round(thaiChars / 900 + latinWords / 220));
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

function readFile(file: string, lang: BlogLang): { meta: PostMeta; body: string } {
  const raw = fs.readFileSync(path.join(dirFor(lang), file), 'utf8');
  const { data, body } = parseFrontmatter(raw);
  const slug = file.replace(/\.md$/, '');
  return {
    meta: {
      slug,
      title: String(data.title ?? slug),
      date: String(data.date ?? '1970-01-01'),
      excerpt: String(data.excerpt ?? ''),
      tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
      readingMinutes: readingMinutes(body),
    },
    body,
  };
}

/** All posts in a language, newest first. Posts dated in the future are hidden. */
export function getAllPosts(lang: BlogLang = 'th'): PostMeta[] {
  const dir = dirFor(lang);
  if (!fs.existsSync(dir)) return [];
  const today = new Date().toISOString().slice(0, 10);
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => readFile(f, lang).meta)
    .filter((p) => p.date <= today)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** True when a post exists in that language. */
export function hasPost(slug: string, lang: BlogLang): boolean {
  return /^[a-z0-9-]+$/.test(slug) && fs.existsSync(path.join(dirFor(lang), `${slug}.md`));
}

export function getPost(slug: string, lang: BlogLang = 'th'): Post | null {
  if (!hasPost(slug, lang)) return null;
  const file = `${slug}.md`;
  const { meta, body } = readFile(file, lang);

  const headings: Heading[] = [];
  const marked = new Marked({
    gfm: true,
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const id = slugify(text);
        if (depth === 2) headings.push({ id, text: text.replace(/<[^>]+>/g, '') });
        return `<h${depth} id="${id}"><a href="#${id}" class="heading-anchor">${text}</a></h${depth}>`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const external = /^https?:\/\//.test(href) && !href.startsWith(SITE_URL);
        const t = title ? ` title="${title}"` : '';
        return external
          ? `<a href="${href}"${t} target="_blank" rel="noopener">${text}</a>`
          : `<a href="${href}"${t}>${text}</a>`;
      },
    },
  });
  const html = marked.parse(body, { async: false }) as string;
  return { ...meta, html, headings };
}

/** Posts sharing the most tags with `post`, excluding itself. */
export function getRelated(post: PostMeta, lang: BlogLang = 'th', limit = 3): PostMeta[] {
  return getAllPosts(lang)
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({ p, score: p.tags.filter((t) => post.tags.includes(t)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || (a.p.date < b.p.date ? 1 : -1))
    .slice(0, limit)
    .map((x) => x.p);
}

export function formatDate(date: string, lang: BlogLang = 'th'): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString(lang === 'en' ? 'en-US' : 'th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** Back-compat alias. */
export const formatThaiDate = (date: string) => formatDate(date, 'th');
