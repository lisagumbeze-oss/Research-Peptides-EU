import { lazy, Suspense, type ReactNode } from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { FeaturedProductsSection } from '../components/home/FeaturedProductsSection';
import { NewestProductsSection } from '../components/home/NewestProductsSection';
import { BestsellerProductsSection } from '../components/home/BestsellerProductsSection';
import { CategoryProductSections } from '../components/home/CategoryProductSections';
import { HomeSectionFallback } from '../components/home/HomeSectionFallback';
import { LazyWhenVisible } from '../components/LazyWhenVisible';
import { loadHomeCatalog } from '../lib/homeCatalog';
import { usePageSeo } from '../seo/SeoProvider';

void loadHomeCatalog();

const WhyEuSection = lazy(() =>
  import('../components/home/WhyEuSection').then((m) => ({ default: m.WhyEuSection })),
);
const CategoryShowcaseSection = lazy(() =>
  import('../components/home/CategoryShowcaseSection').then((m) => ({
    default: m.CategoryShowcaseSection,
  })),
);
const TrustQualitySection = lazy(() =>
  import('../components/home/TrustQualitySection').then((m) => ({
    default: m.TrustQualitySection,
  })),
);
const CustomerExperienceSection = lazy(() =>
  import('../components/home/CustomerExperienceSection').then((m) => ({
    default: m.CustomerExperienceSection,
  })),
);
const CtaSection = lazy(() =>
  import('../components/home/CtaSection').then((m) => ({ default: m.CtaSection })),
);

function DeferredSection({
  minHeight,
  className,
  children,
}: {
  minHeight: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <LazyWhenVisible fallback={<HomeSectionFallback minHeight={minHeight} className={className} />}>
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
    <div className="overflow-x-hidden">
      <HeroSection />
      <div id="catalog-preview" className="scroll-mt-28" />
      <FeaturedProductsSection />
      <DeferredSection minHeight="min-h-[320px]">
        <WhyEuSection />
      </DeferredSection>
      <NewestProductsSection />
      <DeferredSection minHeight="min-h-[360px]" className="bg-navy-950/5">
        <CategoryShowcaseSection />
      </DeferredSection>
      <BestsellerProductsSection />
      <CategoryProductSections />
      <DeferredSection minHeight="min-h-[300px]">
        <TrustQualitySection />
      </DeferredSection>
      <DeferredSection minHeight="min-h-[280px]">
        <CustomerExperienceSection />
      </DeferredSection>
      <DeferredSection minHeight="min-h-[200px]">
        <CtaSection />
      </DeferredSection>
    </div>
  );
}
