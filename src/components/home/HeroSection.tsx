import { useTranslation } from 'react-i18next';
import { usePreloadImage } from '../../hooks/usePreloadImage';
import {
  ArrowRight,
  ChevronDown,
  FileCheck,
  FlaskConical,
  Microscope,
  ShieldCheck,
  Sparkles,
  Thermometer,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { LocaleLink } from '../../i18n/LocaleLink';
import { Button, buttonClassName, Container, ScientificBackdrop } from '../../design-system';
import { fadeUpVariants, staggerContainerVariants, staggerItemVariants } from '../../design-system/motion';
import { useWizardStore } from '../../store/useWizardStore';
import heroBg from '../../assets/hero_bg.png';
import vialsHero from '../../assets/vials_hero.png';

export function HeroSection() {
  const { t } = useTranslation('home');
  const openWizard = useWizardStore((s) => s.openWizard);
  const reduceMotion = useReducedMotion();
  usePreloadImage(vialsHero);

  const metrics = [
    { value: t('hero.metricPurityValue'), caption: t('hero.metricPurityCaption') },
    { value: t('hero.metricCoaValue'), caption: t('hero.metricCoaCaption') },
    { value: t('hero.metricShipValue'), caption: t('hero.metricShipCaption') },
    { value: t('hero.metricHqValue'), caption: t('hero.metricHqCaption') },
  ];

  const scrollToCatalog = () => {
    document.getElementById('catalog-preview')?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <section className="relative isolate overflow-hidden bg-navy-950">
      <HeroAtmosphere reduceMotion={Boolean(reduceMotion)} />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 items-center gap-10 py-12 md:gap-12 md:py-16 lg:grid-cols-12 lg:gap-10 lg:py-20 xl:py-24">
          <motion.div
            className="lg:col-span-6 xl:col-span-6"
            variants={staggerContainerVariants()}
            initial="hidden"
            animate="visible"
          >
            <motion.p
              variants={staggerItemVariants()}
              className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-brand-400/25 bg-brand-400/10 px-3 py-1.5 text-caption text-brand-200"
            >
              <span className="relative flex h-1.5 w-1.5" aria-hidden>
                <span className="absolute inset-0 rounded-full bg-brand-300 motion-safe:animate-ping opacity-60" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-brand-300" />
              </span>
              {t('hero.eyebrow')}
            </motion.p>

            <motion.h1 variants={staggerItemVariants()} className="text-display text-white mb-5 md:mb-6 max-w-[16ch]">
              {t('hero.title')}{' '}
              <span className="bg-gradient-to-r from-brand-200 via-brand-300 to-brand-400 bg-clip-text text-transparent">
                {t('hero.titleHighlight')}
              </span>
            </motion.h1>

            <motion.div variants={staggerItemVariants()} className="mb-6 max-w-xl" aria-hidden>
              <HplcTrace />
            </motion.div>

            <motion.p
              variants={staggerItemVariants()}
              className="mb-8 max-w-xl text-sm leading-relaxed text-silver-400 md:mb-9 md:text-base"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              variants={staggerItemVariants()}
              className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
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
                className="shrink-0 gap-2 border border-white/15 bg-white/5 whitespace-nowrap hover:bg-white/10"
              >
                <Sparkles className="h-4 w-4 shrink-0 text-brand-300" />
                {t('hero.ctaWizard')}
              </Button>
            </motion.div>

            <motion.p
              variants={staggerItemVariants()}
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand-200/70"
            >
              {t('hero.researchOnly')}
            </motion.p>
          </motion.div>

          <div className="lg:col-span-6 xl:col-span-6">
            <HeroSpecimenStage
              reduceMotion={Boolean(reduceMotion)}
              panelLabel={t('hero.specimenPanel')}
              compoundLabel={t('hero.specimenCompound')}
              statusLabel={t('hero.specimenStatus')}
              methodLabel={t('hero.specimenMethod')}
              storageLabel={t('hero.specimenStorage')}
              imageAlt={t('hero.specimenAlt')}
            />
          </div>
        </div>

        <motion.ul
          className="mb-8 grid grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl md:mb-10 lg:grid-cols-4"
          variants={staggerContainerVariants()}
          initial="hidden"
          animate="visible"
        >
          {metrics.map((metric, index) => (
            <motion.li
              key={metric.caption}
              variants={staggerItemVariants()}
              className={`flex flex-col gap-1 px-4 py-4 sm:px-5 sm:py-5 ${
                index % 2 === 1 ? 'border-l border-white/10' : ''
              } ${index >= 2 ? 'border-t border-white/10' : ''} lg:border-t-0 lg:border-l lg:first:border-l-0`}
            >
              <span className="font-display text-lg font-semibold tracking-tight text-white sm:text-xl">
                {metric.value}
              </span>
              <span className="text-[11px] leading-snug text-silver-400 sm:text-xs">{metric.caption}</span>
            </motion.li>
          ))}
        </motion.ul>
      </Container>

      <div className="relative z-10 flex justify-center pb-6 md:pb-8">
        <button
          type="button"
          onClick={scrollToCatalog}
          className="inline-flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-brand-200/80 transition-colors hover:text-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          aria-label={t('hero.explore')}
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em]">{t('hero.explore')}</span>
          <ChevronDown className="h-5 w-5 motion-safe:animate-bounce" aria-hidden />
        </button>
      </div>
    </section>
  );
}

