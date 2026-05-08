# E‑commerce skill sign‑off checklist

Use this after `ecommerce-webapps.md` Step 7. Tick **Pass** / **Fail** / **N/A** and add a one‑word note if needed.

**Environment**

| Item | Pass/Fail/N/A | Notes |
|------|-----------------|-------|
| Dev URL reachable (`npm run dev`, note actual port if 5173 is busy) | | |
| Supabase env vars set (`VITE_SUPABASE_*` or project `.env`) | | |
| DB migrations applied (`npm run db:migrate`) incl. `004_products_compare_at_price.sql` | | |

---

## Step 7 — Code quality (browser pass)

### A. Interactive flows

| # | Check | Pass/Fail/N/A | Notes |
|---|--------|---------------|-------|
| 1 | Home → Shop: grid loads, filters/sort work | | |
| 2 | Shop → PDP: variant selection changes price/add‑to‑cart behaviour | | |
| 3 | Add from Shop grid → cart count/header/badge updates | | |
| 4 | Add from PDP → line merges correctly with same variant | | |
| 5 | Cart page/drawer: qty −/+ updates line total and cart total | | |
| 6 | Remove line → totals correct | | |
| 7 | Wishlist heart on Shop/Search → reflects state | | |
| 8 | Search: category dropdown + sort filter results | | |
| 9 | Checkout steps 1–3 submit → confirmation (step 4) | | |
|10 | Contact form submits without silent failure | | |

### B. Empty / edge states

| # | Check | Pass/Fail/N/A | Notes |
|---|--------|---------------|-------|
|11 | Empty cart page messaging + link to shop | | |
|12 | Empty cart drawer CTA | | |
|13 | Shop: “no products match filters” | | |
|14 | Search: no catalog / no matches states | | |
|15 | Wishlist empty state | | |

### C. Pricing display

| # | Check | Pass/Fail/N/A | Notes |
|---|--------|---------------|-------|
|16 | GBP formatting everywhere visible (£xx.xx pattern) | | |
|17 | Compare‑at / “was” shows where DB has `compare_at_price` | | |

### D. Responsive

| # | Check | Pass/Fail/N/A | Notes |
|---|--------|---------------|-------|
|18 | ~375px: layout usable (bottom nav, header search+cart, no overlap) | | |
|19 | ~1280px: catalog columns + PDP readable | | |
|20 | Shop mobile filter drawer opens/closes + Escape | | |

### E. Console

| # | Check | Pass/Fail/N/A | Notes |
|---|--------|---------------|-------|
|21 | No unexpected errors during flows above (F12 → Console) | | |
|22 | Network failures documented if offline/block | | |

### F. Accessibility (spot check)

| # | Check | Pass/Fail/N/A | Notes |
|---|--------|---------------|-------|
|23 | Skip link → main content focus | | |
|24 | Tab order sensible through header → main CTAs | | |
|25 | Cart drawer: close control + labelled buttons | | |
|26 | Checkout: labelled inputs + shipping radio groups | | |

### G. Product data plausibility

| # | Check | Pass/Fail/N/A | Notes |
|---|--------|---------------|-------|
|27 | Mixed categories/prices/ratings visible (not one uniform slab) | | |

---

## Promo UX consistency (optional but recommended)

| # | Check | Pass/Fail/N/A | Notes |
|---|--------|---------------|-------|
|28 | Canonical promo shown in UI: **`PEPTIDE10`** (alias **`PEPTI10`** still works backend) | | |
|29 | Cart + Checkout totals agree after applying promo | | |

---

## Skill gaps closed (reference — already implemented)

- Featured/best‑rated sort, product counts, trust strip, card badges, compare‑at wiring (with migration).
- Cart hydration skeletons, unified wishlist heart overlay on Shop/Search/Wishlist cards.
- Powder catalog import: `npm run db:import:powder` with `--dry-run` / `--no-shop-images`.

---

## Sign‑off

| Role | Name | Date |
|------|------|------|
| Tester | | |
| Result | **PASS** / **PASS WITH NOTES** / **BLOCKED** | |

**Blockers / follow‑ups:**

```
(free text)
```

---

## Launch verification log (agent run)

| Check | Status | Notes |
|---|---|---|
| Typecheck (`npm run lint`) | PASS | `tsc --noEmit` clean after checkout/email hardening. |
| Contact API dry-run (`api/email/contact`) | PASS | Returned `success: true`, `dryRun: true`, recipients include admin + customer. |
| Order-created/status dry-run (`api/lib/orderEmailHandlers`) | BLOCKED (local env) | Requires `SUPABASE_SERVICE_ROLE_KEY` in local env for REST lookup path. |
| Checkout step gating | PASS (code-level) | Step-1 and step-2 validation now block progression and focus first invalid field. |
| Vercel production deploy | PASS | Latest deployment `dpl_9CbrX1YGUkDzk8aC7G9s19Uk8kPd`, aliased to `https://www.researchpeptide.uk`. |
| Production API smoke (`GET /api/email/*`) | FAIL | Returns `FUNCTION_INVOCATION_FAILED` (500) in production; local `vercel dev` returns expected 405 for same routes. |
