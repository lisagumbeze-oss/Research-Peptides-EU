import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { ScraperEngine } from '../src/scraper/engine.js';
import type { ScrapedLegalPage } from '../src/scraper/extractors/legalContent.js';

interface SeedFile {
  sourceSite: string;
  baseUrl: string;
  legalSupportUrls: string[];
}

interface RawPageResult {
  url: string;
  status: 'ok' | 'skipped' | 'error';
  reason?: string;
  data?: ScrapedLegalPage;
}

const ARGS = process.argv.slice(2);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_ROOT = path.join(__dirname, '..');
const SEED_PATH = path.join(SERVER_ROOT, 'data/referenceSites/researchpeptide/legal-pages.seed.json');
const OUTPUT_DIR = path.join(SERVER_ROOT, 'output/researchpeptide/legal-content');

function hasFlag(flag: string): boolean {
  return ARGS.includes(flag);
}

function blockedCliFlags(): string[] {
  const blocked = ['--sync-to-main', '--write-products', '--upsert-products', '--replace-products'];
  return blocked.filter((flag) => ARGS.includes(flag));
}

function isLegalCandidateUrl(url: string): { allowed: boolean; reason?: string } {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { allowed: false, reason: 'Invalid URL format' };
  }

  const lowerPath = parsed.pathname.toLowerCase();
  const lowerQuery = parsed.search.toLowerCase();
  const blockedSegments = ['/product', '/shop', '/category', '/tag', '/cart', '/checkout'];

  if (blockedSegments.some((segment) => lowerPath.includes(segment))) {
    return { allowed: false, reason: `Blocked product/catalog path: ${lowerPath}` };
  }
  if (lowerQuery.includes('add-to-cart') || lowerQuery.includes('product=')) {
    return { allowed: false, reason: 'Blocked product-like query parameters' };
  }

  const looksLegal = /(privacy|terms|refund|return|shipping|contact|support|policy)/.test(lowerPath);
  if (!looksLegal) {
    return { allowed: false, reason: `Not a legal/support path: ${lowerPath}` };
  }

  return { allowed: true };
}

function normalizeUrl(url: string): string {
  const parsed = new URL(url);
  parsed.hash = '';
  if (!parsed.pathname) parsed.pathname = '/';
  parsed.pathname = parsed.pathname.replace(/\/{2,}/g, '/');
  return parsed.toString();
}

function isBlockedPagePayload(page: ScrapedLegalPage): boolean {
  const title = page.title.toLowerCase();
  const sectionText = page.sections.map((section) => section.text.toLowerCase()).join(' ');
  return title.includes('403') || title.includes('forbidden') || sectionText.includes('access to this page is forbidden');
}

async function readSeedFile(): Promise<SeedFile> {
  const raw = await fs.readFile(SEED_PATH, 'utf-8');
  return JSON.parse(raw) as SeedFile;
}

async function discoverLegalLinks(baseUrl: string): Promise<string[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(baseUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'ResearchPeptidesUK-LegalExtractor/1.0 (+https://researchpeptide.co.uk/)' },
    });
    if (!response.ok) return [];
    const html = await response.text();
    const matches = [...html.matchAll(/href=["']([^"']+)["']/gi)].map((m) => m[1] ?? '');
    const resolved = matches
      .map((href) => {
        try {
          return new URL(href, baseUrl).toString();
        } catch {
          return '';
        }
      })
      .filter(Boolean);
    const unique = [...new Set(resolved)];
    return unique.filter((url) => /(privacy|terms|refund|return|shipping|contact|support|policy)/i.test(url));
  } finally {
    clearTimeout(timeout);
  }
}

function summarizePages(pages: ScrapedLegalPage[], skipped: RawPageResult[], errors: RawPageResult[]) {
  return {
    sourceSite: 'researchpeptide.co.uk',
    capturedAt: new Date().toISOString(),
    totals: {
      success: pages.length,
      skipped: skipped.length,
      errors: errors.length,
      pagesProcessed: pages.length + skipped.length + errors.length,
    },
    policyCoverage: {
      withResearchUseDisclaimer: pages.filter((p) => p.policyFlags.hasResearchUseDisclaimer).length,
      withNoReturnsClause: pages.filter((p) => p.policyFlags.hasNoReturnsClause).length,
      withShippingTerms: pages.filter((p) => p.policyFlags.hasShippingTerms).length,
    },
    pageTypes: Object.fromEntries(
      Object.entries(
        pages.reduce<Record<string, number>>((acc, page) => {
          acc[page.pageType] = (acc[page.pageType] ?? 0) + 1;
          return acc;
        }, {})
      ).sort(([a], [b]) => a.localeCompare(b))
    ),
    skipped: skipped.map((entry) => ({ url: entry.url, reason: entry.reason ?? 'Skipped by filter' })),
    errors: errors.map((entry) => ({ url: entry.url, reason: entry.reason ?? 'Unknown error' })),
  };
}

async function writeJson(fileName: string, data: unknown): Promise<void> {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const filePath = path.join(OUTPUT_DIR, fileName);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

async function main() {
  const blockedFlags = blockedCliFlags();
  if (blockedFlags.length > 0) {
    throw new Error(`Blocked CLI flags: ${blockedFlags.join(', ')}. This script is legal-content only and never writes products.`);
  }

  const discover = hasFlag('--discover-links');
  const dryRun = hasFlag('--dry-run');
  const seed = await readSeedFile();

  const seedUrls = [...seed.legalSupportUrls];
  const discoveredUrls = discover ? await discoverLegalLinks(seed.baseUrl) : [];
  const targetUrls = [...new Set([...seedUrls, ...discoveredUrls].map((url) => normalizeUrl(url)))];

  const engine = new ScraperEngine();
  const rawResults: RawPageResult[] = [];
  const normalizedPages: ScrapedLegalPage[] = [];

  try {
    for (const url of targetUrls) {
      const candidate = isLegalCandidateUrl(url);
      if (!candidate.allowed) {
        rawResults.push({ url, status: 'skipped', reason: candidate.reason });
        continue;
      }

      const pageData = await engine.scrapeLegalPage(url);
      if (!pageData) {
        rawResults.push({ url, status: 'error', reason: 'Extractor returned null' });
        continue;
      }

      if (isBlockedPagePayload(pageData)) {
        rawResults.push({ url, status: 'error', reason: 'Blocked/forbidden page payload detected' });
        continue;
      }

      rawResults.push({ url, status: 'ok', data: pageData });
      normalizedPages.push(pageData);
    }
  } finally {
    await engine.close();
  }

  const skipped = rawResults.filter((entry) => entry.status === 'skipped');
  const errors = rawResults.filter((entry) => entry.status === 'error');
  const summary = summarizePages(normalizedPages, skipped, errors);

  if (!dryRun) {
    await writeJson('raw-pages.json', rawResults);
    await writeJson('normalized-pages.json', normalizedPages);
    await writeJson('summary.json', summary);
  }

  console.log(`Processed ${summary.totals.pagesProcessed} URLs (${summary.totals.success} ok, ${summary.totals.skipped} skipped, ${summary.totals.errors} errors).`);
  if (dryRun) {
    console.log('Dry run enabled, no files written.');
  } else {
    console.log(`Outputs written to: ${OUTPUT_DIR}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
