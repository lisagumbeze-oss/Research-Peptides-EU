import { useTranslation } from 'react-i18next';
import { Building2, BadgeCheck, Microscope, Mail, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { Container, GlassPanel, GlowPanel, Reveal } from '../design-system';
import { HQ_LOCATION, SUPPORT_EMAIL, SUPPORT_PHONE } from '../config/brand';

export default function AboutUs() {
  const { t } = useTranslation('legal');

  return (
    <div className="min-h-screen bg-mist-50 pt-12 pb-20">
      <Container className="max-w-5xl py-12 md:py-16">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
            <Building2 className="h-4 w-4" aria-hidden />
            {t('about.eyebrow')}
          </div>
          <h1 className="text-h1 text-navy-950">{t('about.title')}</h1>
          <p className="text-steel-600 mt-4 max-w-2xl mx-auto">{t('about.subtitle')}</p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Reveal className="lg:col-span-2">
            <GlassPanel variant="light" padding="lg" className="h-full shadow-glow">
              <h2 className="text-xl font-display font-bold text-navy-950 mb-4">
                {t('about.missionTitle')}
              </h2>
              <p className="text-steel-600 leading-relaxed">{t('about.missionBody')}</p>
            </GlassPanel>
          </Reveal>
          <Reveal delay={0.08}>
            <GlowPanel glow="brand" className="bg-navy-950 text-white p-8 h-full">
              <BadgeCheck className="h-6 w-6 text-brand-400 mb-3" aria-hidden />
              <h3 className="font-bold text-lg mb-2">{t('about.qualityTitle')}</h3>
              <p className="text-sm text-silver-400">{t('about.qualityBody')}</p>
            </GlowPanel>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Reveal>
            <GlassPanel variant="light" padding="lg" className="h-full shadow-card">
              <Microscope className="h-6 w-6 text-brand-600 mb-3" aria-hidden />
              <h3 className="text-lg font-bold text-navy-950 mb-2">{t('about.researchTitle')}</h3>
              <p className="text-sm text-steel-600 leading-relaxed">{t('about.researchBody')}</p>
            </GlassPanel>
          </Reveal>
          <Reveal delay={0.06}>
            <GlassPanel variant="light" padding="lg" className="h-full shadow-card">
            <h3 className="text-lg font-bold text-navy-950 mb-4">{t('contact.title')}</h3>
            <div className="space-y-3 text-sm text-steel-600">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-600 shrink-0" aria-hidden />
                <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-brand-600">
                  {SUPPORT_EMAIL}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand-600 shrink-0" aria-hidden />
                {SUPPORT_PHONE}
              </p>
              <p className="text-silver-400">{HQ_LOCATION}</p>
            </div>
            </GlassPanel>
          </Reveal>
        </div>
      </Container>
    </div>
  );
}
