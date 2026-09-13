import { LocaleLink } from '../../i18n/LocaleLink';
import { Quote, Star } from 'lucide-react';
import { motion } from 'motion/react';
import scientistLab from '../../assets/scientist_lab.png';
import { Container, Section, Card } from '../../design-system';
import { fadeUpVariants, staggerDelay } from '../../design-system/motion';
import { SectionHeading } from './SectionHeading';

const testimonials = [
  {
    quote:
      'Batch consistency and COA transparency are exceptional. Our EU metabolic research program relies on documented purity for every acquisition.',
    author: 'Dr. Elena V.',
    role: 'Metabolic Research · Munich',
    rating: 5,
  },
  {
    quote:
      'Dispatch from the Netherlands is fast and temperature-aware. Support provided detailed handling documentation for lyophilized compounds.',
    author: 'Prof. James M.',
    role: 'Institutional Lab · Amsterdam',
    rating: 5,
  },
  {
    quote:
      'The catalog depth for GLP-1 and GH-axis peptides is among the best we have sourced for European in-vitro studies.',
    author: 'Dr. Sofia R.',
    role: 'Pharma Research · Barcelona',
    rating: 5,
  },
];

export function CustomerExperienceSection() {
  const enter = fadeUpVariants();

  return (
    <Section size="lg" tone="mist">
      <Container>
        <SectionHeading
          eyebrow="Researcher community"
          title="Trusted across European laboratories"
          description="Institutions choose Research Peptides EU for analytical transparency, logistics reliability, and research-only compliance."
          align="center"
          className="mb-14"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <motion.div
            variants={enter}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-5 relative rounded-3xl overflow-hidden min-h-[280px] border border-brand-100 shadow-elevated group"
          >
            <img
              src={scientistLab}
              alt="Laboratory research environment"
              className="absolute inset-0 w-full h-full object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-[1.04]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <p className="text-white/90 text-sm font-medium leading-relaxed mb-4">
                Join 15,000+ researchers sourcing EU-verified compounds with institutional-grade support.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-warning fill-warning" aria-hidden />
                  ))}
                </div>
                <span className="text-xs font-semibold text-brand-200 uppercase tracking-wider">
                  4.9 average satisfaction
                </span>
              </div>
            </div>
          </motion.div>

          <div className="lg:col-span-7 grid gap-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.author}
                variants={enter}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: staggerDelay(i, 0.08) }}
              >
                <Card variant="trust" className="relative pl-12">
                  <Quote
                    className="absolute left-5 top-5 h-6 w-6 text-brand-200"
                    aria-hidden
                  />
                  <p className="text-steel-600 text-sm leading-relaxed mb-4 italic">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-semibold text-navy-950 text-sm">{t.author}</p>
                      <p className="text-xs text-silver-400">{t.role}</p>
                    </div>
                    <div className="flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
                      {[...Array(t.rating)].map((_, j) => (
                        <Star key={j} className="h-3.5 w-3.5 text-warning fill-warning" aria-hidden />
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="text-center mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-semibold">
          <LocaleLink to="/faq" className="text-brand-600 hover:text-brand-700">
            Researcher FAQ →
          </LocaleLink>
          <LocaleLink to="/blog" className="text-brand-600 hover:text-brand-700">
            Research journal →
          </LocaleLink>
          <LocaleLink to="/peptide-information" className="text-brand-600 hover:text-brand-700">
            Peptide information →
          </LocaleLink>
        </p>
      </Container>
    </Section>
  );
}
