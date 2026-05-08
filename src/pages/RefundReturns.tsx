import React from 'react';
import { motion } from 'motion/react';
import { RotateCcw, AlertTriangle, ShieldCheck, Mail } from 'lucide-react';

export default function RefundReturns() {
  return (
    <div className="bg-white min-h-screen pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <RotateCcw className="h-4 w-4" />
            Returns Protocol
          </div>
          <h1>Refund & Returns</h1>
          <p className="text-gray-500 mt-4 font-medium italic max-w-2xl mx-auto">
            Clear guidance for damaged shipments, order issues, and refund eligibility under our research-only handling model.
          </p>
        </motion.div>

        <div className="space-y-10">
          <section className="bg-red-50/60 border border-red-100 rounded-3xl p-8">
            <div className="flex gap-4 items-start">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-red-900 font-black uppercase tracking-tight m-0 mb-2">Research Product Handling Notice</h3>
                <p className="text-red-800 text-sm leading-relaxed m-0">
                  Due to strict storage and chain-of-custody requirements, returns are limited. Once products leave controlled logistics,
                  purity and handling cannot be independently guaranteed for resale or redistribution.
                </p>
              </div>
            </div>
          </section>

          <section className="prose prose-blue max-w-none">
            <h2>1. Return Window</h2>
            <p>
              If your order arrives damaged, incomplete, or incorrect, contact us within <strong>7 days of delivery</strong>. Include your order number,
              shipping label photo, and clear product images so our support team can verify the claim quickly.
            </p>

            <h2>2. Eligible Cases</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Incorrect item shipped versus your confirmation email.</li>
              <li>Transit damage affecting vial integrity or packaging seal.</li>
              <li>Missing item from a tracked, completed shipment.</li>
            </ul>

            <h2>3. Non-Eligible Cases</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Change-of-mind purchases after dispatch.</li>
              <li>Opened, used, or improperly stored products.</li>
              <li>Requests raised after the review window has expired.</li>
              <li>Sale and clearance items unless a verified fulfillment error occurred.</li>
            </ul>

            <h2>4. Refund Resolution</h2>
            <p>
              Approved cases are resolved via replacement, store credit, or refund to the original payment method. Processing times can vary by payment provider,
              but most approved refunds appear within 5-10 business days.
            </p>

            <h2>5. Return Shipping</h2>
            <p>
              Do not return any item before approval from support. If a physical return is authorized, we will provide instructions and a reference code.
              Unauthorized returns may be rejected.
            </p>
          </section>

          <section className="bg-slate-950 text-white rounded-3xl p-8 md:p-10">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <h3 className="text-white text-2xl font-black mb-3">Need help with a return request?</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Contact the Research Peptides UK support desk with your order details and we will guide you through the correct review process.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <a href="mailto:info@researchpeptide.uk" className="text-blue-300 hover:text-blue-200 transition-colors">
                    info@researchpeptide.uk
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <ShieldCheck className="h-4 w-4 text-blue-400" />
                  Claims are reviewed against dispatch and tracking records.
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
