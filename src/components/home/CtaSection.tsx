import { LocaleLink } from '../../i18n/LocaleLink';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Reveal, Button, buttonClassName, Container, GlowPanel } from '../../design-system';
import { useWizardStore } from '../../store/useWizardStore';

export function CtaSection() {
  const openWizard = useWizardStore((s) => s.openWizard);

  return (
    <section className="section-md">
      <Container>
        <GlowPanel glow="brand" scientific className="p-10 md:p-14 text-center">
          <Reveal>
            <p className="text-caption text-brand-300 mb-4">Equip your laboratory</p>
            <h2 className="text-h1 text-white font-display font-bold mb-4 max-w-2xl mx-auto">
              Access Europe&apos;s research peptide catalog
            </h2>
            <p className="text-silver-400 text-sm md:text-base max-w-xl mx-auto mb-8 leading-relaxed">
              Verified purity, COA-backed batches, and Netherlands-based EU fulfillment — built for
              laboratories that require documented analytical standards.
            </p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-3">
              <LocaleLink
                to="/shop"
                className={buttonClassName({
                  size: 'lg',
                  className: 'relative z-10 w-full sm:w-auto shrink-0 whitespace-nowrap',
                })}
              >
                Shop catalog
                <ArrowRight className="h-4 w-4 shrink-0 motion-safe:transition-transform motion-safe:duration-200 group-hover:translate-x-0.5" />
              </LocaleLink>
              <Button variant="ghost" size="lg" onClick={openWizard} className="gap-2 border border-white/15 whitespace-nowrap">
                <Sparkles className="h-4 w-4 shrink-0 text-brand-300" />
                Browse by research area
              </Button>
            </div>
          </Reveal>
        </GlowPanel>
      </Container>
    </section>
  );
}
