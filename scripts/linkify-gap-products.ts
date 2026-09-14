/**
 * One-off: write curated linked description for glp-3-pen-40mg, then linkify both gap SKUs.
 *   npx tsx scripts/linkify-gap-products.ts           # dry-run
 *   npx tsx scripts/linkify-gap-products.ts --apply
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { tweakForEu } from './sync-uk-product-descriptions';

const APPLY = process.argv.includes('--apply');

const PEN_DESCRIPTION = tweakForEu(`Retatrutide GLP-3 Pen 40mg – Research Grade

Overview

Retatrutide (often referenced as a GLP-3 / triple-agonist research compound) is supplied here in a 40mg prefilled pen format for controlled laboratory handling. This presentation is intended for research teams that require precise, repeatable dispensing in metabolic pathway and receptor-signalling studies. See also our vial-format [Retatrutide research peptide](/product/retatrutide-glp-3) for conventional lyophilized protocols.

Research Context

Retatrutide is studied as a multi-receptor agonist spanning GLP-1, GIP, and glucagon receptor pathways. Labs comparing incretin research materials often also evaluate [Semaglutide GLP-1 research peptide](/product/semaglutide-glp-1) and [Tirzepatide research peptide](/product/tirzepatide) under the same assay conditions. The pen format supports protocol designs where accurate aliquot delivery and reduced open-vial handling are preferred over conventional lyophilized vials.

Product Notes

• Strength: 40mg prefilled research pen
• Format: ready-to-dispense laboratory presentation
• Intended use: scientific research and laboratory assays only

Related Research Compounds

• [Retatrutide research peptide](/product/retatrutide-glp-3)

• [Semaglutide GLP-1 research peptide](/product/semaglutide-glp-1)

• [Tirzepatide research peptide](/product/tirzepatide)

• [Cagrilintide research peptide](/product/gagrilintide-5mg)

Important

This product is supplied strictly for scientific research and laboratory use and is not intended for human or veterinary consumption. [Buy research peptides online](/shop) from Research Peptides EU for laboratory procurement only.
`);

async function main() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials');
  const supabase = createClient(url, key);

  const inbound = [...PEN_DESCRIPTION.matchAll(/\]\((\/[^)]+)\)/g)].map((m) => m[1]);
  console.log({
    mode: APPLY ? 'apply' : 'dry-run',
    slug: 'glp-3-pen-40mg',
    descLen: PEN_DESCRIPTION.length,
    inboundCount: inbound.length,
    inbound,
    preview: PEN_DESCRIPTION.slice(0, 280).replace(/\n/g, ' / '),
  });

  if (!APPLY) {
    console.log('Dry-run only. Pass --apply to update Supabase.');
    return;
  }

  const { data, error } = await supabase
    .from('products')
    .update({ description: PEN_DESCRIPTION })
    .eq('slug', 'glp-3-pen-40mg')
    .select('slug, title');
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error('glp-3-pen-40mg not found');
  console.log('Updated', data[0]);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
