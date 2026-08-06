# EU Google Ads compliance handoff

## Phase 2 — Pre-Ads QA (completed)

Automated browser smoke: `npx playwright test --config=playwright.phase2.config.ts --workers=1`  
Date: 2026-08-06 · Base: local `http://127.0.0.1:5173`

- [x] First viewport + footer = research lab supply only
- [x] Age gate appears for new visitors (`rp-eu-age-gate`)
- [x] Checkout step 3 requires age + research-use + Terms checkboxes
- [x] Wizard goals are research areas (metabolic / muscle tissue / cellular repair / neuro)
- [x] Calculator uses working aliquot language (not “target dose”)
- [x] Ticker has no Semaglutide/GLP-1 demand / low-stock hype copy
- [x] Shipping + FAQ packaging copy is professional/neutral (not “discreet”)
- [x] Product panel shows research-use-only + not for human/veterinary use
- [x] Ad landing URLs reachable: `/en`, `/en/about-us`, `/en/coas`
- [x] Mobile smoke: Home, Calculator, Shop
- [x] Terms eligibility mentions 18+

**Verdict:** Phase 2 PASS — safe to start a low-budget EU brand/content Ads probe.

---

## Phase 3 — EU brand/content Ads launch pack

**Expectation:** EU peptide *product* ads are often disapproved. This is a policy probe, not Shopping scale.

### Campaign setup (paste into Google Ads)

| Field | Value |
|-------|--------|
| Campaign type | Search |
| Goal | Website traffic |
| Name | `EU Brand-Content Probe · Research Lab` |
| Geo | EU countries you ship to (start with NL + DE + FR only) |
| Language | English (+ local later) |
| Daily budget | €10–20 for first 7–14 days |
| Bidding | Maximize clicks with low bid cap, or Manual CPC |
| Networks | Search only (off Display / partners for the probe) |

### Final URLs (use these only)

1. `https://YOUR-DOMAIN/en` (primary)
2. `https://YOUR-DOMAIN/en/about-us`
3. `https://YOUR-DOMAIN/en/coas`

Do **not** land on Semaglutide, Tirzepatide, Retatrutide, SARMs, Melanotan, HCG, or pen product pages.

### Keyword themes (phrase / exact)

**Include**
- `[research peptides eu]`
- `[research peptides netherlands]`
- `"research peptides laboratory"`
- `"lab peptides europe"`
- brand name variants

**Exclude (negative exact/phrase)**
- weight loss, fat loss, bodybuilding, muscle gain, dosing, inject, buy semaglutide, tirzepatide, retatrutide, sarm, melanotan, hcg, ozempic, mounjaro, for humans, side effects

### Ad copy tone (RSA)

- Headlines: Research-grade peptides · COA documentation · EU dispatch from Netherlands · Laboratory use only
- Descriptions: Supply research compounds for European laboratories. Third-party analytical verification. Not for human or veterinary use.
- Avoid: outcomes, discreet packaging, clinical/treatment language, “buy [drug]”

### Account hygiene

1. Keep this campaign separate from any product tests
2. Pause on first policy strike; fix landing/copy before retry
3. Increase budget only after 7–14 days with no disapprovals

### Plan B if ads fail / stay limited

Brand/content Ads only + SEO + email + affiliates. US/CA supplier certification is deferred.

### Re-run Phase 2 locally

```bash
npm run dev
npx playwright test --config=playwright.phase2.config.ts --workers=1
```
