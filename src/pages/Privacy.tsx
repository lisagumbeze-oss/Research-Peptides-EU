import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import { LegalPageLayout, LegalSection } from '../components/legal/LegalPageLayout';
import { SUPPORT_EMAIL } from '../config/brand';

type LegalBlock = { heading: string; body: string };

export default function Privacy() {
  const { t } = useTranslation('legal');
  const sections = t('privacy.sections', { returnObjects: true }) as LegalBlock[];

  return (
    <LegalPageLayout
      eyebrow={t('privacy.eyebrow')}
      title={t('privacy.title')}
      subtitle={t('privacy.subtitle')}
      icon={<Lock className="h-4 w-4" aria-hidden />}
    >
      {sections.map((section) => (
        <LegalSection key={section.heading} heading={section.heading}>
          <p>{section.body}</p>
        </LegalSection>
      ))}
      <p className="text-center text-xs text-silver-400 font-mono pt-4">
        {t('privacy.ref')} ·{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="text-brand-600 hover:underline">
          {SUPPORT_EMAIL}
        </a>
      </p>
    </LegalPageLayout>
  );
}
