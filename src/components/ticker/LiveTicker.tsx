import { AlertCircle, FlaskConical, Zap, Package } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { cn } from '../../lib/utils';

const TICKER_ITEMS = [
  { icon: Package, text: 'EU DISPATCH: Netherlands warehouse — tracked laboratory shipments', color: 'text-brand-400' },
  { icon: Zap, text: 'ANALYTICS: Third-party HPLC verification on catalog batches', color: 'text-success' },
  { icon: FlaskConical, text: 'RESEARCH USE ONLY: Not for human or veterinary use', color: 'text-purity' },
  { icon: AlertCircle, text: 'DOCUMENTATION: COA available for verified batch lines', color: 'text-brand-300' },
  { icon: Package, text: 'FULFILLMENT: Cold-chain handling for sensitive research materials', color: 'text-warning' },
];

export default function LiveTicker() {
  const reduceMotion = useReducedMotion();
  const displayItems = reduceMotion ? TICKER_ITEMS : [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div
      className="bg-navy-950 border-b border-brand-900/30 py-2.5 overflow-hidden relative group/ticker"
      role="region"
      aria-label="Store notices"
    >
      <ul className="sr-only">
        {TICKER_ITEMS.map((item) => (
          <li key={item.text}>{item.text}</li>
        ))}
      </ul>
      <div
        aria-hidden
        className={cn(
          'flex whitespace-nowrap gap-12 items-center',
          reduceMotion ? 'overflow-x-auto px-6 [scrollbar-width:none]' : 'ticker-track w-max',
        )}
      >
        {displayItems.map((item, i) => (
          <div key={`${item.text}-${i}`} className="flex items-center gap-3">
            <item.icon className={`h-3.5 w-3.5 ${item.color}`} aria-hidden />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-silver-400">
              {item.text}
            </span>
            <div className="h-1 w-1 bg-white/20 rounded-full" />
          </div>
        ))}
      </div>
      <div className="absolute inset-y-0 left-0 w-16 md:w-24 bg-gradient-to-r from-navy-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 md:w-24 bg-gradient-to-l from-navy-950 to-transparent z-10 pointer-events-none" />
    </div>
  );
}
