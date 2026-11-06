/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, Building2, User, Briefcase, CalendarCheck, Check, Shield } from 'lucide-react';
import { LoanPurpose } from '../types';

interface ServicesSectionProps {
  onSelectService: (purpose: LoanPurpose) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  return (
    <section id="services" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-emerald-800 mb-3">
            <span>Specialized Credit Facilities</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Transparent Fixed APR</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Financial Services Engineered for Growth & Capital Preservation.
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Whether securing prime real estate, modernizing commercial infrastructure, or structuring personal liquidity, our bespoke credit products offer rapid disbursement, flexible amortization, and institutional terms.
          </p>
        </div>

        {/* 4 Core Financial Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Service 1: Personal Loans */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col hover:border-emerald-800/40 transition-all duration-300 shadow-sm hover:shadow-md group">
            <div className="relative h-52 w-full overflow-hidden bg-slate-100">
              <img
                src="/src/assets/images/personal_wealth_1793731911369.jpg"
                alt="Personal Loans and Private Wealth Advisory"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
                <span className="font-semibold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  Personal Capital
                </span>
                <span className="bg-emerald-950/80 px-2 py-0.5 rounded text-[11px] font-mono border border-emerald-700/50">
                  $10k – $150k
                </span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Personal & Executive Loans
                </h3>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  Unsecured personal facilities designed for high-earning professionals, debt restructuring, tax obligations, and major private investments without cumbersome red tape.
                </p>

                <ul className="space-y-2 mb-6 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Fixed APR starting at 5.25% with zero collateral required</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Terms from 12 to 48 months with early payoff allowance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Funds delivered via SWIFT, ACH, or SEPA within 24h</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onSelectService('Personal Investment & Wealth Strategy')}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-emerald-800 hover:text-white text-slate-900 rounded-lg text-xs font-semibold tracking-wide uppercase transition-colors flex items-center justify-center gap-2"
              >
                <span>Apply for Personal Loan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Service 2: Property Purchase Financing */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col hover:border-emerald-800/40 transition-all duration-300 shadow-sm hover:shadow-md group">
            <div className="relative h-52 w-full overflow-hidden bg-slate-100">
              <img
                src="/src/assets/images/property_financing_1793731910591.jpg"
                alt="Property Purchase Financing and Mortgages"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
                <span className="font-semibold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  Real Estate & Property
                </span>
                <span className="bg-emerald-950/80 px-2 py-0.5 rounded text-[11px] font-mono border border-emerald-700/50">
                  $100k – $1.5M
                </span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Property Purchase Financing
                </h3>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  Tailored mortgage and bridge financing for prime residential acquisitions, vacation homes, and high-yield buy-to-let portfolios with rapid title verification.
                </p>

                <ul className="space-y-2 mb-6 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>LTV up to 80% on approved residential valuations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Competitive institutional interest rates from 4.85%</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Expedited title deed assessment & solicitor coordination</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onSelectService('Property Purchase & Real Estate')}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-emerald-800 hover:text-white text-slate-900 rounded-lg text-xs font-semibold tracking-wide uppercase transition-colors flex items-center justify-center gap-2"
              >
                <span>Apply for Property Loan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Service 3: Commercial & Business Financing */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col hover:border-emerald-800/40 transition-all duration-300 shadow-sm hover:shadow-md group">
            <div className="relative h-52 w-full overflow-hidden bg-slate-100">
              <img
                src="/src/assets/images/business_financing_1793731911362.jpg"
                alt="Commercial and Business Expansion Financing"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
                <span className="font-semibold flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                  Corporate Credit
                </span>
                <span className="bg-emerald-950/80 px-2 py-0.5 rounded text-[11px] font-mono border border-emerald-700/50">
                  $50k – $1.25M
                </span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Commercial & Business Financing
                </h3>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  Working capital lines, equipment leasing, and venture expansion debt structured for mid-market enterprises, healthcare practices, and innovative tech companies.
                </p>

                <ul className="space-y-2 mb-6 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Revenue-based underwriting with tailored covenant options</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Fixed or variable margin linked to central bank base</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Dedicated corporate credit committee relationship officer</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onSelectService('Commercial & Business Expansion')}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-emerald-800 hover:text-white text-slate-900 rounded-lg text-xs font-semibold tracking-wide uppercase transition-colors flex items-center justify-center gap-2"
              >
                <span>Apply for Business Loan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Feature 4: Flexible Repayment Options - Wide Banner */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-emerald-800 mb-2">
                <CalendarCheck className="w-4 h-4" />
                <span>Borrower Flexibility</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                Flexible Repayment Options Structured Around Your Cashflow
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Unlike rigid high-street lenders, Manulife Financial Services offers adaptable repayment architectures tailored to cyclical revenue cycles, seasonal earnings, or major liquidity events.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-900 block mb-1">Standard Equal Monthly</span>
                  <p className="text-slate-500">Fully amortizing principal and interest with identical predictable debits across 12, 24, 36, or 48 months.</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-900 block mb-1">Early Payoff Without Penalty</span>
                  <p className="text-slate-500">Settle your principal balance in full at any time without punitive prepayment charges or hidden exit penalties.</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-900 block mb-1">Multi-Currency Settlement</span>
                  <p className="text-slate-500">Pay repayments seamlessly in USD, GBP, EUR, or CHF through direct SEPA, ACH, or SWIFT clearing rails.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-emerald-900 rounded-xl p-6 text-white text-center flex flex-col items-center justify-center">
              <Shield className="w-10 h-10 text-emerald-400 mb-3" />
              <h4 className="text-lg font-bold mb-1">No Advance Fees</h4>
              <p className="text-xs text-emerald-200 leading-relaxed mb-4">
                We never collect upfront insurance or clearance fees before loan disbursement. Complete fee transparency guaranteed.
              </p>
              <button
                onClick={() => onSelectService('Property Purchase & Real Estate')}
                className="w-full py-2.5 px-4 bg-white text-emerald-950 font-bold text-xs uppercase rounded-lg hover:bg-emerald-100 transition-colors"
              >
                Start Loan Application
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
