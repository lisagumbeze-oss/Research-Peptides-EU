import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Button, Container, GlowPanel } from '../../design-system';
import { useWizardStore } from '../../store/useWizardStore';

export function CtaSection() {
  const openWizard = useWizardStore((s) => s.openWizard);

  return (
    <section className="section-md">
      <Container>
        <GlowPanel glow="brand" scientific className="p-10 md:p-14 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-caption text-brand-300 mb-4">Start your research protocol</p>
            <h2 className="text-h1 text-white font-display font-bold mb-4 max-w-2xl mx-auto">
              Access Europe&apos;s premium research peptide catalog today
            </h2>
            <p className="text-silver-400 text-sm md:text-base max-w-xl mx-auto mb-8 leading-relaxed">
              Verified purity, COA-backed batches, and Netherlands-based EU fulfillment — built for
              laboratories that demand clinical precision.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/shop">
                <Button size="lg" className="gap-2 min-w-[200px]">
                  Shop catalog
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="lg" onClick={openWizard} className="gap-2 border border-white/15 min-w-[200px]">
                <Sparkles className="h-4 w-4 text-brand-300" />
                Find your compound
              </Button>
            </div>
          </motion.div>
        </GlowPanel>
      </Container>
    </section>
  );
}
