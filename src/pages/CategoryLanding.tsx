import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LocaleLink } from '../i18n/LocaleLink';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Beaker, CheckCircle2, FlaskConical, ShieldCheck } from 'lucide-react';
import { supabase } from '../supabase';
import { usePageSeo } from '../seo/SeoProvider';
import { breadcrumbJsonLd, itemListJsonLd } from '../seo/structuredData';
import type { LocaleCode } from '../i18n/locales';
import { SHOP_PRODUCT_COLUMNS } from '../lib/shopCatalogQuery';
import { Container, Section, Reveal } from '../design-system';
import { CatalogPageHeader } from '../components/catalog/CatalogPageHeader';
import { CatalogTrustBar } from '../components/catalog/CatalogTrustBar';
import { ProductGrid } from '../components/catalog/ProductGrid';
import { CatalogEmptyState } from '../components/catalog/CatalogEmptyState';
import { useProductCatalogActions } from '../hooks/useProductCatalogActions';
import type { CatalogProduct } from '../components/products/ProductCard';
import { categoryPath } from '../lib/categoryUrl';
import { ResearchLinkHub } from '../components/seo/ResearchLinkHub';
import { AnswerCapsule } from '../components/seo/AnswerCapsule';
import { HQ_LOCATION } from '../config/brand';

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

function buildIntro(name: string, description: string | null | undefined): string {
  if (description && description.trim().length > 40) return description.trim();
  return `${name} research compounds from Research Peptides EU — third-party tested, EUR pricing, and EU dispatch from the Netherlands. For laboratory research use only.`;
}

