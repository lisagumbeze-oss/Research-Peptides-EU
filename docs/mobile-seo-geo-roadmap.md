# Mobile Trust Surface + SEO/GEO Roadmap

**Status:** Phase F complete — A→F program done (deploy to activate live bot HTML)  
**Site:** https://www.researchpeptide.eu  
**Stack:** Vite 6 + React 19 SPA (Vercel), Tailwind v4, 19 locales, Supabase  
**Constraint:** Do not break Supabase auth, cart, checkout, admin, wishlist, wizard, tawk.to, feeds.

---

## Phase A — Baseline (complete)

### Verified (live + code)

| Finding | Evidence | Severity |
|---------|----------|----------|
| CSR-only HTML for all routes | Live `/` and `/en/shop` return same shell: empty `#root`, generic title/description only | **P0** |
| Google Fonts + GTM in first HTML | `index.html` render-blocking font CSS + gtag | P1 |
| Almost all pages eagerly imported | `src/App.tsx` — only Admin is `lazy` | P1 |
| `pb-safe` used but undefined | `MobileBottomNav.tsx` — no `env(safe-area-inset-*)` utility | P1 |
| Categories are query URLs | `Categories.tsx` → `/search?category=` | P1 |
| Duplicate / thin global schema | `Layout.tsx` Org+WebSite+LocalBusiness; `LocaleHead.tsx` LocalBusiness again; SearchAction missing locale | P2 |
| Mobile overlay stack | Bottom nav + cookie (`z-90`) + sales toast + back-to-top + chat | P2 |
| Blog URLs by id | `/blog/:id` — weaker than slugs | P2 |
| Blog index missing `usePageSeo` | `Blog.tsx` | P2 |
| Keyword markets already exist | `docs/seo/keyword-markets-plan.md` — reuse for category/content copy | — |

### Scorecard (post Phase F — 2026-09-14)

| Metric | Baseline | After F | Status |
|--------|----------|---------|--------|
| Bot-visible product title/body | No (shell only) | Yes in `dist/` prerender (830 pages) | ✅ local/static; ⏳ live pending deploy |
| Mobile safe-area nav | Broken / no-op | `.pb-safe` + `viewport-fit=cover` | ✅ |
| Initial JS (storefront) | Monolithic eager routes | Home eager; others lazy | ✅ |
| Category landings | Query-only | `/category/:slug` + sitemap + prerender | ✅ |
| Schema duplication | Yes | Single `globalEntityJsonLd` via LocaleHead | ✅ |
| Default OG image | Weak / page-dependent | Always `brand_logo.png` | ✅ |

### Phase F validation log

| ID | Result |
|----|--------|
| F1 | `npm run prerender:verify` + `npm run qa:phase-f` passed; static serve confirmed H1/JSON-LD/prerender on `/en/`, `/en/shop/`, product, category |
| F2 | Source invariants: safe-area, sticky buy bar, overlay discipline, lazy routes |
| F3 | `tsc` — no `src/` errors; `npm run build` + prerender 830 pages OK |
| F4 | Skipped PageSpeed (optional); field CWV still an evidence gap |
| F5 | Scorecard updated |

**Deploy note:** Live `https://www.researchpeptide.eu/en` still returns empty `#root` shell until this build is deployed to Vercel with Supabase env for prerender.

---

## Phase B — Mobile Trust Surface

**Goal:** One primary action on phone; clear thumb reach; less chrome conflict; smaller first JS.

| ID | Task | Files | Effort | Priority |
|----|------|-------|--------|----------|
| B1 | Define `pb-safe` / `pt-safe` / `safe-bottom` with `env(safe-area-inset-*)` | `src/index.css` | S | P0 ✅ |
| B2 | Overlay discipline: hide/defer sales toast + back-to-top when cookie open; keep bottom nav as sole primary chrome | `Layout.tsx`, `SalesNotification.tsx`, `CookieConsent.tsx` | M | P1 ✅ |
| B3 | Product mobile: sticky buy box, specs/COA above fold, single CTA hierarchy | `ProductDetails.tsx`, product components | M | P0 ✅ |
| B4 | Shop/search mobile filters already drawer — audit spacing vs bottom nav | `Shop.tsx`, `CatalogFilters.tsx` | S | P1 ✅ |
| B5 | Route-level `React.lazy` for all non-critical pages (keep Home eager) | `src/App.tsx` | M | P0 ✅ |
| B6 | Font strategy: subset or self-host critical weights; drop duplicate preload+stylesheet | `index.html`, optional `public/fonts` | M | P1 ✅ |
| B7 | Mobile hero: don’t leave empty visual plane — lighter LCP image or CSS atmosphere that works on small screens | `HeroSection.tsx` | M | P1 ✅ |

**Exit criteria:** Safe-area OK on notched devices; product CTA always reachable; route chunks load on demand; no cookie+toast+BTT stacking over buy actions.

