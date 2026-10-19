import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function main() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url!, key);

  const updates = [
    {
      slug: 'tirzepatide',
      title: 'Tirzepatide | How to Buy Tirzepatide in the Netherlands',
      description:
        'Tirzepatide research peptide — dual GIP and GLP-1 receptor agonist for laboratory incretin and metabolic pathway studies. Where can I buy Tirzepatide in the Netherlands? Order from Research Peptides EU with COA documentation and EU dispatch. How much for Tirzepatide in Germany and the UK? Check live catalog pricing for research vials. How to buy Tirzepatide in Italy: add to cart, checkout in EUR, and we ship temperature-controlled across Europe. Often compared with Semaglutide GLP-1 research peptide under matched assay conditions. Research use only — not for human or veterinary use.',
    },
    {
      slug: 'semaglutide',
      title: 'Semaglutide | Where Can I Buy Semaglutide in Germany',
      description:
        'Semaglutide GLP-1 research peptide for selective GLP-1 receptor agonist laboratory models. How to buy Semaglutide in Germany? Order research-grade vials from Research Peptides EU with HPLC/COA pathways. Where can I buy Semaglutide in the UK and Netherlands? Ship from our European catalog with EUR pricing. How much for Semaglutide in Italy and Spain? See live product pricing before checkout. Common comparator alongside Tirzepatide dual agonist research material. Research use only — not for human or veterinary use.',
    },
    {
      slug: 'semaglutide-glp-1',
      title: 'Semaglutide GLP-1 | How Much for Semaglutide in the UK',
      description:
        'Semaglutide GLP-1 research peptide for selective GLP-1 receptor agonist laboratory models. How much for Semaglutide in the UK? Check live EUR catalog pricing. Where can I buy Semaglutide GLP-1 in France and the Netherlands? Research Peptides EU supplies COA-verified material for laboratory procurement. How to buy Semaglutide in Italy: add to cart and checkout for temperature-controlled EU dispatch. Research use only — not for human or veterinary use.',
    },
    {
      slug: 'hgh-fragment-176-191',
      description:
        'HGH Fragment 176-191 research peptide for metabolic fragment studies. Maps to fragment 176-191 / HGH fragment demand in DE, US, NL and UK research catalogs. Research use only.',
    },
    {
      slug: 'hgh-191aa-somatropin',
      description:
        'HGH 191AA (Somatropin) research material. HGH191aa / HGH 191aa peptide queries from US and DE labs are served as laboratory research compounds only — not for human use.',
    },
    {
      slug: 'hexarelin-2mg',
      description:
        'Hexarelin research peptide (hexarelin acetate) for GH-axis laboratory studies. Listed for DE, NL and US research procurement. Research use only.',
    },
    {
      slug: 'glutathione-peptide',
      description:
        'Glutathione peptide research material for redox and peptide-chemistry studies. Glutathione peptide / peptide glutathione demand from NL, US and AU labs. Research use only.',
    },
    {
      slug: 'peg-mgf',
      description:
        'PEG-MGF research peptide for growth-factor pathway studies. PEG MGF online / buy PEG-MGF research material for NL and AU laboratory catalogs. Research use only.',
    },
    {
      slug: 'gonadorelin-acetate',
      description:
        'Gonadorelin acetate (GnRH) research material. Kopen gonadoreline peptide / buy gonadorelin queries are fulfilled for laboratory research only.',
    },
    {
      slug: 'aicar',
      description:
        'AICAR research compound for AMPK-pathway laboratory studies. AICAR peptide listed for AU and EU research catalogs. Research use only.',
    },
    {
      slug: 'glow-blend-ghk-cu-bpc157-tb500',
      description:
        'Glow blend peptide research material (GHK-Cu / BPC-157 / TB-500) for multi-pathway assays. Glow blend peptide demand from US and UK research catalogs. Research use only.',
    },
    {
      slug: 'bacteriostatic-water-0-9-benzyl-alcohol-10ml-hospira-injection-usp',
      description:
        'Hospira USP bacteriostatic water 0.9% benzyl alcohol 10mL. Hospira bacteriostatic water 10 ml / Hospira bac water 10ml for US and UK laboratory reconstitution. Research use only.',
    },
  ];

  for (const row of updates) {
    const payload: { description: string; title?: string } = {
      description: row.description,
    };
    if ('title' in row && row.title) payload.title = row.title;

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('slug', row.slug)
      .select('slug,title');
    if (error) console.error(row.slug, error.message);
    else if (!data?.length) console.warn('missing', row.slug);
    else console.log('Updated', row.slug, data[0]?.title ?? '');
  }
}
main();
