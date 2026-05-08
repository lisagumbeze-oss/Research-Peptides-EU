import React from 'react';
import { ShieldAlert, Scale, FileText } from 'lucide-react';
import { motion } from 'motion/react';

export default function Terms() {
  return (
    <div className="bg-white min-h-screen pt-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <Scale className="h-4 w-4" />
            Legal Protocols
          </div>
          <h1>Terms & Conditions</h1>
          <p className="text-gray-500 mt-4 font-medium italic">Last Updated: April 2026</p>
        </motion.div>

        <div className="prose prose-blue max-w-none space-y-12">
          <section className="bg-red-50/50 p-8 rounded-3xl border border-red-100">
            <div className="flex gap-4 items-start">
              <ShieldAlert className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-red-900 font-black uppercase tracking-tight m-0 mb-2">CRITICAL RESEARCH DISCLAIMER</h3>
                <p className="text-red-800 text-sm leading-relaxed m-0">
                  All products available on Research Peptides UK are strictly for <strong>Laboratory Research, Scientific, and Industrial use only</strong>.
                  These products are NOT for human or veterinary use. They are not intended to diagnose, treat, cure, or prevent any disease. 
                  By purchasing, you acknowledge the inherent risks and certify that you are a qualified researcher or laboratory professional.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2>1. Eligibility & Agreement</h2>
            <p>
              By accessing Research Peptides UK, you represent and warrant that you are at least 18 years of age and possess the legal authority to enter into this agreement.
              The use of our products is restricted to permitted research applications under local laws and regulations.
            </p>
          </section>

          <section>
            <h2>2. Product Use & Handling</h2>
            <p>
              The compounds provided are experimental in nature. The buyer assumes all responsibility for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Verification of the chemical compatibility and safety of the compounds.</li>
              <li>Compliance with all workplace safety standards (COSHH, OSHA, etc.).</li>
              <li>Safe disposal of materials following research completion.</li>
            </ul>
          </section>

          <section>
            <h2>3. No Return Policy</h2>
            <p>
              Due to the highly sensitive pharmaceutical nature of peptides and the requirement for strictly controlled temperature environments, <strong>Research Peptides UK maintains a strict NO RETURN policy</strong>.
              Once an item leaves our controlled logistics chain, we cannot guarantee its purity to subsequent researchers; therefore, all sales are final.
            </p>
          </section>

          <section>
            <h2>4. Limitation of Liability</h2>
            <p>
              Research Peptides UK, its directors, and employees shall not be liable for any incidental, consequential, or indirect damages arising from the use or inability to use our products.
              Our total liability in any circumstance is capped at the purchase price of the specific product in question.
            </p>
          </section>

          <section>
            <h2>5. Compliance with Laws</h2>
            <p>
              Research regulations vary by jurisdiction. It is the buyer's sole responsibility to ensure that the acquisition and possession of these compounds comply with the laws of their specific country, state, or region.
            </p>
          </section>

          <div className="pt-12 border-t border-gray-100 flex items-center justify-between text-gray-400 text-xs font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Document Reference: PS-TERMS-2026
            </div>
            <span>Research Peptides UK Operations</span>
          </div>
        </div>
      </div>
    </div>
  );
}