export default function CategoryLanding() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const locale = i18n.language as LocaleCode;
  const [category, setCategory] = useState<CategoryRow | null>(null);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { isInWishlist, handleToggleWishlist, handleAddToCart } = useProductCatalogActions();

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const [catResult, prodResult] = await Promise.all([
          supabase.from('categories').select('id, name, slug, description').eq('slug', slug).maybeSingle(),
          supabase.from('products').select(SHOP_PRODUCT_COLUMNS).order('created_at', { ascending: false }),
        ]);

        if (cancelled) return;

        if (catResult.data) {
          setCategory(catResult.data as CategoryRow);
        } else {
          setCategory(null);
        }

        const all = (prodResult.data as CatalogProduct[] | null) ?? [];
        const filtered = all.filter((p) =>
          (p.categories ?? []).some((c) => String(c).toLowerCase() === slug.toLowerCase()),
        );
        setProducts(filtered);
      } catch (error) {
        console.error('Error loading category landing:', error);
        if (!cancelled) {
          setCategory(null);
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const displayName = category?.name ?? slug.replace(/-/g, ' ');
  const intro = buildIntro(displayName, category?.description);
  const canonicalPath = categoryPath(slug);

  const seoConfig = useMemo(() => {
    if (!slug) return null;
    const title = `${displayName} Research Peptides | Research Peptides EU`;
    const description = intro.slice(0, 160);
    return {
      title,
      description,
      canonicalPath,
      jsonLd: [
        breadcrumbJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Categories', path: '/categories' },
            { name: displayName, path: canonicalPath },
          ],
          locale,
        ),
        itemListJsonLd(products, locale),
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: `What are ${displayName} research peptides used for?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `${displayName} compounds in this catalog are supplied for controlled laboratory and in-vitro research only. They are not for human consumption, clinical use, or veterinary treatment.`,
              },
            },
            {
              '@type': 'Question',
              name: `Does Research Peptides EU ship ${displayName} across the EU?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `Yes. Orders dispatch from the Netherlands with EUR pricing and EU-wide logistics. Review shipping details and COA documentation before ordering.`,
              },
            },
            {
              '@type': 'Question',
              name: `Are ${displayName} products third-party tested?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `Research Peptides EU emphasizes third-party testing and COA documentation for research-grade peptides. Check the COA library and individual product pages for available certificates.`,
              },
            },
          ],
        },
      ],
    };
  }, [slug, displayName, intro, canonicalPath, locale, products]);

  usePageSeo(seoConfig);

  if (!loading && !category && products.length === 0) {
    return (
      <div className="min-h-screen bg-mist-50">
        <Container className="py-20 text-center">
          <h1 className="font-display font-bold text-2xl text-navy-950 mb-4">Category not found</h1>
          <p className="text-steel-600 mb-6">This research line is unavailable or has no matching compounds.</p>
          <LocaleLink to="/categories" className="text-brand-600 font-semibold hover:underline">
            Browse all categories →
          </LocaleLink>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mist-50">
      <CatalogPageHeader
        eyebrow="Research category"
        title={
          <>
            {displayName}{' '}
            <span className="text-brand-400">research peptides</span>
          </>
        }
        description={intro}
      />
      <CatalogTrustBar />

      <Section size="md" tone="mist">
        <Container>
          <Reveal className="mb-8">
            <AnswerCapsule title={`Quick answer: ${displayName} research peptides`}>
              <p>
                {intro} Compounds ship from {HQ_LOCATION} with EUR pricing for laboratory research only — not for
                human consumption. Browse products below or open the{' '}
                <LocaleLink to="/peptide-guide" className="text-brand-700 font-semibold hover:underline">
                  peptide guide
                </LocaleLink>
                .
              </p>
            </AnswerCapsule>
          </Reveal>

          <Reveal className="mb-10 rounded-3xl border border-brand-100 bg-white p-6 md:p-8 shadow-card">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center shrink-0">
                <Beaker className="h-6 w-6 text-brand-600" aria-hidden />
              </div>
              <div className="space-y-3 min-w-0">
                <h2 className="font-display font-bold text-lg text-navy-950">
                  About this research line
                </h2>
                <p className="text-sm text-steel-600 leading-relaxed">{intro}</p>
                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {[
                    { icon: ShieldCheck, label: 'Third-party tested focus' },
                    { icon: FlaskConical, label: 'Laboratory research only' },
                    { icon: CheckCircle2, label: 'EUR pricing · EU dispatch' },
                  ].map(({ icon: Icon, label }) => (
                    <li
                      key={label}
                      className="flex items-center gap-2 text-xs font-semibold text-brand-800 bg-brand-50/80 rounded-xl px-3 py-2 border border-brand-100"
                    >
                      <Icon className="h-4 w-4 text-brand-600 shrink-0" aria-hidden />
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <p className="text-sm text-steel-600">
              {loading ? 'Loading compounds…' : (
                <>
                  <span className="font-semibold text-navy-950">{products.length}</span> compounds in{' '}
                  <span className="font-semibold text-navy-950">{displayName}</span>
                </>
              )}
            </p>
            <LocaleLink
              to="/shop"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Full catalog
              <ArrowRight className="h-4 w-4" />
            </LocaleLink>
          </div>

          {!loading && products.length === 0 ? (
            <div className="space-y-6">
              <CatalogEmptyState
                title="No compounds in this category yet"
                description="Browse the full shop or another research line while we expand this collection."
              />
              <div className="text-center">
                <LocaleLink to="/categories" className="text-brand-600 font-semibold text-sm hover:underline">
                  View all categories →
                </LocaleLink>
              </div>
            </div>
          ) : (
            <ProductGrid
              products={products}
              loading={loading}
              skeletonCount={8}
              inWishlist={isInWishlist}
              onToggleWishlist={handleToggleWishlist}
              onAddToCart={handleAddToCart}
            />
          )}

          <Reveal as="section" className="mt-16 rounded-3xl border border-brand-100 bg-white p-6 md:p-10 shadow-card">
            <h2 className="font-display font-bold text-xl text-navy-950 mb-6">
              {displayName} — research FAQ
            </h2>
            <dl className="space-y-6">
              <div>
                <dt className="font-semibold text-navy-950 text-sm mb-2">
                  What are {displayName} research peptides used for?
                </dt>
                <dd className="text-sm text-steel-600 leading-relaxed">
                  Compounds in this category are supplied for controlled laboratory and in-vitro research only.
                  They are not for human consumption, clinical use, or veterinary treatment.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-navy-950 text-sm mb-2">
                  Does Research Peptides EU ship {displayName} across the EU?
                </dt>
                <dd className="text-sm text-steel-600 leading-relaxed">
                  Yes. Orders dispatch from the Netherlands with EUR pricing. See{' '}
                  <LocaleLink to="/shipping" className="text-brand-600 font-medium hover:underline">
                    shipping
                  </LocaleLink>{' '}
                  and the{' '}
                  <LocaleLink to="/coas" className="text-brand-600 font-medium hover:underline">
                    COA library
                  </LocaleLink>{' '}
                  for documentation.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-navy-950 text-sm mb-2">
                  How do I choose the right {displayName} compound?
                </dt>
                <dd className="text-sm text-steel-600 leading-relaxed">
                  Review product specifications, purity documentation, and our{' '}
                  <LocaleLink to="/peptide-guide" className="text-brand-600 font-medium hover:underline">
                    peptide guide
                  </LocaleLink>
                  . For catalog-wide browsing, open the{' '}
                  <LocaleLink to="/shop" className="text-brand-600 font-medium hover:underline">
                    full shop
                  </LocaleLink>
                  .
                </dd>
              </div>
            </dl>
          </Reveal>
        </Container>
      </Section>

      <ResearchLinkHub variant="compact" showOutbound={false} />
    </div>
  );
}
