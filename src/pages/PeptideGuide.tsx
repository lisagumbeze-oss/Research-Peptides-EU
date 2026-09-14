import { BookOpen, FlaskConical, ShieldCheck, Beaker } from 'lucide-react';
import { LocaleLink } from '../i18n/LocaleLink';
import { Reveal } from '../design-system';
import { staggerDelay } from '../design-system/motion';
import { AnswerCapsule } from '../components/seo/AnswerCapsule';
import { usePageSeo } from '../seo/SeoProvider';
import { HQ_LOCATION } from '../config/brand';

const guideTopics = [
  {
    title: 'Peptide Fundamentals',
    summary:
      'A practical introduction to amino-acid chains, sequence notation, and why peptides are central to controlled laboratory workflows.',
  },
  {
    title: 'Synthesis & Purification',
    summary:
      'An overview of SPPS, purification strategies, and analytical checkpoints used to ensure consistent research batches.',
  },
  {
    title: 'Storage & Reconstitution',
    summary:
      'Recommended handling protocols for lyophilized compounds and reconstituted solutions, including contamination controls.',
  },
  {
    title: 'Quality Verification',
    summary:
      'How to read HPLC/LC-MS documentation, assess batch suitability, and maintain repeatability across experiments.',
  },
];

export default function PeptideGuide() {
  usePageSeo({
    title: 'Peptide Guide | Research Peptides EU',
    description:
      'Practical guide to research peptides: fundamentals, storage, reconstitution, and quality verification for laboratory workflows.',
    canonicalPath: '/peptide-guide',
  });

  return (
    <div className="bg-white min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Reveal className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <BookOpen className="h-4 w-4" />
            Research Resource
          </div>
          <h1>Peptide Guide</h1>
          <p className="text-gray-500 mt-4 font-medium italic max-w-3xl mx-auto">
            A practical reference for researchers working with peptides in controlled laboratory environments.
            All materials are intended for research use workflows only.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mb-12 max-w-3xl mx-auto">
          <AnswerCapsule title="Quick answer: what are research peptides?">
            <p>
              Research peptides are short chains of amino acids supplied for controlled laboratory and in-vitro
              studies only — not for human consumption. Typical workflows use lyophilized material, cold-chain
              storage, and reconstitution (often with bacteriostatic water) before experiments. Research Peptides
              EU dispatches from {HQ_LOCATION} with EUR pricing across the EU. See the{' '}
              <LocaleLink to="/shop" className="text-brand-700 font-semibold hover:underline">
                catalog
              </LocaleLink>{' '}
              and{' '}
              <LocaleLink to="/coas" className="text-brand-700 font-semibold hover:underline">
                COA library
              </LocaleLink>
              .
            </p>
          </AnswerCapsule>
        </Reveal>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
          {guideTopics.map((topic, idx) => (
            <Reveal
              key={topic.title}
              as="article"
              delay={staggerDelay(idx)}
              className="bg-gray-50 border border-gray-100 rounded-3xl p-7"
            >
              <h3 className="text-xl font-black tracking-tight mb-3">{topic.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{topic.summary}</p>
            </Reveal>
          ))}
        </section>

        <Reveal as="section" className="bg-slate-950 text-white rounded-[2.5rem] p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <FlaskConical className="h-6 w-6 text-brand-400 mb-3" />
              <h4 className="font-black uppercase tracking-wider text-sm mb-2">Application Scope</h4>
              <p className="text-sm text-gray-300">In vitro and analytical laboratory workflows only.</p>
            </div>
            <div>
              <ShieldCheck className="h-6 w-6 text-brand-400 mb-3" />
              <h4 className="font-black uppercase tracking-wider text-sm mb-2">Compliance First</h4>
              <p className="text-sm text-gray-300">Researchers are responsible for local regulatory compliance and approved handling.</p>
            </div>
            <div>
              <Beaker className="h-6 w-6 text-brand-400 mb-3" />
              <h4 className="font-black uppercase tracking-wider text-sm mb-2">Need Calculation Help?</h4>
              <LocaleLink to="/peptide-calculator" className="text-sm text-brand-300 hover:text-brand-200 font-bold transition-colors">
                Open Peptide Calculator
              </LocaleLink>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
