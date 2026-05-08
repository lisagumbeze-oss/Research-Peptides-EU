import React from 'react';
import { Lock, Eye, ShieldCheck, Database } from 'lucide-react';
import { motion } from 'motion/react';

export default function Privacy() {
  return (
    <div className="bg-white min-h-screen pt-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <Lock className="h-4 w-4" />
            Confidentiality Protocols
          </div>
          <h1>Privacy Policy</h1>
          <p className="text-gray-500 mt-4 font-medium italic">Compliant with UK GDPR & Data Protection Act 2018</p>
        </motion.div>

        <div className="prose prose-blue max-w-none space-y-12">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="h-5 w-5 text-blue-600" />
              <h2 className="m-0">Data Overview</h2>
            </div>
            <p>
              Research Peptides UK is committed to protecting the privacy and security of our researchers' information.
              This policy outlines how we collect, use, and safeguard the data you provide when accessing our research catalog or conducting transactions.
            </p>
          </section>

          <section>
            <h2>1. Information We Collect</h2>
            <p>We may collect and process the following categories of personal data:</p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600">
              <li><strong>Identity Data:</strong> Full name and professional affiliation.</li>
              <li><strong>Contact Data:</strong> Email address, telephone number, and delivery address.</li>
              <li><strong>Financial Data:</strong> Transaction records (payment processing is handled by secure 3rd-party encrypted providers).</li>
              <li><strong>Technical Data:</strong> IP address, browser type, and usage patterns on our platform.</li>
            </ul>
          </section>

          <section>
            <h2>2. How We Use Your Data</h2>
            <p>Your data is processed strictly for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600">
              <li>Processing and fulfilling your research orders.</li>
              <li>Managing your account and providing liaison support.</li>
              <li>Ensuring compliance with local research regulations.</li>
              <li>Improving our laboratory product interface.</li>
            </ul>
          </section>

          <section className="bg-blue-50 p-8 rounded-3xl border border-blue-100">
            <div className="flex gap-4 items-start">
              <ShieldCheck className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="m-0 mb-2 font-black text-gray-900 uppercase tracking-tight">ENCRYPTED SECURITY</h3>
                <p className="text-sm leading-relaxed m-0 text-gray-600">
                  We implement industry-standard AES-256 encryption for data at rest and TLS for data in transit. 
                  Our database is periodically audited to ensure the highest levels of researcher confidentiality.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2>3. Data Retention</h2>
            <p>
              We retain transaction and legal data for a period of 6 years following the end of the financial year in which the transaction occurred, as required by UK tax law and for regulatory compliance tracking.
            </p>
          </section>

          <section>
            <h2>4. Your Legal Rights</h2>
            <p>Under UK data protection laws, you have rights including:</p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600">
              <li><strong>Access:</strong> Request copies of your personal data.</li>
              <li><strong>Rectification:</strong> Request correction of inaccurate information.</li>
              <li><strong>Erasure:</strong> Request deletion of your data (subject to legal retention requirements).</li>
              <li><strong>Object:</strong> Object to the processing of your data for specific purposes.</li>
            </ul>
          </section>

          <div className="pt-12 border-t border-gray-100 flex items-center justify-between text-gray-400 text-xs font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              GDPR-REF: PS-PRV-2026
            </div>
            <span>Data Protection Officer</span>
          </div>
        </div>
      </div>
    </div>
  );
}
