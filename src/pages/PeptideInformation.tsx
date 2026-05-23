import React from 'react';
import { motion } from 'motion/react';
import { BookText, FlaskConical, TestTube2 } from 'lucide-react';

const infoArticles = [
  { title: 'Intro to Peptides', readTime: '8 min', summary: 'Core terminology, structure basics, and key lab concepts for handling peptide compounds.' },
  { title: 'Peptide Synthesis Overview', readTime: '10 min', summary: 'High-level explanation of solid-phase workflows, cleavage steps, and practical synthesis checkpoints.' },
  { title: 'Peptide Solubility', readTime: '7 min', summary: 'Factors affecting dissolution and practical solvent selection guidance for research use cases.' },
  { title: 'Purification Pathways', readTime: '12 min', summary: 'How chromatographic techniques are used to improve purity and consistency between batches.' },
];

export default function PeptideInformation() {
  return (
    <div className="bg-white min-h-screen pt-12 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <BookText className="h-4 w-4" />
            Educational Resources
          </div>
          <h1>Peptide Information</h1>
          <p className="text-gray-500 mt-4 font-medium italic max-w-3xl mx-auto">
            Structured learning resources for peptide chemistry, synthesis, purification, and analytical interpretation in research settings.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {infoArticles.map((article, idx) => (
            <motion.article
              key={article.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-gray-50 border border-gray-100 rounded-3xl p-7"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-600 mb-2">{article.readTime}</p>
              <h3 className="text-xl font-black tracking-tight mb-3">{article.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{article.summary}</p>
            </motion.article>
          ))}
        </div>

        <section className="mt-10 bg-slate-950 text-white rounded-3xl p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <FlaskConical className="h-5 w-5 text-brand-400 mb-2" />
            <h4 className="font-black text-sm uppercase tracking-widest mb-1">Research Use Scope</h4>
            <p className="text-sm text-gray-300">Content is intended for laboratory training and research operations only.</p>
          </div>
          <div>
            <TestTube2 className="h-5 w-5 text-brand-400 mb-2" />
            <h4 className="font-black text-sm uppercase tracking-widest mb-1">Method Alignment</h4>
            <p className="text-sm text-gray-300">Always align calculations and handling steps to your internal SOP and compliance requirements.</p>
          </div>
          <div>
            <BookText className="h-5 w-5 text-brand-400 mb-2" />
            <h4 className="font-black text-sm uppercase tracking-widest mb-1">Need Support?</h4>
            <p className="text-sm text-gray-300">Contact: info@researchpeptide.eu</p>
          </div>
        </section>
      </div>
    </div>
  );
}
