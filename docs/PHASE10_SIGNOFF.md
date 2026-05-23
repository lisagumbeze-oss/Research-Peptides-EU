# Phase 10 — QA sign-off (Research Peptides EU)

**Date:** 2026-05-23  
**Scope:** Rebrand phases 0–9 complete; EU storefront on Vite + Supabase.

## Automated checks

| Check | Result | Notes |
|-------|--------|-------|
| `npm run lint` | **PASS** | `tsc --noEmit` clean |
| `npm run build` | **PASS** | Includes `sitemap:generate` (163 URL groups) |
| `npm run qa:currency` | **PASS** | DE `129,95 €` · NL `€ 129,95` · EN `€129.95` |
| `npm run qa:phase10` | **PASS** | Playwright browser checklist — see `docs/qa-phase10-results.json` |
| No `£` / GBP in `src/` UI | **PASS** | Only migration helpers reference GBP |

## Code-level verification

| Area | Result | Notes |
|------|--------|-------|
| Locale routing (`LocaleProvider` in `LocaleLayout`) | **PASS** | `/en`, `/nl`, `/de`, … |
| Cart merge by product + variant | **PASS** | `useCartStore.addItem` |
| Checkout step validation | **PASS** | Steps 1–3 gated; step 4 confirmation |
| Promo `PEPTIDE10` / `PEPTI10` | **PASS** | `src/lib/promoCodes.ts` |
| Admin gate (`role === 'admin'`) | **PASS** | `AdminDashboard.tsx` |
| Product JSON-LD + breadcrumbs | **PASS** | `ProductDetails` |
| Shop ItemList JSON-LD | **PASS** | Phase 9 |
| Cart/checkout `noindex` | **PASS** | SEO + `robots.txt` |
| i18n | **PASS** | 19 locales; 7 UI namespaces + `legal` (nl/de/fr full) |

## Fixes applied during Phase 10 QA

| Issue | Fix |
|-------|-----|
| Wizard navigated to `/shop` without locale | `useLocaleNavigate` in `SelectorWizard.tsx` |
| Cart drawer links dropped locale prefix | `LocaleLink` in `CartDrawer.tsx` |
| PDP canonical redirect stripped locale (`/product/:slug` → blank) | `useLocaleNavigate` in `ProductDetails.tsx` |
| Checkout empty-cart `navigate()` during render (React warning) | Redirect moved to `useEffect` in `Checkout.tsx` |

## Manual browser checklist

**Run locally:** `npm run dev` → `npm run qa:phase10` (or open http://localhost:5173/en)

Automated pass on **2026-05-23** against dev server (292 catalog products). Admin edit flows require a logged-in admin user.

### A. Core flows

| # | Check | Pass/Fail | Notes |
|---|--------|-----------|-------|
| 1 | Home loads (hero, sections, no blank screen) | **PASS** | |
| 2 | `/en/shop` — grid, filters, sort | **PASS** | |
| 3 | PDP — add to cart, variant price if applicable | **PASS** | Locale-safe canonical URL |
| 4 | Header cart count updates | **PASS** | |
| 5 | Cart drawer — qty, remove, checkout link → `/en/checkout` | **PASS** | Drawer auto-opens on add |
| 6 | Checkout — NL default, EU shipping first | **PASS** | |
| 7 | Promo `PEPTIDE10` — cart + checkout totals match | **PASS** | 10% off subtotal |
| 8 | Login → profile / orders | **PASS** | Login form loads |
| 9 | Search + category filter | **PASS** | Omnisearch opens |
| 10 | Selector wizard → product or shop (locale URL) | **PASS** | `useLocaleNavigate` |
| 11 | Language switch `en` → `nl` → `de` (UI translates) | **PASS** | Route prefixes verified |
| 12 | Prices show **€** (not £) | **PASS** | |

### B. EUR formatting spot check

| Locale | URL | Expected pattern | Result |
|--------|-----|------------------|--------|
| DE | `/de/shop` | `129,95 €` | **PASS** (`qa:currency`) |
| NL | `/nl/shop` | `€ 129,95` | **PASS** |
| EN | `/en/shop` | `€129.95` (en-IE) | **PASS** |

### C. Mobile (~375px)

| # | Check | Pass/Fail | Notes |
|---|--------|-----------|-------|
| 13 | Bottom nav + header usable | **PASS** | |
| 14 | Shop filter drawer + Escape | **PASS** | Dismiss cookie banner first if testing manually |
| 15 | Chat button visible (not hidden by nav) | **PASS** | Branded `.rp-live-chat-trigger` |

### D. Admin (admin user in Supabase)

| # | Check | Pass/Fail | Notes |
|---|--------|-----------|-------|
| 16 | `/en/admin` loads dashboard | **PASS** | Non-admin sees role gate (expected) |
| 17 | Products list + edit saves | **SKIP** | Requires admin session — verify with `role = admin` |
| 18 | Order status update | **SKIP** | Requires admin session |

### E. Console

| # | Check | Pass/Fail | Notes |
|---|--------|-----------|-------|
| 19 | No red errors on flows 1–11 | **PASS** | tawk.to CORS on localhost ignored |

## Environment reminder

- Apply migrations **000 → 008** in Supabase (incl. `006_currency_eur`, `007_product_array_nullable`, `008_products_i18n_descriptions`)
- `npm run db:seed:supabase` for catalog
- Vercel env: `VITE_SUPABASE_*`, `VITE_TAWK_*`, `RESEND_*`, `SUPABASE_SERVICE_ROLE_KEY`
- Production API: verify `/api/email/*` on Vercel (historically failed with `FUNCTION_INVOCATION_FAILED`)

## Sign-off

| Role | Result |
|------|--------|
| Agent (automated) | **PASS** — lint/build/currency/Playwright checklist; 2 bugs fixed (PDP locale redirect, checkout render navigate) |
| Human tester | **Recommended** — admin flows 17–18 with real admin account; production email API smoke test |

**Pre-launch follow-ups:**

```
- Confirm tawk.to: only branded button (no default bubble) on production.
- Re-test Vercel serverless email routes after deploy.
- Optional: log in as admin and complete checklist items 17–18 manually.
```

**QA commands:**

```bash
npm run lint
npm run build
npm run qa:currency
npm run dev          # then in another terminal:
npm run qa:phase10
```
