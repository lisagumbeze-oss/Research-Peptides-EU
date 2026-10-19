/**
 * Deterministic enrichment map for the 28 ZYBIO Phase-2 create slugs.
 * Prefer UK exact listings; otherwise adapt closest compound (EU DB / UK sibling / peer URL).
 */

export type MatchType = 'exact' | 'adapted';

export type DescSource =
  | { type: 'eu-db'; slug: string }
  | { type: 'uk'; slug: string }
  | { type: 'peer-url'; url: string }
  | { type: 'compose'; from: string[]; /** adaptation keys applied after compose */ }
  | { type: 'static'; text: string };

export type ImageSource =
  | { type: 'eu-db'; slug: string }
  | { type: 'uk'; slug: string }
  | { type: 'peer-url'; url: string }
  | { type: 'direct'; url: string };

export type EnrichmentEntry = {
  slug: string;
  title: string;
  matchType: MatchType;
  descSource: DescSource;
  imageSource: ImageSource;
  /** Text rewrites applied after tweakForEu */
  adapt: {
    renameFrom?: string | string[];
    renameTo?: string;
    formNote?: string;
    strengthNote?: string;
    extraPrefix?: string;
  };
  notes: string;
  /** Soft floor for description length (lab solvents may be lower) */
  minDescLen?: number;
};

export const ZYBIO_NEW_ENRICHMENT_MARKER = 'Source: zybio-new-enrichment';

export const CREATE_SLUGS = [
  'triptorelin-acetate',
  'l-carnitine',
  'b7-33',
  'humanin',
  'liraglutide',
  'lipo-c',
  'lc526',
  'acetic-acid',
  'acth-1-39',
  'cardiogen',
  'cortagen',
  'matrixyl',
  'orexin-b',
  'frag-17-23',
  'retatrutide-tesamorelin-blend',
  'na-selank',
  'na-semax',
  'selank-semax-blend',
  'ghk-cu-kpv-blend',
  'vitamin-b12',
  'cartalax',
  'bam15',
  'bam15-slu-pp-332',
  'orforglipron',
  '5-amino-1mq-capsules',
  '5-amino-1mq-nad-capsules',
  'bpc-157-capsules',
  'kpv-capsules',
] as const;

