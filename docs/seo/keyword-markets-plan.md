# Keyword markets plan — status

Brand target remains **Research Peptides EU** (Europe-first). Keywords are stored **per country** and never merged.

## Countries ingested

| Code | Country | Priority | Unique | Targets | File |
|---|---|---|---:|---:|---|
| `uk` | United Kingdom | high | 219 | 178 | [`keywords-by-market/uk.json`](./keywords-by-market/uk.json) |
| `us` | United States | high | 72 | 70 | [`keywords-by-market/us.json`](./keywords-by-market/us.json) |
| `es` | Spain | high | 45 | 36 | [`keywords-by-market/es.json`](./keywords-by-market/es.json) |
| `nl` | Netherlands | high | 19 | 18 | [`keywords-by-market/nl.json`](./keywords-by-market/nl.json) |
| `de` | Germany | high | 8 | 8 | [`keywords-by-market/de.json`](./keywords-by-market/de.json) |
| `au` | Australia | medium | 9 | 8 | [`keywords-by-market/au.json`](./keywords-by-market/au.json) |
| `fr` | France | medium | 1 | 1 | [`keywords-by-market/fr.json`](./keywords-by-market/fr.json) |
| `se` | Sweden | low | 1 | 1 | [`keywords-by-market/se.json`](./keywords-by-market/se.json) |
| `at` | Austria | low | 1 | 1 | [`keywords-by-market/at.json`](./keywords-by-market/at.json) |

Master index: [`keywords-index.json`](./keywords-index.json)

## Differentiation rule

Every keyword record includes:

1. **`market_code`** — `uk` / `us` / `de` / `nl` / `es` / …
2. **`evidence_source_domains`** — `.eu` / `.co.uk` / `.es`
3. **Own market file** — same phrase in UK vs US = two records

## Implemented

- [x] Per-market JSON + master index
- [x] Ingest all 9 markets (newest CSV per country+source)
- [x] Link hub markets: `eu, es, uk, us, nl, de, fr, at, se, au`
- [x] Locale copy for EN / ES / NL / DE / FR
- [x] Product description updates for high-volume multi-market SKUs
- [x] Blogs: UK-EU guide + multi-market (NL/DE/US/AU) guide

## Thin markets

FR / SE / AT only have brand-level queries (`european peptide`, `peptides eu`) — mapped to Home / About / Shop, not thin product pages.
