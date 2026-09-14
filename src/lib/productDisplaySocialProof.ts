/**
 * Stable per-product social proof for the storefront.
 * Seeded by product id so values stay consistent across reloads.
 *
 * Rating: 3.0–4.9 in 0.1 steps (3.1, 3.5, 4.1, …)
 * Reviews: 25–50 inclusive
 * Two review cards per product from a large pool (different names + quotes)
 */

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Mulberry32 — deterministic stream from a seed. */
function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type DisplayReview = {
  name: string;
  role: string;
  content: string;
  date: string;
};

export type ProductDisplaySocialProof = {
  rating: number;
  reviewCount: number;
  reviews: [DisplayReview, DisplayReview];
};

const REVIEWERS: { name: string; role: string }[] = [
  { name: 'Dr. Alexander V.', role: 'Clinical Research · EU' },
  { name: 'Sarah M.', role: 'Biotech Analyst · NL' },
  { name: 'Dr. Helena K.', role: 'Peptide Chemistry · DE' },
  { name: 'Marco R.', role: 'Laboratory Manager · IT' },
  { name: 'Dr. Ingrid L.', role: 'Molecular Biology · SE' },
  { name: 'Thomas B.', role: 'QC Specialist · BE' },
  { name: 'Dr. Sofia P.', role: 'Pharmacology · ES' },
  { name: 'Jonas H.', role: 'Research Associate · DK' },
  { name: 'Dr. Camille D.', role: 'Biochemistry · FR' },
  { name: 'Laura N.', role: 'Formulation Science · FI' },
  { name: 'Dr. Piotr W.', role: 'Analytical Chemistry · PL' },
  { name: 'Elena G.', role: 'Cell Culture Lead · PT' },
  { name: 'Dr. Markus S.', role: 'Translational Lab · AT' },
  { name: 'Niamh O.', role: 'Research Scientist · IE' },
  { name: 'Dr. Lukas C.', role: 'Proteomics · CZ' },
  { name: 'Amelia T.', role: 'Lab Operations · NL' },
  { name: 'Dr. Freja A.', role: 'Endocrinology Research · NO' },
  { name: 'Mateo I.', role: 'Assay Development · ES' },
  { name: 'Dr. Yara H.', role: 'Immunology · NL' },
  { name: 'Oliver K.', role: 'Supply Chain QA · DE' },
  { name: 'Dr. Anika M.', role: 'Structural Biology · DE' },
  { name: 'Hugo F.', role: 'Biotech Procurement · FR' },
  { name: 'Dr. Clara E.', role: 'In-vitro Models · BE' },
  { name: 'Viktor J.', role: 'HPLC Specialist · HU' },
  { name: 'Dr. Isolde R.', role: 'Peptide Synthesis · CH' },
  { name: 'Greta S.', role: 'Stability Studies · SE' },
  { name: 'Dr. Noel P.', role: 'Metabolic Research · IE' },
  { name: 'Ivana D.', role: 'Research Technician · HR' },
  { name: 'Dr. Bastien Q.', role: 'Receptor Pharmacology · FR' },
  { name: 'Mila V.', role: 'Cold-chain Logistics · NL' },
  { name: 'Dr. Stefan U.', role: 'Bioanalytical Lab · DE' },
  { name: 'Rosa C.', role: 'Quality Assurance · ES' },
  { name: 'Dr. Emil N.', role: 'Neuroscience Models · FI' },
  { name: 'Katja L.', role: 'Documentation Lead · EE' },
  { name: 'Dr. Raphael Z.', role: 'Process Chemistry · LU' },
  { name: 'Sofie B.', role: 'Sample Intake · DK' },
  { name: 'Dr. Miren A.', role: 'Tissue Culture · ES' },
  { name: 'Levente K.', role: 'Instrumentation · HU' },
  { name: 'Dr. Pauline W.', role: 'Regulatory Science · NL' },
  { name: 'Artur G.', role: 'Warehouse QC · PL' },
  { name: 'Dr. Elise M.', role: 'Ligand Binding · BE' },
  { name: 'Niko P.', role: 'Research Fellow · FI' },
  { name: 'Dr. Chiara B.', role: 'Peptide Analytics · IT' },
  { name: 'Johan E.', role: 'Method Validation · SE' },
  { name: 'Dr. Ava R.', role: 'Cellular Assays · NL' },
  { name: 'Denis F.', role: 'Lab Procurement · FR' },
  { name: 'Dr. Hedda S.', role: 'Biophysics · NO' },
  { name: 'Lucia T.', role: 'Stability Lab · IT' },
  { name: 'Dr. Bram V.', role: 'Metabolomics · NL' },
  { name: 'Petra H.', role: 'COA Review · DE' },
  { name: 'Dr. Oscar D.', role: 'Receptor Assays · ES' },
  { name: 'Fiona C.', role: 'Clinical Ops · IE' },
  { name: 'Dr. Tomasz K.', role: 'Mass Spectrometry · PL' },
  { name: 'Ines L.', role: 'Research Coordinator · PT' },
  { name: 'Dr. Svenja O.', role: 'GH-axis Models · DE' },
  { name: 'Rasmus J.', role: 'Batch Release · DK' },
  { name: 'Dr. Valentina S.', role: 'Protein Chemistry · IT' },
  { name: 'Koen D.', role: 'Facility Manager · BE' },
  { name: 'Dr. Astrid F.', role: 'Neurobiology · SE' },
  { name: 'Miguel A.', role: 'Inventory Control · ES' },
];