function HeroAtmosphere({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="absolute inset-0" aria-hidden>
      <img
        src={heroBg}
        alt=""
        className="h-full w-full object-cover object-[center_20%] opacity-20 md:opacity-28"
        loading="eager"
        decoding="async"
        fetchPriority="low"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(45,181,163,0.18),transparent_42%),radial-gradient(ellipse_at_80%_20%,rgba(26,54,93,0.55),transparent_50%),linear-gradient(180deg,rgba(15,39,68,0.72)_0%,rgba(15,39,68,0.88)_55%,#0f2744_100%)]" />
      <ScientificBackdrop variant="dark" glow className="opacity-80" />
      <div
        className={`hero-orb pointer-events-none absolute -top-24 left-[8%] h-[22rem] w-[22rem] rounded-full bg-brand-400/20 blur-3xl ${
          reduceMotion ? '' : 'motion-safe:animate-[hero-orb-drift_16s_ease-in-out_infinite]'
        }`}
      />
      <div
        className={`hero-orb pointer-events-none absolute top-[30%] right-[-6%] h-[26rem] w-[26rem] rounded-full bg-navy-900/70 blur-3xl ${
          reduceMotion ? '' : 'motion-safe:animate-[hero-orb-drift_20s_ease-in-out_infinite_reverse]'
        }`}
      />
    </div>
  );
}

function HeroSpecimenStage({
  reduceMotion,
  panelLabel,
  compoundLabel,
  statusLabel,
  methodLabel,
  storageLabel,
  imageAlt,
}: {
  reduceMotion: boolean;
  panelLabel: string;
  compoundLabel: string;
  statusLabel: string;
  methodLabel: string;
  storageLabel: string;
  imageAlt: string;
}) {
  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
      <div className="absolute -inset-px rounded-[1.75rem] bg-gradient-to-br from-brand-300/35 via-white/10 to-transparent opacity-80" aria-hidden />
      <div className="relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-slate-850/70 shadow-glow backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-brand-200/80">
            <Microscope className="h-3.5 w-3.5 text-brand-300" aria-hidden />
            {panelLabel}
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-silver-400">{compoundLabel}</span>
        </div>

        <div className="relative flex min-h-[220px] items-center justify-center px-4 py-8 sm:min-h-[280px] sm:px-8 sm:py-10 lg:min-h-[320px]">
          {reduceMotion ? (
            <div className="absolute h-48 w-48 rounded-full bg-brand-400/25 blur-3xl sm:h-56 sm:w-56" />
          ) : (
            <motion.div
              className="absolute h-48 w-48 rounded-full bg-brand-400/25 blur-3xl sm:h-56 sm:w-56"
              animate={{ scale: [1, 1.1, 1], opacity: [0.35, 0.55, 0.35] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          <motion.img
            src={vialsHero}
            alt={imageAlt}
            width={640}
            height={360}
            variants={fadeUpVariants()}
            initial="hidden"
            animate="visible"
            className="relative z-10 w-full max-w-[20rem] aspect-[16/9] object-contain drop-shadow-[0_24px_48px_rgba(45,181,163,0.32)] sm:max-w-[26rem] lg:max-w-[30rem]"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </div>

        <ul className="grid grid-cols-3 border-t border-white/10">
          <SpecimenSpec icon={ShieldCheck} label={statusLabel} />
          <SpecimenSpec icon={FileCheck} label={methodLabel} />
          <SpecimenSpec icon={Thermometer} label={storageLabel} />
        </ul>
      </div>

      <div className="pointer-events-none absolute -left-4 top-24 hidden rounded-xl border border-white/10 bg-navy-950/80 px-3 py-2 shadow-elevated backdrop-blur-md xl:block">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-3.5 w-3.5 text-brand-300" aria-hidden />
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-brand-100">{methodLabel}</span>
        </div>
      </div>
    </div>
  );
}

function SpecimenSpec({ icon: Icon, label }: { icon: typeof ShieldCheck; label: string }) {
  return (
    <li className="flex items-start gap-2 border-white/10 px-3 py-3 [&:not(:first-child)]:border-l sm:px-4">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-300" aria-hidden />
      <span className="text-[10px] leading-snug text-brand-100 sm:text-[11px]">{label}</span>
    </li>
  );
}

function HplcTrace() {
  return (
    <svg viewBox="0 0 420 36" className="h-8 w-full max-w-md text-brand-400/70" fill="none" aria-hidden>
      <path
        d="M0 28 C28 28 36 28 48 26 C64 24 70 8 86 8 C102 8 108 22 124 24 C142 26 150 18 168 12 C186 6 196 4 212 4 C230 4 236 16 252 20 C270 25 282 14 298 10 C316 5 328 8 344 16 C360 24 372 28 390 28 H420"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M0 28 C28 28 36 28 48 26 C64 24 70 8 86 8 C102 8 108 22 124 24 C142 26 150 18 168 12 C186 6 196 4 212 4 C230 4 236 16 252 20 C270 25 282 14 298 10 C316 5 328 8 344 16 C360 24 372 28 390 28 H420"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}
