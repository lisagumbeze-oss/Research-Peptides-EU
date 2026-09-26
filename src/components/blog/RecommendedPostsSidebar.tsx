import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { LocaleLink } from '../../i18n/LocaleLink';
import { blogPath } from '../../lib/blogUrl';
import { readingTimeMinutes, stripMarkdown, type ArticleHeading, type BlogPostRecord } from '../../lib/blog';
import { formatLocaleDate } from '../../lib/formatLocaleDate';
import { Badge, Card, buttonClassName } from '../../design-system';
import { cn } from '../../lib/utils';

type RecommendedPostsSidebarProps = {
  posts: BlogPostRecord[];
  headings?: ArticleHeading[];
  locale: string;
  className?: string;
};

export function RecommendedPostsSidebar({
  posts,
  headings = [],
  locale,
  className,
}: RecommendedPostsSidebarProps) {
  const showToc = headings.length >= 2;

  return (
    <aside
      className={cn('space-y-6 lg:sticky lg:top-8', className)}
      aria-label="Article sidebar"
    >
      {showToc ? (
        <Card className="p-6">
          <p className="text-caption text-brand-600 mb-3">In this article</p>
          <nav aria-label="On this page">
            <ol className="space-y-2.5">
              {headings.map((heading) => (
                <li key={heading.id} className={heading.level === 3 ? 'pl-3' : undefined}>
                  <a
                    href={`#${heading.id}`}
                    className="block text-sm leading-snug text-steel-600 hover:text-brand-700 transition-colors"
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </Card>
      ) : null}

      <Card className="p-6">
        <p className="text-caption text-brand-600 mb-1">Continue reading</p>
        <h2 className="text-lg font-display font-bold text-navy-950 mb-5">Recommended posts</h2>

        {posts.length === 0 ? (
          <p className="text-sm text-steel-600">More journal entries will appear here as they are published.</p>
        ) : (
          <ul className="divide-y divide-brand-50">
            {posts.map((post) => {
              const href = blogPath(post);
              const minutes = readingTimeMinutes(String(post.content || ''));
              return (
                <li key={post.id} className="py-4 first:pt-0 last:pb-0">
                  <LocaleLink to={href} className="group flex gap-3.5">
                    <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-mist-50 border border-brand-50">
                      {post.image_url ? (
                        <img
                          src={post.image_url}
                          alt=""
                          className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-brand-300">
                          <BookOpen className="h-5 w-5" aria-hidden />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-display font-bold text-navy-950 leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">
                        {post.title}
                      </h3>
                      <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-wider text-silver-400">
                        {post.created_at ? (
                          <time dateTime={post.created_at}>{formatLocaleDate(post.created_at, locale)}</time>
                        ) : null}
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden />
                          {minutes} min
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-steel-600 line-clamp-2">
                        {stripMarkdown(String(post.content || ''), 90)}
                      </p>
                    </div>
                  </LocaleLink>
                </li>
              );
            })}
          </ul>
        )}

        <LocaleLink
          to="/blog"
          className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600 hover:text-brand-800"
        >
          All journal entries <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </LocaleLink>
      </Card>

      <Card variant="feature" className="p-6">
        <Badge variant="brand" className="mb-3">
          Research catalog
        </Badge>
        <p className="font-display font-bold text-navy-950 mb-2">Need the compound discussed here?</p>
        <p className="text-sm text-steel-600 mb-5 leading-relaxed">
          Browse third-party tested research peptides with EUR pricing and EU dispatch.
        </p>
        <LocaleLink to="/shop" className={buttonClassName({ variant: 'primary', size: 'md', fullWidth: true })}>
          Shop research peptides
        </LocaleLink>
      </Card>
    </aside>
  );
}
