import React from 'react';
import { motion } from 'motion/react';
import { Building2, BadgeCheck, Microscope, Mail, Phone } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="bg-white min-h-screen pt-12 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <Building2 className="h-4 w-4" />
            About Research Peptides UK
          </div>
          <h1>About Us</h1>
          <p className="text-gray-500 mt-4 font-medium italic max-w-3xl mx-auto">
            Research Peptides UK supports laboratory teams with high-quality research compounds, transparent documentation,
            and responsive technical support for institutional workflows.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2 bg-gray-50 border border-gray-100 rounded-3xl p-8">
            <h2 className="text-2xl font-black mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              We focus on consistency, documentation, and researcher confidence. Every operational process is designed
              to support repeatable scientific work, from product handling to support response standards.
            </p>
          </div>
          <div className="bg-slate-950 text-white rounded-3xl p-8">
            <BadgeCheck className="h-6 w-6 text-blue-400 mb-3" />
            <h3 className="font-black text-lg mb-2">Quality Focus</h3>
            <p className="text-sm text-gray-300">
              Batch-level verification and clear documentation are central to our supply approach.
            </p>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8">
            <Microscope className="h-6 w-6 text-blue-600 mb-3" />
            <h3 className="text-lg font-black mb-2">Research-Only Positioning</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              All listed compounds are offered for laboratory and scientific research contexts only and are not marketed
              for human or veterinary use.
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8">
            <h3 className="text-lg font-black mb-4">Support Contact</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                info@researchpeptide.uk
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-600" />
                +44 7508 227474
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
