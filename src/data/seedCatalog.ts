export type SeedCategory = {
  name: string;
  slug: string;
  description: string;
};

export type ProductVariant = {
  name: string;
  price: number;
};

export type SeedProduct = {
  title: string;
  description: string;
  price: number;
  inventory: number;
  categories: string[];
  specifications: string[];
  image: string;
  rating: number;
  reviewCount: number;
  /** Optional RRP for sale / strike-through on cards (requires DB column + migration). */
  compareAtPrice?: number;
  variants?: ProductVariant[];
};

export const referenceSeedCategories: SeedCategory[] = [
  {
    name: 'Peptides',
    slug: 'peptides',
    description: 'High-purity research peptides for scientific and academic studies.',
  },
  {
    name: 'SARMs',
    slug: 'sarms',
    description: 'Selective Androgen Receptor Modulators for research applications.',
  },
  {
    name: 'Research Chemicals',
    slug: 'research-chemicals',
    description: 'Premium grade research chemicals and laboratory reagents.',
  },
  {
    name: 'Peptide Blends',
    slug: 'peptide-blends',
    description: 'Synergistic combinations of research peptides in single vials.',
  },
  {
    name: 'Peptide Capsules',
    slug: 'peptide-capsules',
    description: 'Oral format research compounds for metabolic and signaling studies.',
  },
  {
    name: 'IGF-1 Proteins',
    slug: 'igf-1-proteins',
    description: 'Insulin-like Growth Factor analogs and related proteins.',
  },
  {
    name: 'Melanotan Peptides',
    slug: 'melanotan-peptides',
    description: 'Melanocortin receptor agonists for pigmentation research.',
  },
  {
    name: 'Supplements',
    slug: 'supplements',
    description: 'General laboratory and research-grade nutritional compounds.',
  },
  {
    name: 'Lab Supplies',
    slug: 'lab-supplies',
    description: 'Bacteriostatic water and essential chemical reconstitution supplies.',
  },
  {
    name: 'Peptide Powder',
    slug: 'peptide-powder',
    description: 'Lyophilized peptide powders from wholesale price list (SKU-mapped variants).',
  },
];

