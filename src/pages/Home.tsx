import { lazy, Suspense, type ReactNode } from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { HomeSectionFallback } from '../components/home/HomeSectionFallback';
import { LazyWhenVisible } from '../components/LazyWhenVisible';
import { SEO } from '../components/seo/SEO';
import { usePageSeo } from '../seo/SeoProvider';
// #region agent log
import { agentLog } from '../debug/agentLog';

/** Reports whether a section's dynamic import resolves, rejects, or never settles. */
function tracedImport<T>(label: string, load: () => Promise<T>): Promise<T> {
  const started = Date.now();
  agentLog('I', 'Home.tsx:12', 'section import started', { label });
  const timer = window.setTimeout(
    () => agentLog('I', 'Home.tsx:14', 'section import STILL PENDING after 8s', { label }),
    8000,
  );
  return load().then(
    (mod) => {
      window.clearTimeout(timer);
      agentLog('I', 'Home.tsx:19', 'section import resolved', { label, ms: Date.now() - started });
      return mod;
    },
    (error: unknown) => {
      window.clearTimeout(timer);
      agentLog('I', 'Home.tsx:24', 'section import REJECTED', {
        label,
        ms: Date.now() - started,
        error: String(error).slice(0, 300),
      });
      throw error;
    },
  );
}
// #endregion

const FeaturedProductsSection = lazy(() =>
  tracedImport('FeaturedProductsSection', () =>
    import('../components/home/FeaturedProductsSection').then((m) => ({
      default: m.FeaturedProductsSection,
    })),
  ),
);
const WhyEuSection = lazy(() =>
  tracedImport('WhyEuSection', () =>
    import('../components/home/WhyEuSection').then((m) => ({ default: m.WhyEuSection })),
  ),
);
const CategoryShowcaseSection = lazy(() =>
  tracedImport('CategoryShowcaseSection', () =>
    import('../components/home/CategoryShowcaseSection').then((m) => ({
      default: m.CategoryShowcaseSection,
    })),
  ),
);
const TrustQualitySection = lazy(() =>
  tracedImport('TrustQualitySection', () =>
    import('../components/home/TrustQualitySection').then((m) => ({
      default: m.TrustQualitySection,
    })),
  ),
);
const CustomerExperienceSection = lazy(() =>
  tracedImport('CustomerExperienceSection', () =>
    import('../components/home/CustomerExperienceSection').then((m) => ({
      default: m.CustomerExperienceSection,
    })),
  ),
);
const CtaSection = lazy(() =>
  tracedImport('CtaSection', () =>
    import('../components/home/CtaSection').then((m) => ({ default: m.CtaSection })),
  ),
);

function DeferredSection({
  minHeight,
  className,
  children,
  label,
}: {
  minHeight: string;
  className?: string;
  children: ReactNode;
  label: string;
}) {
  return (
    <LazyWhenVisible
      debugLabel={label}
      fallback={<HomeSectionFallback minHeight={minHeight} className={className} />}
    >
      <Suspense fallback={<HomeSectionFallback minHeight={minHeight} className={className} />}>
        {children}
      </Suspense>
    </LazyWhenVisible>
  );
}

export default function Home() {
  usePageSeo({
    title: "Research Peptides EU | Premium Research Peptides for European Laboratories",
    description: "Premium research-grade peptides and compounds for European laboratories. Third-party tested, EU distribution, next-day shipping available.",
    canonicalPath: "/",
  });

  return (
    <div className="overflow-hidden">
      <HeroSection />
      <DeferredSection minHeight="min-h-[420px]" label="FeaturedProductsSection">
        <FeaturedProductsSection />
      </DeferredSection>
      <DeferredSection minHeight="min-h-[320px]" label="WhyEuSection">
        <WhyEuSection />
      </DeferredSection>
      <DeferredSection minHeight="min-h-[360px]" className="bg-navy-950/5" label="CategoryShowcaseSection">
        <CategoryShowcaseSection />
      </DeferredSection>
      <DeferredSection minHeight="min-h-[300px]" label="TrustQualitySection">
        <TrustQualitySection />
      </DeferredSection>
      <DeferredSection minHeight="min-h-[280px]" label="CustomerExperienceSection">
        <CustomerExperienceSection />
      </DeferredSection>
      <DeferredSection minHeight="min-h-[200px]" label="CtaSection">
        <CtaSection />
      </DeferredSection>
    </div>
  );
}
