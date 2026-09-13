/**
 * Internal + outbound research links keyed to SEO markets.
 * Evidence: docs/seo/keywords-by-market/{market}.json — never merge markets.
 */
export type LinkMarket = 'eu' | 'es' | 'uk' | 'us' | 'de' | 'fr' | 'nl' | 'at' | 'se' | 'au';

export type LocalizedAnchor = {
  en: string;
  es?: string;
  uk?: string;
  us?: string;
  de?: string;
  fr?: string;
  nl?: string;
  au?: string;
};

export type InternalResearchLink = {
  id: string;
  href: string;
  anchor: LocalizedAnchor;
  blurb?: LocalizedAnchor;
  markets: LinkMarket[];
};

export type OutboundResearchLink = {
  id: string;
  href: string;
  anchor: LocalizedAnchor;
  blurb?: LocalizedAnchor;
};

const ALL_EU: LinkMarket[] = ['eu', 'es', 'uk', 'us', 'nl', 'de', 'fr', 'at', 'se', 'au'];

export const homepageInternalLinks: InternalResearchLink[] = [
  {
    id: 'shop-eu',
    href: '/shop',
    anchor: {
      en: 'Buy research peptides online — EU & UK labs',
      uk: 'Buy peptides online UK & Europe research catalog',
      us: 'Research peptides catalog for US & EU labs',
      nl: 'Research chem peptide / research chemicals peptides catalogus',
      de: 'Peptide for research — EU-Forschungskatalog',
      fr: 'European peptide — catalogue de recherche',
      es: 'Comprar péptidos de investigación en España y Europa',
      au: 'Buy research peptides — AU & EU catalog',
    },
    blurb: {
      en: 'Research Peptides Europe catalog with EUR pricing and Netherlands dispatch.',
      uk: 'Buy research peptides online UK researchers trust — EUR catalog, EU fulfillment.',
      us: 'Verified research compounds with EU documentation standards.',
      nl: 'Research chemicals peptides voor NL-laboratoria — EU-verzending vanuit Nederland.',
      de: 'Research chemical peptides und peptide for research aus den Niederlanden.',
      fr: 'European peptide / peptides eu pour laboratoires européens.',
      es: 'Catálogo Research Peptides Europe con precios en EUR y envío en la UE.',
      au: 'EUR research catalog with EU dispatch for Australian laboratory teams.',
    },
    markets: ALL_EU,
  },
  {
    id: 'about-europe',
    href: '/about-us',
    anchor: {
      en: 'About Research Peptides Europe',
      uk: 'Research Peptides Europe — UK & EU supplier',
      us: 'Research Peptides Europe — peptides EU supplier',
      nl: 'Over Research Peptides Europe (peptides eu)',
      de: 'Über Research Peptides Europe',
      fr: 'À propos de Research Peptides Europe',
      es: 'Sobre Research Peptides Europe · europa peptide',
    },
    markets: ALL_EU,
  },
  {
    id: 'calculator',
    href: '/peptide-calculator',
    anchor: {
      en: 'Peptide calculator for lab reconstitution',
      es: 'Calculadora de péptidos para reconstitución',
      nl: 'Peptide calculator voor reconstitutie',
      de: 'Peptid-Rechner für Rekonstitution',
      fr: 'Calculateur de peptides',
    },
    markets: ['eu', 'es', 'uk', 'us', 'nl', 'de', 'au', 'fr'],
  },
  {
    id: 'bac-water',
    href: '/product/bacteriostatic-water',
    anchor: {
      en: 'Bacteriostatic water for research peptides',
      uk: 'Bacteriostatic water UK research diluent',
      us: 'Hospira bacteriostatic water research diluent',
      es: 'Agua bacteriostática para péptidos de investigación',
      nl: 'Bacteriostatic water voor onderzoekspeptiden',
      de: 'Bakteriostatisches Wasser für Forschungspeptide',
    },
    markets: ['eu', 'es', 'uk', 'us', 'nl', 'de', 'au'],
  },
  {
    id: 'bac-hospira',
    href: '/product/bacteriostatic-water-0-9-benzyl-alcohol-10ml-hospira-injection-usp',
    anchor: {
      en: 'Hospira bacteriostatic water 10ml',
      uk: 'Bac water Hospira — bacteriostatic water 10ml',
      us: 'Hospira bacteriostatic water 10 ml / Hospira bac water 10ml',
    },
    markets: ['eu', 'uk', 'us'],
  },
  {
    id: 'retatrutide',
    href: '/product/retatrutide',
    anchor: {
      en: 'Buy Retatrutide research peptide',
      uk: 'Retatrutide UK buy — research grade',
      es: 'Comprar Retatrutide de investigación',
    },
    markets: ['eu', 'es', 'uk', 'us'],
  },
  {
    id: 'retatrutide-pen',
    href: '/product/vio-labs-retatrutide-40mg-3ml-prefilled-pen',
    anchor: {
      en: 'Retatrutide research pen peptides',
      uk: 'Retatrutide peptide pen — research format',
      es: 'Pen peptides Retatrutide para laboratorio',
    },
    markets: ['eu', 'es', 'uk'],
  },
  {
    id: 'cjc-1295',
    href: '/product/cjc-1295-with-dac',
    anchor: {
      en: 'CJC-1295 research peptide',
      uk: 'CJC 1295 with DAC research peptide',
    },
    markets: ['eu', 'uk', 'us'],
  },
  {
    id: 'cjc-ipamorelin',
    href: '/product/cjc-1295-no-dac-ipamorelin-blend',
    anchor: {
      en: 'CJC-1295 Ipamorelin research blend',
      uk: 'CJC 1295 Ipamorelin blend for research',
    },
    markets: ['eu', 'uk', 'us'],
  },
  {
    id: 'ipamorelin',
    href: '/product/ipamorelin',
    anchor: {
      en: 'Buy Ipamorelin research peptide',
      uk: 'Buy Ipamorelin / Ipamorelin UK research',
    },
    markets: ['eu', 'uk'],
  },
  {
    id: 'bpc-tb500',
    href: '/product/bpc-157-tb500-x-10-vials',
    anchor: {
      en: 'BPC-157 TB-500 research blend',
      uk: 'BPC157 TB500 research blend',
      au: 'BPC 157 10mg TB500 10mg research blend',
    },
    markets: ['eu', 'uk', 'au', 'us'],
  },
  {
    id: 'glow-blend',
    href: '/product/glow-blend-ghk-cu-bpc157-tb500',
    anchor: {
      en: 'Glow peptide research blend',
      uk: 'Glow peptide / Glow blend GHK-Cu BPC TB500',
      us: 'Glow blend peptide research material',
    },
    markets: ['eu', 'uk', 'us'],
  },
  {
    id: 'kpv',
    href: '/product/kpv',
    anchor: {
      en: 'KPV peptide for research',
      uk: 'KPV peptide UK research material',
    },
    markets: ['eu', 'uk', 'us', 'au'],
  },
  {
    id: 'amino-1mq',
    href: '/product/5-amino-1mq',
    anchor: {
      en: '5-Amino-1MQ research compound',
      uk: '5 Amino 1MQ research peptide',
    },
    markets: ['eu', 'uk'],
  },
  {
    id: 'igf1',
    href: '/product/igf-1-lr3',
    anchor: {
      en: 'IGF-1 LR3 research protein',
      uk: 'IGF 1 LR3 / buy IGF-1 LR3 research',
      es: 'Comprar IGF-1 LR3 de investigación',
      nl: 'IGF-1 peptide apotheek / research IGF-1',
      de: 'IGF 1 DES / IGF-1 research peptide',
    },
    markets: ['eu', 'es', 'uk', 'nl', 'de', 'us'],
  },
  {
    id: 'hcg',
    href: '/product/hcg',
    anchor: {
      en: 'HCG peptide for research',
      uk: 'Buy HCG UK — research HCG peptide',
      de: 'Peptides HCG — Forschungsmaterial',
    },
    markets: ['eu', 'uk', 'de', 'us'],
  },
  {
    id: 'hgh-fragment',
    href: '/product/hgh-fragment-176-191',
    anchor: {
      en: 'HGH Fragment 176-191 research peptide',
      uk: 'HGH fragment 176-191 research',
      us: 'Fragment 176-191 / HGH 191aa research',
      de: 'HGH Fragment 176-191 / Fragment 176-191',
      nl: 'Bestellen frag 176-191 peptide',
    },
    markets: ['eu', 'uk', 'us', 'de', 'nl'],
  },
  {
    id: 'hgh-191aa',
    href: '/product/hgh-191aa-somatropin',
    anchor: {
      en: 'HGH 191AA research somatropin',
      us: 'HGH 191aa / HGH191aa research peptide',
      de: 'HGH 191aa Forschungsmaterial',
    },
    markets: ['eu', 'us', 'de', 'uk'],
  },
  {
    id: 'hexarelin',
    href: '/product/hexarelin-2mg',
    anchor: {
      en: 'Hexarelin research peptide',
      us: 'Hexarelin acetate research',
      de: 'Hexarelin Forschungspeptid',
      nl: 'Hexarelin apotheek / hexareline peptide',
    },
    markets: ['eu', 'us', 'de', 'nl'],
  },
  {
    id: 'glutathione',
    href: '/product/glutathione-peptide',
    anchor: {
      en: 'Glutathione peptide for research',
      us: 'Glutathione peptides / gluta peptides research',
      nl: 'Glutathione peptide / peptide glutathione',
      au: 'Glutathione peptide research',
    },
    markets: ['eu', 'us', 'nl', 'au'],
  },
  {
    id: 'peg-mgf',
    href: '/product/peg-mgf',
    anchor: {
      en: 'PEG-MGF research peptide',
      nl: 'PEG MGF online / PEG MGF koop (onderzoek)',
      au: 'Buy PEG-MGF / buy MGF peptide research',
    },
    markets: ['eu', 'nl', 'au'],
  },
  {
    id: 'gonadorelin',
    href: '/product/gonadorelin-acetate',
    anchor: {
      en: 'Gonadorelin acetate research',
      nl: 'Kopen gonadoreline peptide (onderzoek)',
      au: 'Buy gonadorelin research',
    },
    markets: ['eu', 'nl', 'au'],
  },
  {
    id: 'aicar',
    href: '/product/aicar',
    anchor: {
      en: 'AICAR research compound',
      au: 'AICAR peptide research',
    },
    markets: ['eu', 'au'],
  },
  {
    id: 'cagrilintide-blend',
    href: '/product/retatrutide-cagrilintide-blend',
    anchor: {
      en: 'Cagrilintide peptide research blend',
      es: 'Péptido Cagrilintide · precio investigación',
    },
    markets: ['eu', 'es', 'uk'],
  },
  {
    id: 'blog-spain-eu',
    href: '/blog/research-peptides-spain-europe',
    anchor: {
      en: 'Research peptides for Spain and Europe',
      es: 'Comprar péptidos en España y Europa — guía',
    },
    markets: ['eu', 'es'],
  },
  {
    id: 'blog-uk-eu',
    href: '/blog/research-peptides-uk-europe',
    anchor: {
      en: 'Buy peptides online UK & Europe guide',
      uk: 'Buy peptides online UK — Research Peptides Europe',
      us: 'Research peptides for US & EU laboratories',
    },
    markets: ['eu', 'uk', 'us', 'au'],
  },
  {
    id: 'blog-multi-market',
    href: '/blog/research-peptides-multi-market-eu',
    anchor: {
      en: 'NL, DE, US & AU research peptides guide',
      nl: 'Research chem peptide gids voor NL-labs',
      de: 'Peptide for research — DE & EU Leitfaden',
      us: 'Glow blend peptide & HGH 191aa research guide',
      au: 'AU research peptides — glutathione, AICAR, PEG-MGF',
      fr: 'European peptide / peptides eu — guide laboratoire',
    },
    markets: ['eu', 'nl', 'de', 'us', 'au', 'fr', 'se', 'at'],
  },
  {
    id: 'blog-retatrutide',
    href: '/blog/retatrutide-research-peptide-eu',
    anchor: {
      en: 'Retatrutide buy online — EU lab guide',
      uk: 'Where to buy Retatrutide online for research',
      es: 'Guía Retatrutide para laboratorios en la UE',
    },
    markets: ['eu', 'es', 'uk', 'us'],
  },
  {
    id: 'blog-reconstitute',
    href: '/blog/reconstitute-research-peptides',
    anchor: {
      en: 'How to reconstitute with bacteriostatic water',
      uk: 'Bacteriostatic water reconstitution guide',
      us: 'Hospira bacteriostatic water reconstitution guide',
      es: 'Reconstituir péptidos con agua bacteriostática',
    },
    markets: ['eu', 'es', 'uk', 'us', 'nl', 'de'],
  },
  {
    id: 'blog-bpc-tb',
    href: '/blog/tb-500-vs-bpc-157-synergistic-effects',
    anchor: {
      en: 'TB-500 vs BPC-157 research guide',
      uk: 'BPC 157 and TB 500 research comparison',
      au: 'BPC 157 TB500 research comparison',
    },
    markets: ['eu', 'uk', 'au', 'us'],
  },
  {
    id: 'coa',
    href: '/coas',
    anchor: {
      en: 'COA library for research peptides',
      es: 'Biblioteca COA de péptidos de investigación',
      nl: 'COA-bibliotheek onderzoekspeptiden',
      de: 'COA-Bibliothek Forschungspeptide',
      fr: 'Bibliothèque COA peptides de recherche',
    },
    markets: ALL_EU,
  },
  {
    id: 'shipping',
    href: '/shipping',
    anchor: {
      en: 'EU & UK peptide shipping from the Netherlands',
      uk: 'Peptides UK shipping via EU dispatch',
      nl: 'EU-verzending onderzoekspeptiden vanuit Nederland',
      de: 'EU-Versand Forschungspeptide aus den Niederlanden',
      fr: 'Livraison UE peptides de recherche',
      es: 'Envío de péptidos en la UE desde Países Bajos',
    },
    markets: ALL_EU,
  },
  {
    id: 'peptide-info',
    href: '/peptide-information',
    anchor: {
      en: 'Peptide information for researchers',
      es: 'Información sobre péptidos para investigadores',
      de: 'Peptid-Informationen für Forscher',
      nl: 'Peptide-informatie voor onderzoekers',
      fr: 'Informations sur les peptides',
    },
    markets: ALL_EU,
  },
  {
    id: 'faq',
    href: '/faq',
    anchor: {
      en: 'Researcher FAQ — Research Peptides EU',
      es: 'FAQ investigadores — Research Peptides EU',
      nl: 'FAQ onderzoekers — Research Peptides EU',
      de: 'Forscher-FAQ — Research Peptides EU',
      fr: 'FAQ chercheurs — Research Peptides EU',
    },
    markets: ALL_EU,
  },
];

