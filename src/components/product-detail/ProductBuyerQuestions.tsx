import { LocaleLink } from '../../i18n/LocaleLink';

const COUNTRIES = [
  'the Netherlands',
  'the UK',
  'Germany',
  'Italy',
  'Spain',
  'France',
  'Belgium',
  'Poland',
] as const;

function hashIndex(seed: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % mod;
}

function baseName(title: string): string {
  const pipe = title.indexOf(' | ');
  return (pipe > 0 ? title.slice(0, pipe) : title).trim();
}

type Props = {
  title: string;
  slug: string;
};

export function ProductBuyerQuestions({ title, slug }: Props) {
  const name = baseName(title);
  const c0 = COUNTRIES[hashIndex(slug, COUNTRIES.length)];
  const c1 = COUNTRIES[(hashIndex(slug, COUNTRIES.length) + 2) % COUNTRIES.length];
  const c2 = COUNTRIES[(hashIndex(slug, COUNTRIES.length) + 4) % COUNTRIES.length];

  const items = [
    {
      q: `How to buy ${name} in ${c0}?`,
      a: `Add ${name} to your cart on Research Peptides EU, checkout in EUR, and we dispatch from the Netherlands with temperature-controlled EU logistics. Research use only.`,
    },
    {
      q: `Where can I buy ${name} in ${c1}?`,
      a: `Order ${name} online from our European research catalog — COA documentation, HPLC-verified batches, and tracked delivery to ${c1} and neighbouring markets.`,
    },
    {
      q: `How much for ${name} in ${c2}?`,
      a: `Live EUR pricing is shown on this page. Compare vial strengths, apply bulk tiers where available, and confirm shipping at checkout for ${c2} destinations.`,
    },
  ];

  return (
    <section className="rounded-3xl bg-white/90 backdrop-blur-sm border border-brand-100 p-8 md:p-10 shadow-card">
      <p className="text-caption text-brand-600 mb-2">Buyer questions</p>
      <h2 className="text-h2 font-display font-bold text-navy-950 mb-6">
        How to buy {name} in Europe
      </h2>
      <dl className="space-y-6">
        {items.map((item) => (
          <div key={item.q}>
            <dt className="font-semibold text-navy-950 mb-1">{item.q}</dt>
            <dd className="text-sm text-steel-600 leading-relaxed">{item.a}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-8 text-sm text-steel-600">
        Browse the full{' '}
        <LocaleLink to="/shop" className="font-semibold text-brand-700 hover:underline underline-offset-4">
          research peptides catalog
        </LocaleLink>{' '}
        or review{' '}
        <LocaleLink to="/shipping" className="font-semibold text-brand-700 hover:underline underline-offset-4">
          shipping to the Netherlands, UK, Germany, and the EU
        </LocaleLink>
        .
      </p>
    </section>
  );
}
