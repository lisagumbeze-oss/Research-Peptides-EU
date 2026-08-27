import { useEffect, useRef, useState, type ComponentType } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { X, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Target, Zap, Waves } from 'lucide-react';
import { useWizardStore } from '../../store/useWizardStore';
import { supabase } from '../../supabase';
import { LocaleLink } from '../../i18n/LocaleLink';
import { Button } from '../../design-system';
import { fadeUpVariants, modalMotion, overlayMotion, staggerContainerVariants, staggerItemVariants } from '../../design-system/motion';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { ProductImagePlaceholder } from '../products/ProductImagePlaceholder';
import type { CatalogProduct } from '../products/ProductCard';
import { productPath } from '../../lib/productUrl';
import { cn } from '../../lib/utils';

interface WizardOption {
  id: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  category?: string;
  description?: string;
}

interface WizardStep {
  id: string;
  title: string;
  options: WizardOption[];
}

const STEPS: WizardStep[] = [
  {
    id: 'goal',
    title: 'Which research area are you exploring?',
    options: [
      { id: 'fat-loss', label: 'Metabolic research pathways', icon: Target, category: 'Weight Loss' },
      { id: 'muscle', label: 'Muscle tissue research models', icon: Zap, category: 'Muscle Growth' },
      { id: 'recovery', label: 'Cellular repair research', icon: Waves, category: 'Healing' },
      { id: 'cognitive', label: 'Neuro research models', icon: Sparkles, category: 'Nootropics' },
    ],
  },
  {
    id: 'experience',
    title: 'What is your laboratory experience level?',
    options: [
      { id: 'beginner', label: 'Entry Level', description: 'New to peptide research workflows' },
      { id: 'intermediate', label: 'Intermediate', description: 'Have conducted prior laboratory studies' },
      { id: 'advanced', label: 'Advanced', description: 'Experienced laboratory researcher' },
    ],
  },
];

