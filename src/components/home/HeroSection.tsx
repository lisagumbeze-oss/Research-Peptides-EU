import { useTranslation } from 'react-i18next';
import { ArrowRight, FlaskConical, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { motion } from 'motion/react';
import { LocaleLink } from '../../i18n/LocaleLink';
import { Button, Container, GlassPanel } from '../../design-system';
import { useWizardStore } from '../../store/useWizardStore';
import heroBg from '../../assets/hero_bg.png';
import vialsHero from '../../assets/vials_hero.png';

export function HeroSection() {
  const { t } = useTranslation('home');
  const openWizard = useWizardStore((s) => s.openWizard);

  const trustPills = [
    { icon: ShieldCheck, label: t('hero.trustPurity') },
    { icon: Truck, label: t('hero.trustShipping') },
    { icon: FlaskConical, label: t('hero.trustCoa') },
  ];

  return (
    <section className="relative overflow-hidden bg-navy-950">
      <div className="absolute inset-0" aria-hidden>
        <img src={heroBg} alt="" className="h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/70 to-navy-950/50" />
        <div className="absolute inset-0 bg-scientific-grid opacity-25" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-glow" />
      </div>

      <Container className="relative z-10 py-16 md:py-24 lg:py-28">
        <GlassPanel variant="dark" padding="none" className="overflow-hidden shadow-glow">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
            <div className="p-8 md:p-12 lg:p-14">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-caption text-brand-300 mb-4"
              >
                {t('hero.eyebrow')}
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.05 }}
                className="text-display text-white mb-6"
              >
                {t('hero.title')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-400">
                  {t('hero.titleHighlight')}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.12 }}
                className="text-silver-400 text-sm md:text-base leading-relaxed mb-8 max-w-lg"
              >
                {t('hero.subtitle')}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.18 }}
                className="flex flex-col sm:flex-row gap-3 mb-10"
              >
                <LocaleLink to="/shop">
                  <Button size="lg" className="w-full sm:w-auto gap-2">
                    {t('hero.ctaShop')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </LocaleLink>
                <Button variant="ghost" size="lg" onClick={openWizard} className="gap-2 border border-white/15">
                  <Sparkles className="h-4 w-4 text-brand-300" />
                  {t('hero.ctaWizard')}
                </Button>
              </motion.div>

              <motion.ul
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-2"
              >
                {trustPills.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-medium text-brand-100"
                  >
                    <Icon className="h-3.5 w-3.5 text-brand-400 shrink-0" aria-hidden />
                    {label}
                  </li>
                ))}
              </motion.ul>
            </div>

            <div className="relative flex items-center justify-center p-8 lg:p-12 min-h-[280px] lg:min-h-0">
              <motion.div
                className="absolute w-64 h-64 rounded-full bg-brand-500/20 blur-3xl"
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden
              />
              <motion.img
                src={vialsHero}
                alt="Premium research peptide vials"
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.25 }}
                className="relative z-10 w-full max-w-md object-contain drop-shadow-[0_24px_48px_rgba(67,87,214,0.35)]"
              />
            </div>
          </div>
        </GlassPanel>
      </Container>
    </section>
  );
}