export const compactInternalLinkIds = [
  'shop-eu',
  'calculator',
  'bac-water',
  'retatrutide',
  'hgh-fragment',
  'glow-blend',
  'blog-uk-eu',
  'coa',
] as const;

export const outboundResearchLinks: OutboundResearchLink[] = [
  {
    id: 'pubchem',
    href: 'https://pubchem.ncbi.nlm.nih.gov/',
    anchor: {
      en: 'PubChem compound database',
      es: 'Base de datos de compuestos PubChem',
      de: 'PubChem Verbindungsdatenbank',
      nl: 'PubChem verbindingendatabase',
      fr: 'Base de données PubChem',
    },
  },
  {
    id: 'ema',
    href: 'https://www.ema.europa.eu/en',
    anchor: {
      en: 'European Medicines Agency (EMA)',
      es: 'Agencia Europea de Medicamentos (EMA)',
      de: 'Europäische Arzneimittel-Agentur (EMA)',
      nl: 'Europees Geneesmiddelenbureau (EMA)',
      fr: 'Agence européenne des médicaments (EMA)',
    },
  },
  {
    id: 'uniprot',
    href: 'https://www.uniprot.org/',
    anchor: {
      en: 'UniProt protein knowledgebase',
      es: 'Base de conocimiento de proteínas UniProt',
      de: 'UniProt Protein-Wissensdatenbank',
      nl: 'UniProt eiwitkennisbank',
      fr: 'Base de connaissances UniProt',
    },
  },
];

export function localizeAnchor(locale: string, text: LocalizedAnchor): string {
  const code = locale.slice(0, 2).toLowerCase() as keyof LocalizedAnchor;
  const localized = text[code];
  if (typeof localized === 'string' && localized.trim()) return localized;
  return text.en;
}

/** Locale first; then market-tuned English (uk/us/au) on EN storefront. */
export function localizeAnchorForMarkets(
  locale: string,
  text: LocalizedAnchor,
  markets: LinkMarket[],
): string {
  const code = locale.slice(0, 2).toLowerCase();
  if (code === 'es' && text.es) return text.es;
  if (code === 'nl' && text.nl) return text.nl;
  if (code === 'de' && text.de) return text.de;
  if (code === 'fr' && text.fr) return text.fr;

  if (code === 'en' || code === 'uk') {
    if (markets.includes('uk') && text.uk) return text.uk;
    if (markets.includes('us') && text.us) return text.us;
    if (markets.includes('au') && text.au) return text.au;
  }
  return text.en;
}

export function linksForMarkets(
  links: InternalResearchLink[],
  markets: LinkMarket[],
): InternalResearchLink[] {
  const set = new Set(markets);
  return links.filter((link) => link.markets.some((m) => set.has(m)));
}