---

## Phase C — Indexable HTML

**Goal:** Critical URLs ship title, description, main content, and Product JSON-LD without JS.

| ID | Task | Approach | Effort | Priority |
|----|------|----------|--------|----------|
| C1 | Choose prerender path (prefer stay on Vite) | Build-time SEO HTML shells via `scripts/prerender-seo.ts` (no Playwright required) | L | P0 ✅ |
| C2 | Prerender set v1 | `en/nl/de/fr/es` × home, shop, faq, about, contact, peptide-guide, shipping, categories | L | P0 ✅ |
| C3 | Dynamic product HTML | Supabase catalog → `/product/:slug` for all active products × 5 locales | L | P0 ✅ |
| C4 | Ensure prerendered HTML includes LocaleHead meta + Product schema | Title, description, canonical, hreflang, OG, Org/WebSite/Product JSON-LD | M | P0 ✅ |
| C5 | Vercel: serve prerendered files ahead of SPA rewrite | `cleanUrls` + filesystem-first static `*/index.html` before SPA fallback | M | P0 ✅ |
| C6 | Defer non-essential third parties until consent / idle | gtag deferred to `window.load` (Phase B); consent gating optional follow-up | S | P1 ✅ |

**Exit criteria:** `curl` of `/en/product/{slug}` returns product name in HTML; Googlebot sample matches.

**Out of scope for C:** Full Next.js migration (revisit only if prerender proves insufficient).

---

## Phase D — Category + content architecture

**Goal:** Real commercial landings; stronger topical graph; reuse keyword maps.

| ID | Task | Files | Effort | Priority |
|----|------|-------|--------|----------|
| D1 | Add `/category/:slug` route + page (unique H1, intro, ItemList, FAQ capsule) | `App.tsx`, `CategoryLanding.tsx` | L | P0 ✅ |
| D2 | Redirect/update category cards from search query → landing | `Categories.tsx`, mega-menu, home, search legacy redirect | S | P0 ✅ |
| D3 | Sitemap entries for categories | `scripts/generate-sitemap.ts`, `api/sitemap.ts`, prerender | S | P0 ✅ |
| D4 | Blog: `usePageSeo` on index; plan slug URLs (`/blog/:slug`) with redirect from id | `Blog.tsx`, `BlogPost.tsx`, `docs/seo/blog-slug-plan.md` | M | P1 ✅ |
| D5 | Internal links: home/shop/product ↔ guide/FAQ/category using keyword markets | `researchLinks.ts` | M | P1 ✅ |

**Exit criteria:** Category URLs indexable, unique copy, in sitemap; categories no longer primarily query params.

---

## Phase E — GEO polish

**Goal:** Clear entities and answer structures for AI/search — no thin spam pages.

| ID | Task | Files | Effort | Priority |
|----|------|-------|--------|----------|
| E1 | Single schema factory: Org / WebSite (locale SearchAction) / LocalBusiness (full NAP from `brand.ts`) | `structuredData.ts`, `Layout.tsx`, `LocaleHead.tsx` | M | P0 ✅ |
| E2 | Default `og:image` always set | `LocaleHead.tsx`, `index.html` | S | P1 ✅ |
| E3 | Answer capsules on FAQ, product, category, guide (definition, research-use, testing, EU shipping) | page sections | M | P1 ✅ |
| E4 | Entity consistency pass (name, URL, address, email) | brand + emails + schema | S | P1 ✅ |
| E5 | Enrich LocalBusiness (contactPoint; hours only if real) | `structuredData.ts` | S | P2 ✅ |

**Exit criteria:** One Org/WebSite/LocalBusiness per page; answer blocks present on key templates; NAP matches legal HQ.

---

## Phase F — Validate

| ID | Check |
|----|--------|
| F1 | `curl`/Playwright: prerendered routes contain titles + H1 + schema |
| F2 | Mobile smoke: product → cart → checkout chrome (safe area, sticky CTA) |
| F3 | `npm run lint` + `npm run build` |
| F4 | Optional: PageSpeed mobile home + 1 product |
| F5 | Update this doc scorecard with post-change status |

---

## Execution order

```
A (done) → B1–B5 → B6–B7 → C1–C5 → C6 → D1–D3 → D4–D5 → E1–E5 → F
```

Parallel-safe later: B6 with C; D4 with E; never block C on D.

## Definition of done (program)

1. Mobile: safe areas, one primary CTA, split routes.  
2. SEO: critical pages HTML-complete without JS.  
3. Architecture: real category URLs.  
4. GEO: clean entities + answer capsules.  
5. No checkout/auth regressions.

---

## Next action

Start **Phase B** with B1 (safe-area CSS) + B5 (lazy routes) + B2 (overlay discipline), then B3 (product sticky buy box).
