import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, ChevronDown, FlaskConical, Truck, CreditCard } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { LegalPageLayout } from '../components/legal/LegalPageLayout';
import { LocaleLink } from '../i18n/LocaleLink';
import { buttonClassName, Reveal } from '../design-system';
import { accordionMotion } from '../design-system/motion';
import { cn } from '../lib/utils';
import { usePageSeo } from '../seo/SeoProvider';
import { AnswerCapsule } from '../components/seo/AnswerCapsule';
import { HQ_LOCATION, SUPPORT_EMAIL } from '../config/brand';

const GROUP_META = [
  { key: 'product', icon: FlaskConical },
  { key: 'logistics', icon: Truck },
  { key: 'payments', icon: CreditCard },
] as const;

type FaqItem = { q: string; a: string };

export default function FAQ() {
  const { t } = useTranslation('legal');
  const [openIndex, setOpenIndex] = useState<string | null>('0-0');
  const reduceMotion = useReducedMotion();
  const panelMotion = accordionMotion(Boolean(reduceMotion));
  
  // Aggregate all FAQs for Schema
  const allFaqItems = GROUP_META.flatMap(group => 
    (t(`faq.groups.${group.key}.items`, { returnObjects: true }) as FaqItem[]) || []
  );

  usePageSeo({
    title: 'FAQ | Research Peptides EU',
    description:
      'Answers on research-use policies, EU shipping, purity testing, and ordering research peptides from Research Peptides EU.',
    canonicalPath: '/faq',
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": allFaqItems.map(item => ({
          "@type": "Question",
          "name": item.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.a
          }
        }))
      }
    ]
  });

  const toggle = (idx: string) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <LegalPageLayout
      eyebrow={t('faq.eyebrow')}
      title={t('faq.title')}
      subtitle={t('faq.subtitle')}
      icon={<HelpCircle className="h-4 w-4" aria-hidden />}
    >
      <Reveal className="mb-10">
        <AnswerCapsule title="Quick answer: shipping, purity, and research use">
          <p>
            Research Peptides EU supplies research-grade peptides for laboratory use only — not for human
            consumption. Orders dispatch from the Netherlands ({HQ_LOCATION}) across the EU with EUR pricing.
            Batches emphasize third-party testing; see the{' '}
            <LocaleLink to="/coas" className="text-brand-700 font-semibold hover:underline">
              COA library
            </LocaleLink>{' '}
            and contact {SUPPORT_EMAIL} for order questions.
          </p>
        </AnswerCapsule>
      </Reveal>

      {GROUP_META.map((group, groupIdx) => {
        const items = t(`faq.groups.${group.key}.items`, {
          returnObjects: true,
        }) as FaqItem[];
        return (
          <section key={group.key}>
            <div className="flex items-center gap-3 mb-4 border-b border-brand-100 pb-3">
              <group.icon className="h-5 w-5 text-brand-600" aria-hidden />
              <h3 className="text-sm font-bold uppercase tracking-wider text-navy-950 m-0">
                {t(`faq.groups.${group.key}.title`)}
              </h3>
            </div>
            <div className="space-y-2">
              {items.map((item, qIdx) => {
                const id = `${groupIdx}-${qIdx}`;
                const isOpen = openIndex === id;
                return (
                  <div
                    key={id}
                    className={cn(
                      'border rounded-2xl transition-all',
                      isOpen
                        ? 'border-brand-200 bg-brand-50/40'
                        : 'border-brand-100 bg-white hover:border-brand-200',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(id)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${id}`}
                      className="w-full px-5 py-4 flex items-center justify-between text-left gap-3"
                    >
                      <span className="font-semibold text-navy-950 text-sm md:text-base leading-snug">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={cn(
                          'h-5 w-5 text-silver-400 shrink-0 transition-transform motion-reduce:transition-none',
                          isOpen && 'rotate-180',
                        )}
                        aria-hidden
                      />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          id={`faq-panel-${id}`}
                          role="region"
                          {...panelMotion}
                        >
                          <p className="px-5 pb-4 text-sm text-steel-600">{item.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <Reveal className="bg-navy-950 rounded-3xl p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 rounded-full blur-3xl" aria-hidden />
        <h3 className="text-white font-display font-bold mb-2 relative z-10">{t('faq.ctaTitle')}</h3>
        <p className="text-silver-400 text-sm mb-6 relative z-10">{t('faq.ctaBody')}</p>
        <LocaleLink
          to="/contact"
          className={buttonClassName({ className: 'relative z-10 whitespace-nowrap' })}
        >
          {t('faq.ctaButton')}
        </LocaleLink>
      </Reveal>
    </LegalPageLayout>
  );
}
