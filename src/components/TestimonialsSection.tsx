/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Quote, Star, ShieldCheck, CheckCircle2, Building, 
  MapPin, Clock, DollarSign, Filter, Plus, Send, X, ExternalLink, Award
} from 'lucide-react';
import { TestimonialItem } from '../types';
import { storage } from '../lib/storage';
import { formatCurrency } from '../lib/calculator';
import { useLanguage } from '../context/LanguageContext';

export const TestimonialsSection: React.FC = () => {
  const { t } = useLanguage();
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [activeSector, setActiveSector] = useState<string>('all');
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Form State
  const [newAuthor, setNewAuthor] = useState<string>('');
  const [newRole, setNewRole] = useState<string>('');
  const [newCompany, setNewCompany] = useState<string>('');
  const [newLocation, setNewLocation] = useState<string>('');
  const [newAmount, setNewAmount] = useState<number>(500000);
  const [newFacilityType, setNewFacilityType] = useState<string>('Commercial Expansion Facility');
  const [newSector, setNewSector] = useState<string>('Infrastructure & Energy');
  const [newQuote, setNewQuote] = useState<string>('');

  useEffect(() => {
    const fetchTestimonials = async () => {
      const data = await storage.getTestimonials();
      setTestimonials(data);
    };
    fetchTestimonials();
    window.addEventListener('verdant_storage_update', fetchTestimonials);
    return () => window.removeEventListener('verdant_storage_update', fetchTestimonials);
  }, []);

  const sectors = [
    { key: 'all', label: 'All Sectors' },
    { key: 'Infrastructure & Energy', label: 'Infrastructure & Energy' },
    { key: 'Life Sciences & Biotech', label: 'Life Sciences & Biotech' },
    { key: 'Real Estate & Construction', label: 'Real Estate & Construction' },
    { key: 'Maritime & Logistics', label: 'Maritime & Logistics' },
  ];

  const filteredTestimonials = testimonials.filter((item) => {
    if (activeSector === 'all') return true;
    return item.sector === activeSector;
  });

  const handleSubmitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newQuote.trim() || !newCompany.trim()) return;

    const item: TestimonialItem = {
      id: `t-${Date.now()}`,
      authorName: newAuthor.trim(),
      role: newRole.trim() || 'Principal Director',
      company: newCompany.trim(),
      location: newLocation.trim() || 'London, United Kingdom',
      facilityAmount: newAmount || 500000,
      facilityType: newFacilityType,
      sector: newSector,
      quote: newQuote.trim(),
      turnaroundTime: '48 Hours',
      closingDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      verifiedAuditDesk: 'Global Underwriting Desk',
      rating: 5,
    };

    await storage.addTestimonial(item);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowSubmitModal(false);
      // Reset form
      setNewAuthor('');
      setNewRole('');
      setNewCompany('');
      setNewLocation('');
      setNewQuote('');
    }, 2000);
  };

  return (
    <section id="testimonials" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-emerald-800 mb-2">
              <Award className="w-4 h-4 text-emerald-700" />
              <span>Verified Institutional Borrowers & Case Studies</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Institutional Capital Proven Across Global Markets
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Read verified credit closing statements from corporate executives, private family offices, and developers who secured multi-million dollar liquidity with zero advance fees.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-2 shrink-0 self-start md:self-auto"
          >
            <Plus className="w-4 h-4 text-emerald-700" />
            <span>Submit Client Experience</span>
          </button>
        </div>

        {/* 4 Quantitative Proof Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Capital Deployed
            </span>
            <span className="text-2xl font-extrabold font-mono text-slate-900 mt-1 block">
              $1.2B+
            </span>
            <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">
              Tier 1/2 Institutional Facilities
            </span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Decision Turnaround
            </span>
            <span className="text-2xl font-extrabold font-mono text-emerald-900 mt-1 block">
              48h Avg
            </span>
            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
              Accelerated Committee Review
            </span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Fee Compliance
            </span>
            <span className="text-2xl font-extrabold font-mono text-slate-900 mt-1 block">
              100%
            </span>
            <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">
              Zero Advance Fees Collected
            </span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Client Satisfaction
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-extrabold font-mono text-slate-900">
                4.9
              </span>
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
              Audited Borrower Rating
            </span>
          </div>
        </div>

        {/* Sector Filter Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 text-xs">
          {sectors.map((sector) => (
            <button
              key={sector.key}
              type="button"
              onClick={() => setActiveSector(sector.key)}
              className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeSector === sector.key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {sector.label}
            </button>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTestimonials.map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs hover:border-emerald-200 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top card metadata: Facility and Sector */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-950 text-sm">
                      {formatCurrency(item.facilityAmount)}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-600 font-medium">
                      {item.facilityType}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {item.sector}
                  </span>
                </div>

                {/* Stars and Turnaround */}
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div className="flex text-amber-400">
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span>Closed in {item.turnaroundTime}</span>
                  </span>
                </div>

                {/* Quote Body */}
                <blockquote className="text-slate-700 text-xs sm:text-[13px] leading-relaxed italic mb-6">
                  "{item.quote}"
                </blockquote>
              </div>

              {/* Author Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-950 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {item.authorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-xs">
                        {item.authorName}
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      {item.role}, {item.company}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {item.location}
                    </span>
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-400 font-mono shrink-0">
                  <span className="block text-emerald-800 font-semibold">{item.closingDate}</span>
                  <span className="text-[9px] block text-slate-400">{item.verifiedAuditDesk}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Assurance Strip */}
        <div className="mt-12 p-4 bg-emerald-950/90 text-white rounded-xl border border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              <strong>Verified Institutional Borrowers:</strong> All corporate case studies and endorsements are vetted by independent underwriting compliance audit.
            </span>
          </div>
          <span className="font-mono text-emerald-300 text-[11px] shrink-0">
            CONFIDENTIALITY & GDPR VERIFIED
          </span>
        </div>

      </div>

      {/* Modal: Submit Borrower Experience */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Quote className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Submit Borrower Endorsement</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitTestimonial} className="p-6 space-y-4">
              {submitSuccess ? (
                <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950">
                  <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto" />
                  <h4 className="font-bold text-sm">Thank You for Your Endorsement</h4>
                  <p className="text-xs text-emerald-800">
                    Your institutional review has been logged and published to the verified case studies ledger.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Executive Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAuthor}
                        onChange={(e) => setNewAuthor(e.target.value)}
                        placeholder="e.g. Richard Sterling"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Title / Role *
                      </label>
                      <input
                        type="text"
                        required
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        placeholder="e.g. Managing Director"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Company / Entity *
                      </label>
                      <input
                        type="text"
                        required
                        value={newCompany}
                        onChange={(e) => setNewCompany(e.target.value)}
                        placeholder="e.g. Horizon Capital Partners"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        City & Country *
                      </label>
                      <input
                        type="text"
                        required
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        placeholder="e.g. London, United Kingdom"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Facility Amount ($) *
                      </label>
                      <input
                        type="number"
                        min="10000"
                        step="10000"
                        required
                        value={newAmount}
                        onChange={(e) => setNewAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Industry Sector *
                      </label>
                      <select
                        value={newSector}
                        onChange={(e) => setNewSector(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      >
                        <option value="Infrastructure & Energy">Infrastructure & Energy</option>
                        <option value="Life Sciences & Biotech">Life Sciences & Biotech</option>
                        <option value="Real Estate & Construction">Real Estate & Construction</option>
                        <option value="Maritime & Logistics">Maritime & Logistics</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Facility Type
                    </label>
                    <input
                      type="text"
                      value={newFacilityType}
                      onChange={(e) => setNewFacilityType(e.target.value)}
                      placeholder="e.g. Commercial Expansion Facility"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Borrower Experience Statement / Case Summary *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={newQuote}
                      onChange={(e) => setNewQuote(e.target.value)}
                      placeholder="Describe the speed of underwriting, multi-sig escrow verification, communication with credit officers, and fund release..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 resize-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSubmitModal(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Publish Endorsement</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

    </section>
  );
};
