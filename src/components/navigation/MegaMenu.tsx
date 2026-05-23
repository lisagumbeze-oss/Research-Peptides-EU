import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LocaleLink } from '../../i18n/LocaleLink';
import { ArrowRight, FlaskConical, Microscope } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../supabase';
import { researchTools, type MegaMenuId } from '../../navigation/config';
import { cn } from '../../lib/utils';

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

type MegaMenuProps = {
  activeMenu: MegaMenuId | null;
  onClose: () => void;
};

export default function MegaMenu({ activeMenu, onClose }: MegaMenuProps) {
  const { t } = useTranslation('nav');
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeMenu !== 'shop') return;
    let cancelled = false;
    setLoading(true);
    void (async () => {
      const { data } = await supabase.from('categories').select('id, name, slug, description');
      if (!cancelled) {
        if (data) setCategories(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeMenu]);

  return (
    <AnimatePresence>
      {activeMenu && (
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-navy-950/20 backdrop-blur-[2px] hidden md:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            id="mega-menu-panel"
            role="region"
            aria-label={activeMenu === 'shop' ? 'Shop categories' : 'Research resources'}
            className="hidden md:block absolute left-0 right-0 top-full z-50 border-t border-brand-100/80 bg-white shadow-elevated"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {activeMenu === 'shop' ? (
                <div className="grid grid-cols-12 gap-8">
                  <div className="col-span-4 rounded-2xl bg-gradient-hero p-6 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-scientific-grid opacity-30" aria-hidden />
                    <div className="relative z-10">
                      <FlaskConical className="h-8 w-8 text-brand-300 mb-4" aria-hidden />
                      <p className="text-caption text-brand-200 mb-2">European catalog</p>
                      <h3 className="font-display text-xl font-bold mb-2">Research-grade inventory</h3>
                      <p className="text-sm text-brand-100/90 leading-relaxed mb-4">
                        Third-party tested compounds shipped across the EU from our Netherlands operations.
                      </p>
                      <LocaleLink
                        to="/shop"
                        onClick={onClose}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-brand-200 transition-colors"
                      >
                        {t('mega.browseCatalog')}
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </LocaleLink>
                    </div>
                  </div>
                  <div className="col-span-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-caption text-brand-600">{t('footer.categories')}</h3>
                      <LocaleLink
                        to="/categories"
                        onClick={onClose}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                      >
                        {t('mega.allCategories')}
                      </LocaleLink>
                    </div>
                    {loading ? (
                      <p className="text-sm text-silver-400">Loading categories…</p>
                    ) : categories.length === 0 ? (
                      <p className="text-sm text-steel-600">
                        Explore the{' '}
                        <LocaleLink to="/shop" onClick={onClose} className="text-brand-600 font-semibold">
                          {t('mega.browseCatalog')}
                        </LocaleLink>
                        .
                      </p>
                    ) : (
                      <ul className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                        {categories.map((cat) => (
                          <li key={cat.id}>
                            <LocaleLink
                              to={`/search?category=${cat.slug}`}
                              onClick={onClose}
                              className={cn(
                                'block rounded-xl border border-transparent px-4 py-3',
                                'hover:border-brand-200 hover:bg-brand-50/50 transition-all group',
                              )}
                            >
                              <span className="font-semibold text-sm text-navy-950 group-hover:text-brand-600">
                                {cat.name}
                              </span>
                              {cat.description ? (
                                <span className="block text-xs text-steel-600 mt-0.5 line-clamp-2">
                                  {cat.description}
                                </span>
                              ) : null}
                            </LocaleLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-12 gap-8">
                  <div className="col-span-4 rounded-2xl bg-mist-50 border border-brand-100 p-6">
                    <Microscope className="h-8 w-8 text-brand-500 mb-4" aria-hidden />
                    <p className="text-caption text-brand-600 mb-2">{t('primary.research')}</p>
                    <h3 className="font-display text-xl font-bold text-navy-950 mb-2">
                      {t('research.researchHub')}
                    </h3>
                    <p className="text-sm text-steel-600 leading-relaxed">
                      {t('research.researchHubDesc')}
                    </p>
                  </div>
                  <ul className="col-span-8 grid sm:grid-cols-2 gap-3">
                    {researchTools.map((item) => (
                      <li key={item.href}>
                        <LocaleLink
                          to={item.href}
                          onClick={onClose}
                          className="flex flex-col h-full rounded-xl border border-silver-400/25 p-4 hover:border-brand-300 hover:shadow-card transition-all group"
                        >
                          <span className="font-semibold text-navy-950 group-hover:text-brand-600">
                            {t(item.labelKey)}
                          </span>
                          {item.descriptionKey ? (
                            <span className="text-xs text-steel-600 mt-1 leading-relaxed">
                              {t(item.descriptionKey)}
                            </span>
                          ) : null}
                        </LocaleLink>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
