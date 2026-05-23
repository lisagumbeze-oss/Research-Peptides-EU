import { BadgeCheck, FileCheck, ShieldCheck, Thermometer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Container, Section, GlowPanel } from '../../design-system';
import { SectionHeading } from './SectionHeading';

const standards = [
  {
    icon: ShieldCheck,
    title: 'Third-party testing',
    desc: 'Independent verification of purity and identity for every production batch.',
  },
  {
    icon: FileCheck,
    title: 'COA documentation',
    desc: 'Certificate of Analysis references available through our COA library.',
  },
  {
    icon: Thermometer,
    title: 'Cold-chain integrity',
    desc: 'Lyophilized storage and EU dispatch protocols protect compound stability.',
  },
  {
    icon: BadgeCheck,
    title: 'Research compliance',
    desc: 'Strictly for in-vitro laboratory use — not for human or veterinary application.',
  },
];

export function TrustQualitySection() {
  return (
    <Section size="lg" tone="light">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <SectionHeading
            eyebrow="Trust & quality"
            title={
              <>
                Pharmaceutical-grade{' '}
                <span className="text-brand-600">lab standards</span>
              </>
            }
            description="Our quality system is designed for European research institutions that require traceability, analytical rigor, and consistent batch performance."
          />

          <GlowPanel glow="brand" className="p-8 md:p-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {standards.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex gap-4"
                >
                  <div className="shrink-0 w-11 h-11 rounded-xl bg-brand-500/30 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-brand-200" aria-hidden />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-silver-400 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <Link
              to="/coas"
              className="inline-flex mt-8 text-sm font-semibold text-brand-300 hover:text-white transition-colors"
            >
              Open COA library →
            </Link>
          </GlowPanel>
        </div>
      </Container>
    </Section>
  );
}
