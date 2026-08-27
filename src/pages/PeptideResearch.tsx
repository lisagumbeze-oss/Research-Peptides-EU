import { Microscope, ShieldAlert } from 'lucide-react';
import { Reveal } from '../design-system';
import { staggerDelay } from '../design-system/motion';

type ResearchCard = {
  category: string;
  readTime: string;
  title: string;
  summary: string;
};

const researchCards: ResearchCard[] = [
  {
    category: 'Weight & Metabolic',
    readTime: '7 min',
    title: 'GLP-1 Pathway Peptides in Metabolic Research',
    summary: 'A review-oriented overview of receptor pathways, satiety signaling, and protocol design considerations.',
  },
  {
    category: 'Regenerative',
    readTime: '6 min',
    title: 'BPC-157 and TB-500 Mechanistic Notes',
    summary: 'Summary of preclinical pathway discussions related to tissue signaling and experimental model design.',
  },
  {
    category: 'Mitochondrial',
    readTime: '8 min',
    title: 'Mitochondria-Targeted Peptides',
    summary: 'Research framing for mitochondrial peptide investigations and common endpoint measurements.',
  },
  {
    category: 'Anabolic Signaling',
    readTime: '5 min',
    title: 'IGF Axis in Experimental Context',
    summary: 'Practical interpretation notes for dose framework, assay controls, and reproducibility considerations.',
  },
];

export default function PeptideResearch() {
  return (
    <div className="bg-white min-h-screen pt-12 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Reveal className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <Microscope className="h-4 w-4" />
            Evidence Summaries
          </div>
          <h1>Peptide Research</h1>
          <p className="text-gray-500 mt-4 font-medium italic max-w-3xl mx-auto">
            Curated research briefs and mechanistic overviews to support protocol planning and scientific discussion.
          </p>
        </Reveal>

        <Reveal className="bg-amber-50 border border-amber-100 rounded-3xl p-6 mb-8 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5" />
          <p className="text-sm text-amber-900 leading-relaxed">
            Research Use Only: Content is educational and not medical advice. Products and references are intended for laboratory research contexts only.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {researchCards.map((card, idx) => (
            <Reveal
              key={card.title}
              as="article"
              delay={staggerDelay(idx)}
              className="bg-gray-50 border border-gray-100 rounded-3xl p-7"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-600">{card.category}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{card.readTime}</span>
              </div>
              <h3 className="text-xl font-black tracking-tight mb-3">{card.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{card.summary}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
