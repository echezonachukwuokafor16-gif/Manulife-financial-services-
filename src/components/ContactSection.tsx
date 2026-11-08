/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Building, Clock, ShieldCheck, UserCheck, ArrowRight } from 'lucide-react';
import { CompanyContactSettings } from '../types';
import { storage } from '../lib/storage';
import { WhatsAppFilledIcon, TelegramFilledIcon } from './SocialSupportIcons';
import { useLanguage } from '../context/LanguageContext';

export const ContactSection: React.FC = () => {
  const { t } = useLanguage();
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [contactSettings, setContactSettings] = useState<CompanyContactSettings | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Personal Loan Advisory',
    message: '',
  });

  useEffect(() => {
    const fetchContact = async () => {
      const data = await storage.getContactSettings();
      setContactSettings(data);
    };
    fetchContact();
    window.addEventListener('verdant_storage_update', fetchContact);
    return () => window.removeEventListener('verdant_storage_update', fetchContact);
  }, []);

  const supportEmail = contactSettings?.supportEmail || 'support@manulife-financial.com';
  const directLiaison = contactSettings?.directLiaisonEmail || 'echezonachukwuokafor16@gmail.com';
  const phone = contactSettings?.supportPhone || '+44 20 7946 0880';
  const londonMail = contactSettings?.londonEmail || 'london.desk@manulife-financial.com';
  const zurichMail = contactSettings?.zurichEmail || 'zurich.desk@manulife-financial.com';
  const nyMail = contactSettings?.nyEmail || 'ny.desk@manulife-financial.com';
  const hours = contactSettings?.officeHours || 'Underwriting Committee convenes continuously Monday through Friday across global market sessions.';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setFormSubmitted(true);
  };

  return (
    <section id="contact" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-emerald-800 mb-3">
            <Mail className="w-4 h-4" />
            <span>Client Services & Private Advisory</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            {t('contact.title', 'Connect with Our Underwriting Advisory Team')}
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            {t('contact.subtitle', 'Speak directly with a senior credit officer or submit a confidential inquiry regarding custom loan structuring, cross-border collateral, or corporate facility syndication.')}
          </p>
        </div>

        {/* 2-Column: Left Form, Right Institutional Global Offices */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Contact Form */}
          <div className="lg:col-span-7 bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Send an Advisory Inquiry
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Our underwriting specialists reply within 2 hours during global market hours.
            </p>

            {formSubmitted ? (
              <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-emerald-950 mb-1">
                  Inquiry Dispatched Successfully
                </h4>
                <p className="text-xs text-emerald-800 max-w-sm mx-auto mb-4 leading-relaxed">
                  Thank you, {formData.name}. A designated credit relationship officer has been assigned to your message and will contact you at {formData.email}.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFormSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', subject: 'Personal Loan Advisory', message: '' });
                  }}
                  className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition-colors"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Victoria Sterling"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="v.sterling@corporate.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+44 20 7946 0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Advisory Area
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    >
                      <option value="Personal Loan Advisory">Personal & Executive Facility</option>
                      <option value="Property Purchase Financing">Property & Real Estate Debt</option>
                      <option value="Commercial Expansion">Commercial Expansion & Working Capital</option>
                      <option value="Underwriting Question">Existing Application Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Requirements / Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Briefly describe your capital requirements or desired loan timeline..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 resize-none"
                  />
                </div>

                <div className="text-[11px] text-slate-500">
                  By submitting, you consent to secure institutional communications in accordance with our Privacy Policy.
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Submit Confidential Inquiry</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* Right: Global Desk Locations & Direct Liaison */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Primary Direct Officer Liaison Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Direct Credit Underwriter Desk</span>
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-mono">
                  Escalation Liaison
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-white">
                  Direct Officer Liaison Inbox
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Confidential direct contact for underwriting committee appeals, corporate credit facilities, and disbursement verification.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a href={`mailto:${directLiaison}`} className="text-emerald-300 hover:text-white font-mono font-semibold break-all underline">
                    {directLiaison}
                  </a>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-mono text-slate-300">{phone}</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {supportEmail}
                </span>
              </div>
            </div>

            {/* WhatsApp & Telegram Instant Support Desk Card */}
            <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white rounded-2xl p-6 border border-emerald-800/60 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Instant Messaging & Encrypted Channels</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Underwriters Online
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-white">
                  WhatsApp & Telegram Borrower Concierge
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Connect directly with senior credit committee advisors and underwriting officers on verified institutional encrypted channels for rapid document review and real-time guidance.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* WhatsApp Action Button */}
                <a
                  href={contactSettings?.whatsappLink || `https://wa.me/${(contactSettings?.whatsappNumber || '+447458198234').replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 rounded-xl transition-all flex items-center gap-3 group shadow-sm hover:border-emerald-400"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#25D366] text-white flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
                    <WhatsAppFilledIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">WhatsApp Business</div>
                    <div className="text-xs font-mono font-bold text-white truncate">{contactSettings?.whatsappNumber || '+44 7458 198234'}</div>
                    <div className="text-[10px] text-emerald-400/90 flex items-center gap-1 mt-0.5 font-medium">
                      <span>Chat with Underwriter</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                  </div>
                </a>

                {/* Telegram Action Button */}
                <a
                  href={contactSettings?.telegramLink || `https://t.me/${(contactSettings?.telegramUsername || '@ManulifeFinancialSupport').replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 rounded-xl transition-all flex items-center gap-3 group shadow-sm hover:border-sky-400"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#229ED9] text-white flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
                    <TelegramFilledIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase font-bold text-sky-300 tracking-wider">Telegram Official</div>
                    <div className="text-xs font-mono font-bold text-white truncate">{contactSettings?.telegramUsername || '@ManulifeFinancialSupport'}</div>
                    <div className="text-[10px] text-sky-400/90 flex items-center gap-1 mt-0.5 font-medium">
                      <span>Open Telegram Channel</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                  </div>
                </a>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Global Lending Desks
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Official physical headquarters and regulated regional branches:
            </p>

            <div className="space-y-4">
              
              {/* London */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 mb-1">
                    <Building className="w-4 h-4 text-emerald-800" />
                    <span>London Global Headquarters</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">GMT</span>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  100 Bishopsgate, 28th Floor, London EC2N 4AG, United Kingdom
                </p>
                <div className="text-xs text-slate-500 space-y-0.5">
                  <div>Direct: {phone}</div>
                  <div>Desk: <a href={`mailto:${londonMail}`} className="text-emerald-800 hover:underline font-mono">{londonMail}</a></div>
                </div>
              </div>

              {/* Zurich */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 mb-1">
                    <Building className="w-4 h-4 text-emerald-800" />
                    <span>Zurich Private Credit Desk</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">CET</span>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  Bahnhofstrasse 45, 8001 Zürich, Switzerland
                </p>
                <div className="text-xs text-slate-500 space-y-0.5">
                  <div>Direct: +41 44 215 9000</div>
                  <div>Desk: <a href={`mailto:${zurichMail}`} className="text-emerald-800 hover:underline font-mono">{zurichMail}</a></div>
                </div>
              </div>

              {/* New York */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 mb-1">
                    <Building className="w-4 h-4 text-emerald-800" />
                    <span>New York Americas Division</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">EST</span>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  One Vanderbilt Avenue, Suite 4100, New York, NY 10017
                </p>
                <div className="text-xs text-slate-500 space-y-0.5">
                  <div>Direct: +1 (212) 555-0199</div>
                  <div>Desk: <a href={`mailto:${nyMail}`} className="text-emerald-800 hover:underline font-mono">{nyMail}</a></div>
                </div>
              </div>

            </div>

            {/* Operating Hours info */}
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>{hours}</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
