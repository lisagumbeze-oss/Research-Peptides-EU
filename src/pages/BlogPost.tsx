import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, Clock, Tag } from 'lucide-react';
import { LocaleLink } from '../i18n/LocaleLink';
import { useLocaleNavigate } from '../i18n/useLocaleNavigate';
import { useLocale } from '../i18n/LocaleProvider';
import { supabase } from '../supabase';
import { Badge, Container, Reveal, ScientificBackdrop, buttonClassName } from '../design-system';
import { ResearchLinkHub } from '../components/seo/ResearchLinkHub';
import { BlogMarkdown } from '../components/blog/BlogMarkdown';
import { RecommendedPostsSidebar } from '../components/blog/RecommendedPostsSidebar';
import { ArticleShareButton } from '../components/blog/ArticleShareButton';
import { usePageSeo } from '../seo/SeoProvider';
import { breadcrumbJsonLd } from '../seo/structuredData';
import { blogPath, blogSlug } from '../lib/blogUrl';
import {
  extractArticleHeadings,
  readingTimeMinutes,
  selectRecommendedPosts,
  stripMarkdown,
  type BlogPostRecord,
} from '../lib/blog';
import { formatLocaleDate } from '../lib/formatLocaleDate';
import { stripLocaleFromPath } from '../i18n/routing';
import { BRAND_NAME } from '../config/brand';
import logo from '../assets/brandLogo';

const AUTHOR_NAME = `${BRAND_NAME} Editorial Board`;

