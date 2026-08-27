import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LocaleLink } from '../../i18n/LocaleLink';
import { FlaskConical } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Button } from '../../design-system';
import { modalMotion, overlayMotion } from '../../design-system/motion';

const AGE_GATE_KEY = 'rp-eu-age-gate';

export function AgeGate() {
  const { t } = useTranslation('legal');
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();
  const overlay = overlayMotion(Boolean(reduceMotion));
  const panel = modalMotion(Boolean(reduceMotion));

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AGE_GATE_KEY);
      if (stored !== 'confirmed') setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const confirm = () => {
    try {
      localStorage.setItem(AGE_GATE_KEY, 'confirmed');
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="age-gate-title"
          aria-describedby="age-gate-desc"
          {...overlay}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm"
        >
          <motion.div
            {...panel}
            className="w-full max-w-md bg-white border border-brand-100 rounded-2xl shadow-elevated p-6 md:p-8"
          >
            <div className="flex gap-3 mb-5">
              <div className="shrink-0 w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center">
                <FlaskConical className="h-5 w-5 text-brand-600" aria-hidden />
              </div>
              <div>
                <h2 id="age-gate-title" className="font-display font-bold text-navy-950 text-lg">
                  {t('ageGate.title')}
                </h2>
                <p id="age-gate-desc" className="text-sm text-steel-600 mt-2 leading-relaxed">
                  {t('ageGate.description')}
                </p>
              </div>
            </div>
            <Button size="lg" fullWidth onClick={confirm}>
              {t('ageGate.confirm')}
            </Button>
            <p className="text-center text-xs text-steel-500 mt-4 leading-relaxed">
              {t('ageGate.footer')}{' '}
              <LocaleLink to="/terms" className="text-brand-600 font-semibold hover:text-brand-700">
                {t('ageGate.termsLink')}
              </LocaleLink>
              .
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
