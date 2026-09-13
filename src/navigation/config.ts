export type NavLinkItem = {
  labelKey: string;
  href: string;
  descriptionKey?: string;
};

export type MegaMenuId = 'shop' | 'research';

export type PrimaryNavItem =
  | { labelKey: string; href: string }
  | { labelKey: string; megaMenu: MegaMenuId };

export const primaryNav: PrimaryNavItem[] = [
  { labelKey: 'primary.home', href: '/' },
  { labelKey: 'primary.shop', megaMenu: 'shop' },
  { labelKey: 'primary.research', megaMenu: 'research' },
  { labelKey: 'primary.blog', href: '/blog' },
  { labelKey: 'primary.contact', href: '/contact' },
];

export const researchTools: NavLinkItem[] = [
  {
    labelKey: 'research.peptideGuide',
    href: '/peptide-guide',
    descriptionKey: 'research.peptideGuideDesc',
  },
  {
    labelKey: 'research.calculator',
    href: '/peptide-calculator',
    descriptionKey: 'research.calculatorDesc',
  },
  {
    labelKey: 'research.coaLibrary',
    href: '/coas',
    descriptionKey: 'research.coaLibraryDesc',
  },
  {
    labelKey: 'research.information',
    href: '/peptide-information',
    descriptionKey: 'research.informationDesc',
  },
  {
    labelKey: 'research.researchHub',
    href: '/peptide-research',
    descriptionKey: 'research.researchHubDesc',
  },
];

export const footerInventory: NavLinkItem[] = [
  { labelKey: 'footer.fullCatalog', href: '/shop' },
  { labelKey: 'footer.categories', href: '/categories' },
  { labelKey: 'footer.retatrutide', href: '/product/retatrutide' },
  { labelKey: 'footer.bacWater', href: '/product/bacteriostatic-water' },
  { labelKey: 'footer.advancedSearch', href: '/search' },
  { labelKey: 'footer.wishlist', href: '/wishlist' },
];

export const footerResearch: NavLinkItem[] = [
  { labelKey: 'footer.calculator', href: '/peptide-calculator' },
  { labelKey: 'footer.coaLibrary', href: '/coas' },
  { labelKey: 'footer.peptideInfo', href: '/peptide-information' },
  { labelKey: 'footer.ukEuropeGuide', href: '/blog/research-peptides-uk-europe' },
  { labelKey: 'footer.spainEuropeGuide', href: '/blog/research-peptides-spain-europe' },
  { labelKey: 'footer.reconstitutionGuide', href: '/blog/reconstitute-research-peptides' },
];

export const footerSupport: NavLinkItem[] = [
  { labelKey: 'footer.faq', href: '/faq' },
  { labelKey: 'footer.euShipping', href: '/shipping' },
  { labelKey: 'primary.contact', href: '/contact' },
  { labelKey: 'footer.about', href: '/about-us' },
];

export const footerLegal: NavLinkItem[] = [
  { labelKey: 'footer.terms', href: '/terms' },
  { labelKey: 'footer.privacy', href: '/privacy' },
  { labelKey: 'footer.returns', href: '/refund-returns' },
];
