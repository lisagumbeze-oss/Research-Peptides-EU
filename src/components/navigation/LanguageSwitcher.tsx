import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Globe } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { supportedLocales, type LocaleCode } from '../../i18n/locales';
import { useLocale } from '../../i18n/LocaleProvider';
import { pathWithLocale, persistLocaleCookie, stripLocaleFromPath } from '../../i18n/routing';
import { cn } from '../../lib/utils';

type LanguageSwitcherProps = {
  variant?: 'header' | 'mobile';
};

export default function LanguageSwitcher({ variant = 'header' }: LanguageSwitcherProps) {
  const { locale, setLocale, localeLabel } = useLocale();
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const current = supportedLocales.find((l) => l.code === locale) ?? supportedLocales[0];

  const handleSelect = (code: LocaleCode) => {
    const path = stripLocaleFromPath(location.pathname);
    navigate(`${pathWithLocale(code, path)}${location.search}${location.hash}`);
    setLocale(code);
    persistLocaleCookie(code);
    setOpen(false);
  };

  const triggerClass =
    variant === 'mobile'
      ? 'w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-steel-600 hover:bg-brand-50 hover:text-brand-600'
      : 'flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-medium text-steel-600 hover:text-brand-600 hover:bg-brand-50/80 transition-colors';

  return (
    <div ref={rootRef} className={cn('relative', variant === 'mobile' && 'w-full')}>
      <button
        type="button"
        className={triggerClass}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Language: ${localeLabel}. Change language`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="flex items-center gap-2 min-w-0">
          {variant === 'header' ? (
            <Globe className="h-4 w-4 shrink-0 text-brand-500" aria-hidden />
          ) : null}
          <span className="text-base leading-none" aria-hidden>
            {current.flag}
          </span>
          <span className="truncate">{current.nativeName}</span>
        </span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: variant === 'header' ? 6 : 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: variant === 'header' ? 6 : 0 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            aria-label="Select language"
            className={cn(
              'z-[60] overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-elevated',
              variant === 'header'
                ? 'absolute right-0 top-full mt-2 w-56 max-h-80 overflow-y-auto'
                : 'mt-2 w-full max-h-64 overflow-y-auto',
            )}
          >
            <ul className="py-1">
              {supportedLocales.map((loc) => {
                const selected = loc.code === locale;
                return (
                  <li key={loc.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={cn(
                        'flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors',
                        selected
                          ? 'bg-brand-50 text-brand-700 font-semibold'
                          : 'text-steel-600 hover:bg-mist-50 hover:text-navy-950',
                      )}
                      onClick={() => handleSelect(loc.code)}
                    >
                      <span className="text-lg leading-none" aria-hidden>
                        {loc.flag}
                      </span>
                      <span className="flex-1">{loc.nativeName}</span>
                      {selected ? (
                        <span className="text-[10px] uppercase tracking-wider text-brand-500">
                          {t('languageActive')}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