export const enrichmentMap: EnrichmentEntry[] = [
  {
    slug: 'triptorelin-acetate',
    title: 'Triptorelin Acetate',
    matchType: 'adapted',
    descSource: { type: 'eu-db', slug: 'kisspeptin' },
    imageSource: { type: 'eu-db', slug: 'triptorelin-gnrh-100mg' },
    adapt: {
      renameFrom: ['Kisspeptin-10', 'Kisspeptin', 'kisspeptin'],
      renameTo: 'Triptorelin Acetate',
      strengthNote: 'Supplied as Triptorelin acetate research peptide (2mg kit presentations).',
      formNote: 'Lyophilized vial format for laboratory research.',
      extraPrefix:
        'Triptorelin acetate is a synthetic GnRH agonist analogue used in endocrine and reproductive-axis laboratory research.\n\n',
    },
    notes: 'Adapt HPG-axis peptide copy from Kisspeptin; Triptorelin rebrand image',
  },
  {
    slug: 'l-carnitine',
    title: 'L-Carnitine',
    matchType: 'adapted',
    descSource: { type: 'eu-db', slug: 'l-carnitine-600mg' },
    imageSource: { type: 'eu-db', slug: 'l-carnitine-600mg' },
    adapt: {
      renameFrom: ['L-Carnitine 600mg', '600mg'],
      renameTo: 'L-Carnitine',
      strengthNote:
        'Multi-strength research kits: 60mg/ml, 120mg/ml, and 500mg/ml (10ml × 10 vials).',
      formNote: 'Injectable research solution kits for laboratory use.',
    },
    notes: 'UK/EU L-Carnitine 600mg adapted to multi-strength kit line',
  },
  {
    slug: 'b7-33',
    title: 'B7-33',
    matchType: 'adapted',
    descSource: {
      type: 'static',
      text: `B7-33 – Research Grade Peptide

Overview

B7-33 is a single-chain relaxin-2 mimetic and biased RXFP1 agonist studied as a lyophilized research peptide. It is a linear, disulfide-free heptacosapeptide used in laboratory models of relaxin-pathway signalling, tissue-repair research, and RXFP1 pharmacology.

Research Context

B7-33 was designed to reproduce key aspects of relaxin-2 signalling through RXFP1 while simplifying the peptide architecture relative to native H2 relaxin. Research groups use B7-33 when they need a controlled RXFP1 ligand for receptor-binding, signalling, and comparative peptide assays. Related laboratory materials often include other repair-pathway peptides such as BPC-157 and TB500 under aligned assay conditions.

Product Notes

• Form: lyophilized powder in sealed research vials
• Typical kit: 10mg × 10 vials
• Intended use: scientific research and laboratory assays only
• Documentation: batch purity verification recommended prior to experimental use

Important

This product is supplied strictly for scientific research and laboratory use and is not intended for human or veterinary consumption.`,
    },
    imageSource: { type: 'eu-db', slug: 'bpc-157' },
    adapt: {
      formNote: 'Lyophilized peptide for laboratory research only.',
      strengthNote: 'Research kits: 10mg × 10 vials.',
    },
    notes: 'Peer PDPs blocked (403); static research copy + BPC-157 vial photography as lyophilized peptide presentation',
  },
  {
    slug: 'humanin',
    title: 'Humanin',
    matchType: 'adapted',
    descSource: {
      type: 'static',
      text: `Humanin – Research Grade Peptide

Overview

Humanin is a 24-amino-acid mitochondrial-derived peptide associated with cellular protection, metabolic regulation, and neuroprotection research. Unlike many fully synthetic research peptides, Humanin is naturally encoded by mitochondrial DNA and is studied in aging, neurodegeneration, metabolism, and mitochondrial biology models.

Research Context

Humanin was initially identified for its ability to protect neuronal cells from toxic insults associated with Alzheimer's disease models. Subsequent research has connected Humanin with mitochondrial signalling, oxidative stress, apoptosis, glucose metabolism, and cellular survival pathways, including IGF-related signalling and STAT3.

Product Notes

• Form: lyophilized powder
• Typical kit: 10mg × 10 vials
• Class: mitochondrial-derived peptide (MDP)
• Intended use: scientific research and laboratory assays only

Important

This product is supplied strictly for scientific research and laboratory use and is not intended for human or veterinary consumption.`,
    },
    imageSource: { type: 'eu-db', slug: 'mots-c-mitochondrial-derived-peptide' },
    adapt: {
      formNote: 'Lyophilized mitochondrial-derived peptide for laboratory research only.',
      strengthNote: 'Research kits: 10mg × 10 vials.',
    },
    notes: 'Peer PDP blocked; static Humanin research copy from peer page content; MOTS-c vial photo',
  },
  {
    slug: 'liraglutide',
    title: 'Liraglutide',
    matchType: 'adapted',
    descSource: { type: 'eu-db', slug: 'semaglutide-glp-1' },
    imageSource: { type: 'eu-db', slug: 'semaglutide-glp-1' },
    adapt: {
      renameFrom: ['Semaglutide GLP-1', 'Semaglutide', 'GLP-1'],
      renameTo: 'Liraglutide',
      formNote: 'Lyophilized GLP-1 receptor agonist scaffold for laboratory research.',
      strengthNote: 'Research kits: 5mg and 10mg × 10 vials.',
      extraPrefix:
        'Liraglutide is a long-acting GLP-1 receptor agonist peptide scaffold studied in metabolic and incretin-pathway laboratory models.\n\n',
    },
    notes: 'Peer PDP unavailable; adapt Semaglutide GLP-1 copy/image as closest exact GLP-1 peptide presentation',
  },
  {
    slug: 'lipo-c',
    title: 'Lipo-C',
    matchType: 'adapted',
    descSource: { type: 'eu-db', slug: 'l-carnitine-600mg' },
    imageSource: { type: 'eu-db', slug: 'l-carnitine-600mg' },
    adapt: {
      renameFrom: ['L-Carnitine 600mg', 'L-Carnitine', 'Carnitine'],
      renameTo: 'Lipo-C',
      formNote: 'Lipotropic research solution (10ml × 10 vials).',
      strengthNote: 'Supplied as Lipo-C laboratory solution kits.',
      extraPrefix:
        'Lipo-C is a lipotropic research solution used in laboratory studies of fat-metabolism pathways.\n\n',
    },
    notes: 'Adapt metabolic lab-solution copy from L-Carnitine',
  },
  {
    slug: 'lc526',
    title: 'LC526',
    matchType: 'adapted',
    descSource: { type: 'eu-db', slug: 'l-carnitine-600mg' },
    imageSource: { type: 'eu-db', slug: 'l-carnitine-600mg' },
    adapt: {
      renameFrom: ['L-Carnitine 600mg', 'L-Carnitine', 'Carnitine'],
      renameTo: 'LC526',
      formNote: 'Research solution (10ml × 10 vials).',
      extraPrefix: 'LC526 is supplied as a laboratory research solution.\n\n',
    },
    notes: 'Adapt lab-solution presentation from L-Carnitine',
  },
  {
    slug: 'acetic-acid',
    title: 'Acetic Acid',
    matchType: 'adapted',
    descSource: {
      type: 'eu-db',
      slug: 'bacteriostatic-water-0-9-sodium-chloride-10ml-hospira-usp-injection',
    },
    imageSource: { type: 'eu-db', slug: 'bacteriostatic-water' },
    adapt: {
      renameFrom: ['Bacteriostatic Water', 'bacteriostatic water', 'BAC water'],
      renameTo: 'Acetic Acid',
      formNote: 'Laboratory solvent kits: 3ml and 10ml × 10 vials.',
      extraPrefix:
        'Acetic acid is supplied for laboratory reconstitution and solvent workflows in peptide research protocols.\n\n',
    },
    notes: 'Adapt lab solvent copy from bacteriostatic water',
    minDescLen: 250,
  },
  {
    slug: 'acth-1-39',
    title: 'ACTH 1-39',
    matchType: 'adapted',
    descSource: { type: 'eu-db', slug: 'semax' },
    imageSource: { type: 'eu-db', slug: 'semax' },
    adapt: {
      renameFrom: ['Semax', 'ACTH(4-10)', 'ACTH 4-10'],
      renameTo: 'ACTH 1-39',
      formNote: 'Lyophilized ACTH 1-39 fragment for laboratory research.',
      strengthNote: 'Research kits: 5mg × 10 vials.',
      extraPrefix:
        'ACTH 1-39 is the full-length adrenocorticotropic hormone peptide sequence studied in endocrine and neurochemical laboratory models.\n\n',
    },
    notes: 'Adapt ACTH-family neuro peptide copy from Semax',
  },
  {
    slug: 'cardiogen',
    title: 'Cardiogen',
    matchType: 'adapted',
    descSource: { type: 'eu-db', slug: 'epithalon' },
    imageSource: { type: 'eu-db', slug: 'epithalon' },
    adapt: {
      renameFrom: ['Epithalon', 'Epitalon', 'epithalon'],
      renameTo: 'Cardiogen',
      formNote: 'Bioregulator research peptide (lyophilized).',
      strengthNote: 'Research kits: 20mg × 10 vials.',
      extraPrefix:
        'Cardiogen is a synthetic bioregulator peptide studied in cardiovascular and myocardial research models.\n\n',
    },
    notes: 'Adapt bioregulator copy from Epithalon',
  },
  {
    slug: 'cortagen',
    title: 'Cortagen',
    matchType: 'adapted',
    descSource: { type: 'eu-db', slug: 'epithalon' },
    imageSource: { type: 'eu-db', slug: 'pinealon' },
    adapt: {
      renameFrom: ['Epithalon', 'Epitalon', 'epithalon'],
      renameTo: 'Cortagen',
      formNote: 'Bioregulator research peptide (lyophilized).',
      strengthNote: 'Research kits: 20mg × 10 vials.',
      extraPrefix:
        'Cortagen is a synthetic bioregulator peptide studied in central nervous system research models.\n\n',
    },
    notes: 'Adapt bioregulator copy from Epithalon; Pinealon vial imagery',
  },
  {
    slug: 'matrixyl',
    title: 'Matrixyl',
    matchType: 'adapted',
    descSource: { type: 'eu-db', slug: 'ghk-cu' },
    imageSource: { type: 'eu-db', slug: 'ghk-cu' },
    adapt: {
      renameFrom: ['GHK-Cu', 'GHK-CU', 'GHK Cu', 'copper peptide'],
      renameTo: 'Matrixyl',
      formNote: 'Palmitoyl peptide research material (lyophilized).',
      strengthNote: 'Research kits: 10mg × 10 vials.',
      extraPrefix:
        'Matrixyl (palmitoyl pentapeptide) is studied in extracellular matrix and dermal-research laboratory models.\n\n',
    },
    notes: 'Adapt skin/matrix peptide copy from GHK-Cu',
  },
  {
    slug: 'orexin-b',
    title: 'Orexin B',
    matchType: 'adapted',
    descSource: { type: 'eu-db', slug: 'dsip-delta-sleep-inducing-peptide' },
    imageSource: { type: 'eu-db', slug: 'dsip' },
    adapt: {
      renameFrom: ['DSIP', 'Delta sleep-inducing peptide', 'delta sleep'],
      renameTo: 'Orexin B',
      formNote: 'Lyophilized orexin/hypocretin research peptide.',
      strengthNote: 'Research kits: 5mg × 10 vials.',
      extraPrefix:
        'Orexin B (hypocretin-2) is a hypothalamic neuropeptide studied in sleep–wake and arousal pathway research.\n\n',
    },
    notes: 'Adapt sleep/neuro peptide copy from DSIP',
  },
  {
    slug: 'frag-17-23',
    title: 'Frag 17-23',
    matchType: 'adapted',
    descSource: { type: 'eu-db', slug: 'thymosin-beta-4-tb500-10mg' },
    imageSource: { type: 'eu-db', slug: 'tb500-thymosin-beta-4-acetate' },
    adapt: {
      renameFrom: ['Thymosin Beta 4 (TB500)', 'Thymosin Beta-4', 'TB500', 'TB-500', 'Thymosin Beta 4'],
      renameTo: 'Frag 17-23',
      formNote: 'Thymosin beta fragment 17-23 research peptide (lyophilized).',
      strengthNote: 'Research kits: 10mg × 10 vials.',
      extraPrefix:
        'Frag 17-23 is a short thymosin-beta fragment studied in actin-binding and tissue-research models.\n\n',
    },
    notes: 'Adapt TB500/frag family copy',
  },
  {
    slug: 'retatrutide-tesamorelin-blend',
    title: 'Retatrutide + Tesamorelin Blend',
    matchType: 'adapted',
    descSource: { type: 'compose', from: ['semaglutide-glp-1', 'tesamorelin'] },
    imageSource: { type: 'eu-db', slug: 'retatrutide' },
    adapt: {
      renameFrom: ['Semaglutide GLP-1', 'Semaglutide'],
      renameTo: 'Retatrutide',
      formNote: 'Combination lyophilized blend for laboratory research.',
      strengthNote: 'Research presentation: Retatrutide 10mg + Tesamorelin 10mg (20mg total).',
      extraPrefix:
        'This blend combines Retatrutide (GLP-3 / triple-agonist research scaffold) with Tesamorelin (GHRH analog) for parallel metabolic pathway studies.\n\n',
    },
    notes: 'Compose Semaglutide GLP-1 class copy + Tesamorelin (UK Retatrutide API blocked)',
  },
  {
    slug: 'na-selank',
    title: 'NA-Selank',
    matchType: 'adapted',
    descSource: { type: 'eu-db', slug: 'selank-5mg' },
    imageSource: { type: 'eu-db', slug: 'selank-5mg' },
    adapt: {
      renameFrom: ['Selank 5mg', 'Selank'],
      renameTo: 'N-Acetyl Selank (NA-Selank)',
      formNote: 'N-Acetyl Selank lyophilized research peptide.',
      strengthNote: 'Research kits: 10mg × 10 vials.',
      extraPrefix:
        'NA-Selank (N-Acetyl Selank) is an acetylated Selank analogue studied for enhanced stability in neurochemical research models.\n\n',
    },
    notes: 'Adapt Selank → N-Acetyl Selank',
  },
  {
    slug: 'na-semax',
    title: 'NA-Semax',
    matchType: 'adapted',
    descSource: { type: 'eu-db', slug: 'semax' },
    imageSource: { type: 'eu-db', slug: 'semax' },
    adapt: {
      renameFrom: ['Semax'],
      renameTo: 'N-Acetyl Semax (NA-Semax)',
      formNote: 'N-Acetyl Semax lyophilized research peptide.',
      strengthNote: 'Research kits: 10mg × 10 vials.',
      extraPrefix:
        'NA-Semax (N-Acetyl Semax) is an acetylated Semax analogue studied in cognitive and neuroprotective research models.\n\n',
    },
    notes: 'Adapt Semax → N-Acetyl Semax',
  },
  {
    slug: 'selank-semax-blend',
    title: 'Selank + Semax Blend',
    matchType: 'adapted',
    descSource: { type: 'compose', from: ['selank-5mg', 'semax'] },
    imageSource: { type: 'eu-db', slug: 'selank-5mg' },
    adapt: {
      formNote: 'Combined Selank and Semax lyophilized blend.',
      strengthNote: 'Kits: 5mg+5mg (10mg) and 10mg+10mg (20mg) × 10 vials.',
      extraPrefix:
        'This blend co-formulates Selank and Semax for laboratories comparing complementary neuropeptide pathways in a single vial presentation.\n\n',
    },
    notes: 'Compose Selank + Semax',
  },
  {
    slug: 'ghk-cu-kpv-blend',
    title: 'GHK-Cu + KPV Blend',
    matchType: 'adapted',
    descSource: { type: 'compose', from: ['ghk-cu', 'kpv'] },
    imageSource: { type: 'eu-db', slug: 'ghk-cu' },
    adapt: {
      formNote: 'Combined GHK-Cu and KPV lyophilized blend.',
      strengthNote: 'Research kits: 60mg × 10 vials.',
      extraPrefix:
        'This blend combines GHK-Cu copper peptide with KPV for parallel dermal and inflammatory-pathway research protocols.\n\n',
    },
    notes: 'Compose GHK-Cu + KPV',
  },
  {
    slug: 'vitamin-b12',
    title: 'Vitamin B12',
    matchType: 'adapted',
    descSource: { type: 'eu-db', slug: 'nad-250mg' },
    imageSource: { type: 'eu-db', slug: 'nad' },
    adapt: {
      renameFrom: ['NAD+', 'NAD +', 'Nad+', 'NAD'],
      renameTo: 'Vitamin B12',
      formNote: 'Vitamin B12 research material (lyophilized / vial kits).',
      strengthNote: 'Research kits: 10mg × 10 vials.',
      extraPrefix:
        'Vitamin B12 (cobalamin) research material for laboratory biochemistry and coenzyme pathway studies.\n\n',
    },
    notes: 'Adapt injectable vitamin/cofactor presentation from NAD+',
  },
  {
    slug: 'cartalax',
    title: 'Cartalax',
    matchType: 'adapted',
    descSource: { type: 'eu-db', slug: 'epithalon' },
    imageSource: { type: 'eu-db', slug: 'epithalon' },
    adapt: {
      renameFrom: ['Epithalon', 'Epitalon'],
      renameTo: 'Cartalax',
      formNote: 'Cartilage bioregulator research peptide (lyophilized).',
      strengthNote: 'Research kits: 20mg × 10 vials.',
      extraPrefix:
        'Cartalax is a synthetic bioregulator peptide studied in cartilage and connective-tissue research models.\n\n',
    },
    notes: 'Adapt bioregulator copy from Epithalon',
  },
  {
    slug: 'bam15',
    title: 'BAM15',
    matchType: 'adapted',
    descSource: { type: 'eu-db', slug: 'slu-pp-332' },
    imageSource: { type: 'eu-db', slug: 'slu-pp-332' },
    adapt: {
      renameFrom: ['SLU-PP-332', 'SLU PP 332'],
      renameTo: 'BAM15',
      formNote: 'BAM15 research capsules.',
      strengthNote: 'Capsule kits: 50mg × 60.',
      extraPrefix:
        'BAM15 is a mitochondrial uncoupler research compound supplied in capsule form for laboratory metabolic protocols.\n\n',
    },
    notes: 'Peer PDP blocked; adapt SLU-PP-332 capsule-line copy/image',
  },
  {
    slug: 'bam15-slu-pp-332',
    title: 'BAM15 + SLU-PP-332',
    matchType: 'adapted',
    descSource: { type: 'eu-db', slug: 'slu-pp-332' },
    imageSource: { type: 'eu-db', slug: 'slu-pp-332' },
    adapt: {
      formNote: 'Combination research capsules.',
      strengthNote: 'Capsules: BAM15 50mg + SLU-PP-332 250mcg × 60.',
      extraPrefix:
        'This capsule stack combines BAM15 (mitochondrial uncoupler) with SLU-PP-332 for parallel metabolic research protocols.\n\n',
    },
    notes: 'Peer PDP blocked; adapt SLU-PP-332 capsule copy for stack',
  },
  {
    slug: 'orforglipron',
    title: 'Orforglipron',
    matchType: 'adapted',
    descSource: { type: 'eu-db', slug: 'semaglutide-glp-1' },
    imageSource: { type: 'eu-db', slug: 'semaglutide-glp-1' },
    adapt: {
      renameFrom: ['Semaglutide', 'GLP-1'],
      renameTo: 'Orforglipron',
      formNote: 'Oral non-peptide GLP-1 receptor agonist research compound (capsules).',
      strengthNote: 'Capsule kits: 6mg × 90.',
      extraPrefix:
        'Orforglipron is an oral small-molecule GLP-1 receptor agonist scaffold studied in metabolic research models.\n\n',
    },
    notes: 'Adapt GLP-1 class copy from Semaglutide; capsule form note',
  },
  {
    slug: '5-amino-1mq-capsules',
    title: '5-Amino-1MQ Capsules',
    matchType: 'adapted',
    descSource: { type: 'eu-db', slug: '5-amino-1mq' },
    imageSource: { type: 'eu-db', slug: '5-amino-1mq' },
    adapt: {
      renameFrom: ['5-Amino-1MQ', '5-amino-1mq', '5 Amino 1MQ'],
      renameTo: '5-Amino-1MQ Capsules',
      formNote: 'Capsule presentation for laboratory research.',
      strengthNote: 'Capsule kits: 50mg × 60.',
    },
    notes: 'Adapt 5-Amino-1MQ vial copy → capsules',
  },
  {
    slug: '5-amino-1mq-nad-capsules',
    title: '5-Amino-1MQ + NAD Capsules',
    matchType: 'adapted',
    descSource: { type: 'compose', from: ['5-amino-1mq', 'nad-250mg'] }, // nad-250mg has long EU copy
    imageSource: { type: 'eu-db', slug: '5-amino-1mq' },
    adapt: {
      formNote: 'Combination research capsules.',
      strengthNote: 'Capsules: 5-Amino-1MQ 50mg + NAD 50mg × 60.',
      extraPrefix:
        'This capsule stack combines 5-Amino-1MQ with NAD for parallel metabolic and coenzyme research protocols.\n\n',
    },
    notes: 'Compose 5-Amino + NAD; prefer UK nad-250mg for NAD section',
  },
  {
    slug: 'bpc-157-capsules',
    title: 'BPC-157 Capsules',
    matchType: 'adapted',
    descSource: { type: 'eu-db', slug: 'bpc-157' },
    imageSource: { type: 'eu-db', slug: 'bpc-157' },
    adapt: {
      renameFrom: ['BPC-157', 'BPC 157'],
      renameTo: 'BPC-157 Capsules',
      formNote: 'Oral capsule presentation for laboratory research.',
      strengthNote: 'Capsule kits: 500mcg × 60 and 500mcg × 100.',
    },
    notes: 'Adapt BPC-157 vial copy → capsules',
  },
  {
    slug: 'kpv-capsules',
    title: 'KPV Capsules',
    matchType: 'adapted',
    descSource: { type: 'eu-db', slug: 'kpv' },
    imageSource: { type: 'eu-db', slug: 'kpv' },
    adapt: {
      renameFrom: ['KPV'],
      renameTo: 'KPV Capsules',
      formNote: 'Oral capsule presentation for laboratory research.',
      strengthNote: 'Capsule kits: 250mcg × 60.',
    },
    notes: 'Adapt KPV vial copy → capsules',
  },
];

export function getEnrichmentEntry(slug: string): EnrichmentEntry | undefined {
  return enrichmentMap.find((e) => e.slug === slug);
}
