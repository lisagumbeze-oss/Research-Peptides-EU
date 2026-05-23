import { Truck, ShieldCheck, Globe, Clock, PackageCheck, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Container } from '../design-system';
import { CatalogPageHeader } from '../components/catalog/CatalogPageHeader';

export default function Shipping() {
  const { t } = useTranslation('shipping');

  const features = [
    { icon: Clock, title: t('features.cutoffTitle'), desc: t('features.cutoffDesc') },
    { icon: ShieldCheck, title: t('features.trackedTitle'), desc: t('features.trackedDesc') },
    { icon: PackageCheck, title: t('features.packagingTitle'), desc: t('features.packagingDesc') },
  ];

  return (
    <div className="min-h-screen bg-mist-50">
      <CatalogPageHeader
        eyebrow={t('header.eyebrow')}
        title={t('header.title')}
        description={t('header.description')}
      />

      <Container className="py-12 md:py-16 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-3xl border border-brand-100 shadow-card flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-6">
                <feature.icon className="h-7 w-7 text-brand-600" aria-hidden />
              </div>
              <h3 className="text-lg font-bold text-navy-950 mb-3">{feature.title}</h3>
              <p className="text-steel-600 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="space-y-12">
          <section className="bg-navy-950 text-white rounded-3xl p-8 md:p-14 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-[100px]" aria-hidden />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">{t('regions.title')}</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                      <span className="font-bold text-brand-400 text-xs">EU</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{t('regions.euTitle')}</h4>
                      <p className="text-silver-400 text-sm">{t('regions.euDesc')}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                      <Globe className="h-5 w-5 text-brand-400" aria-hidden />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{t('regions.worldTitle')}</h4>
                      <p className="text-silver-400 text-sm">{t('regions.worldDesc')}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                      <Truck className="h-5 w-5 text-brand-400" aria-hidden />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{t('regions.ukTitle')}</h4>
                      <p className="text-silver-400 text-sm">{t('regions.ukDesc')}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
                <h4 className="text-brand-400 font-semibold uppercase tracking-wider text-xs mb-4">
                  {t('responsibility.eyebrow')}
                </h4>
                <p className="text-sm text-silver-300 leading-relaxed mb-4">{t('responsibility.body')}</p>
                <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" aria-hidden />
                  <p className="text-xs text-amber-100/90 leading-relaxed font-medium">
                    {t('responsibility.disclaimer')}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
