import { ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LocaleLink } from '../../i18n/LocaleLink';
import { Container, Section } from '../../design-system';
import { SectionHeading } from '../home/SectionHeading';
import {
  compactInternalLinkIds,
  homepageInternalLinks,
  linksForMarkets,
  localizeAnchorForMarkets,
  outboundResearchLinks,
  type InternalResearchLink,
  type LinkMarket,
} from '../../data/researchLinks';

type ResearchLinkHubProps = {
  /** `full` = homepage hub; `compact` = supporting pages */
  variant?: 'full' | 'compact';
  markets?: LinkMarket[];
  showOutbound?: boolean;
  className?: string;
};

function pickLinks(variant: 'full' | 'compact', markets: LinkMarket[]): InternalResearchLink[] {
  const scoped = linksForMarkets(homepageInternalLinks, markets);
  if (variant === 'full') return scoped;
  const allow = new Set<string>(compactInternalLinkIds);
  return scoped.filter((l) => allow.has(l.id));
}

export function ResearchLinkHub({
  variant = 'full',
  markets = ['eu', 'es', 'uk', 'us', 'nl', 'de', 'fr', 'at', 'se', 'au'],
  showOutbound = true,
  className,
}: ResearchLinkHubProps) {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const isEs = locale.startsWith('es');
  const isNl = locale.startsWith('nl');
  const isDe = locale.startsWith('de');
  const isFr = locale.startsWith('fr');
  const internal = pickLinks(variant, markets);

  const eyebrow = isEs
    ? 'Enlaces de investigación'
    : isNl
      ? 'Onderzoekslinks'
      : isDe
        ? 'Forschungslinks'
        : isFr
          ? 'Liens de recherche'
          : 'Research links';
  const title =
    variant === 'full'
      ? isEs
        ? (
            <>
              Explore péptidos UE, herramientas y{' '}
              <span className="text-brand-600">recursos de laboratorio</span>
            </>
          )
        : isNl
          ? (
              <>
                Verken research peptides, tools en{' '}
                <span className="text-brand-600">labbronnen</span>
              </>
            )
          : isDe
            ? (
                <>
                  Forschungspeptide, Tools und{' '}
                  <span className="text-brand-600">Laborressourcen</span>
                </>
              )
            : isFr
              ? (
                  <>
                    Peptides de recherche, outils et{' '}
                    <span className="text-brand-600">ressources labo</span>
                  </>
                )
              : (
                  <>
                    Explore peptides EU, lab tools and{' '}
                    <span className="text-brand-600">research resources</span>
                  </>
                )
      : isEs
        ? 'Recursos relacionados'
        : isNl
          ? 'Gerelateerde bronnen'
          : isDe
            ? 'Verwandte Ressourcen'
            : isFr
              ? 'Ressources associées'
              : 'Related research resources';
  const description = isEs
    ? 'Enlaces internos a catálogo, Retatrutide, agua bacteriostática, calculadora de péptidos y guías para laboratorios en España y toda Europa. Solo uso en investigación.'
    : isNl
      ? 'Interne links voor NL-labs — research chem peptide, glutathione peptide, PEG MGF, frag 176-191 en reconstitutie. Alleen voor onderzoek.'
      : isDe
        ? 'Interne Links für DE-Labs — peptide for research, HGH Fragment 176-191, Hexarelin, HCG. Nur für die Forschung.'
        : isFr
          ? 'Liens internes — european peptide / peptides eu, catalogue et guides laboratoire. Usage recherche uniquement.'
          : 'Internal links for UK, US, EU and AU labs — market-tagged keyword anchors (never mixed). Research use only.';

  return (
    <Section
      size={variant === 'full' ? 'lg' : 'md'}
      tone={variant === 'full' ? 'mist' : 'light'}
      className={className}
      aria-labelledby="research-link-hub-heading"
    >
      <Container>
        {variant === 'full' ? (
          <SectionHeading
            eyebrow={eyebrow}
            title={<span id="research-link-hub-heading">{title}</span>}
            description={description}
            align="center"
            className="mb-10"
          />
        ) : (
          <div className="mb-6">
            <p className="text-caption text-brand-600 mb-2">{eyebrow}</p>
            <h2 id="research-link-hub-heading" className="text-xl font-display font-bold text-navy-950">
              {title}
            </h2>
            <p className="text-sm text-steel-600 mt-2 max-w-2xl">{description}</p>
          </div>
        )}

        <nav aria-label={isEs ? 'Enlaces internos de investigación' : 'Internal research links'}>
          <ul
            className={
              variant === 'full'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5'
                : 'grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3'
            }
          >
            {internal.map((link) => (
              <li key={link.id} className="min-w-0">
                <LocaleLink
                  to={link.href}
                  className="group block text-sm font-semibold text-brand-700 hover:text-brand-600 underline-offset-4 hover:underline"
                >
                  {localizeAnchorForMarkets(locale, link.anchor, markets)}
                </LocaleLink>
                {link.blurb && variant === 'full' ? (
                  <p className="text-xs text-steel-600 mt-1 leading-relaxed">
                    {localizeAnchorForMarkets(locale, link.blurb, markets)}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>

        {showOutbound ? (
          <div className="mt-10 pt-8 border-t border-brand-100/80">
            <p className="text-caption text-steel-600 mb-4">
              {isEs ? 'Referencias científicas externas' : 'External scientific references'}
            </p>
            <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-x-8 sm:gap-y-3">
              {outboundResearchLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-950 hover:text-brand-600 underline-offset-4 hover:underline"
                  >
                    {localizeAnchorForMarkets(locale, link.anchor, markets)}
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
                    <span className="sr-only">{isEs ? '(se abre en una pestaña nueva)' : '(opens in a new tab)'}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
