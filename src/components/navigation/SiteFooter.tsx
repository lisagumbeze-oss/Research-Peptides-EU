import { useTranslation } from 'react-i18next';
import { LocaleLink } from '../../i18n/LocaleLink';
import { MapPin, ShieldCheck, Truck } from 'lucide-react';
import logo from '../../assets/logo.webp';
import { Container } from '../../design-system';
import { footerInventory, footerLegal, footerSupport } from '../../navigation/config';
import { brandName } from '../../design-system/tokens';

type SiteFooterProps = {
  newsletterEmail: string;
  newsletterSubmitting: boolean;
  newsletterMessage: string | null;
  newsletterError: string | null;
  onNewsletterEmailChange: (value: string) => void;
  onNewsletterSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export default function SiteFooter({
  newsletterEmail,
  newsletterSubmitting,
  newsletterMessage,
  newsletterError,
  onNewsletterEmailChange,
  onNewsletterSubmit,
}: SiteFooterProps) {
  const { t: tNav } = useTranslation('nav');

  return (
    <footer className="bg-navy-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow opacity-60 pointer-events-none" aria-hidden />
      <div className="absolute inset-0 bg-scientific-grid opacity-20 pointer-events-none" aria-hidden />

      <Container className="relative z-10 section-md">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          <div className="md:col-span-4">
            <LocaleLink to="/" className="inline-flex items-center gap-3 mb-6 rounded-lg">
              <img src={logo} alt="" className="h-10 w-auto brightness-0 invert" />
            </LocaleLink>
            <p className="text-sm text-silver-400 leading-relaxed max-w-sm">
              {brandName} delivers research-grade peptide compounds to European laboratories with
              third-party verified purity and pharmaceutical-level handling standards.
            </p>
            <p className="flex items-start gap-2 text-xs text-brand-300/90 mt-4 max-w-sm">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
              Headquartered in the Netherlands · EU-wide distribution
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-200">
                <Truck className="h-3 w-3" aria-hidden />
                EU Shipping
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-200">
                <ShieldCheck className="h-3 w-3" aria-hidden />
                GDPR Compliant
              </span>
            </div>
            <address className="not-italic text-silver-400 text-sm leading-relaxed mt-8 max-w-sm">
              <a href="mailto:info@researchpeptide.uk" className="hover:text-white transition-colors">
                info@researchpeptide.uk
              </a>
            </address>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-caption text-brand-400 mb-5">Catalog</h4>
            <ul className="space-y-3 text-sm text-silver-400">
              {footerInventory.map((item) => (
                <li key={item.href}>
                  <LocaleLink to={item.href} className="hover:text-white transition-colors">
                    {tNav(item.labelKey)}
                  </LocaleLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-caption text-brand-400 mb-5">Support</h4>
            <ul className="space-y-3 text-sm text-silver-400">
              {footerSupport.map((item) => (
                <li key={item.href}>
                  <LocaleLink to={item.href} className="hover:text-white transition-colors">
                    {tNav(item.labelKey)}
                  </LocaleLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-caption text-brand-400 mb-5">Research newsletter</h4>
            <p className="text-silver-400 text-sm mb-5 leading-relaxed">
              Priority updates on EU supply availability, batch COAs, and newly listed compounds.
            </p>
            <form
              className="flex flex-wrap gap-2 rounded-2xl p-1.5 bg-white/5 backdrop-blur-md border border-white/10 focus-within:ring-2 focus-within:ring-brand-400/40 transition-all"
              onSubmit={onNewsletterSubmit}
            >
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Email for research newsletter
              </label>
              <input
                id="footer-newsletter-email"
                type="email"
                placeholder="Laboratory email"
                autoComplete="email"
                value={newsletterEmail}
                onChange={(e) => onNewsletterEmailChange(e.target.value)}
                disabled={newsletterSubmitting}
                required
                className="min-w-0 flex-1 px-4 py-3 bg-transparent text-white placeholder:text-silver-400/80 focus:outline-none text-sm"
              />
              <button
                type="submit"
                disabled={newsletterSubmitting}
                className="bg-gradient-cta px-6 py-3 rounded-xl hover:brightness-110 disabled:opacity-70 font-semibold text-sm whitespace-nowrap transition-all"
              >
                {newsletterSubmitting ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>
            {newsletterMessage ? (
              <p className="mt-2 text-xs text-success font-medium" role="status" aria-live="polite">
                {newsletterMessage}
              </p>
            ) : null}
            {newsletterError ? (
              <p className="mt-2 text-xs text-error font-medium" role="alert">
                {newsletterError}
              </p>
            ) : null}
          </div>
        </div>
      </Container>

      <Container className="relative z-10 pb-10">
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-silver-400">
          <span>
            © {new Date().getFullYear()} {brandName}. European research operations.
          </span>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {footerLegal.map((item) => (
              <LocaleLink key={item.href} to={item.href} className="hover:text-brand-300 transition-colors">
                {tNav(item.labelKey)}
              </LocaleLink>
            ))}
          </div>
        </div>
        <p className="text-center md:text-left text-[10px] text-silver-400/80 mt-4 max-w-3xl leading-relaxed normal-case tracking-normal font-normal">
          All products are for laboratory research only. Not for human or veterinary use. VAT-ready
          invoicing available for qualified EU institutions.
        </p>
      </Container>
    </footer>
  );
}
