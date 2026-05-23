import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import { supabase } from '../../supabase';
import { primaryNav, researchTools } from '../../navigation/config';
import { LocaleLink } from '../../i18n/LocaleLink';
import { Button } from '../../design-system';
import LanguageSwitcher from './LanguageSwitcher';
import { cn } from '../../lib/utils';

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
  user: { id: string } | null;
  isAdmin?: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onOpenSearch: () => void;
};

type CategoryRow = { id: string; name: string; slug: string };

export default function MobileNav({
  open,
  onClose,
  user,
  isAdmin,
  onLogin,
  onLogout,
  onOpenSearch,
}: MobileNavProps) {
  const { t } = useTranslation('common');
  const { t: tNav } = useTranslation('nav');
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [shopExpanded, setShopExpanded] = useState(true);

  useEffect(() => {
    if (!open) return;
    supabase
      .from('categories')
      .select('id, name, slug')
      .then(({ data }) => {
        if (data) setCategories(data);
      });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const linkClass =
    'block px-3 py-2.5 rounded-xl text-sm font-medium text-steel-600 hover:bg-brand-50 hover:text-brand-600';

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[55] bg-navy-950/40 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden
            onClick={onClose}
          />
          <motion.nav
            id="mobile-nav-drawer"
            aria-label="Mobile primary"
            className="fixed inset-y-0 right-0 z-[56] w-full max-w-sm bg-white shadow-elevated flex flex-col lg:hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-brand-100">
              <span className="font-display font-bold text-navy-950">Menu</span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50"
              >
                {t('close')}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
              <LanguageSwitcher variant="mobile" />

              <div>
                <button
                  type="button"
                  className="flex w-full items-center justify-between text-caption text-brand-600 mb-2"
                  onClick={() => setShopExpanded((e) => !e)}
                  aria-expanded={shopExpanded}
                >
                  {tNav('primary.shop')}
                  <span aria-hidden>{shopExpanded ? '−' : '+'}</span>
                </button>
                {shopExpanded && (
                  <ul className="space-y-0.5">
                    <li>
                      <LocaleLink to="/shop" className={linkClass} onClick={onClose}>
                        {tNav('mega.browseCatalog')}
                      </LocaleLink>
                    </li>
                    {categories.map((cat) => (
                      <li key={cat.id}>
                        <LocaleLink
                          to={`/search?category=${cat.slug}`}
                          className={linkClass}
                          onClick={onClose}
                        >
                          {cat.name}
                        </LocaleLink>
                      </li>
                    ))}
                    <li>
                      <LocaleLink to="/categories" className={linkClass} onClick={onClose}>
                        {tNav('mega.allCategories')}
                      </LocaleLink>
                    </li>
                  </ul>
                )}
              </div>

              <div>
                <p className="text-caption text-brand-600 mb-2">{tNav('primary.research')}</p>
                <ul className="space-y-0.5">
                  {researchTools.map((item) => (
                    <li key={item.href}>
                      <LocaleLink to={item.href} className={linkClass} onClick={onClose}>
                        {tNav(item.labelKey)}
                      </LocaleLink>
                    </li>
                  ))}
                </ul>
              </div>

              <ul className="space-y-0.5">
                {primaryNav
                  .filter((item): item is { labelKey: string; href: string } => 'href' in item)
                  .map((item) => (
                    <li key={item.href}>
                      <LocaleLink to={item.href} className={linkClass} onClick={onClose}>
                        {tNav(item.labelKey)}
                      </LocaleLink>
                    </li>
                  ))}
              </ul>

              <button
                type="button"
                className={cn(linkClass, 'w-full text-left')}
                onClick={() => {
                  onOpenSearch();
                  onClose();
                }}
              >
                {t('search')}
              </button>

              {user ? (
                <ul className="space-y-0.5 pt-2 border-t border-brand-100">
                  <li>
                    <LocaleLink to="/wishlist" className={linkClass} onClick={onClose}>
                      {t('wishlist')}
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink to="/profile" className={linkClass} onClick={onClose}>
                      {t('account')}
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink to="/orders" className={linkClass} onClick={onClose}>
                      {t('orders')}
                    </LocaleLink>
                  </li>
                  {isAdmin ? (
                    <li>
                      <LocaleLink to="/admin" className={linkClass} onClick={onClose}>
                        Admin
                      </LocaleLink>
                    </li>
                  ) : null}
                  <li>
                    <button
                      type="button"
                      className={cn(linkClass, 'w-full text-left text-error hover:bg-red-50')}
                      onClick={() => {
                        onClose();
                        onLogout();
                      }}
                    >
                      {t('logout')}
                    </button>
                  </li>
                </ul>
              ) : (
                <Button fullWidth onClick={() => { onClose(); onLogin(); }}>
                  {t('login')}
                </Button>
              )}
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
