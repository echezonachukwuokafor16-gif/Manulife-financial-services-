/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calculator, AlertCircle, ArrowRight, Table, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { calculateLoanRepayment, formatCurrency } from '../lib/calculator';
import { useLanguage } from '../context/LanguageContext';

interface LoanCalculatorSectionProps {
  onApplyWithTerms: (amount: number, term: 12 | 24 | 36 | 48) => void;
}

export const LoanCalculatorSection: React.FC<LoanCalculatorSectionProps> = ({ onApplyWithTerms }) => {
  const { t } = useLanguage();
  const [amount, setAmount] = useState<number>(120000);
  const [interestRate, setInterestRate] = useState<number>(5.75);
  const [periodMonths, setPeriodMonths] = useState<12 | 24 | 36 | 48>(36);
  const [showAmortization, setShowAmortization] = useState<boolean>(false);

  const result = calculateLoanRepayment(amount, interestRate, periodMonths);

  const principalRatio = Math.round((result.loanAmount / (result.totalRepayment || 1)) * 100);
  const interestRatio = 100 - principalRatio;

  return (
    <section id="calculator" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title & Intro */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-emerald-800 mb-3">
            <Calculator className="w-4 h-4" />
            <span>Interactive Financial Planning</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            {t('calculator.title', 'Institutional Loan Calculator')}
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            {t('calculator.subtitle', 'Model your capital requirements, test different amortization terms, and examine expected monthly commitments with full fee transparency.')}
          </p>
        </div>

        {/* Main Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Inputs Column (7 cols) */}
          <div className="lg:col-span-7 bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8">
            
            {/* Input 1: Loan Amount */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
                <label className="text-sm font-bold text-slate-900">
                  Loan Principal Amount ($)
                </label>
                <div className="relative w-48">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">$</span>
                  <input
                    type="number"
                    min="5000"
                    max="1500000"
                    step="1000"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(1000, Number(e.target.value)))}
                    className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 tabular-nums"
                  />
                </div>
              </div>

              <input
                type="range"
                min="10000"
                max="1000000"
                step="5000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-800"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1 font-mono">
                <span>$10,000</span>
                <span>$500,000</span>
                <span>$1,000,000+</span>
              </div>
            </div>

            {/* Input 2: Annual Interest Rate */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
                <label className="text-sm font-bold text-slate-900">
                  Estimated Annual Interest Rate (%)
                </label>
                <div className="relative w-36">
                  <input
                    type="number"
                    min="2.5"
                    max="28.0"
                    step="0.05"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Math.max(0.1, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 tabular-nums text-right pr-7"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 font-mono text-sm">%</span>
                </div>
              </div>

              <input
                type="range"
                min="3.5"
                max="18.0"
                step="0.25"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-800"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1 font-mono">
                <span>3.50% (Prime Tier)</span>
                <span>8.50% (Standard)</span>
                <span>18.00%</span>
              </div>
            </div>

            {/* Input 3: Repayment Period */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Preferred Repayment Period
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {([12, 24, 36, 48] as const).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setPeriodMonths(period)}
                    className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all text-center ${
                      periodMonths === period
                        ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-base">{period} Months</span>
                    <span className={`text-[11px] font-normal block ${periodMonths === period ? 'text-emerald-200' : 'text-slate-400'}`}>
                      {period / 12} {period / 12 === 1 ? 'Year' : 'Years'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Presets */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Popular Facilities:</span>
              <button
                type="button"
                onClick={() => { setAmount(50000); setPeriodMonths(24); setInterestRate(5.25); }}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-100 text-slate-700"
              >
                $50k Executive (2 Yrs)
              </button>
              <button
                type="button"
                onClick={() => { setAmount(250000); setPeriodMonths(36); setInterestRate(5.65); }}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-100 text-slate-700"
              >
                $250k Commercial (3 Yrs)
              </button>
              <button
                type="button"
                onClick={() => { setAmount(500000); setPeriodMonths(48); setInterestRate(4.85); }}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-100 text-slate-700"
              >
                $500k Property (4 Yrs)
              </button>
            </div>

          </div>

          {/* Right Summary Column (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                  Calculation Summary
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {periodMonths} monthly cycles
                </span>
              </div>

              {/* Big Monthly Figure */}
              <div className="py-6">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-medium block mb-1">
                  Estimated Monthly Repayment
                </span>
                <div className="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tight tabular-nums">
                  {formatCurrency(result.monthlyRepayment)}
                </div>
                <span className="text-xs text-emerald-400 mt-1 block">
                  Fixed principal + interest installment
                </span>
              </div>

              {/* Breakdown Rows */}
              <div className="space-y-3.5 py-4 border-t border-slate-800 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Principal:</span>
                  <span className="font-mono font-semibold tabular-nums text-white">
                    {formatCurrency(result.loanAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Interest Payable:</span>
                  <span className="font-mono font-semibold tabular-nums text-emerald-300">
                    {formatCurrency(result.totalInterest)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800/60 font-bold">
                  <span className="text-slate-200">Total Repayment Amount:</span>
                  <span className="font-mono font-bold text-lg tabular-nums text-white">
                    {formatCurrency(result.totalRepayment)}
                  </span>
                </div>
              </div>

              {/* Visual Split Bar */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                  <span>Principal ({principalRatio}%)</span>
                  <span>Interest ({interestRatio}%)</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${principalRatio}%` }}
                  />
                  <div
                    className="bg-emerald-300/40 h-full transition-all duration-300"
                    style={{ width: `${interestRatio}%` }}
                  />
                </div>
              </div>

              {/* Toggle Amortization Schedule */}
              <button
                type="button"
                onClick={() => setShowAmortization(!showAmortization)}
                className="mt-6 flex items-center justify-between w-full py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-xs text-slate-300 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Table className="w-3.5 h-3.5 text-emerald-400" />
                  View Sample Amortization Milestones
                </span>
                {showAmortization ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {/* Sample Amortization Table */}
              {showAmortization && (
                <div className="mt-3 p-3 bg-slate-950/70 rounded-lg border border-slate-800 text-xs max-h-56 overflow-y-auto">
                  <table className="w-full text-left font-mono">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800 pb-1 text-[11px]">
                        <th className="py-1">Mo</th>
                        <th className="py-1">Principal</th>
                        <th className="py-1">Interest</th>
                        <th className="py-1 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-slate-300 text-[11px]">
                      {result.amortizationPreview.map((item) => (
                        <tr key={item.month}>
                          <td className="py-1.5">{item.month}</td>
                          <td className="py-1.5 text-emerald-400">${item.principalPaid.toLocaleString()}</td>
                          <td className="py-1.5 text-slate-400">${item.interestPaid.toLocaleString()}</td>
                          <td className="py-1.5 text-right">${item.remainingBalance.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Action button */}
            <div className="mt-8 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => onApplyWithTerms(amount, periodMonths)}
                className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide uppercase rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>{t('calculator.applyNow', 'Apply with These Terms')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Clear Regulatory & Legal Disclaimer */}
        <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-900 font-semibold">Important Regulatory Notice:</strong> The calculations above are indicative simulations provided for planning and estimation purposes only. Final loan amounts, APR interest rates, amortization schedules, and collateral covenants depend upon comprehensive credit assessment, formal income verification, and Underwriting Credit Committee approval. Manulife Financial Services does not charge upfront origination or releasing fees prior to loan disbursement.
          </p>
        </div>

      </div>
    </section>
  );
};
