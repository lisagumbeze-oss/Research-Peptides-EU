import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, FlaskConical, ShieldCheck, Beaker } from 'lucide-react';
import { Link } from 'react-router-dom';

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
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <BookOpen className="h-4 w-4" />
            Research Resource
          </div>
          <h1>Peptide Guide</h1>
          <p className="text-gray-500 mt-4 font-medium italic max-w-3xl mx-auto">
            A practical reference for researchers working with peptides in controlled laboratory environments.
            All materials are intended for research use workflows only.
          </p>
        </motion.div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
          {guideTopics.map((topic, idx) => (
            <motion.article
              key={topic.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-gray-50 border border-gray-100 rounded-3xl p-7"
            >
              <h3 className="text-xl font-black tracking-tight mb-3">{topic.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{topic.summary}</p>
            </motion.article>
          ))}
        </section>

        <section className="bg-slate-950 text-white rounded-[2.5rem] p-8 md:p-12">
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
              <Link to="/peptide-calculator" className="text-sm text-brand-300 hover:text-brand-200 font-bold transition-colors">
                Open Peptide Calculator
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
