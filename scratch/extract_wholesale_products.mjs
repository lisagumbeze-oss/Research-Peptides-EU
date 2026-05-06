import fs from 'fs';

const urls = [
  'https://www.wholesalepeptides.co.uk/products/bpc-157?variant=42841428426815',
  'https://www.wholesalepeptides.co.uk/products/bpc-157-tb500-ghk-cu-glowpen?variant=42841499303999',
  'https://www.wholesalepeptides.co.uk/products/bpc-tb?variant=42841447596095',
  'https://www.wholesalepeptides.co.uk/products/diosa-glow-70mg-prefilled-pen?variant=43052247842879',
  'https://www.wholesalepeptides.co.uk/products/ghk-cu?variant=42841469190207',
  'https://www.wholesalepeptides.co.uk/products/hcg?variant=42841510740031',
  'https://www.wholesalepeptides.co.uk/products/mots-c-x-10-vials?variant=42928128917567',
  'https://www.wholesalepeptides.co.uk/products/tirzepatide-100mg-one-vial?variant=43142876954687',
  'https://www.wholesalepeptides.co.uk/products/vio-labs-retatrutide-40mg-3ml-prefilled-pen?variant=43074302935103'
];

function round2(n) {
  return Math.round(n * 100) / 100;
}

function cleanText(s) {
  return s.replace(/\\n/g, '\n').replace(/\\"/g, '"').trim();
}

for (const url of urls) {
  const res = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();

  const metaMatch = html.match(/var meta = (\{[\s\S]*?\});/);
  if (!metaMatch) {
    console.error('Missing meta block for', url);
    continue;
  }
  const meta = JSON.parse(metaMatch[1]);
  const product = meta.product;

  const ldMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  let ldProduct = null;
  for (const match of ldMatches) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed['@type'] === 'ProductGroup') {
        ldProduct = parsed;
        break;
      }
    } catch {
      // ignore
    }
  }

  const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"[^>]*>/) ||
    html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:image"[^>]*>/);
  const ogImage = ogImageMatch?.[1] || null;
  const description = ldProduct?.description ? cleanText(ldProduct.description) : '';

  const variants = (product.variants || []).map((v) => {
    const sourcePrice = v.price / 100;
    return {
      id: v.id,
      name: v.public_title || v.name,
      sourcePrice,
      discountedPrice: round2(sourcePrice * 0.9)
    };
  });

  const basePrice = variants.length > 0 ? Math.min(...variants.map((v) => v.discountedPrice)) : 0;

  const output = {
    sourceUrl: url,
    handle: product.handle,
    title: product.variants?.[0]?.name?.split(' - ')[0]?.trim() || product.handle,
    image: ogImage,
    description,
    variants,
    discountedBasePrice: basePrice
  };

  console.log(JSON.stringify(output));
}
