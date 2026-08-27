import { BookOpen, FlaskConical, ShieldCheck, Beaker } from 'lucide-react';
import { LocaleLink } from '../i18n/LocaleLink';
import { Reveal } from '../design-system';
import { staggerDelay } from '../design-system/motion';

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

        {/* Answer Capsule for GEO Optimization */}
        <Reveal delay={0.08} className="bg-brand-50 border-l-4 border-brand-500 p-6 rounded-r-2xl mb-12 text-left max-w-3xl mx-auto shadow-sm">
          <p className="text-navy-950 font-bold text-lg mb-2">Quick Answer: What are Research Peptides?</p>
          <p className="text-steel-700 font-medium leading-relaxed">
            Research peptides are synthesized short chains of amino acids utilized exclusively for in vitro laboratory studies. To maintain structural stability, they require lyophilization, cold-chain storage, and careful reconstitution using bacteriostatic water prior to experimental application.
          </p>
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
