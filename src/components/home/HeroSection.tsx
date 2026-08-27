import { useTranslation } from 'react-i18next';
import { usePreloadImage } from '../../hooks/usePreloadImage';
import { ArrowRight, ChevronDown, FlaskConical, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { LocaleLink } from '../../i18n/LocaleLink';
import { Button, buttonClassName, Container, GlassPanel, ScientificBackdrop } from '../../design-system';
import { fadeUpVariants, staggerContainerVariants, staggerItemVariants } from '../../design-system/motion';
import { useWizardStore } from '../../store/useWizardStore';
import heroBg from '../../assets/hero_bg.png';
import vialsHero from '../../assets/vials_hero.png';

export function HeroSection() {
  const { t } = useTranslation('home');
  const openWizard = useWizardStore((s) => s.openWizard);
  const reduceMotion = useReducedMotion();
  usePreloadImage(vialsHero);

  const trustPills = [
    { icon: ShieldCheck, label: t('hero.trustPurity') },
    { icon: Truck, label: t('hero.trustShipping') },
    { icon: FlaskConical, label: t('hero.trustCoa') },
  ];

  const scrollToCatalog = () => {
    document.getElementById('catalog-preview')?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <section className="relative overflow-hidden bg-navy-950">
      <div className="absolute inset-0" aria-hidden>
        <img
          src={heroBg}
          alt=""
          className="hidden md:block h-full w-full object-cover opacity-35"
          loading="lazy"
          decoding="async"
          fetchPriority="low"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/70 to-navy-950/50" />
        <ScientificBackdrop variant="dark" className="opacity-90" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-glow pointer-events-none" aria-hidden />
      </div>

      <Container className="relative z-10 py-16 md:py-24 lg:py-28">
        <GlassPanel variant="dark" padding="none" className="overflow-hidden shadow-glow">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.85fr)] items-center">
            <motion.div
              className="p-8 md:p-12 lg:p-12 lg:pr-8"
              variants={staggerContainerVariants()}
              initial="hidden"
              animate="visible"
            >
              <motion.p variants={staggerItemVariants()} className="text-caption text-brand-300 mb-4">
                {t('hero.eyebrow')}
              </motion.p>

              <motion.h1 variants={staggerItemVariants()} className="text-display text-white mb-6">
                {t('hero.title')}{' '}
                <span className="text-gradient-brand">{t('hero.titleHighlight')}</span>
              </motion.h1>

              <motion.p
                variants={staggerItemVariants()}
                className="text-silver-400 text-sm md:text-base leading-relaxed mb-8 max-w-lg"
              >
                {t('hero.subtitle')}
              </motion.p>

              <motion.div
                variants={staggerItemVariants()}
                className="flex flex-col sm:flex-row lg:flex-nowrap gap-3 mb-10"
              >
                <LocaleLink
                  to="/shop"
                  className={buttonClassName({
                    size: 'lg',
                    className: 'relative z-10 w-full sm:w-auto shrink-0 whitespace-nowrap',
                  })}
                >
                  {t('hero.ctaShop')}
                  <ArrowRight className="h-4 w-4 shrink-0 motion-safe:transition-transform motion-safe:duration-200 group-hover:translate-x-0.5" />
                </LocaleLink>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={openWizard}
                  className="shrink-0 gap-2 border border-white/15 whitespace-nowrap"
                >
                  <Sparkles className="h-4 w-4 shrink-0 text-brand-300" />
                  {t('hero.ctaWizard')}
                </Button>
              </motion.div>

              <motion.ul variants={staggerItemVariants()} className="flex flex-nowrap items-center gap-2 overflow-x-auto">
                {trustPills.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="inline-flex items-center gap-2 shrink-0 whitespace-nowrap rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-medium text-brand-100"
                  >
                    <Icon className="h-3.5 w-3.5 text-brand-400 shrink-0" aria-hidden />
                    {label}
                  </li>
                ))}
              </motion.ul>
            </motion.div>

            <div className="relative flex items-center justify-center p-6 lg:p-8 min-h-[220px] lg:min-h-0">
              {!reduceMotion ? (
                <motion.div
                  className="absolute w-52 h-52 rounded-full bg-brand-400/25 blur-3xl"
                  animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.55, 0.4] }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                  aria-hidden
                />
              ) : (
                <div className="absolute w-52 h-52 rounded-full bg-brand-400/25 blur-3xl" aria-hidden />
              )}
              <motion.img
                src={vialsHero}
                alt="Premium research peptide vials"
                width={384}
                height={384}
                variants={fadeUpVariants()}
                initial="hidden"
                animate="visible"
                className="relative z-10 w-full max-w-[18rem] sm:max-w-[20rem] lg:max-w-[22rem] aspect-square object-contain drop-shadow-[0_24px_48px_rgba(67,87,214,0.35)]"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            </div>
          </div>
        </GlassPanel>
      </Container>

      <div className="relative z-10 flex justify-center pb-6">
        <button
          type="button"
          onClick={scrollToCatalog}
          className="inline-flex flex-col items-center gap-1 text-brand-200/80 hover:text-brand-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded-xl px-3 py-2"
          aria-label="Scroll to featured compounds"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em]">Explore catalog</span>
          <ChevronDown
            className="h-5 w-5 motion-safe:animate-bounce"
            aria-hidden
          />
        </button>
      </div>
    </section>
  );
}
