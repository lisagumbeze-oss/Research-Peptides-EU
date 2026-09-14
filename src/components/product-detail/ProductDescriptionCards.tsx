import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlaskConical } from 'lucide-react';
import { Reveal } from '../../design-system';
import { parseProductDescription } from '../../lib/parseProductDescription';
import { cn } from '../../lib/utils';

type ProductDescriptionCardsProps = {
  description?: string | null;
  productTitle?: string;
  className?: string;
};

export function ProductDescriptionCards({
  description,
  productTitle,
  className,
}: ProductDescriptionCardsProps) {
  const { t } = useTranslation('product');
  const sections = useMemo(() => parseProductDescription(description), [description]);

  if (!sections.length) return null;

  return (
    <Reveal
      as="section"
      className={cn(
        'rounded-3xl bg-white/90 backdrop-blur-sm border border-brand-100 p-8 md:p-12 shadow-card mb-10',
        className,
      )}
      aria-labelledby="product-dossier-heading"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-caption text-brand-600 mb-2">
            {t('dossier.eyebrow', { defaultValue: 'Research profile' })}
          </p>
          <h2
            id="product-dossier-heading"
            className="text-h2 font-display font-bold text-navy-950"
          >
            {t('dossier.title', { defaultValue: 'Compound dossier' })}
          </h2>
          {productTitle ? (
            <p className="mt-2 text-sm text-steel-600 max-w-xl">
              {t('dossier.subtitle', {
                defaultValue: 'Structured laboratory notes for {{title}}.',
                title: productTitle,
              })}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-mist-50 border border-brand-50 shrink-0">
          <FlaskConical className="h-4 w-4 text-brand-600" aria-hidden />
          <span className="text-sm font-bold text-navy-950 tabular-nums">
            {t('dossier.sectionCount', {
              defaultValue: '{{count}} sections',
              count: sections.length,
            })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
        {sections.map((section, index) => (
          <article
            key={section.id}
            className="flex flex-col p-6 rounded-2xl bg-mist-50 border border-brand-50 min-h-[11rem]"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <h3 className="font-display font-bold text-navy-950 text-base leading-snug">
                {section.title}
              </h3>
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-600 shrink-0">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>

            {section.body ? (
              <div className="text-sm text-steel-600 leading-relaxed space-y-3 flex-1">
                {section.body.split(/\n{2,}/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            ) : null}

            {section.bullets.length > 0 ? (
              <ul className={cn('mt-4 space-y-2', section.body && 'pt-4 border-t border-brand-100')}>
                {section.bullets.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-steel-600 leading-snug">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </Reveal>
  );
}
