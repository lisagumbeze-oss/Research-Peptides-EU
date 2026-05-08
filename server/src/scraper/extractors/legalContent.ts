import { Page } from 'playwright';

export interface LegalSection {
  heading: string;
  text: string;
}

export interface LegalContact {
  emails: string[];
  phones: string[];
  addresses: string[];
}

export interface LegalPolicyFlags {
  hasResearchUseDisclaimer: boolean;
  hasNoReturnsClause: boolean;
  hasShippingTerms: boolean;
}

export interface ScrapedLegalPage {
  sourceSite: 'researchpeptide.co.uk';
  url: string;
  slug: string;
  pageType: string;
  title: string;
  sections: LegalSection[];
  contact: LegalContact;
  disclaimers: string[];
  policyFlags: LegalPolicyFlags;
  capturedAt: string;
}

function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

function dedupeStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const normalized = normalizeWhitespace(value);
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(normalized);
  }
  return out;
}

function pathSlug(url: string): string {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/\/+$/, '');
    const chunks = path.split('/').filter(Boolean);
    return chunks.length > 0 ? chunks[chunks.length - 1]! : 'home';
  } catch {
    return 'unknown';
  }
}

function derivePageType(url: string, title: string): string {
  const haystack = `${url} ${title}`.toLowerCase();
  if (haystack.includes('shipping')) return 'shipping-policy';
  if (haystack.includes('refund') || haystack.includes('return')) return 'returns-refunds';
  if (haystack.includes('terms')) return 'terms-and-conditions';
  if (haystack.includes('privacy')) return 'privacy-policy';
  if (haystack.includes('contact')) return 'contact-support';
  return 'legal-support';
}

export async function extractLegalContent(page: Page): Promise<ScrapedLegalPage> {
  const extracted = await page.evaluate(() => {
    const title = document.title || '';

    const sectionElements = Array.from(
      document.querySelectorAll('h1, h2, h3, .entry-title, .elementor-heading-title')
    );

    const sections: Array<{ heading: string; text: string }> = [];
    const bodyEl = document.querySelector('main, article, .site-main, .entry-content, .elementor-widget-theme-post-content');
    const fallbackBodyText = bodyEl?.textContent?.trim() ?? document.body.textContent?.trim() ?? '';

    for (const headingEl of sectionElements) {
      const heading = headingEl.textContent?.trim() ?? '';
      if (!heading) continue;

      const chunks: string[] = [];
      let node = headingEl.nextElementSibling;
      while (node && !/^H[1-3]$/i.test(node.tagName)) {
        const text = node.textContent?.trim() ?? '';
        if (text) chunks.push(text);
        node = node.nextElementSibling;
      }

      const text = chunks.join('\n').trim();
      if (text) sections.push({ heading, text });
    }

    const emailMatches = (document.body.innerText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? []).map((x) =>
      x.trim()
    );
    const phoneMatches =
      document.body.innerText.match(/(?:\+?\d[\d\s().-]{7,}\d)/g)?.map((x) => x.trim()) ?? [];

    const addressCandidates = Array.from(
      document.querySelectorAll('address, .contact-address, .footer-address, .elementor-widget-text-editor')
    )
      .map((el) => el.textContent?.trim() ?? '')
      .filter(Boolean);

    return {
      title,
      sections,
      fallbackBodyText,
      emails: emailMatches,
      phones: phoneMatches,
      addresses: addressCandidates,
    };
  });

  const url = page.url();
  const slug = pathSlug(url);
  const pageType = derivePageType(url, extracted.title);
  const sections =
    extracted.sections.length > 0
      ? extracted.sections.map((section) => ({
          heading: normalizeWhitespace(section.heading),
          text: normalizeWhitespace(section.text),
        }))
      : [
          {
            heading: extracted.title || slug,
            text: normalizeWhitespace(extracted.fallbackBodyText),
          },
        ];

  const sectionsText = sections.map((s) => `${s.heading}\n${s.text}`).join('\n').toLowerCase();
  const disclaimers = dedupeStrings(
    sections
      .map((s) => s.text)
      .filter((text) => /research purposes|not intended for human use|not medical products|liability/i.test(text))
  );

  return {
    sourceSite: 'researchpeptide.co.uk',
    url,
    slug,
    pageType,
    title: normalizeWhitespace(extracted.title || slug),
    sections,
    contact: {
      emails: dedupeStrings(extracted.emails),
      phones: dedupeStrings(extracted.phones),
      addresses: dedupeStrings(extracted.addresses),
    },
    disclaimers,
    policyFlags: {
      hasResearchUseDisclaimer: /research purposes|not intended for human use|not medical products/.test(sectionsText),
      hasNoReturnsClause: /no returns|do not accept returned|return(s)?\s+policy/.test(sectionsText),
      hasShippingTerms: /shipping|shipped|delivery|business day/.test(sectionsText),
    },
    capturedAt: new Date().toISOString(),
  };
}
