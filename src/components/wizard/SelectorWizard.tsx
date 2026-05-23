import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Target, Zap, Waves } from 'lucide-react';
import { useWizardStore } from '../../store/useWizardStore';
import { supabase } from '../../supabase';
import { useLocaleNavigate } from '../../i18n/useLocaleNavigate';
import { ProductImagePlaceholder } from '../products/ProductImagePlaceholder';
import { productPath } from '../../lib/productUrl';

interface WizardOption {
  id: string;
  label: string;
  icon?: any;
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
    title: 'What is your primary research goal?',
    options: [
      { id: 'fat-loss', label: 'Fat Loss & Metabolism', icon: Target, category: 'Weight Loss' },
      { id: 'muscle', label: 'Muscle Development', icon: Zap, category: 'Muscle Growth' },
      { id: 'recovery', label: 'Tissue Repair & Recovery', icon: Waves, category: 'Healing' },
      { id: 'cognitive', label: 'Cognitive Enhancement', icon: Sparkles, category: 'Nootropics' }
    ]
  },
  {
    id: 'experience',
    title: 'What is your experience level?',
    options: [
      { id: 'beginner', label: 'Entry Level', description: 'New to research peptides' },
      { id: 'intermediate', label: 'Intermediate', description: 'Have conducted prior studies' },
      { id: 'advanced', label: 'Advanced Explorer', description: 'Experienced researcher' }
    ]
  }
];

export default function SelectorWizard() {
  const { isOpen, closeWizard } = useWizardStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useLocaleNavigate();

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setSelections({});
      setRecommendations([]);
    }
  }, [isOpen]);

  const handleSelect = (stepId: string, optionId: string) => {
    setSelections(prev => ({ ...prev, [stepId]: optionId }));
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      fetchRecommendations();
    }
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    setCurrentStep(STEPS.length); // Move to results step
    try {
      const selectedGoal = STEPS[0].options.find(o => o.id === selections.goal);
      const category = selectedGoal?.category || 'Weight Loss';
      
      const { data } = await supabase
        .from('products')
        .select('*')
        .contains('categories', [category])
        .limit(3);
      
      // Fallback if no category match
      if (!data || data.length === 0) {
        const { data: fallback } = await supabase.from('products').select('*').limit(3);
        setRecommendations(fallback || []);
      } else {
        setRecommendations(data);
      }
    } catch (err) {
      console.error('Wizard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product: any) => {
    closeWizard();
    navigate(productPath(product));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6"
        >
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={closeWizard} />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b dark:border-gray-800 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Compound Selector</h2>
                <p className="text-gray-500 text-sm mt-1">Experimental guidance based on your research goals</p>
              </div>
              <button 
                onClick={closeWizard}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-8 min-h-[400px]">
              {currentStep < STEPS.length ? (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">
                      Step {currentStep + 1} of {STEPS.length}
                    </span>
                    <div className="flex gap-1">
                      {STEPS.map((_, i) => (
                        <div 
                          key={i} 
                          className={`h-1 w-6 rounded-full ${i <= currentStep ? 'bg-brand-600' : 'bg-gray-100 dark:bg-gray-800'}`} 
                        />
                      ))}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {STEPS[currentStep].title}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {STEPS[currentStep].options.map((option: any) => (
                      <button
                        key={option.id}
                        onClick={() => handleSelect(STEPS[currentStep].id, option.id)}
                        className="group p-6 rounded-3xl border-2 border-gray-100 dark:border-gray-800 hover:border-brand-500 dark:hover:border-brand-500 hover:bg-brand-50/30 transition-all text-left flex items-start gap-4"
                      >
                        {option.icon && (
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl group-hover:bg-brand-100 dark:group-hover:bg-brand-900/50 transition-colors">
                            <option.icon className="h-6 w-6 text-gray-400 group-hover:text-brand-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors">
                            {option.label}
                          </p>
                          {option.description && (
                            <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {currentStep > 0 && (
                    <button 
                      onClick={() => setCurrentStep(prev => prev - 1)}
                      className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" /> Go Back
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">Research Protocol Ready</h3>
                    <p className="text-gray-500 mt-1">Our algorithm suggests starting your study with these compounds:</p>
                  </div>

                  {loading ? (
                    <div className="flex flex-col items-center py-12">
                      <div className="h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Filtering Global Catalog...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {recommendations.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleProductClick(product)}
                          className="flex items-center gap-4 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all cursor-pointer group"
                        >
                          <div className="h-20 w-20 rounded-2xl overflow-hidden bg-gray-50 shrink-0">
                            {product.images?.[0] ? (
                            <img src={product.images[0]} alt="" className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
                            ) : (
                              <ProductImagePlaceholder
                                productId={String(product.id)}
                                title={product.title}
                                className="h-full w-full min-h-20"
                                compact
                              />
                            )}
                          </div>
                          <div className="flex-grow">
                            <p className="text-[10px] font-black text-brand-600 uppercase mb-1">Recommended</p>
                            <h4 className="font-bold text-gray-900 dark:text-white">{product.title}</h4>
                            <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-brand-600 transition-colors" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setCurrentStep(0)}
                      className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-all"
                    >
                      Restart Protocol
                    </button>
                    <button 
                      onClick={() => { navigate('/shop'); closeWizard(); }}
                      className="flex-1 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      View All Shop
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
