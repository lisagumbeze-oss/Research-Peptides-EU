import React, { useState } from 'react';
import { HelpCircle, ChevronDown, FlaskConical, Truck, CreditCard, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const faqs = [
  {
    category: "Product & Safety",
    icon: FlaskConical,
    questions: [
      {
        q: "Are these products safe for human or animal consumption?",
        a: "Absolutely not. All products sold by Research Peptides UK are strictly for laboratory research and scientific application only. They are not for human or veterinary use."
      },
      {
        q: "How do you verify the purity of your peptides?",
        a: "We subject every batch to HPLC and Mass Spec analysis. Purity levels are consistently verified at 99.8% or higher before being released for distribution."
      },
      {
        q: "How should I store the compounds upon arrival?",
        a: "Most lyophilized peptides are stable at room temperature for short durations (shipping), but for long-term stability, we recommend storage at -20°C or -80°C."
      }
    ]
  },
  {
    category: "Logistics & Shipping",
    icon: Truck,
    questions: [
      {
        q: "How long does shipping take within the UK?",
        a: "We offer expedited tracked shipping. Most UK researchers receive their orders within 1-3 business days."
      },
      {
        q: "Is the packaging discreet?",
        a: "Yes. All orders are shipped in plain, unmarked packaging to ensure the privacy and security of your research institution."
      },
      {
        q: "Do you ship internationally?",
        a: "Yes, we ship globally. Shipping times vary by region, typically ranging from 3-14 days depending on local customs protocols."
      }
    ]
  },
  {
    category: "Payments & Policy",
    icon: CreditCard,
    questions: [
      {
        q: "Which cryptocurrencies do you accept?",
        a: "We prioritize privacy and accept BTC, ETH, USDT, and other major stablecoins via our secure payment gateway."
      },
      {
        q: "What is your return policy?",
        a: "To maintain the highest standards of research integrity and cold-chain security, we do not accept returns. All sales are final."
      }
    ]
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<string | null>("0-0");

  const toggle = (idx: string) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="bg-white min-h-screen pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <HelpCircle className="h-4 w-4" />
            Support Intelligence
          </div>
          <h1>Researcher FAQ</h1>
          <p className="text-gray-500 mt-4 font-medium italic">Standard protocols and common inquiries for Research Peptides UK researchers.</p>
        </motion.div>

        <div className="space-y-12">
          {faqs.map((group, groupIdx) => (
            <section key={groupIdx}>
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <group.icon className="h-5 w-5 text-blue-600" />
                <h3 className="m-0 text-sm font-black uppercase tracking-[0.2em] text-gray-900">{group.category}</h3>
              </div>
              
              <div className="space-y-3">
                {group.questions.map((item, qIdx) => {
                  const id = `${groupIdx}-${qIdx}`;
                  const isOpen = openIndex === id;
                  
                  return (
                    <div 
                      key={id}
                      className={`border rounded-2xl transition-all duration-300 ${isOpen ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                    >
                      <button 
                        onClick={() => toggle(id)}
                        className="w-full px-6 py-5 flex items-center justify-between text-left"
                      >
                        <span className="font-bold text-gray-900 text-lg leading-tight">{item.q}</span>
                        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 text-gray-600 leading-relaxed text-sm">
                              {item.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-20 p-8 bg-slate-950 rounded-[2.5rem] text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl" />
          <h3 className="text-white mb-2 italic">Still have technical questions?</h3>
          <p className="text-gray-400 text-sm mb-6">Our liaison team is available for deep-dive research support.</p>
          <a 
            href="/contact" 
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
          >
            Liaison Office
          </a>
        </div>
      </div>
    </div>
  );
}
