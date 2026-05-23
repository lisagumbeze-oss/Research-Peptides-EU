import { Activity, Award, FlaskConical, Microscope } from 'lucide-react';
import { motion } from 'motion/react';
import { Card, Container, Section } from '../../design-system';
import { SectionHeading } from './SectionHeading';
import { staggerContainerVariants, staggerItem } from '../../design-system/motion';

const pillars = [
  {
    icon: FlaskConical,
    title: 'Research quality',
    desc: 'Every batch is synthesized and validated against strict analytical benchmarks before release to catalog.',
  },
  {
    icon: Microscope,
    title: 'Product purity',
    desc: 'HPLC and mass spectrometry workflows target 99.8%+ consistency for reproducible laboratory outcomes.',
  },
  {
    icon: Activity,
    title: 'Manufacturing standards',
    desc: 'Temperature-controlled handling, lyophilized stability protocols, and documented chain of custody.',
  },
  {
    icon: Award,
    title: 'Scientific innovation',
    desc: 'Continuous expansion of GLP-1, GH-axis, and mitochondrial peptide lines aligned with EU research demand.',
  },
];

export function WhyEuSection() {
  return (
    <Section size="lg" tone="light">
      <Container>
        <SectionHeading
          eyebrow="Why Research Peptides EU"
          title={
            <>
              Built for institutional{' '}
              <span className="text-brand-600">scientific trust</span>
            </>
          }
          description="Headquartered in the Netherlands, we combine European regulatory discipline with pharmaceutical-grade logistics for research teams across the EU."
          align="center"
          className="mb-14"
        />

        <motion.div
          variants={staggerContainerVariants()}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {pillars.map((item) => (
            <motion.div key={item.title} variants={staggerItem}>
              <Card variant="feature" className="h-full group hover:border-brand-200 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center mb-5 shadow-card group-hover:shadow-elevated transition-shadow">
                  <item.icon className="h-7 w-7 text-white" aria-hidden />
                </div>
                <h3 className="font-display font-bold text-lg text-navy-950 mb-2">{item.title}</h3>
                <p className="text-sm text-steel-600 leading-relaxed">{item.desc}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Section>
  );
}