const QUOTES: string[] = [
  'Purity levels exceeded our laboratory requirements. Vacuum sealing remained intact during EU transit.',
  'Structural integrity of the lyophilized powder was excellent. Reconstitution was immediate and clear.',
  'COA documentation matched the lot we received. HPLC trace was clean for our assay panel.',
  'Cold-chain packaging held temperature markers within range through Netherlands dispatch.',
  'Batch-to-batch consistency was better than our previous EU supplier for parallel assays.',
  'Labeling accuracy and vial integrity made intake logging straightforward for our team.',
  'Reconstitution clarity was high; no particulates observed under standard lab lighting.',
  'Shipping timeline was predictable. Customs paperwork for our institute was complete.',
  'Residual moisture indicators stayed dry. Storage transfer into our archive was uneventful.',
  'Peptide mass on the label aligned with our analytical weighing within tolerance.',
  'Useful for controlled receptor-binding work. Handling instructions were clear and practical.',
  'Packaging was research-grade and discreet. Vials arrived without stress marks on the seals.',
  'Our QC spot-check confirmed identity markers consistent with the provided certificate.',
  'Stable under our −20 °C protocol for two weeks before first use. No degradation signals.',
  'Communication on lot availability was precise. We scheduled assays without idle instrument time.',
  'Lyophilized cake appearance was uniform across the multi-vial order we placed.',
  'Suitable for exploratory metabolic pathway screens. Concentration prep was uncomplicated.',
  'EU fulfillment was faster than expected. Tracked delivery arrived mid-morning as stated.',
  'Septum integrity held after repeated sampling in our sterile workflow.',
  'Documentation pack included what our compliance officer needed for internal approval.',
  'No leakage, no cracked glass. Packaging foam was properly densified for peptide vials.',
  'Purity claims were credible against our in-house UV absorbance check.',
  'We compared three lots over a quarter — variance stayed within our acceptance band.',
  'Helpful for GH-axis laboratory models. Solubility in bacteriostatic water was clean.',
  'Secondary packaging blocked light adequately for our amber-storage SOP.',
  'Intake barcode scanning worked; SKU and lot fields matched the packing list.',
  'For a research-only SKU, presentation and labeling felt pharmaceutical-adjacent in quality.',
  'Assay noise floor stayed low after reconstitution — good for sensitive readouts.',
  'Netherlands origin simplified our VAT and import notes for the finance team.',
  'Caps were torque-consistent. No cross-threaded closures in the full carton.',
  'We appreciated the research-use disclaimer clarity for ethics board filings.',
  'Particle-free after vortex per protocol. Ideal for our cell-based screening plate.',
  'Lot COA PDF was downloadable and matched the printed insert included in the box.',
  'Delivery windows aligned with our cold-room staffing — no after-hours risk.',
  'Useful reference material for teaching lab demos on peptide handling best practices.',
  'No off-odors on opening. Desiccant packs were correctly placed and still active.',
  'Concentration calculations from labeled mass worked first time without re-weigh.',
  'Support answered a COA clarification the same day — uncommon for this category.',
  'Multi-vial foam tray prevented contact damage during courier handling.',
  'Stable signal in our ELISA workflow after standard aliquoting and freeze cycles.',
  'Compared favorably with a parallel US supplier on transit time into Spain.',
  'Glass quality and stopper type matched what we specify for lyophilized peptides.',
  'Research notes on the product page matched what we observed in bench practice.',
  'Inventory units scanned cleanly into LIMS. Minimal rework for our data steward.',
  'We run blinded duplicates — this lot behaved consistently across operators.',
  'Humidity indicator cards arrived blue. Warehouse handoff looked carefully managed.',
  'Good option for EU labs needing predictable peptide logistics without UK delays.',
  'Stopper coring was minimal after ten needle passes in a shared prep suite.',
  'Label fonts and lot codes were legible under our barcode scanners without glare.',
  'Reproducible standard curves after reconstitution — critical for our weekly panel.',
  'Outer carton crush-test survived a rough last-mile delivery without vial loss.',
  'Clear research-only positioning helped our purchasing desk approve the PO quickly.',
  'No color shift after two thaw cycles under our SOP. Promising stability profile.',
  'Peptide dissolved fully in the recommended volume with gentle swirling only.',
  'We received the correct strength variant — no mix-ups across similar SKUs.',
  'Instrument downtime avoided thanks to on-time arrival before a booked HPLC slot.',
  'Secondary seals were intact. Tamper evidence matched our receiving checklist.',
  'Useful in angiogenic pathway pilots. Handling was no more complex than peers.',
  'Staff training used this lot as the reference for proper lyophilized intake.',
  'Overall: dependable research supply with documentation that stands up to audit.',
];