export default function SelectorWizard() {
  const { isOpen, closeWizard } = useWizardStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [recommendations, setRecommendations] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const overlay = overlayMotion(Boolean(reduceMotion));
  const panel = modalMotion(Boolean(reduceMotion));
  const stepVariants = fadeUpVariants();
  const optionList = staggerContainerVariants();
  const optionItem = staggerItemVariants();

  useFocusTrap(isOpen, panelRef, closeWizard);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentStep(0);
    setSelections({});
    setRecommendations([]);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const handleSelect = (stepId: string, optionId: string) => {
    setSelections((prev) => ({ ...prev, [stepId]: optionId }));
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      fetchRecommendations();
    }
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    setCurrentStep(STEPS.length);
    try {
      const selectedGoal = STEPS[0].options.find((o) => o.id === selections.goal);
      const category = selectedGoal?.category || 'Weight Loss';

      const { data } = await supabase
        .from('products')
        .select('*')
        .contains('categories', [category])
        .limit(3);

      if (!data || data.length === 0) {
        const { data: fallback } = await supabase.from('products').select('*').limit(3);
        setRecommendations((fallback as CatalogProduct[]) || []);
      } else {
        setRecommendations(data as CatalogProduct[]);
      }
    } catch (err) {
      console.error('Wizard error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          <motion.button
            type="button"
            {...overlay}
            onClick={closeWizard}
            className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm"
            aria-label="Close research area selector"
            tabIndex={-1}
          />

          <motion.div
            ref={panelRef}
            {...panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="wizard-title"
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-elevated overflow-hidden border border-brand-100"
          >
            <div className="p-6 md:p-8 border-b border-brand-100 flex justify-between items-start gap-4">
              <div>
                <h2 id="wizard-title" className="font-display text-xl md:text-2xl font-bold text-navy-950 tracking-tight">
                  Research area selector
                </h2>
                <p className="text-steel-600 text-sm mt-1">
                  Browse compounds by laboratory research area
                </p>
              </div>
              <button
                type="button"
                onClick={closeWizard}
                className="p-2 rounded-xl text-steel-600 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                aria-label="Close research area selector"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 md:p-8 min-h-[400px]">
              {currentStep < STEPS.length ? (
                <motion.div
                  key={STEPS[currentStep].id}
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-caption text-brand-600">
                      Step {currentStep + 1} of {STEPS.length}
                    </span>
                    <div className="flex gap-1" aria-hidden>
                      {STEPS.map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            'h-1 w-6 rounded-full origin-left transition-colors',
                            i <= currentStep ? 'bg-brand-500' : 'bg-brand-100',
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <h3 className="text-lg md:text-xl font-display font-bold text-navy-950">
                    {STEPS[currentStep].title}
                  </h3>

                  <motion.div
                    variants={optionList}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    {STEPS[currentStep].options.map((option) => {
                      const Icon = option.icon;
                      return (
                        <motion.div key={option.id} variants={optionItem}>
                          <button
                            type="button"
                            onClick={() => handleSelect(STEPS[currentStep].id, option.id)}
                            className={cn(
                              'group w-full p-5 md:p-6 rounded-2xl border-2 border-brand-100 text-left',
                              'hover:border-brand-400 hover:bg-brand-50/60 transition-colors',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                              'flex items-start gap-4',
                            )}
                          >
                            {Icon ? (
                              <div className="p-3 bg-mist-50 rounded-2xl group-hover:bg-brand-100 transition-colors">
                                <Icon className="h-6 w-6 text-brand-500" aria-hidden />
                              </div>
                            ) : null}
                            <div>
                              <p className="font-semibold text-navy-950 group-hover:text-brand-700 transition-colors">
                                {option.label}
                              </p>
                              {option.description ? (
                                <p className="text-sm text-steel-600 mt-1">{option.description}</p>
                              ) : null}
                            </div>
                          </button>
                        </motion.div>
                      );
                    })}
                  </motion.div>

                  {currentStep > 0 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((prev) => prev - 1)}
                      className="flex items-center gap-2 text-sm font-semibold text-steel-600 hover:text-navy-950 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden />
                      Go back
                    </button>
                  ) : null}
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                  <div className="text-center">
                    <div className="w-14 h-14 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-7 w-7 text-success" aria-hidden />
                    </div>
                    <h3 className="text-xl font-display font-bold text-navy-950">
                      Suggested research compounds
                    </h3>
                    <p className="text-steel-600 text-sm mt-1">
                      Based on your selected research area, these catalog lines may be relevant:
                    </p>
                  </div>

                  {loading ? (
                    <div className="space-y-3" role="status">
                      <span className="sr-only">Filtering catalog</span>
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-4">
                          <div className="skeleton-block h-20 w-20 rounded-2xl shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="skeleton-block h-4 w-2/3" />
                            <div className="skeleton-block h-3 w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="grid grid-cols-1 gap-3">
                      {recommendations.map((product) => (
                        <li key={product.id}>
                          <LocaleLink
                            to={productPath(product)}
                            onClick={closeWizard}
                            className={cn(
                              'flex items-center gap-4 p-4 rounded-2xl border border-brand-100',
                              'hover:border-brand-300 hover:bg-brand-50/50 hover:shadow-card transition-colors',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                            )}
                          >
                            <div className="h-20 w-20 rounded-2xl overflow-hidden bg-mist-50 shrink-0 border border-brand-50">
                              {product.images?.[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt=""
                                  className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:hover:scale-105"
                                />
                              ) : (
                                <ProductImagePlaceholder
                                  productId={String(product.id)}
                                  title={product.title}
                                  className="h-full w-full min-h-20"
                                  compact
                                />
                              )}
                            </div>
                            <div className="flex-grow min-w-0">
                              <p className="text-caption text-brand-600 mb-1">Recommended</p>
                              <h4 className="font-semibold text-navy-950">{product.title}</h4>
                              {product.description ? (
                                <p className="text-sm text-steel-600 line-clamp-1">{product.description}</p>
                              ) : null}
                            </div>
                            <ArrowRight className="h-5 w-5 shrink-0 text-silver-400" aria-hidden />
                          </LocaleLink>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setCurrentStep(0)}>
                      Restart
                    </Button>
                    <LocaleLink
                      to="/shop"
                      onClick={closeWizard}
                      className="flex-1 inline-flex items-center justify-center h-11 px-6 rounded-xl bg-gradient-cta text-white text-sm font-semibold shadow-elevated border border-brand-400/30 hover:shadow-glow hover:brightness-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                    >
                      View catalog
                    </LocaleLink>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
