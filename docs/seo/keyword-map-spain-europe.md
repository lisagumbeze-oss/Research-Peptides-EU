# Keyword map — Spain evidence, Europe targeting

Source: Semrush organic positions for `researchpeptides.es` (ES, 2026-09-09).  
Canonical machine list: [`keywords-spain-europe.json`](./keywords-spain-europe.json).

**Positioning rule:** Spain keywords capture ES demand; every surface still frames **Research Peptides EU** as EU-wide (Netherlands fulfillment, EUR, ship across Europe). Do not narrow the brand to Spain-only.

## Priority clusters → surfaces

| Cluster | Primary keyword | Volume | Assign to |
|---|---|---:|---|
| Spain buy peptides | comprar peptidos en españa | 140 | `/es`, `/es/shop`, blog Spain/EU |
| Retatrutide | retatrutide comprar | 880 | Retatrutide PDPs, shop ES, blog |
| Bacteriostatic water | agua bacteriostática farmacia | 260 | BAC water PDP, reconstitution blog, calculator |
| EU brand | peptides eu / research peptides-europe | 140 / 50 | Home, About, meta descriptions |
| Calculator | calculadora peptidos | 50 | Peptide calculator page |
| IGF-1 / follistatin | igf-1 comprar | 70 | IGF-1 LR3 PDP, shop ES |
| Cagrilintide* | comprar cagrilintide | 90 | Shop ES + blog until SKU exists |

\*No dedicated seed catalog SKU yet — content-only until product is added.

## Noise / skip

Do not target: `peptdes`, `peptidasa`, `peptidr`, `peptids`, `pepties`, `24peptides`, `lipofectamine`, `estreptavidina`.  
Treat `comprar retratutida` as a typo variant of retatrutide.

## Extending for UK / other countries

When new Semrush exports arrive:

1. Add/merge keywords under `docs/seo/keywords-uk.json` (or `keywords-de.json`, etc.).
2. Add market-tagged anchors in `src/data/researchLinks.ts` (`markets: ['uk']`, `anchor.uk`).
3. Pass those markets into `<ResearchLinkHub markets={['eu', 'es', 'uk']} />`.

UK list is live: [`keywords-uk.json`](./keywords-uk.json) · [`keyword-map-uk.md`](./keyword-map-uk.md).