export default function BlogPost() {
  const { id: idOrSlug } = useParams<{ id: string }>();
  const navigate = useLocaleNavigate();
  const { locale } = useLocale();
  const [post, setPost] = useState<BlogPostRecord | null>(null);
  const [recommended, setRecommended] = useState<BlogPostRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchPost = async () => {
      if (!idOrSlug) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        const rows = (data ?? []) as BlogPostRecord[];
        let match = rows.find(
          (row) =>
            row.id === idOrSlug ||
            blogSlug(row) === idOrSlug ||
            String(row.slug || '') === idOrSlug,
        );

        if (!match) {
          const { data: single } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('id', idOrSlug)
            .maybeSingle();
          match = (single as BlogPostRecord | null) ?? undefined;
        }

        if (cancelled) return;
        const next = match ?? null;
        setPost(next);
        setRecommended(next ? selectRecommendedPosts(next, rows) : []);
      } catch (error) {
        console.error('Error fetching blog post:', error);
        if (!cancelled) {
          setPost(null);
          setRecommended([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchPost();
    return () => {
      cancelled = true;
    };
  }, [idOrSlug]);

  useEffect(() => {
    if (!post) return;
    const canonical = blogPath(post);
    if (stripLocaleFromPath(window.location.pathname) !== canonical) {
      navigate(canonical, { replace: true });
    }
  }, [post, navigate]);

  const excerpt = useMemo(() => stripMarkdown(String(post?.content || ''), 180), [post]);
  const minutes = useMemo(() => readingTimeMinutes(String(post?.content || '')), [post]);
  const headings = useMemo(() => extractArticleHeadings(String(post?.content || '')), [post]);

  const pageSeo = useMemo(() => {
    if (!post) return null;
    return {
      title: `${post.title} | ${BRAND_NAME} Journal`,
      description: excerpt,
      canonicalPath: blogPath(post),
      ogType: 'article' as const,
      ogImage: post.image_url || undefined,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: excerpt,
          image: post.image_url ? [post.image_url] : [],
          datePublished: post.created_at,
          dateModified: post.updated_at || post.created_at,
          author: { '@type': 'Organization', name: AUTHOR_NAME },
          publisher: { '@type': 'Organization', name: BRAND_NAME },
        },
        breadcrumbJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Research Journal', path: '/blog' },
            { name: String(post.title || 'Article'), path: blogPath(post) },
          ],
          locale,
        ),
      ],
    };
  }, [post, excerpt, locale]);

  usePageSeo(pageSeo);

  if (loading) {
    return (
      <div className="bg-mist-50 min-h-screen">
        <Container className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem] gap-10 animate-pulse">
            <div className="space-y-6">
              <div className="h-4 w-40 bg-brand-100 rounded-full" />
              <div className="h-16 bg-brand-100 rounded-2xl w-full" />
              <div className="h-72 bg-brand-100 rounded-3xl w-full" />
              <div className="space-y-3">
                <div className="h-4 bg-brand-100 rounded w-full" />
                <div className="h-4 bg-brand-100 rounded w-full" />
                <div className="h-4 bg-brand-100 rounded w-2/3" />
              </div>
            </div>
            <div className="hidden lg:block space-y-4">
              <div className="h-64 bg-brand-100 rounded-3xl" />
              <div className="h-40 bg-brand-100 rounded-3xl" />
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-mist-50">
        <div className="text-center bg-white p-12 rounded-3xl shadow-card border border-brand-100 max-w-md">
          <BookOpen className="h-14 w-14 text-brand-200 mx-auto mb-6" aria-hidden />
          <h1 className="text-2xl font-display font-bold text-navy-950 mb-3">Article not found</h1>
          <p className="text-steel-600 mb-8">The requested journal entry could not be identified.</p>
          <LocaleLink to="/blog" className={buttonClassName({ variant: 'primary', size: 'md' })}>
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Return to journal
          </LocaleLink>
        </div>
      </div>
    );
  }

  return (
    <article className="bg-mist-50 min-h-screen">
      <div className="relative overflow-hidden border-b border-brand-100 bg-white">
        <ScientificBackdrop variant="light" glow className="opacity-70" />
        <Container className="relative z-10 pt-10 pb-6">
          <nav aria-label="Breadcrumb" className="text-sm text-steel-600">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <LocaleLink to="/blog" className="inline-flex items-center gap-2 hover:text-brand-700">
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                  Research Journal
                </LocaleLink>
              </li>
              <li aria-hidden className="text-silver-400">
                /
              </li>
              <li className="text-navy-950 font-medium line-clamp-1 max-w-[42ch]">{post.title}</li>
            </ol>
          </nav>
        </Container>
      </div>

      <Container className="py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem] gap-10 xl:gap-14 items-start">
          <div>
            <Reveal as="header" className="bg-white border border-brand-100 rounded-3xl shadow-card overflow-hidden">
              {post.image_url ? (
                <div className="aspect-[16/8] bg-mist-50">
                  <img
                    src={post.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                    fetchPriority="high"
                  />
                </div>
              ) : null}

              <div className="p-6 sm:p-8 lg:p-12">
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  <Badge variant="brand">
                    <Tag className="h-3 w-3 mr-1.5" aria-hidden />
                    Research insight
                  </Badge>
                  {post.created_at ? (
                    <span className="inline-flex items-center gap-1.5 text-caption">
                      <Calendar className="h-3 w-3" aria-hidden />
                      <time dateTime={post.created_at}>{formatLocaleDate(post.created_at, locale)}</time>
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1.5 text-caption">
                    <Clock className="h-3 w-3" aria-hidden />
                    {minutes} min read
                  </span>
                </div>

                <h1 className="text-navy-950 mb-5">{post.title}</h1>
                {excerpt ? <p className="text-body-lg max-w-3xl">{excerpt}</p> : null}

                <div className="mt-8 pt-6 border-t border-brand-50 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={logo}
                      alt=""
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-full object-cover bg-white border border-brand-100"
                    />
                    <div>
                      <p className="text-caption">Authored by</p>
                      <p className="text-sm font-semibold text-navy-950">{AUTHOR_NAME}</p>
                    </div>
                  </div>
                  <ArticleShareButton title={String(post.title || BRAND_NAME)} />
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.08} className="mt-8 bg-white border border-brand-100 rounded-3xl shadow-card p-6 sm:p-8 lg:p-12">
              <BlogMarkdown content={String(post.content || '')} />

              <footer className="mt-12 pt-8 border-t border-brand-100">
                <p className="text-sm text-steel-600 leading-relaxed mb-8">
                  Materials discussed in this journal are supplied for controlled laboratory and in-vitro research
                  only — not for human consumption or clinical use.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <LocaleLink to="/blog" className={buttonClassName({ variant: 'primary', size: 'md' })}>
                    <ArrowLeft className="h-4 w-4" aria-hidden />
                    More journal entries
                  </LocaleLink>
                  <LocaleLink to="/shop" className={buttonClassName({ variant: 'outline', size: 'md' })}>
                    Shop research peptides
                  </LocaleLink>
                </div>
              </footer>
            </Reveal>
          </div>

          <RecommendedPostsSidebar posts={recommended} headings={headings} locale={locale} />
        </div>
      </Container>

      <ResearchLinkHub variant="compact" markets={['eu', 'es']} showOutbound={false} />
    </article>
  );
}
