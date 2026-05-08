import React from 'react';
import { Truck, ShieldCheck, Globe, Clock, PackageCheck, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Shipping() {
  return (
    <div className="bg-white min-h-screen pt-12 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <Truck className="h-4 w-4" />
            Global Logistics
          </div>
          <h1>Shipping & Delivery</h1>
          <p className="text-gray-500 mt-4 font-medium italic max-w-2xl mx-auto">
            Secure, rapid, and discreet delivery protocols for research environments worldwide.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            { 
              icon: Clock, 
              title: "12:00 PM Cutoff", 
              desc: "Orders finalized before noon (UK Time) Monday–Friday are dispatched the same day." 
            },
            { 
              icon: ShieldCheck, 
              title: "Tracked Security", 
              desc: "Every shipment is fully tracked from our laboratory to your facility door." 
            },
            { 
              icon: PackageCheck, 
              title: "Stealth Packaging", 
              desc: "Items are vacuum-sealed and shipped in plain, unmarked tactical packaging." 
            }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                <feature.icon className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight mb-3">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="space-y-12">
          <section className="bg-slate-950 text-white rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <h2 className="text-white mb-6">Domestic & Global Reach</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="font-black text-blue-500">UK</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Next-Day Tracked (UK)</h4>
                      <p className="text-gray-400 text-sm">Average delivery time: 1–3 business days. Free on qualifying institutional orders.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Globe className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">International Logistics</h4>
                      <p className="text-gray-400 text-sm">Worldwide stealth shipping. Delivery intervals: 3–14 days depending on regional customs clearance.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
                 <h4 className="text-blue-500 font-black uppercase tracking-widest text-xs mb-4">Researcher Responsibility</h4>
                 <p className="text-sm text-gray-300 leading-relaxed mb-4">
                   International buyers are responsible for ensuring that the products comply with local import laws. All customs duties and regional taxes are the responsibility of the purchaser.
                 </p>
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-400">
                    <AlertTriangle className="h-4 w-4" />
                    Customs Compliance Required
                 </div>
              </div>
            </div>
          </section>

          <section className="prose prose-blue max-w-none">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-6">Delivery Insurance & Protocols</h2>
            <p className="text-gray-600">
              In the rare event of a logistics failure (loss in transit), Research Peptides UK provides a one-time reshipment protocol for verified tracked losses,
              provided that the initial delivery address provided was accurate and comprehensive. 
              Please contact our logistics liaison if your order has exceeded the estimated delivery window by more than 48 hours.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