export const referenceSeedProducts: SeedProduct[] = [
  // ----- PEPTIDES & RESEARCH CHEMICALS FROM UK SITE -----
  {
    title: 'Tirzepatide',
    description: 'Advanced dual GIP and GLP-1 receptor agonist designed for metabolic research.',
    price: 142.50,
    inventory: 150,
    categories: ['peptides', 'research-chemicals'],
    specifications: ['Lyophilized powder', 'Research use only', 'Dual agonist'],
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80',
    rating: 4.9,
    reviewCount: 42,
    compareAtPrice: 175.0,
    variants: [
      { name: '5mg', price: 142.50 },
      { name: '10mg', price: 265.00 },
      { name: '15mg', price: 380.00 }
    ]
  },
  {
    title: 'Semaglutide - GLP-1',
    description: 'High-purity GLP-1 receptor agonist for blood glucose and metabolic pathway studies.',
    price: 114.00,
    inventory: 200,
    categories: ['peptides', 'research-chemicals'],
    specifications: ['GLP-1 Analog', 'Lyophilized', 'Batch purity tested'],
    image: 'https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&w=900&q=80',
    rating: 4.8,
    reviewCount: 89,
    compareAtPrice: 134.99,
    variants: [
        { name: '2mg', price: 114.00 },
        { name: '5mg', price: 195.00 }
    ]
  },
  {
    title: 'Retatrutide GLP-3',
    description: 'Cutting-edge triple agonist (GLP-1, GIP, GCGR) for complex metabolic research models.',
    price: 95.00,
    inventory: 90,
    categories: ['peptides', 'research-chemicals'],
    specifications: ['Triple agonist', 'Research Grade', 'Verified Purity'],
    image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=900&q=80',
    rating: 4.7,
    reviewCount: 31,
    variants: [
      { name: '5mg', price: 95.00 },
      { name: '10mg', price: 180.00 }
    ]
  },
  {
    title: 'Tesofensine 500mcg (60 Capsules)',
    description: 'Monoamine reuptake inhibitor supplied in capsule format for neurological and metabolic studies.',
    price: 160.50,
    inventory: 45,
    categories: ['peptide-capsules', 'research-chemicals'],
    specifications: ['500mcg per capsule', '60 count', 'Oral research format'],
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80',
    rating: 4.6,
    reviewCount: 19,
    variants: [
      { name: '60 Capsules', price: 160.50 },
      { name: '120 Capsules', price: 295.00 }
    ]
  },
  {
    title: 'BPC 5mg + TB 5mg Blend',
    description: 'Synergistic combination of Body Protection Compound and Thymosin Beta 4 for connective tissue research.',
    price: 85.50,
    inventory: 110,
    categories: ['peptide-blends', 'peptides'],
    specifications: ['10mg total blend', '5mg + 5mg ratio', 'Lyophilized'],
    image: 'https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&w=900&q=80',
    rating: 5.0,
    reviewCount: 67,
    variants: [{ name: '10mg (5+5)', price: 85.50 }]
  },
  {
    title: 'CJC-1295 No DAC 5mg + Ipamorelin 5mg',
    description: 'Classic GH-axis blend combining two potent secretagogues for synergistic receptor activation studies.',
    price: 85.50,
    inventory: 85,
    categories: ['peptide-blends', 'peptides'],
    specifications: ['10mg total blend', '5mg + 5mg ratio', 'Cold storage required'],
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=900&q=80',
    rating: 4.8,
    reviewCount: 54,
    variants: [{ name: '10mg (5+5)', price: 85.50 }]
  },
  {
    title: 'LL-37',
    description: 'Antimicrobial peptide referenced in immunomodulation and pathogen defense research.',
    price: 99.25,
    inventory: 30,
    categories: ['peptides', 'research-chemicals'],
    specifications: ['Antimicrobial peptide', 'High purity', 'Research use only'],
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80',
    rating: 4.5,
    reviewCount: 12,
    variants: [{ name: '5mg', price: 99.25 }]
  },
  {
    title: 'HGH Fragment 176-191 10mg',
    description: 'Fragmented portion of the HGH chain, often evaluated for isolated metabolic properties.',
    price: 56.99,
    inventory: 130,
    categories: ['peptides'],
    specifications: ['10mg vial', 'Fragment 176-191', 'Lyophilized powder'],
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=900&q=80',
    rating: 4.7,
    reviewCount: 22,
    variants: [
      { name: '2mg', price: 25.00 },
      { name: '5mg', price: 42.00 },
      { name: '10mg', price: 56.99 }
    ]
  },

  // ----- SARMS & OTHERS FROM US SITE -----
  {
    title: 'MK-677 / Ibutamoren 25mg x 30ml',
    description: 'Liquid-format orally active GH secretagogue for long-term signaling cascade evaluation.',
    price: 61.75,
    inventory: 180,
    categories: ['sarms', 'research-chemicals'],
    specifications: ['25mg/ml concentration', '30ml bottle', 'Liquid research suspension'],
    image: 'https://images.unsplash.com/photo-1607619056271-8bb0c1d5f74f?auto=format&fit=crop&w=900&q=80',
    rating: 4.9,
    reviewCount: 112,
    variants: [{ name: '30ml Bottle', price: 61.75 }]
  },
  {
    title: 'BPC-157 5mg',
    description: 'Stable gastric pentadecapeptide utilized in systemic cellular healing and repair models.',
    price: 23.75,
    inventory: 250,
    categories: ['peptides'],
    specifications: ['5mg vial', 'Batch purity verified', 'Research protocol grade'],
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80',
    rating: 4.9,
    reviewCount: 156,
    variants: [
      { name: '5mg', price: 23.75 },
      { name: '10mg', price: 42.00 }
    ]
  },
  {
    title: 'Thymosin Beta 4 (TB500) 10mg',
    description: 'Actin-binding protein synthetic analog studied for its role in cell migration and tissue repair.',
    price: 47.50,
    inventory: 140,
    categories: ['peptides'],
    specifications: ['10mg vial', 'Lyophilized powder', 'High purity'],
    image: 'https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&w=900&q=80',
    rating: 4.8,
    reviewCount: 88,
    variants: [
      { name: '2mg', price: 18.00 },
      { name: '5mg', price: 32.00 },
      { name: '10mg', price: 47.50 }
    ]
  },
  {
    title: 'IGF-1 LR3 1mg',
    description: 'Extended half-life variant of Insulin-like Growth Factor-1 for prolonged cellular receptor studies.',
    price: 57.00,
    inventory: 70,
    categories: ['igf-1-proteins', 'peptides'],
    specifications: ['1mg vial', 'Recombinant protein', 'Research grade'],
    image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=900&q=80',
    rating: 4.7,
    reviewCount: 45,
    variants: [{ name: '1mg', price: 57.00 }]
  },
  {
    title: 'MT-2 (Melanotan 2 Acetate) 10mg',
    description: 'Synthetic melanocortin receptor agonist widely referenced in photoprotection and pigmentation studies.',
    price: 28.50,
    inventory: 190,
    categories: ['melanotan-peptides'],
    specifications: ['10mg vial', 'Acetate form', 'Dark packaging'],
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80',
    rating: 4.6,
    reviewCount: 63,
    variants: [
      { name: '10mg', price: 28.50 },
      { name: '20mg', price: 52.00 }
    ]
  },
  {
    title: 'MOTS-C 10mg',
    description: 'Mitochondrial-derived peptide implicated in metabolic regulation and cellular stress response.',
    price: 42.75,
    inventory: 85,
    categories: ['peptides', 'research-chemicals'],
    specifications: ['10mg vial', 'Mitochondrial derived', 'Lyophilized'],
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80',
    rating: 4.8,
    reviewCount: 29,
    variants: [{ name: '10mg', price: 42.75 }]
  },
  {
    title: 'Thymosin Alpha-1 10mg',
    description: 'Potent immune system modulator synthesized for immune response mapping studies.',
    price: 61.75,
    inventory: 60,
    categories: ['peptides'],
    specifications: ['10mg vial', 'Immune modulator', 'Research use only'],
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=900&q=80',
    rating: 4.7,
    reviewCount: 21,
    variants: [{ name: '10mg', price: 61.75 }]
  },
  {
    title: 'Bacteriostatic Water 0.9% Benzyl Alcohol 30mL',
    description: 'Crucial laboratory supply for the reconstitution and sterile preparation of lyophilized research compounds.',
    price: 14.25,
    inventory: 500,
    categories: ['lab-supplies'],
    specifications: ['30mL sterile vial', '0.9% benzyl alcohol', 'For laboratory preparation'],
    image: 'https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&w=900&q=80',
    rating: 5.0,
    reviewCount: 215,
    variants: [{ name: '30mL Bottle', price: 14.25 }]
  },
  {
    title: 'BPC 157 x 10 Vials',
    description: 'BPC-157 (Body Protection Compound-157) for research use only. Supplied as lyophilized material in sterile vials for controlled laboratory workflows.',
    price: 67.50,
    inventory: 120,
    categories: ['peptides'],
    specifications: ['Research use only', '10 vials per pack', 'Lyophilized format'],
    image: 'https://www.wholesalepeptides.co.uk/cdn/shop/files/D2209E07-6C7A-484A-9005-6713BA343604.png?v=1768901946',
    rating: 4.9,
    reviewCount: 42,
    variants: [
      { name: '5mg', price: 67.50 },
      { name: '10mg', price: 103.50 }
    ]
  },
  {
    title: 'BPC 157 + GHK-CU + TB500 x 10 Vials',
    description: 'Combination research bundle containing BPC-157, GHK-CU, and TB-500 in lyophilized sterile vials for laboratory assay development and compound stability work.',
    price: 269.10,
    inventory: 80,
    categories: ['peptide-blends', 'peptides'],
    specifications: ['BPC 157 10mg + GHK-CU 50mg + TB500 10mg', '10 vials per pack', 'Research use only'],
    image: 'https://www.wholesalepeptides.co.uk/cdn/shop/files/D2209E07-6C7A-484A-9005-6713BA343604.png?v=1768901946',
    rating: 4.8,
    reviewCount: 18,
    variants: [{ name: 'BPC 157 10mg + GHK-CU 50mg + TB500 10mg', price: 269.10 }]
  },
  {
    title: 'BPC 157 + TB500 x 10 Vials',
    description: 'Dual-peptide blend of BPC-157 and TB-500 for research use only, supplied lyophilized for controlled in-vitro and analytical studies.',
    price: 157.50,
    inventory: 90,
    categories: ['peptide-blends', 'peptides'],
    specifications: ['5mg + 5mg or 10mg + 10mg', '10 vials per pack', 'Research use only'],
    image: 'https://www.wholesalepeptides.co.uk/cdn/shop/files/D2209E07-6C7A-484A-9005-6713BA343604.png?v=1768901946',
    rating: 4.8,
    reviewCount: 21,
    variants: [
      { name: '5+5mg', price: 157.50 },
      { name: '10+10mg', price: 283.50 }
    ]
  },
  {
    title: 'DIOSA GLOW 70mg Prefilled Pen',
    description: 'Multi-compound blend (BPC-157, TB500, GHK-CU) for laboratory research use. Prefilled pen kit format with consistent composition for controlled workflows.',
    price: 76.50,
    inventory: 75,
    categories: ['peptide-blends', 'peptides'],
    specifications: ['BPC-157 10mg / TB500 10mg / GHK-CU 50mg', '70mg total', 'Research use only'],
    image: 'https://www.wholesalepeptides.co.uk/cdn/shop/files/Untitled_design-30.png?v=1774787130',
    rating: 4.7,
    reviewCount: 14,
    variants: [
      { name: '1 x Pen Kits', price: 76.50 },
      { name: '5 x Pen Kits', price: 337.50 },
      { name: '10 x Pen Kits', price: 540.00 },
      { name: '20 x Pen Kits', price: 900.00 }
    ]
  },
  {
    title: 'GHK-CU x 10 Vials',
    description: 'GHK-Cu (Copper Tripeptide-1) research material supplied in lyophilized sterile vials for peptide-metal interaction and assay development work.',
    price: 46.80,
    inventory: 100,
    categories: ['peptides', 'research-chemicals'],
    specifications: ['50mg and 100mg options', '10 vials per pack', 'Research use only'],
    image: 'https://www.wholesalepeptides.co.uk/cdn/shop/files/D2209E07-6C7A-484A-9005-6713BA343604.png?v=1768901946',
    rating: 4.7,
    reviewCount: 16,
    variants: [
      { name: '50mg', price: 46.80 },
      { name: '100mg', price: 62.10 }
    ]
  },
  {
    title: 'HCG x 10 Vials',
    description: 'Human Chorionic Gonadotropin (HCG) for research use only, delivered in lyophilized format for analytical testing and controlled lab protocols.',
    price: 103.50,
    inventory: 95,
    categories: ['research-chemicals', 'peptides'],
    specifications: ['5000iu and 1000iu variants', '10 vials per pack', 'Research use only'],
    image: 'https://www.wholesalepeptides.co.uk/cdn/shop/files/D2209E07-6C7A-484A-9005-6713BA343604.png?v=1768901946',
    rating: 4.6,
    reviewCount: 13,
    variants: [
      { name: '5000iu', price: 103.50 },
      { name: '1000iu', price: 211.50 }
    ]
  },
  {
    title: 'MOTS-c x 10 Vials',
    description: 'MOTS-c peptide for research use only, supplied in lyophilized vials for metabolic signaling and compound characterization studies.',
    price: 94.50,
    inventory: 85,
    categories: ['peptides', 'research-chemicals'],
    specifications: ['10mg and 40mg options', '10 vials per pack', 'Research use only'],
    image: 'https://www.wholesalepeptides.co.uk/cdn/shop/files/D2209E07-6C7A-484A-9005-6713BA343604.png?v=1768901946',
    rating: 4.7,
    reviewCount: 17,
    variants: [
      { name: '10mg', price: 94.50 },
      { name: '40mg', price: 245.70 }
    ]
  },
  {
    title: 'Tirzepatide 100mg One Vial',
    description: 'High-purity Tirzepatide single vial format for research use only. Lyophilized presentation for controlled laboratory handling.',
    price: 90.00,
    inventory: 70,
    categories: ['peptides', 'research-chemicals'],
    specifications: ['100mg single vial', 'Lyophilized format', 'Research use only'],
    image: 'https://www.wholesalepeptides.co.uk/cdn/shop/files/D2209E07-6C7A-484A-9005-6713BA343604.png?v=1768901946',
    rating: 4.8,
    reviewCount: 19,
    variants: [{ name: '100mg', price: 90.00 }]
  },
  {
    title: 'Vio Labs Retatrutide 40mg / 3ml Prefilled Pen',
    description: 'Retatrutide prefilled pen format for laboratory and research use. Precision-controlled delivery system for consistent handling across protocols.',
    price: 144.00,
    inventory: 65,
    categories: ['peptides', 'research-chemicals'],
    specifications: ['40mg per pen', '3ml total volume', 'Research use only'],
    image: 'https://www.wholesalepeptides.co.uk/cdn/shop/files/ChatGPTImageDec21_2025at09_10_00PM_png.webp?v=1775409152',
    rating: 4.8,
    reviewCount: 22,
    variants: [
      { name: '1 x Pen Kits', price: 144.00 },
      { name: '5 x Pen Kits', price: 540.00 },
      { name: '10 x Pen Kits', price: 720.00 },
      { name: '20 x Pen Kits', price: 1260.00 }
    ]
  }
];
