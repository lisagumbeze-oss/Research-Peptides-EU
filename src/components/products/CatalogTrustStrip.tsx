import { Link } from 'react-router-dom';
import { Truck, ShieldCheck } from 'lucide-react';

export function CatalogTrustStrip() {
  return (
    <div className="border-b border-blue-100/90 bg-gradient-to-r from-blue-50/95 via-white to-indigo-50/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 md:py-3">
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center text-[10px] md:text-[11px] font-bold text-gray-700 leading-snug">
          <span className="inline-flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 shrink-0 text-blue-600" aria-hidden />
            <span>
              Free shipping on orders over{' '}
              <span className="whitespace-nowrap">£500 (UK &amp; EU)</span> and{' '}
              <span className="whitespace-nowrap">£1000 (international)</span>
            </span>
          </span>
          <span className="hidden sm:inline text-gray-300 font-light" aria-hidden>
            |
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
            <span>
              Research sales are final — see{' '}
              <Link to="/faq" className="text-blue-600 underline-offset-2 hover:underline">
                FAQ &amp; support
              </Link>
            </span>
          </span>
        </p>
      </div>
    </div>
  );
}
