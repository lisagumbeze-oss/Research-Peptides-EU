import { useTranslation } from 'react-i18next';
import { RotateCcw, AlertTriangle, Mail, ShieldCheck } from 'lucide-react';
import { LegalPageLayout, LegalSection } from '../components/legal/LegalPageLayout';
import { SUPPORT_EMAIL } from '../config/brand';

export default function RefundReturns() {
  const { t } = useTranslation('legal');

  return (
    <LegalPageLayout
      eyebrow={t('refund.eyebrow')}
      title={t('refund.title')}
      subtitle={t('refund.subtitle')}
      icon={<RotateCcw className="h-4 w-4" aria-hidden />}
    >
      <div className="bg-error/10 border border-error/20 rounded-3xl p-6 flex gap-4">
        <AlertTriangle className="h-6 w-6 text-error shrink-0" aria-hidden />
        <p className="text-sm text-navy-950 m-0 leading-relaxed">
          Temperature-sensitive research compounds cannot be resold after dispatch. Claims are limited to
          verified fulfillment errors within 7 days of delivery.
        </p>
      </div>

      <LegalSection heading="Eligible cases">
        <ul className="list-disc pl-5 space-y-2">
          <li>Incorrect item vs. order confirmation</li>
          <li>Transit damage to vial integrity or seal</li>
          <li>Missing line item on a tracked shipment</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Non-eligible">
        <ul className="list-disc pl-5 space-y-2">
          <li>Change of mind after dispatch</li>
          <li>Opened, used, or improperly stored products</li>
          <li>Claims after the review window</li>
        </ul>
      </LegalSection>

      <p>{t('refund.body')}</p>

      <div className="bg-navy-950 text-white rounded-3xl p-8 flex flex-col sm:flex-row gap-6 justify-between items-start">
        <div>
          <h3 className="text-white font-display font-bold text-lg mb-2">Returns support</h3>
          <p className="text-silver-400 text-sm">{t('refund.body')}</p>
        </div>
        <div className="space-y-2 text-sm shrink-0">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="flex items-center gap-2 text-brand-300 hover:text-white"
          >
            <Mail className="h-4 w-4" aria-hidden />
            {SUPPORT_EMAIL}
          </a>
          <p className="flex items-center gap-2 text-silver-400">
            <ShieldCheck className="h-4 w-4" aria-hidden />
            Tracked dispatch review
          </p>
        </div>
      </div>
    </LegalPageLayout>
  );
}
