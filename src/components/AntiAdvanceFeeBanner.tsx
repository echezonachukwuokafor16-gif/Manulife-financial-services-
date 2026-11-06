/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, CheckCircle, Scale, Lock } from 'lucide-react';

export const AntiAdvanceFeeBanner: React.FC = () => {
  return (
    <section className="py-12 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="rounded-2xl border-2 border-emerald-900/15 bg-gradient-to-br from-emerald-950 to-slate-950 text-white p-6 sm:p-10 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <span>Fair Lending & Consumer Protection Charter</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
                Zero Upfront Payment Guarantee
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Manulife Financial Services adheres strictly to international ethical lending standards and regulatory guidance. <strong className="text-white font-semibold">We never request or collect upfront wire fees, insurance deposits, or clearance advances as a condition for releasing or disbursing an approved loan.</strong>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3.5 backdrop-blur-sm">
                  <span className="font-bold text-emerald-300 block mb-1">No Advance Insurance</span>
                  <p className="text-slate-400 text-[11px] leading-normal">
                    Legitimate lenders never require borrowers to send money via wire transfer, gift cards, or crypto to unlock funds.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-3.5 backdrop-blur-sm">
                  <span className="font-bold text-emerald-300 block mb-1">100% Itemized Disclosure</span>
                  <p className="text-slate-400 text-[11px] leading-normal">
                    All administrative costs or regulatory filings are transparently enumerated on your formal term sheet and deducted from net disbursement.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-3.5 backdrop-blur-sm">
                  <span className="font-bold text-emerald-300 block mb-1">Bank-Grade Compliance</span>
                  <p className="text-slate-400 text-[11px] leading-normal">
                    Operations adhere to AML/KYC anti-fraud standards with end-to-end cryptographic protection of applicant records.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-emerald-900/40 border border-emerald-500/20 rounded-xl p-6 text-center flex flex-col items-center">
              <Scale className="w-10 h-10 text-emerald-400 mb-3" />
              <h4 className="text-base font-bold text-white mb-1">Verified Fair Lender</h4>
              <p className="text-xs text-emerald-200 mb-4">
                Transparent APR · Zero hidden surcharges · Formal legal contracts
              </p>
              <div className="w-full py-2 px-3 rounded bg-emerald-950/60 border border-emerald-800 text-[11px] font-mono text-emerald-300">
                AUDITED PROTOCOL · ISO 27001
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
