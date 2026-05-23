type ProductRow = {
  id: string;
  slug: string | null;
  title: string | null;
  description: string | null;
  price: number | null;
  images: string[] | null;
  categories: string[] | null;
  inventory: number | null;
  created_at: string | null;
};

function xmlEscape(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function slugifyProductName(input: string): string {
  const cleaned = input.replace(/\s*\(powder list[^)]*\)/gi, '').trim();
  return cleaned
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 80) || 'product';
}

function siteOriginFromRequest(req: any): string {
  const envSite = process.env.SITE_URL || process.env.VITE_SITE_URL;
  if (envSite) return envSite.replace(/\/+$/, '');

  const host = req?.headers?.['x-forwarded-host'] || req?.headers?.host;
  const proto = req?.headers?.['x-forwarded-proto'] || 'https';
  if (host) return `${proto}://${host}`;
  return 'https://researchpeptide.eu';
}

async function fetchProducts(): Promise<ProductRow[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured');

  const query =
    'select=id,slug,title,description,price,images,categories,inventory,created_at&order=created_at.desc.nullslast';
  const res = await fetch(`${url}/rest/v1/products?${query}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Supabase products read failed: ${res.status} ${t}`);
  }
  return (await res.json()) as ProductRow[];
}

function productLink(origin: string, p: ProductRow): string {
  const slug = (p.slug || '').trim() || slugifyProductName(p.title || 'product');
  return `${origin}/product/${encodeURIComponent(slug)}`;
}

function buildFeedXml(origin: string, products: ProductRow[]): string {
  const now = new Date().toUTCString();
  const items = products
    .map((p) => {
      const link = productLink(origin, p);
      const title = p.title || 'Untitled product';
      const description = p.description || 'Research-use product listing.';
      const image = p.images?.[0] || '';
      const price = Number(p.price || 0);
      const updated = p.created_at ? new Date(p.created_at).toUTCString() : now;
      const availability = (p.inventory || 0) > 0 ? 'in stock' : 'out of stock';
      const productType = p.categories?.join(' > ') || 'Research products';

      return [
        '<item>',
        `<g:id>${xmlEscape(p.id)}</g:id>`,
        `<title>${xmlEscape(title)}</title>`,
        `<description>${xmlEscape(description)}</description>`,
        `<link>${xmlEscape(link)}</link>`,
        image ? `<g:image_link>${xmlEscape(image)}</g:image_link>` : '',
        `<g:availability>${xmlEscape(availability)}</g:availability>`,
        `<g:price>${xmlEscape(price.toFixed(2))} EUR</g:price>`,
        `<g:condition>new</g:condition>`,
        `<g:brand>Research Peptides EU</g:brand>`,
        `<g:product_type>${xmlEscape(productType)}</g:product_type>`,
        `<pubDate>${xmlEscape(updated)}</pubDate>`,
        '</item>',
      ]
        .filter(Boolean)
        .join('');
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Research Peptides EU Product Feed</title>
    <link>${xmlEscape(origin)}</link>
    <description>Live product feed for Research Peptides EU catalog (EUR).</description>
    <lastBuildDate>${xmlEscape(now)}</lastBuildDate>
    ${items}
  </channel>
</rss>`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const origin = siteOriginFromRequest(req);
    const products = await fetchProducts();
    const xml = buildFeedXml(origin, products);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).send(xml);
  } catch (error: any) {
    console.error('product-feed handler:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'product feed failed',
    });
  }
}
