import { slugifyProductName } from './productUrl';
import type { BlogPostLike } from './blogUrl';

export type BlogPostRecord = BlogPostLike & {
  content?: string | null;
  image_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ArticleHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'for',
  'from',
  'how',
  'in',
  'into',
  'is',
  'of',
  'on',
  'or',
  'the',
  'this',
  'that',
  'to',
  'with',
  'your',
  'what',
]);

const WORDS_PER_MINUTE = 220;

/** Ensure markdown headings have a space after the hashes (`##Title` → `## Title`). */
export function normalizeBlogMarkdown(content: string): string {
  return String(content || '')
    .replace(/\r\n/g, '\n')
    .replace(/^(#{1,6})([^\s#])/gm, '$1 $2');
}

export function stripMarkdown(value: string, maxLength?: number): string {
  const plain = String(value || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/^>\s+/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!maxLength || plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).replace(/\s+\S*$/, '').trimEnd()}…`;
}

export function readingTimeMinutes(content: string): number {
  const words = String(content || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function headingAnchorId(text: string): string {
  return slugifyProductName(text) || 'section';
}

export function uniqueHeadingId(text: string, seen: Map<string, number>): string {
  const base = headingAnchorId(text);
  const next = (seen.get(base) ?? 0) + 1;
  seen.set(base, next);
  return next === 1 ? base : `${base}-${next}`;
}

export function extractArticleHeadings(markdown: string): ArticleHeading[] {
  const headings: ArticleHeading[] = [];
  const seen = new Map<string, number>();

  for (const line of normalizeBlogMarkdown(markdown).split('\n')) {
    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const text = match[2].replace(/[*_`]/g, '').trim();
    if (!text) continue;
    headings.push({
      id: uniqueHeadingId(text, seen),
      text,
      level: match[1].length === 2 ? 2 : 3,
    });
  }

  return headings;
}

function tokenize(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token)),
  );
}

function overlapScore(left: Set<string>, right: Set<string>): number {
  if (left.size === 0 || right.size === 0) return 0;
  let score = 0;
  for (const token of right) {
    if (left.has(token)) score += 1;
  }
  return score;
}

function createdAtMs(post: BlogPostRecord): number {
  const value = post.created_at ? Date.parse(post.created_at) : 0;
  return Number.isFinite(value) ? value : 0;
}

export function selectRecommendedPosts(
  current: BlogPostRecord,
  catalog: BlogPostRecord[],
  limit = 4,
): BlogPostRecord[] {
  const currentTokens = tokenize(
    `${current.title || ''} ${stripMarkdown(String(current.content || ''), 400)}`,
  );

  return catalog
    .filter((post) => post.id && post.id !== current.id)
    .map((post) => {
      const titleScore = overlapScore(currentTokens, tokenize(String(post.title || ''))) * 4;
      const bodyScore = overlapScore(
        currentTokens,
        tokenize(stripMarkdown(String(post.content || ''), 240)),
      );
      return { post, score: titleScore + bodyScore, recency: createdAtMs(post) };
    })
    .sort((a, b) => b.score - a.score || b.recency - a.recency)
    .slice(0, limit)
    .map((entry) => entry.post);
}
