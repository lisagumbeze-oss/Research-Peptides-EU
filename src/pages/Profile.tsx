import { useTranslation } from 'react-i18next';
import { Mail, Shield, Calendar, MapPin, CreditCard } from 'lucide-react';
import { formatLocaleDate } from '../lib/formatLocaleDate';
import { motion } from 'motion/react';
import { AccountShell } from '../components/account/AccountShell';
import { useAuthStore } from '../store/useAuthStore';

export default function Profile() {
  const { i18n } = useTranslation();
  const { profile } = useAuthStore();

  return (
    <AccountShell title="Account overview" subtitle="Manage your researcher profile and preferences">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <section className="bg-white p-8 rounded-3xl border border-brand-100 shadow-card">
          <h3 className="font-display font-bold text-lg text-navy-950 mb-6 flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-600" aria-hidden />
            Account security
          </h3>
          <div className="space-y-5">
            <div className="flex gap-3">
              <Mail className="h-5 w-5 text-silver-400 shrink-0" aria-hidden />
              <div>
                <p className="text-caption text-brand-600">Email</p>
                <p className="font-semibold text-navy-950">{profile?.email}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Calendar className="h-5 w-5 text-silver-400 shrink-0" aria-hidden />
              <div>
                <p className="text-caption text-brand-600">Member since</p>
                <p className="font-semibold text-navy-950">
                  {profile?.created_at
                    ? formatLocaleDate(profile.created_at, i18n.language, {
                        month: 'long',
                        year: 'numeric',
                      })
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-navy-950 text-white p-8 rounded-3xl shadow-elevated relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-glow opacity-40 pointer-events-none" aria-hidden />
          <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2 relative z-10">
            <MapPin className="h-5 w-5 text-brand-400" aria-hidden />
            EU shipping address
          </h3>
          <div className="relative z-10 p-5 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-caption text-brand-300 mb-2">Primary laboratory address</p>
            <p className="text-sm text-silver-400">No default address saved yet.</p>
            <button
              type="button"
              className="text-xs font-semibold text-brand-300 underline mt-3 hover:text-white transition-colors"
            >
              Set address at checkout
            </button>
          </div>
        </section>
      </motion.div>

      <section className="mt-6 bg-white p-8 rounded-3xl border border-brand-100 shadow-card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display font-bold text-lg flex items-center gap-2 text-navy-950">
            <CreditCard className="h-5 w-5 text-brand-600" aria-hidden />
            Activity overview
          </h3>
          <span className="text-caption text-brand-600">Verified account</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-brand-50 border border-brand-100">
            <p className="text-caption text-brand-600 mb-1">Total spent</p>
            <p className="text-2xl font-display font-bold text-brand-700">—</p>
          </div>
          <div className="p-5 rounded-2xl bg-mist-50 border border-brand-100">
            <p className="text-caption text-brand-600 mb-1">Open orders</p>
            <p className="text-2xl font-display font-bold text-navy-950">—</p>
          </div>
        </div>
      </section>
    </AccountShell>
  );
}
