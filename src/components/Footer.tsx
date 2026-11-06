/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { CompanyContactSettings } from '../types';
import { storage } from '../lib/storage';

interface FooterProps {
  onNavigate: (view: 'home' | 'apply' | 'applicant-portal' | 'admin-portal') => void;
  onOpenApply: () => void;
  onOpenLegal: (type: 'privacy' | 'terms') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenApply, onOpenLegal }) => {
  const [contactSettings, setContactSettings] = useState<CompanyContactSettings | null>(null);

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
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 text-xs">
      {/* Top Footer Tier */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="/assets/aistudio/file_00000000245881fdbc108ee1cf0b4466_512afb92.png" 
                alt="Manulife Financial Services Logo" 
                className="w-11 h-11 object-contain rounded-full shadow-md bg-white border border-emerald-600 shrink-0" 
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white font-sans">
                  Manulife
                </span>
                <span className="text-[10px] tracking-widest uppercase text-emerald-400 font-semibold">
                  Financial Services
                </span>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed max-w-sm">
              Premier institutional lending institution providing personal credit facilities, residential real estate mortgages, and commercial expansion capital with transparent underwriting and zero advance fees.
            </p>

            <div className="flex items-center gap-3 text-emerald-400 text-[11px] pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                <span>ISO/IEC 27001 Certified</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                <span>256-Bit TLS 1.3 Vault</span>
              </span>
            </div>

            {/* Dynamic Customer Support & Direct Liaison info */}
            <div className="pt-3 border-t border-slate-900 space-y-1.5 text-[11px]">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-400">Customer Support:</span>
                <a href={`mailto:${supportEmail}`} className="text-emerald-300 hover:text-white font-mono underline">
                  {supportEmail}
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 text-emerald-400 flex items-center justify-center font-bold text-[10px]">↳</span>
                <span className="text-slate-400">Direct Liaison:</span>
                <a href={`mailto:${directLiaison}`} className="text-white hover:text-emerald-300 font-mono underline break-all">
                  {directLiaison}
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-400">Priority Hotline:</span>
                <span className="text-slate-300 font-mono">{phone}</span>
              </div>
            </div>
          </div>

          {/* Solutions Column */}
          <div className="space-y-3">
            <span className="font-bold uppercase tracking-wider text-white text-xs block">
              Credit Facilities
            </span>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    onNavigate('home');
                    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Personal Loans
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('home');
                    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Property Financing
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('home');
                    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Commercial & Business
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('home');
                    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Flexible Repayments
                </button>
              </li>
            </ul>
          </div>

          {/* Portals & Tools Column */}
          <div className="space-y-3">
            <span className="font-bold uppercase tracking-wider text-white text-xs block">
              Borrower Services
            </span>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    onNavigate('home');
                    document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Interactive Loan Calculator
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('home');
                    document.getElementById('eligibility')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Eligibility Standards
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('home');
                    document.getElementById('anti-advance-fee')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Zero Advance Fee Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('home');
                    document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Knowledge Base & FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Global Desks Column */}
          <div className="space-y-3">
            <span className="font-bold uppercase tracking-wider text-white text-xs block">
              Headquarters
            </span>
            <div className="space-y-2 text-slate-400 text-[11px]">
              <div>
                <strong className="text-slate-200 block">London Headquarters</strong>
                <span>100 Bishopsgate, London EC2N 4AG</span>
              </div>
              <div>
                <strong className="text-slate-200 block">Americas Lending</strong>
                <span>One Vanderbilt Ave, New York NY 10017</span>
              </div>
              <div>
                <strong className="text-slate-200 block">Zurich Private Credit</strong>
                <span>Bahnhofstrasse 45, 8001 Zürich</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Fair Lending & Anti-Fraud Legal Bottom Bar */}
      <div className="border-t border-slate-900 bg-black/40 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Manulife Financial Services Limited. All rights reserved. Registered financial institution.
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => onOpenLegal('privacy')}
              className="hover:text-slate-300 transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onOpenLegal('terms')}
              className="hover:text-slate-300 transition-colors"
            >
              Terms of Service & Fee Disclosures
            </button>
            <button
              onClick={onOpenApply}
              className="text-emerald-400 font-semibold hover:underline"
            >
              Apply Online
            </button>
            <button
              onClick={() => onNavigate('admin-portal')}
              className="text-slate-600 hover:text-slate-400 flex items-center gap-1 transition-colors text-[10px] ml-1"
              title="Restricted Staff Portal"
            >
              <Lock className="w-2.5 h-2.5" />
              <span>Staff Portal</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
