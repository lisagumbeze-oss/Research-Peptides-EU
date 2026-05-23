import { Truck, ShieldCheck, Globe, Clock, PackageCheck, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { Container } from '../design-system';
import { CatalogPageHeader } from '../components/catalog/CatalogPageHeader';

export default function Shipping() {
  return (
    <div className="min-h-screen bg-mist-50">
      <CatalogPageHeader
        eyebrow="Logistics"
        title="Shipping & delivery"
        description="EU-first fulfillment from the Netherlands with tracked delivery across member states and worldwide options."
      />

      <Container className="py-12 md:py-16 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: Clock,
              title: '12:00 CET cutoff',
              desc: 'Orders placed before noon Central European Time, Monday–Friday, are dispatched the same business day.',
            },
            {
              icon: ShieldCheck,
              title: 'Tracked security',
              desc: 'Every shipment is fully tracked from our laboratory to your facility.',
            },
            {
              icon: PackageCheck,
              title: 'Discreet packaging',
              desc: 'Items are vacuum-sealed and shipped in plain, unmarked packaging suitable for research facilities.',
            },
          ].map((feature, i) => (
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
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">EU & international reach</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                      <span className="font-bold text-brand-400 text-xs">EU</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">European Union delivery</h4>
                      <p className="text-silver-400 text-sm">
                        Standard EU shipping: 3–7 business days. Free shipping on qualifying orders over €500 (subtotal).
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                      <Globe className="h-5 w-5 text-brand-400" aria-hidden />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Worldwide logistics</h4>
                      <p className="text-silver-400 text-sm">
                        Non-EU destinations: 5–14 business days depending on customs and regional carriers.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                      <Truck className="h-5 w-5 text-brand-400" aria-hidden />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">United Kingdom</h4>
                      <p className="text-silver-400 text-sm">
                        Tracked UK options remain available at checkout when United Kingdom is selected as the destination.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
                <h4 className="text-brand-400 font-semibold uppercase tracking-wider text-xs mb-4">
                  Researcher responsibility
                </h4>
                <p className="text-sm text-silver-300 leading-relaxed mb-4">
                  Buyers are responsible for ensuring products comply with local import laws. Customs duties, VAT, and
                  regional taxes may apply and are the purchaser&apos;s responsibility where not collected at checkout.
                </p>
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                  <AlertTriangle className="h-4 w-4" aria-hidden />
                  Customs compliance required
                </div>
              </div>
            </div>
          </section>

          <section className="max-w-none">
            <h2 className="text-2xl font-bold text-navy-950 mb-4">Delivery insurance & protocols</h2>
            <p className="text-steel-600 leading-relaxed">
              In the rare event of a verified tracked loss in transit, Research Peptides EU may offer a one-time
              reshipment when the delivery address was accurate and complete. Contact our logistics team if your order
              exceeds the estimated delivery window by more than 48 hours.
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
