import type { LocaleCode } from '../i18n/locales';

type CategoryCopy = { name: string; description: string };

/** Canonical English + locale overlays keyed by category slug. */
const CATEGORY_I18N: Record<string, Partial<Record<LocaleCode, CategoryCopy>> & { en: CategoryCopy }> = {
  peptides: {
    en: {
      name: 'Peptides',
      description: 'High-purity research peptides for scientific and academic studies.',
    },
    es: {
      name: 'Péptidos',
      description: 'Péptidos de investigación de alta pureza para estudios científicos y académicos.',
    },
    nl: {
      name: 'Peptiden',
      description: 'Hoogzuivere onderzoekspeptiden voor wetenschappelijke en academische studies.',
    },
    de: {
      name: 'Peptide',
      description: 'Hochreine Forschungspeptide für wissenschaftliche und akademische Studien.',
    },
    fr: {
      name: 'Peptides',
      description: 'Peptides de recherche de haute pureté pour études scientifiques et académiques.',
    },
    it: {
      name: 'Peptidi',
      description: 'Peptidi di ricerca ad elevata purezza per studi scientifici e accademici.',
    },
  },
  sarms: {
    en: {
      name: 'SARMs',
      description: 'Selective androgen receptor modulators for research applications.',
    },
    es: {
      name: 'SARMs',
      description: 'Moduladores selectivos del receptor de andrógenos para aplicaciones de investigación.',
    },
    nl: {
      name: 'SARMs',
      description: 'Selectieve androgeenreceptormodulatoren voor onderzoeksdoeleinden.',
    },
    de: {
      name: 'SARMs',
      description: 'Selektive Androgenrezeptor-Modulatoren für Forschungsanwendungen.',
    },
    fr: {
      name: 'SARMs',
      description: 'Modulateurs sélectifs des récepteurs aux androgènes pour la recherche.',
    },
    it: {
      name: 'SARM',
      description: 'Modulatori selettivi del recettore degli androgeni per applicazioni di ricerca.',
    },
  },
  'research-chemicals': {
    en: {
      name: 'Research Chemicals',
      description: 'Premium grade research chemicals and laboratory reagents.',
    },
    es: {
      name: 'Productos químicos de investigación',
      description: 'Reactivos y productos químicos de laboratorio de grado premium.',
    },
    nl: {
      name: 'Research chemicals',
      description: 'Premium onderzoekschemicaliën en laboratoriumreagentia.',
    },
    de: {
      name: 'Forschungschemikalien',
      description: 'Hochwertige Forschungschemikalien und Laborreagenzien.',
    },
    fr: {
      name: 'Produits chimiques de recherche',
      description: 'Réactifs et produits chimiques de laboratoire de qualité premium.',
    },
    it: {
      name: 'Prodotti chimici da ricerca',
      description: 'Reagenti e prodotti chimici di laboratorio di grado premium.',
    },
  },
  'peptide-blends': {
    en: {
      name: 'Peptide Blends',
      description: 'Synergistic combinations of research peptides in single vials.',
    },
    es: {
      name: 'Mezclas de péptidos',
      description: 'Combinaciones sinérgicas de péptidos de investigación en un solo vial.',
    },
    nl: {
      name: 'Peptideblends',
      description: 'Synergetische combinaties van onderzoekspeptiden in één flesje.',
    },
    de: {
      name: 'Peptidmischungen',
      description: 'Synergistische Kombinationen von Forschungspeptiden in einzelnen Vials.',
    },
    fr: {
      name: 'Mélanges de peptides',
      description: 'Combinaisons synergiques de peptides de recherche en flacons unitaires.',
    },
    it: {
      name: 'Miscele di peptidi',
      description: 'Combinazioni sinergiche di peptidi di ricerca in un unico flaconcino.',
    },
  },
  'peptide-capsules': {
    en: {
      name: 'Peptide Capsules',
      description: 'Oral format research compounds for metabolic and signaling studies.',
    },
    es: {
      name: 'Cápsulas de péptidos',
      description: 'Compuestos de investigación en formato oral para estudios metabólicos y de señalización.',
    },
    nl: {
      name: 'Peptidecapsules',
      description: 'Orale onderzoeksverbindingen voor metabolische en signaleringsstudies.',
    },
    de: {
      name: 'Peptidkapseln',
      description: 'Orale Forschungsverbindungen für Stoffwechsel- und Signalstudien.',
    },
    fr: {
      name: 'Capsules de peptides',
      description: 'Composés de recherche en format oral pour études métaboliques et de signalisation.',
    },
    it: {
      name: 'Capsule di peptidi',
      description: 'Composti da ricerca in formato orale per studi metabolici e di segnalazione.',
    },
  },
  'igf-1-proteins': {
    en: {
      name: 'IGF-1 Proteins',
      description: 'Insulin-like growth factor analogs and related proteins.',
    },
    es: {
      name: 'Proteínas IGF-1',
      description: 'Análogos del factor de crecimiento similar a la insulina y proteínas relacionadas.',
    },
    nl: {
      name: 'IGF-1-eiwitten',
      description: 'Insuline-achtige groeifactoranalogen en gerelateerde eiwitten.',
    },
    de: {
      name: 'IGF-1-Proteine',
      description: 'Insulinähnliche Wachstumsfaktor-Analoga und verwandte Proteine.',
    },
    fr: {
      name: 'Protéines IGF-1',
      description: 'Analogues du facteur de croissance insulinomimétique et protéines associées.',
    },
    it: {
      name: 'Proteine IGF-1',
      description: 'Analoghi del fattore di crescita insulinosimile e proteine correlate.',
    },
  },
  'melanotan-peptides': {
    en: {
      name: 'Melanotan Peptides',
      description: 'Melanocortin receptor agonists for pigmentation research.',
    },
    es: {
      name: 'Péptidos Melanotan',
      description: 'Agonistas del receptor de melanocortina para investigación de pigmentación.',
    },
    nl: {
      name: 'Melanotan-peptiden',
      description: 'Melanocortinereceptoragonisten voor pigmentatieonderzoek.',
    },
    de: {
      name: 'Melanotan-Peptide',
      description: 'Melanocortin-Rezeptor-Agonisten für die Pigmentierungsforschung.',
    },
    fr: {
      name: 'Peptides Melanotan',
      description: 'Agonistes des récepteurs de la mélanocortine pour la recherche sur la pigmentation.',
    },
    it: {
      name: 'Peptidi Melanotan',
      description: 'Agonisti del recettore della melanocortina per la ricerca sulla pigmentazione.',
    },
  },
  supplements: {
    en: {
      name: 'Supplements',
      description: 'Research-grade nutritional compounds for laboratory use.',
    },
    es: {
      name: 'Suplementos de laboratorio',
      description: 'Compuestos nutricionales de grado investigación para uso en laboratorio.',
    },
    nl: {
      name: 'Laboratoriumsupplementen',
      description: 'Nutritionele onderzoeksverbindingen voor laboratoriumgebruik.',
    },
    de: {
      name: 'Labor-Supplements',
      description: 'Ernährungsverbindungen in Forschungsqualität für den Laborgebrauch.',
    },
    fr: {
      name: 'Compléments de laboratoire',
      description: 'Composés nutritionnels de grade recherche pour usage en laboratoire.',
    },
    it: {
      name: 'Integratori da laboratorio',
      description: 'Composti nutrizionali di grado ricerca per uso di laboratorio.',
    },
  },
  'lab-supplies': {
    en: {
      name: 'Lab Supplies',
      description: 'Bacteriostatic water and essential reconstitution supplies.',
    },
    es: {
      name: 'Material de laboratorio',
      description: 'Agua bacteriostática y suministros esenciales para reconstitución química.',
    },
    nl: {
      name: 'Labbenodigdheden',
      description: 'Bacteriostatisch water en essentiële reconstitutiebenodigdheden.',
    },
    de: {
      name: 'Labormaterial',
      description: 'Bakteriostatisches Wasser und wesentliche Rekonstitutionsmaterialien.',
    },
    fr: {
      name: 'Fournitures de laboratoire',
      description: 'Eau bactériostatique et fournitures essentielles de reconstitution.',
    },
    it: {
      name: 'Materiale di laboratorio',
      description: 'Acqua bacteriostatica e forniture essenziali per la ricostituzione.',
    },
  },
  'peptide-powder': {
    en: {
      name: 'Peptide Powder',
      description: 'Lyophilized peptide powders with SKU-mapped variants.',
    },
    es: {
      name: 'Polvo de péptidos',
      description: 'Polvos de péptidos liofilizados del listado mayorista (variantes mapeadas por SKU).',
    },
    nl: {
      name: 'Peptidepoeder',
      description: 'Gelyofiliseerde peptidepoeders met SKU-gekoppelde varianten.',
    },
    de: {
      name: 'Peptidpulver',
      description: 'Lyophilisierte Peptidpulver mit SKU-zugeordneten Varianten.',
    },
    fr: {
      name: 'Poudre de peptides',
      description: 'Poudres de peptides lyophilisées avec variantes associées aux SKU.',
    },
    it: {
      name: 'Polvere di peptidi',
      description: 'Polveri peptidiche liofilizzate con varianti mappate per SKU.',
    },
  },
};

type CategoryLike = {
  slug?: string | null;
  name?: string | null;
  description?: string | null;
};

function copyFor(slug: string, locale: LocaleCode): CategoryCopy | null {
  const entry = CATEGORY_I18N[slug.toLowerCase()];
  if (!entry) return null;
  return entry[locale] ?? entry.en;
}

export function localizedCategoryName(category: CategoryLike, locale: LocaleCode): string {
  const slug = String(category.slug ?? '').trim();
  const localized = slug ? copyFor(slug, locale)?.name : null;
  if (localized) return localized;
  return String(category.name ?? (slug.replace(/-/g, ' ') || ''));
}

export function localizedCategoryDescription(category: CategoryLike, locale: LocaleCode): string {
  const slug = String(category.slug ?? '').trim();
  const localized = slug ? copyFor(slug, locale)?.description : null;
  if (localized) return localized;
  return String(category.description ?? '');
}
