import { HeroSection } from '../components/home/HeroSection';
import { FeaturedProductsSection } from '../components/home/FeaturedProductsSection';
import { WhyEuSection } from '../components/home/WhyEuSection';
import { CategoryShowcaseSection } from '../components/home/CategoryShowcaseSection';
import { TrustQualitySection } from '../components/home/TrustQualitySection';
import { CustomerExperienceSection } from '../components/home/CustomerExperienceSection';
import { CtaSection } from '../components/home/CtaSection';

export default function Home() {
  return (
    <div className="overflow-hidden">
      <HeroSection />
      <FeaturedProductsSection />
      <WhyEuSection />
      <CategoryShowcaseSection />
      <TrustQualitySection />
      <CustomerExperienceSection />
      <CtaSection />
    </div>
  );
}
