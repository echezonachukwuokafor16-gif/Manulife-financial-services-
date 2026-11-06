/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, ShieldCheck, Scale, Lock } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[88vh] flex flex-col text-xs leading-relaxed text-slate-700">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            {type === 'privacy' ? <Lock className="w-4 h-4 text-emerald-400" /> : <Scale className="w-4 h-4 text-emerald-400" />}
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {type === 'privacy' ? 'Privacy Policy & Data Security Charter' : 'Terms of Service & Fair Lending Disclosures'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4">
          {type === 'privacy' ? (
            <>
              <p className="text-slate-500 text-[11px]">
                Effective Date: November 2026 · Global Compliance Standard
              </p>

              <h3 className="text-sm font-bold text-slate-900">1. Institutional Commitment to Confidentiality</h3>
              <p>
                Manulife Financial Services respects the sensitive nature of confidential financial disclosures. This policy governs how we collect, store, and safeguard personal credentials, biometric photograph uploads, employment confirmations, and banking history.
              </p>

              <h3 className="text-sm font-bold text-slate-900">2. Cryptographic Security & Vault Storage</h3>
              <p>
                All data transmitted through our web portal is encrypted in transit using TLS 1.3 and stored at rest using 256-bit Advanced Encryption Standard (AES-256). Applicant identity documents are held in segregated, audited cloud storage compartments protected by strict Role-Based Access Control (RBAC).
              </p>

              <h3 className="text-sm font-bold text-slate-900">3. Information Disclosed During Application</h3>
              <p>
                We collect personal information solely for legitimate underwriting risk evaluation, anti-money laundering (AML), and know-your-customer (KYC) regulatory mandates. We never monetize, sell, or license applicant records to third-party marketing brokers.
              </p>

              <h3 className="text-sm font-bold text-slate-900">4. Right to Deletion & Data Portability</h3>
              <p>
                Applicants have the right to request an extract of their archived credit file or demand erasure of non-statutory records upon complete settlement of any active credit facility.
              </p>
            </>
          ) : (
            <>
              <p className="text-slate-500 text-[11px]">
                Effective Date: November 2026 · Fair Lending & Consumer Disclosures
              </p>

              <h3 className="text-sm font-bold text-slate-900">1. The Anti-Advance-Fee Guarantee</h3>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 font-medium">
                <strong>Mandatory Statutory Disclosure:</strong> Manulife Financial Services does not charge, invoice, or collect upfront payments, advance insurance fees, or clearance deposits as a condition for granting or releasing loan capital. Borrowers should never send wire deposits to unlock approved loans.
              </div>

              <h3 className="text-sm font-bold text-slate-900">2. Indicative Calculations vs. Final Underwriting Terms</h3>
              <p>
                Calculations generated via the public loan calculator are illustrative estimates based on standard amortization schedules. Final loan offers, approved facility amounts, interest rates, and loan-to-value ratios are determined exclusively by the Underwriting Credit Committee following verification of submitted documentation.
              </p>

              <h3 className="text-sm font-bold text-slate-900">3. Electronic Execution & Legal Enforceability</h3>
              <p>
                Digital signatures executed within this portal are legally binding under the Electronic Signatures in Global and National Commerce Act (ESIGN) and Regulation (EU) No 910/2014 (eIDAS).
              </p>

              <h3 className="text-sm font-bold text-slate-900">4. Early Repayment & Fee Transparency</h3>
              <p>
                Borrowers may repay outstanding facility balances in whole or in part at any time without incurring prepayment penalties or punitive recalculations. All legitimate closing or administrative costs are explicitly itemized on the binding term sheet.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs"
          >
            Acknowledge & Close
          </button>
        </div>

      </div>
    </div>
  );
};
