import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, TrendingUp, Zap, Globe } from 'lucide-react';

const TICKER_ITEMS = [
  { icon: AlertCircle, text: "LOW STOCK: BPC-157 5mg — limited EU batch availability", color: "text-warning" },
  { icon: Globe, text: "EU DISPATCH: Semaglutide research units shipped to Amsterdam, NL", color: "text-brand-400" },
  { icon: Zap, text: "PURITY VERIFIED: 99.8%+ third-party testing on all catalog lines", color: "text-success" },
  { icon: TrendingUp, text: "TRENDING: GLP-1 research demand across European institutions", color: "text-purity" },
  { icon: AlertCircle, text: "RESTOCK: TB-500 10mg lyophilized — Netherlands warehouse", color: "text-brand-300" },
];

export default function LiveTicker() {
  // We double the items to create a seamless loop
  const displayItems = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="bg-navy-950 border-b border-brand-900/30 py-2.5 overflow-hidden relative group">
      <motion.div 
        className="flex whitespace-nowrap gap-12 items-center"
        animate={{ x: [0, -1500] }}
        transition={{ 
          repeat: Infinity, 
          duration: 35, 
          ease: "linear",
          repeatType: "loop"
        }}
      >
        {displayItems.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-silver-400">
              {item.text}
            </span>
            <div className="h-1 w-1 bg-gray-700 rounded-full" />
          </div>
        ))}
      </motion.div>
      
      {/* Side fades for luxury look */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-gray-900 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gray-900 to-transparent z-10 pointer-events-none" />
    </div>
  );
}
