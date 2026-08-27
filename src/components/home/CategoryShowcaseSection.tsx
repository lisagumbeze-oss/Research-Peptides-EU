import { useEffect, useState } from 'react';
import { LocaleLink } from '../../i18n/LocaleLink';
import { ArrowRight, Beaker, Dna, Layers, Pill, TestTube2 } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { supabase } from '../../supabase';
import { Container, Section } from '../../design-system';
import { SectionHeading } from './SectionHeading';
import { staggerDelay } from '../../design-system/motion';
import { cn } from '../../lib/utils';

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

const iconPool = [Dna, Beaker, TestTube2, Layers, Pill];

export function CategoryShowcaseSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.from('categories').select('id, name, slug, description').limit(8);
      if (data) setCategories(data);
      setLoading(false);
    })();
  }, []);

  return (
    <Section size="lg" tone="dark" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-scientific-grid opacity-15 pointer-events-none" aria-hidden />
      <Container className="relative z-10">
        <SectionHeading
          eyebrow="Research categories"
          title="Explore by application"
          description="Navigate specialized compound families — from metabolic peptides to laboratory reagents."
          light
          className="mb-12"
        />

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-36 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => {
              const Icon = iconPool[i % iconPool.length];
              return (
                <motion.div
                  key={cat.id}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: staggerDelay(i, 0.05) }}
                  className="h-full"
                >
                  <LocaleLink
                    to={`/search?category=${cat.slug}`}
                    className={cn(
                      'group flex flex-col h-full min-h-[9rem] p-5 rounded-2xl',
                      'bg-white/5 border border-white/10 backdrop-blur-sm',
                      'hover:bg-brand-500/20 hover:border-brand-400/40 transition-all duration-300',
                      'motion-safe:hover:-translate-y-1',
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-500/30 flex items-center justify-center mb-4 group-hover:bg-brand-500 transition-colors">
                      <Icon className="h-5 w-5 text-brand-200 group-hover:text-white" aria-hidden />
                    </div>
                    <h3 className="font-display font-semibold text-white text-sm md:text-base mb-1 group-hover:text-brand-200 transition-colors">
                      {cat.name}
                    </h3>
                    {cat.description ? (
                      <p className="text-xs text-silver-400 line-clamp-2 flex-1">{cat.description}</p>
                    ) : null}
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      Browse <ArrowRight className="h-3 w-3" />
                    </span>
                  </LocaleLink>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <LocaleLink
            to="/categories"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-300 hover:text-white transition-colors"
          >
            View all categories
            <ArrowRight className="h-4 w-4" />
          </LocaleLink>
        </div>
      </Container>
    </Section>
  );
}
