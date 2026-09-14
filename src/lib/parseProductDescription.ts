export type DescriptionSection = {
  id: string;
  title: string;
  body: string;
  bullets: string[];
};

const KNOWN_HEADING =
  /^(Overview|What Is\b.+|Research Context|Product Notes|Important|Key Features?|Specifications?|Storage(?: and Handling)?|Applications?|Research Applications?|Mechanism(?: of Action)?(?: in Laboratory Studies)?|Molecular and Chemical Composition|Advantages of Using\b.+|Laboratory Use|Research Use|Composition|Dosage Form|Purity|Handling|How (?:It|to)\b.+|Related Research Compounds|Scientific References|References|Disclaimer|Research Use Disclaimer)\b/i;

function normalizeBullets(text: string): string {
  return text
    .replace(/\n•\s*\n/g, '\n• ')
    .replace(/^•\s*\n/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function isHeading(block: string): boolean {
  const t = block.trim();
  if (!t || t.length > 80) return false;
  if (t.startsWith('•') || t === '---') return false;
  if (KNOWN_HEADING.test(t)) return true;

  // Reject prose that only looks short (continuations / soft lead-ins)
  if (/[,:;]$/.test(t) && !/\?$/.test(t)) return false;
  if (
    /\b(is|are|was|were|can|will|should|utilized|looking|supplied|maintain|including)\b/i.test(
      t,
    )
  ) {
    return false;
  }

  const words = t.split(/\s+/).length;
  // Short title-like line without sentence punctuation
  if (words <= 8 && !/[.!]/.test(t) && /^[A-Z0-9(]/.test(t) && !/,/.test(t)) {
    return true;
  }
  return false;
}

function slugify(title: string, index: number): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return `${base || 'section'}-${index}`;
}

function extractBullets(body: string): { prose: string; bullets: string[] } {
  const lines = body.split('\n').map((l) => l.trim()).filter(Boolean);
  const bullets: string[] = [];
  const proseLines: string[] = [];
  for (const line of lines) {
    if (line.startsWith('•')) {
      const item = line.replace(/^•\s*/, '').trim();
      if (item) bullets.push(item);
    } else {
      proseLines.push(line);
    }
  }
  return { prose: proseLines.join('\n\n').trim(), bullets };
}

/**
 * Split a plain-text product description into titled cards for the PDP dossier grid.
 */
export function parseProductDescription(raw: string | null | undefined): DescriptionSection[] {
  const text = normalizeBullets(String(raw || '').trim());
  if (!text) return [];

  const blocks = text
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter((b) => b && b !== '---');

  if (!blocks.length) return [];

  const sections: { title: string; chunks: string[] }[] = [];
  let current: { title: string; chunks: string[] } | null = null;

  for (const block of blocks) {
    if (isHeading(block)) {
      // Skip the document title if it looks like "X – Research Grade Peptide"
      if (/research grade/i.test(block) && sections.length === 0 && !current) {
        continue;
      }
      current = { title: block.replace(/:$/, '').trim(), chunks: [] };
      sections.push(current);
      continue;
    }
    if (!current) {
      current = { title: 'Overview', chunks: [] };
      sections.push(current);
    }
    current.chunks.push(block);
  }

  const parsed = sections
    .map((s, index) => {
      const combined = s.chunks.join('\n\n').trim();
      const { prose, bullets } = extractBullets(combined);
      if (!prose && bullets.length === 0) return null;
      return {
        id: slugify(s.title, index),
        title: s.title,
        body: prose,
        bullets,
      } satisfies DescriptionSection;
    })
    .filter(Boolean) as DescriptionSection[];

  // Fallback: one card with the full text when structure is flat
  if (parsed.length === 0) {
    const { prose, bullets } = extractBullets(text);
    return [
      {
        id: 'overview-0',
        title: 'Overview',
        body: prose || text,
        bullets,
      },
    ];
  }

  return parsed;
}

/** Short teaser for the purchase column — first substantive paragraph. */
export function productDescriptionSummary(
  raw: string | null | undefined,
  maxLen = 280,
): string {
  const sections = parseProductDescription(raw);
  const first = sections[0]?.body || String(raw || '').replace(/\s+/g, ' ').trim();
  if (!first) return '';
  const oneLine = first.replace(/\s+/g, ' ').trim();
  if (oneLine.length <= maxLen) return oneLine;
  return `${oneLine.slice(0, maxLen).replace(/\s+\S*$/, '')}…`;
}
