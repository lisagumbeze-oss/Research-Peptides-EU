import { useTranslation } from 'react-i18next';
import { Scale } from 'lucide-react';
import { LegalPageLayout, LegalSection } from '../components/legal/LegalPageLayout';

type LegalBlock = { heading: string; body: string };

export default function Terms() {
  const { t } = useTranslation('legal');
  const sections = t('terms.sections', { returnObjects: true }) as LegalBlock[];

  return (
    <LegalPageLayout
      eyebrow={t('terms.eyebrow')}
      title={t('terms.title')}
      subtitle={t('terms.subtitle')}
      icon={<Scale className="h-4 w-4" aria-hidden />}
    >
      {sections.map((section) => (
        <LegalSection key={section.heading} heading={section.heading}>
          <p>{section.body}</p>
        </LegalSection>
      ))}
      <p className="text-center text-xs text-silver-400 uppercase tracking-wider pt-4">
        {t('terms.footer')}
      </p>
    </LegalPageLayout>
  );
}
