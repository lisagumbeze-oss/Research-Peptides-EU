import { Link } from 'react-router-dom';
import { ShieldCheck, Truck } from 'lucide-react';
import { Container } from '../../design-system';

export function CatalogTrustBar() {
  return (
    <div className="border-b border-brand-100 bg-brand-50/60">
      <Container className="py-2.5 md:py-3">
        <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-[11px] font-medium text-steel-600">
          <span className="inline-flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-brand-600 shrink-0" aria-hidden />
            EU-wide dispatch · Netherlands fulfillment
          </span>
          <span className="hidden sm:inline text-brand-200" aria-hidden>
            |
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-success shrink-0" aria-hidden />
            Research-only ·{' '}
            <Link to="/faq" className="text-brand-600 hover:text-brand-700 underline-offset-2 hover:underline">
              FAQ &amp; compliance
            </Link>
          </span>
        </p>
      </Container>
    </div>
  );
}
