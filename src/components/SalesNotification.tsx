import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X } from 'lucide-react';
import { europeanLocations, sampleProducts } from '../data/europeanCountries';
import { useLocaleNavigate } from '../i18n/useLocaleNavigate';
import { localeToIntl } from '../lib/currency';
import { isLocaleCode, type LocaleCode } from '../i18n/locales';

/** English country labels in `europeanLocations` → ISO 3166-1 alpha-2 */
const COUNTRY_ISO: Record<string, string> = {
  'United Kingdom': 'GB',
  Germany: 'DE',
  France: 'FR',
  Spain: 'ES',
  Italy: 'IT',
  Netherlands: 'NL',
  Sweden: 'SE',
  Norway: 'NO',
  Denmark: 'DK',
  Switzerland: 'CH',
  Austria: 'AT',
  Belgium: 'BE',
  Ireland: 'IE',
  Poland: 'PL',
  Portugal: 'PT',
  Finland: 'FI',
  'Czech Republic': 'CZ',
};

type TimeAgo =
  | { kind: 'justNow' }
  | { kind: 'minutes'; count: number };

interface PurchaseEvent {
  id: number;
  product: string;
  city: string;
  country: string;
  time: TimeAgo;
}

const TIME_OPTIONS: TimeAgo[] = [
  { kind: 'justNow' },
  { kind: 'minutes', count: 2 },
  { kind: 'minutes', count: 5 },
  { kind: 'minutes', count: 12 },
];

function localizedCountryName(countryEn: string, locale: LocaleCode): string {
  const code = COUNTRY_ISO[countryEn];
  if (!code) return countryEn;
  try {
    return new Intl.DisplayNames([localeToIntl(locale)], { type: 'region' }).of(code) ?? countryEn;
  } catch {
    return countryEn;
  }
}

export default function SalesNotification() {
  const { t, i18n } = useTranslation('common', { keyPrefix: 'salesNotification' });
  const navigate = useLocaleNavigate();
  const locale = (isLocaleCode(i18n.language) ? i18n.language : 'en') as LocaleCode;
  const [currentEvent, setCurrentEvent] = useState<PurchaseEvent | null>(null);

  const locationLabel = useMemo(() => {
    if (!currentEvent) return '';
    const country = localizedCountryName(currentEvent.country, locale);
    return `${currentEvent.city}, ${country}`;
  }, [currentEvent, locale]);

  const timeLabel = useMemo(() => {
    if (!currentEvent) return '';
    if (currentEvent.time.kind === 'justNow') return t('justNow');
    return t('minutesAgo', { count: currentEvent.time.count });
  }, [currentEvent, t]);

  useEffect(() => {
    const scheduleNextNotification = () => {
      const delay = Math.floor(Math.random() * (45000 - 15000 + 1)) + 15000;

      return setTimeout(() => {
        const product = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
        const location = europeanLocations[Math.floor(Math.random() * europeanLocations.length)];
        const time = TIME_OPTIONS[Math.floor(Math.random() * TIME_OPTIONS.length)];

        setCurrentEvent({
          id: Date.now(),
          product,
          city: location.city,
          country: location.country,
          time,
        });

        setTimeout(() => {
          setCurrentEvent(null);
        }, 5000);

        scheduleNextNotification();
      }, delay);
    };

    const timeout = scheduleNextNotification();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <AnimatePresence>
      {currentEvent && (
        <motion.div
          key={currentEvent.id}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed z-[60] bottom-20 md:bottom-6 md:left-6 left-1/2 -translate-x-1/2 md:translate-x-0 w-11/12 max-w-[340px]"
        >
          <div
            onClick={() => navigate(`/search?q=${encodeURIComponent(currentEvent.product)}`)}
            className="bg-white rounded-xl shadow-elevated border border-brand-100 overflow-hidden flex items-stretch cursor-pointer hover:bg-mist-50 transition-colors"
          >
            <div className="bg-gradient-cta flex items-center justify-center px-4 shrink-0">
              <CheckCircle2 className="text-white w-6 h-6" aria-hidden />
            </div>

            <div className="p-3 flex-1 min-w-0">
              <p className="text-[13px] text-steel-600 mb-0.5 leading-tight">
                {t('purchased', { location: locationLabel })}
              </p>
              <p className="text-sm font-bold text-navy-950 line-clamp-1 leading-tight">
                {currentEvent.product}
              </p>
              <p className="text-[11px] text-brand-600 mt-1 font-medium">{timeLabel}</p>
            </div>

            <button
              type="button"
              aria-label={t('dismiss')}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentEvent(null);
              }}
              className="absolute top-2 right-2 text-silver-400 hover:text-brand-600 p-1"
            >
              <X className="w-3 h-3" aria-hidden />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
