import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../../design-system';
import { useLocalizedPath } from '../../i18n/useLocalizedPath';

const AGE_GATE_KEY = 'rp-eu-age-gate';

export function AgeGate() {
  const { t } = useTranslation('legal');
  const termsPath = useLocalizedPath('/terms');
  const [visible, setVisible] = useState(false);

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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
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
              <Link to={termsPath} className="text-brand-600 font-semibold hover:text-brand-700">
                {t('ageGate.termsLink')}
              </Link>
              .
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