const DATES = [
  '2 days ago',
  '3 days ago',
  '5 days ago',
  '1 week ago',
  '2 weeks ago',
  '3 weeks ago',
  '1 month ago',
  '6 days ago',
  '4 days ago',
  '8 days ago',
  '10 days ago',
  '12 days ago',
];

function buildReviewPool(): DisplayReview[] {
  const pool: DisplayReview[] = [];
  const n = Math.min(REVIEWERS.length, QUOTES.length);
  for (let i = 0; i < n; i++) {
    const reviewer = REVIEWERS[i]!;
    pool.push({
      name: reviewer.name,
      role: reviewer.role,
      content: QUOTES[i]!,
      date: DATES[i % DATES.length]!,
    });
  }
  // Extra crossed combinations to enlarge unique pair space
  for (let i = 0; i < n; i++) {
    const reviewer = REVIEWERS[i]!;
    const quoteIdx = (i * 7 + 3) % QUOTES.length;
    const quote = QUOTES[quoteIdx]!;
    if (quoteIdx === i) continue;
    pool.push({
      name: reviewer.name,
      role: reviewer.role,
      content: quote,
      date: DATES[(i * 3 + 1) % DATES.length]!,
    });
  }
  return pool;
}

const REVIEW_POOL = buildReviewPool();

/** Pick two distinct pool entries with different reviewer names. */
function pickTwoReviews(seed: number): [DisplayReview, DisplayReview] {
  const n = REVIEW_POOL.length;
  const s = seed >>> 0;
  if (n < 2) {
    const fallback: DisplayReview = {
      name: 'Research Partner',
      role: 'Laboratory · EU',
      content: 'Reliable research-grade material for controlled laboratory workflows.',
      date: '1 week ago',
    };
    return [fallback, { ...fallback, name: 'Lab Coordinator', date: '2 weeks ago' }];
  }

  const firstIdx = s % n;
  let secondIdx = (s >>> 16) % n;
  if (secondIdx === firstIdx) secondIdx = (secondIdx + 1) % n;

  // Prefer different names when the crossed pool reuses a reviewer
  let guard = 0;
  while (
    guard < n &&
    REVIEW_POOL[secondIdx] &&
    REVIEW_POOL[firstIdx] &&
    REVIEW_POOL[secondIdx]!.name === REVIEW_POOL[firstIdx]!.name
  ) {
    secondIdx = (secondIdx + 1) % n;
    guard += 1;
  }
  if (secondIdx === firstIdx) secondIdx = (firstIdx + 1) % n;

  return [REVIEW_POOL[firstIdx]!, REVIEW_POOL[secondIdx]!];
}

export function productDisplaySocialProof(
  productId: string | number | null | undefined,
): ProductDisplaySocialProof {
  const seed = hashSeed(String(productId ?? 'product'));
  const rand = mulberry32(seed);

  // 3.0 … 4.9 inclusive in 0.1 steps → 20 values
  const ratingSteps = 20;
  const ratingIndex = Math.floor(rand() * ratingSteps);
  const rating = Math.round((3 + ratingIndex * 0.1) * 10) / 10;

  const reviewCount = 25 + Math.floor(rand() * 26); // 25..50
  const reviews = pickTwoReviews(seed ^ 0x9e3779b9);

  return { rating, reviewCount, reviews };
}
