/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, CheckCircle2, Calculator, Clock, Lock } from 'lucide-react';
import { calculateLoanRepayment, formatCurrency } from '../lib/calculator';

interface HeroSectionProps {
  onApplyClick: (prefilledAmount?: number, prefilledTerm?: 12 | 24 | 36 | 48) => void;
  onExploreCalculator: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onApplyClick,
  onExploreCalculator,
}) => {
  const [quickAmount, setQuickAmount] = useState<number>(75000);
  const [quickTerm, setQuickTerm] = useState<12 | 24 | 36 | 48>(36);

  const quickCalc = calculateLoanRepayment(quickAmount, 5.75, quickTerm);

  return (
    <section className="relative overflow-hidden bg-white border-b border-slate-200">
      {/* Background ambient subtle grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#064e3b_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-16 lg:pb-24">
        
        {/* Two-column hero split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Proposition & Copy */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            {/* Official Logo Brand Badge & Institutional Kicker */}
            <div className="flex items-center gap-3.5 mb-5 p-2 pr-4 bg-emerald-50/80 rounded-full border border-emerald-100 max-w-fit shadow-xs">
              <img 
                src="/assets/aistudio/file_00000000245881fdbc108ee1cf0b4466_512afb92.png" 
                alt="Manulife Financial Services Seal" 
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-full shadow-sm bg-white shrink-0" 
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-emerald-900">
                  <span>Manulife Financial Services</span>
                  <span aria-hidden="true" className="text-emerald-300">·</span>
                  <span className="text-emerald-700 font-semibold hidden sm:inline">Direct Institutional Lending</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Regulated Credit Facilities & Capital Underwriting
                </span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-6 font-sans">
              Precision Institutional Lending for Ambitious Milestones.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mb-8">
              Manulife Financial Services provides structured personal loans, luxury residential mortgages, and commercial financing up to $1,500,000. Benefit from accelerated 24-hour committee review, competitive fixed rates, and a strict no-advance-fee guarantee.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10">
              <button
                onClick={() => onApplyClick(quickAmount, quickTerm)}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-emerald-800 rounded-lg hover:bg-emerald-900 active:bg-emerald-950 transition-all shadow-sm hover:shadow whitespace-nowrap focus-visible:ring-2 focus-visible:ring-emerald-700"
              >
                <span>APPLY FOR A LOAN</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={onExploreCalculator}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-800 bg-slate-100 rounded-lg hover:bg-slate-200 active:bg-slate-300 transition-colors whitespace-nowrap"
              >
                <Calculator className="w-4 h-4 text-emerald-800" />
                <span>Open Full Calculator</span>
              </button>
            </div>

            {/* Trust bullet markers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Zero Advance Release Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>24-Hour Underwriting</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>256-Bit Bank Encryption</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Quick Estimator Card overlaid on High-Fidelity Architectural Visual */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-xl">
              
              {/* High-fidelity generated HQ image */}
              <div className="relative h-48 sm:h-56 w-full overflow-hidden">
                <img
                  src="/src/assets/images/hero_financial_hq_1793731910239.jpg"
                  alt="Manulife Financial Services Institutional Headquarters"
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
                  <span className="font-semibold tracking-wide">Underwriting Atrium Desk</span>
                  <span className="text-emerald-300 font-mono text-[11px]">Prime Tier 5.75% Est. APR</span>
                </div>
              </div>

              {/* Quick Estimator Form */}
              <div className="p-6 bg-white text-slate-900 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    Instant Repayment Preview
                  </h3>
                  <span className="text-xs text-emerald-800 font-medium">Fixed Rate</span>
                </div>

                {/* Amount Slider */}
                <div className="mb-4">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-slate-500 font-medium">Requested Capital</span>
                    <span className="font-bold text-slate-900 font-mono tabular-nums text-sm">
                      {formatCurrency(quickAmount)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="500000"
                    step="5000"
                    value={quickAmount}
                    onChange={(e) => setQuickAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-800"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>$10,000</span>
                    <span>$250,000</span>
                    <span>$500,000</span>
                  </div>
                </div>

                {/* Repayment Period buttons */}
                <div className="mb-5">
                  <span className="block text-xs font-medium text-slate-500 mb-2">
                    Repayment Period (Months)
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {([12, 24, 36, 48] as const).map((period) => (
                      <button
                        key={period}
                        type="button"
                        onClick={() => setQuickTerm(period)}
                        className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                          quickTerm === period
                            ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {period} Mo
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculated Monthly Box */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4 flex items-center justify-between">
                  <div>
                    <span className="block text-[11px] text-slate-500 uppercase tracking-wider font-medium">
                      Estimated Monthly
                    </span>
                    <span className="text-2xl font-extrabold text-emerald-900 font-mono tabular-nums">
                      {formatCurrency(quickCalc.monthlyRepayment)}
                    </span>
                    <span className="text-[11px] text-slate-500 block">/ month</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[11px] text-slate-500 uppercase tracking-wider font-medium">
                      Total Interest
                    </span>
                    <span className="text-sm font-semibold text-slate-800 font-mono tabular-nums">
                      {formatCurrency(quickCalc.totalInterest)}
                    </span>
                    <span className="block text-[10px] text-slate-400">Total: {formatCurrency(quickCalc.totalRepayment)}</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  type="button"
                  onClick={() => onApplyClick(quickAmount, quickTerm)}
                  className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold tracking-wide uppercase transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Apply with These Terms</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Full-width 4-metric strip below hero */}
      <div className="border-t border-slate-200 bg-slate-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center sm:text-left">
            
            <div className="p-3">
              <span className="block text-2xl lg:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                4.85%
              </span>
              <span className="text-xs text-slate-500 font-medium mt-1 block">
                Benchmark APR Starting Rate
              </span>
            </div>

            <div className="p-3 border-l border-slate-200">
              <span className="block text-2xl lg:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                $1.5M
              </span>
              <span className="text-xs text-slate-500 font-medium mt-1 block">
                Maximum Single Facility Limit
              </span>
            </div>

            <div className="p-3 border-l-0 sm:border-l border-slate-200">
              <span className="block text-2xl lg:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                24 Hours
              </span>
              <span className="text-xs text-slate-500 font-medium mt-1 block">
                Standard Underwriting Turnaround
              </span>
            </div>

            <div className="p-3 border-l border-slate-200">
              <span className="block text-2xl lg:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                $0.00
              </span>
              <span className="text-xs text-slate-500 font-medium mt-1 block">
                Upfront Fees Guaranteed
              </span>
            </div>

          </div>
        </div>
      </div>

    </section>
  );
};
