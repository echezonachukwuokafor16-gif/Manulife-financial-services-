/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CheckCircle2, XCircle, FileText, UserCheck, ShieldCheck, ArrowRight } from 'lucide-react';

interface EligibilitySectionProps {
  onOpenApply: () => void;
}

export const EligibilitySection: React.FC<EligibilitySectionProps> = ({ onOpenApply }) => {
  // Interactive mini-eligibility checker
  const [ageOver18, setAgeOver18] = useState<boolean>(true);
  const [regularIncome, setRegularIncome] = useState<boolean>(true);
  const [validId, setValidId] = useState<boolean>(true);
  const [noBankruptcy, setNoBankruptcy] = useState<boolean>(true);

  const isEligible = ageOver18 && regularIncome && validId && noBankruptcy;

  return (
    <section id="eligibility" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-emerald-800 mb-3">
            <UserCheck className="w-4 h-4" />
            <span>Underwriting Standards</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Clear Eligibility Guidelines & Required Documentation
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Manulife Financial Services maintains transparent, responsible credit standards. We evaluate applicants based on demonstrated cashflow stability, identity verification, and debt sustainability.
          </p>
        </div>

        {/* 2-Column: Left Criteria & Docs, Right Interactive Pre-Check Tool */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (7 cols): Formal Requirements & Documentation checklist */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                Core Applicant Criteria
              </h3>

              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
                  <span className="font-mono text-emerald-800 font-bold shrink-0">01</span>
                  <div>
                    <strong className="text-slate-900">Age & Legal Capacity:</strong> Applicants must be at least 18 years of age (or 21 depending on jurisdiction of residence) with full legal contracting capacity.
                  </div>
                </div>

                <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
                  <span className="font-mono text-emerald-800 font-bold shrink-0">02</span>
                  <div>
                    <strong className="text-slate-900">Income Sustainability:</strong> Verifiable monthly net income of at least $3,500 (or local currency equivalent) from verified employment, dividends, or registered enterprise operations.
                  </div>
                </div>

                <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
                  <span className="font-mono text-emerald-800 font-bold shrink-0">03</span>
                  <div>
                    <strong className="text-slate-900">Debt-to-Income (DTI) Threshold:</strong> Existing fixed recurring debt payments should ideally remain below 45% of gross monthly earnings.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-mono text-emerald-800 font-bold shrink-0">04</span>
                  <div>
                    <strong className="text-slate-900">Identity & Residence:</strong> Possession of a government-issued passport or national photo ID and proof of residence issued within the last 90 days.
                  </div>
                </div>
              </div>
            </div>

            {/* Required Documents Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                Standard Document Checklist
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-900 block mb-1">1. Government Photo ID</span>
                  <p className="text-slate-500">Valid Passport, National Identity Card, or Photocard Driving Licence.</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-900 block mb-1">2. Proof of Address</span>
                  <p className="text-slate-500">Utility invoice, bank statement, or council tax bill issued within past 3 months.</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-900 block mb-1">3. Proof of Income</span>
                  <p className="text-slate-500">Recent 3 months payslips, official P60/W2 tax returns, or audited accounts.</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-900 block mb-1">4. Bank Account Statements</span>
                  <p className="text-slate-500">Last 3 to 6 months consecutive bank statements demonstrating regular cash inflows.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (5 cols): Interactive Quick Eligibility Pre-Check */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-base font-bold text-slate-900">
                Self-Assessment Checker
              </h3>
              <span className="text-xs text-slate-500 font-medium">No credit footprint</span>
            </div>

            <p className="text-xs text-slate-600 mb-6">
              Confirm your preliminary qualifications in seconds before proceeding to the formal 5-step application:
            </p>

            <div className="space-y-4 mb-8">
              
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <span className="text-xs font-medium text-slate-800">
                  I am at least 18 years of age
                </span>
                <input
                  type="checkbox"
                  checked={ageOver18}
                  onChange={(e) => setAgeOver18(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-emerald-800 focus:ring-emerald-700 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <span className="text-xs font-medium text-slate-800">
                  I earn verifiable monthly income ($3,500+)
                </span>
                <input
                  type="checkbox"
                  checked={regularIncome}
                  onChange={(e) => setRegularIncome(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-emerald-800 focus:ring-emerald-700 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <span className="text-xs font-medium text-slate-800">
                  I possess a valid government passport or ID
                </span>
                <input
                  type="checkbox"
                  checked={validId}
                  onChange={(e) => setValidId(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-emerald-800 focus:ring-emerald-700 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <span className="text-xs font-medium text-slate-800">
                  No active undischarged bankruptcies
                </span>
                <input
                  type="checkbox"
                  checked={noBankruptcy}
                  onChange={(e) => setNoBankruptcy(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-emerald-800 focus:ring-emerald-700 cursor-pointer"
                />
              </label>

            </div>

            {/* Result Box */}
            <div className={`p-4 rounded-xl border mb-6 ${
              isEligible 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm mb-1">
                {isEligible ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    <span>Preliminary Assessment: Highly Eligible</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-amber-700" />
                    <span>Additional Review Necessary</span>
                  </>
                )}
              </div>
              <p className="text-xs opacity-90 leading-relaxed">
                {isEligible
                  ? 'Your profile matches our primary criteria for fast-track 24-hour underwriting. You can start your formal application now.'
                  : 'Please check that you fulfill all the core baseline requirements before submitting a full facility request.'}
              </p>
            </div>

            <button
              onClick={onOpenApply}
              disabled={!isEligible}
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 ${
                isEligible
                  ? 'bg-emerald-800 hover:bg-emerald-900 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Begin Loan Application</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>

        </div>

      </div>
    </section>
  );
};
