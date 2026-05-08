import React from 'react';
import { motion } from 'motion/react';
import { Calculator, Sigma } from 'lucide-react';

function round(value: number) {
  return Math.round(value * 10000) / 10000;
}

export default function PeptideCalculator() {
  const [massMg, setMassMg] = React.useState(10);
  const [diluentMl, setDiluentMl] = React.useState(2);
  const [targetDoseMcg, setTargetDoseMcg] = React.useState(250);

  const concentrationMcgPerMl = diluentMl > 0 ? (massMg * 1000) / diluentMl : 0;
  const requiredVolumeMl = concentrationMcgPerMl > 0 ? targetDoseMcg / concentrationMcgPerMl : 0;

  return (
    <div className="bg-white min-h-screen pt-12 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <Calculator className="h-4 w-4" />
            Lab Utility
          </div>
          <h1>Peptide Calculator</h1>
          <p className="text-gray-500 mt-4 font-medium italic max-w-3xl mx-auto">
            Quick reconstitution and dose-volume estimates for research planning. Validate all values against your SOP and batch documentation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-gray-50 border border-gray-100 rounded-3xl p-8 space-y-6">
            <div>
              <label htmlFor="calc-mass" className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2">
                Peptide Mass (mg)
              </label>
              <input
                id="calc-mass"
                type="number"
                min={0.1}
                step={0.1}
                value={massMg}
                onChange={(e) => setMassMg(Number(e.target.value) || 0)}
                className="w-full p-4 rounded-2xl border border-gray-200 bg-white font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label htmlFor="calc-diluent" className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2">
                Diluent Volume (mL)
              </label>
              <input
                id="calc-diluent"
                type="number"
                min={0.1}
                step={0.1}
                value={diluentMl}
                onChange={(e) => setDiluentMl(Number(e.target.value) || 0)}
                className="w-full p-4 rounded-2xl border border-gray-200 bg-white font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label htmlFor="calc-dose" className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2">
                Target Dose (mcg)
              </label>
              <input
                id="calc-dose"
                type="number"
                min={1}
                step={1}
                value={targetDoseMcg}
                onChange={(e) => setTargetDoseMcg(Number(e.target.value) || 0)}
                className="w-full p-4 rounded-2xl border border-gray-200 bg-white font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </section>

          <section className="bg-slate-950 text-white rounded-3xl p-8">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2">
              <Sigma className="h-5 w-5 text-blue-400" />
              Results
            </h2>
            <div className="space-y-4 text-sm">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-gray-300 text-xs uppercase tracking-widest font-black mb-1">Concentration</p>
                <p className="text-2xl font-black text-blue-300">{round(concentrationMcgPerMl)} mcg/mL</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-gray-300 text-xs uppercase tracking-widest font-black mb-1">Volume per target dose</p>
                <p className="text-2xl font-black text-blue-300">{round(requiredVolumeMl)} mL</p>
              </div>
              <p className="text-gray-400 leading-relaxed">
                For laboratory planning only. Confirm final concentration and dose volumes against method-specific requirements before experimental use.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
