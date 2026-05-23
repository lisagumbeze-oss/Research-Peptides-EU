import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MessageSquare, Clock, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { Container, Button, GlassPanel, GlowPanel, Reveal } from '../design-system';
import { HQ_LOCATION, SUPPORT_EMAIL, SUPPORT_PHONE } from '../config/brand';
import { useToastStore } from '../store/useToastStore';
import { postContactEmail } from '../lib/transactionalEmailApi';

export default function Contact() {
  const { t } = useTranslation('legal');
  const addToast = useToastStore((state) => state.addToast);
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [subject, setSubject] = React.useState('General Research Inquiry');
  const [message, setMessage] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitState, setSubmitState] = React.useState<'idle' | 'success' | 'error'>('idle');
  const [submitErrorDetail, setSubmitErrorDetail] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitState('idle');
    setSubmitErrorDetail('');
    try {
      await postContactEmail({ fullName, email, subject, message });
      setSubmitState('success');
      addToast('Dispatch sent successfully. We will reply shortly.', 'success');
      setFullName('');
      setEmail('');
      setSubject('General Research Inquiry');
      setMessage('');
    } catch (err: unknown) {
      const detail = err instanceof Error ? err.message : 'Dispatch failed. Please try again in a moment.';
      setSubmitState('error');
      setSubmitErrorDetail(detail);
      addToast('Dispatch failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-mist-50 min-h-screen pt-12">
      <Container className="py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Left: Contact Info */}
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
                <MessageSquare className="h-4 w-4" aria-hidden />
                {t('contact.eyebrow')}
              </div>
              <h1 className="text-h1 text-navy-950 mb-6">{t('contact.title')}</h1>
              <p className="text-lg text-steel-600 leading-relaxed max-w-lg">{t('contact.subtitle')}</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <Reveal>
              <GlassPanel variant="light" padding="sm" className="p-6 shadow-card h-full">
                <Mail className="h-6 w-6 text-brand-600 mb-3" aria-hidden />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-silver-400 mb-2">
                  {t('contact.emailLabel')}
                </h4>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-navy-950 break-words hover:text-brand-600">
                  {SUPPORT_EMAIL}
                </a>
              </GlassPanel>
              </Reveal>
              <Reveal delay={0.05}>
              <GlassPanel variant="light" padding="sm" className="p-6 shadow-card h-full">
                <Phone className="h-6 w-6 text-brand-600 mb-3" aria-hidden />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-silver-400 mb-2">
                  {t('contact.phoneLabel')}
                </h4>
                <p className="font-semibold text-navy-950">{SUPPORT_PHONE}</p>
              </GlassPanel>
              </Reveal>
              <Reveal delay={0.08} className="sm:col-span-2">
              <GlassPanel variant="light" padding="sm" className="p-6 shadow-card">
                <MapPin className="h-6 w-6 text-brand-600 mb-3" aria-hidden />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-silver-400 mb-2">
                  {t('contact.locationLabel')}
                </h4>
                <p className="font-semibold text-navy-950">{t('contact.locationValue')}</p>
                <p className="text-sm text-steel-600 mt-1">{HQ_LOCATION}</p>
              </GlassPanel>
              </Reveal>
              <Reveal delay={0.1} className="sm:col-span-2">
              <GlassPanel variant="light" padding="sm" className="p-6 shadow-card">
                <Clock className="h-6 w-6 text-brand-600 mb-3" aria-hidden />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-silver-400 mb-2">
                  Support hours (CET)
                </h4>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-navy-950">Monday — Friday</span>
                  <span className="text-brand-600 font-semibold">09:00 – 18:00</span>
                </div>
              </GlassPanel>
              </Reveal>
            </div>

            <GlowPanel glow="brand" className="mt-12 p-8 bg-gradient-cta text-white relative overflow-hidden rounded-[2.5rem]">
               <ShieldCheck className="absolute -right-8 -bottom-8 h-48 w-48 text-white/10 pointer-events-none" aria-hidden />
               <h4 className="text-lg font-bold mb-2">Privacy Guaranteed</h4>
               <p className="text-brand-100 text-sm leading-relaxed">
                 All inquiries are handled with strict researcher confidentiality. We do not share institution data with third parties.
               </p>
            </GlowPanel>
          </div>

          {/* Right: Inquiry Form */}
          <Reveal>
          <GlassPanel variant="light" padding="lg" className="shadow-glow p-8 md:p-12">
            <h3 className="text-2xl font-black mb-8 tracking-tight">Send a Dispatch</h3>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="contact-full-name" className="text-[10px] font-black uppercase tracking-[0.2em] text-steel-600 ml-4">Full Name</label>
                  <input 
                    id="contact-full-name"
                    type="text" 
                    placeholder="Researcher Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    autoComplete="name"
                    className="w-full px-6 py-4 bg-mist-50 border border-brand-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:bg-white transition-all text-sm font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="contact-email" className="text-[10px] font-black uppercase tracking-[0.2em] text-steel-600 ml-4">Email Address</label>
                  <input 
                    id="contact-email"
                    type="email" 
                    placeholder="official@institution.eu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full px-6 py-4 bg-mist-50 border border-brand-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:bg-white transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-subject" className="text-[10px] font-black uppercase tracking-[0.2em] text-steel-600 ml-4">Subject</label>
                <select
                  id="contact-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-6 py-4 bg-mist-50 border border-brand-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:bg-white transition-all text-sm font-medium appearance-none"
                >
                  <option>General Research Inquiry</option>
                  <option>Bulk/Institutional Procurement</option>
                  <option>Product Stability Data (COA)</option>
                  <option>Shipping & Logistics Liaison</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-message" className="text-[10px] font-black uppercase tracking-[0.2em] text-steel-600 ml-4">Your Message</label>
                <textarea 
                  id="contact-message"
                  rows={5}
                  placeholder="How can our technical team assist your research?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full px-6 py-4 bg-mist-50 border border-brand-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:bg-white transition-all text-sm font-medium"
                ></textarea>
              </div>

              {submitState === 'success' && (
                <p className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  Dispatch sent successfully. We will reply shortly.
                </p>
              )}
              {submitState === 'error' && (
                <div className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 space-y-1">
                  <p>Dispatch failed.</p>
                  {submitErrorDetail && (
                    <p className="font-medium text-red-600/95 whitespace-pre-wrap break-words leading-relaxed">{submitErrorDetail}</p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-500 text-white font-black py-5 rounded-2xl hover:bg-brand-600 transition-all active:scale-95 shadow-lg shadow-glow flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-60"
              >
                Transmit Dispatch
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </form>
          </GlassPanel>
          </Reveal>

        </div>
      </Container>
    </div>
  );
}
