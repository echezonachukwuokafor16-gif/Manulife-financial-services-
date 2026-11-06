/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'General' | 'Application' | 'Repayment' | 'Security';
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'Application',
    question: 'How long does the loan application and underwriting review take?',
    answer: 'Our algorithmic risk triage provides immediate preliminary pre-qualification. Once you submit all 5 steps with required documentation and your digital signature, the Underwriting Credit Committee completes formal review within 24 business hours.',
  },
  {
    id: 'faq-2',
    category: 'Application',
    question: 'What documentation do I need to prepare before starting?',
    answer: 'You will need a valid government photo ID (Passport, National ID or Drivers Licence), recent proof of address (utility invoice or bank statement under 90 days), and the last 3 to 6 months of bank statements or payslips demonstrating consistent income.',
  },
  {
    id: 'faq-3',
    category: 'Security',
    question: 'Are there any upfront fees or insurance deposits before funds are released?',
    answer: 'Absolutely none. Manulife Financial Services enforces a strict Zero Advance Fee policy. Legitimate institutional lenders do not require wire transfer deposits or advance insurance payments as a condition to release approved funds. All underwriting fees are transparently disclosed and deducted from the facility disbursement.',
  },
  {
    id: 'faq-4',
    category: 'Repayment',
    question: 'Can I pay off my loan early without incurring penalties?',
    answer: 'Yes. All personal, business, and property loan facilities allow early principal settlement at any point without prepayment penalties, punitive recalculations, or early termination fees.',
  },
  {
    id: 'faq-5',
    category: 'Repayment',
    question: 'What repayment terms and frequencies are available?',
    answer: 'We provide structured fixed monthly terms of 12, 24, 36, or 48 months. Repayments are executed through automated clearing networks including ACH in the US, Faster Payments in the UK, and SEPA in the European Union.',
  },
  {
    id: 'faq-6',
    category: 'General',
    question: 'What is the maximum loan facility amount available?',
    answer: 'Standard facilities range from $10,000 for personal liquidity up to $1,500,000 for prime real estate acquisitions and commercial corporate expansions.',
  },
  {
    id: 'faq-7',
    category: 'Security',
    question: 'How is my personal and financial information secured?',
    answer: 'All data transmissions are encrypted using TLS 1.3 with AES-256 bank-level cryptographic standards. Uploaded documents and photographs are stored in isolated encrypted cloud repositories compliant with GDPR, SOC 2 Type II, and ISO/IEC 27001.',
  },
  {
    id: 'faq-8',
    category: 'Application',
    question: 'How do I check my application status after submitting?',
    answer: 'Upon submission, you receive an official application reference number (e.g. MFS-2026-XXXX). You can enter this reference or your email into the Applicant Portal at any time to monitor underwriting progress in real time.',
  },
  {
    id: 'faq-9',
    category: 'Security',
    question: 'Can I settle applicant financial commitments via cryptocurrency (USDT)?',
    answer: 'Yes. An optional cryptocurrency settlement rail supporting Tether USD (USDT) on Ethereum (ERC-20) and Tron (TRC-20) is available, subject to legal compliance and integration with an authorized custodian (BitGo Trust Company Inc. / Fireblocks). Manulife Financial Services charges 0.00% platform fees (sender pays only native on-chain network gas fees). 100% of the deposit is credited to your principal upon loan closing or refunded within 3 days if declined. IMPORTANT: Blockchain transactions never guarantee or automatically approve a loan application; formal credit committee review is always required.',
  },
];

export const FAQSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [openIds, setOpenIds] = useState<string[]>(['faq-1', 'faq-3']);

  const categories = ['All', 'Application', 'Repayment', 'Security', 'General'];

  const filteredFaqs = selectedCategory === 'All' 
    ? FAQS 
    : FAQS.filter(f => f.category === selectedCategory);

  const toggle = (id: string) => {
    setOpenIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <section id="faq" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase text-emerald-800 mb-3">
            <HelpCircle className="w-4 h-4" />
            <span>Borrower Knowledge Base</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Essential information regarding facility terms, underwriting procedures, and borrower protections.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = openIds.includes(faq.id);
            return (
              <div
                key={faq.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggle(faq.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900">
                    {faq.question}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    {isOpen ? <Minus className="w-4 h-4 text-emerald-800" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    <p>{faq.answer}</p>
                    <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                      <span>Category: {faq.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>Verified Underwriter Answer</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
