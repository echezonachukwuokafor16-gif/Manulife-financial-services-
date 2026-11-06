/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Printer, Download, ShieldCheck, CheckCircle } from 'lucide-react';
import { LoanApplication } from '../types';
import { formatCurrency, calculateLoanRepayment } from '../lib/calculator';

interface OfficialDocumentModalProps {
  application: LoanApplication | null;
  docType: 'term_sheet' | 'summary' | 'amortization' | 'commitment_receipt';
  isOpen: boolean;
  onClose: () => void;
}

export const OfficialDocumentModal: React.FC<OfficialDocumentModalProps> = ({
  application,
  docType,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !application) return null;

  const handlePrint = () => {
    window.print();
  };

  const amount = application.underwriting?.approvedAmount || application.loan.requestedAmount;
  const rate = application.underwriting?.approvedRate || 5.45;
  const term = application.underwriting?.approvedPeriodMonths || application.loan.repaymentPeriodMonths;
  const calculation = calculateLoanRepayment(amount, rate, term);
  const commitmentAmt = application.commitment?.commitmentAmount || Math.round(application.loan.requestedAmount * 0.10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Action bar (excluded from print) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-emerald-400 font-bold">DOCUMENT VIEWER</span>
            <span>·</span>
            <span>{application.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Formal Printable Document Content */}
        <div className="p-8 sm:p-12 overflow-y-auto flex-1 font-sans text-slate-800 bg-white">
          
          {/* Official Letterhead */}
          <div className="flex items-start justify-between border-b-2 border-emerald-950 pb-6 mb-6">
            <div className="flex items-center gap-3.5">
              <img 
                src="/assets/aistudio/file_00000000245881fdbc108ee1cf0b4466_512afb92.png" 
                alt="Manulife Financial Services" 
                className="w-14 h-14 object-contain rounded-full shadow-sm border border-emerald-800 bg-white shrink-0" 
              />
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-950 uppercase font-sans">
                  Manulife Financial Services
                </h1>
                <span className="text-xs text-slate-500 font-medium block">
                  Institutional Credit & Structured Finance Desk
                </span>
                <span className="text-[11px] text-slate-400 block">
                  100 Bishopsgate, London EC2N 4AG · Regulated Credit Facility
                </span>
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="font-mono font-bold text-slate-900 block text-sm">
                REF: {application.id}
              </span>
              <span className="text-slate-500 block">
                Issued: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="text-emerald-800 font-mono text-[10px] block mt-1 uppercase font-semibold">
                Status: {application.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Document Title */}
          <div className="mb-6 text-center">
            <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-slate-900">
              {docType === 'term_sheet' && 'Official Binding Loan Term Sheet'}
              {docType === 'summary' && 'Official Facility Application Dossier'}
              {docType === 'amortization' && 'Amortization & Repayment Schedule'}
              {docType === 'commitment_receipt' && 'Official Applicant Financial Commitment Deposit Receipt'}
            </h2>
            <div className="w-16 h-0.5 bg-emerald-800 mx-auto mt-2" />
          </div>

          {/* Recipient Details Block */}
          <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-6">
            <div>
              <span className="text-slate-400 uppercase text-[10px] block font-semibold mb-1">
                Designated Borrower
              </span>
              <strong className="text-slate-900 text-sm block">{application.personal.fullName}</strong>
              <div className="text-slate-600 mt-1">{application.personal.residentialAddress}</div>
              <div className="text-slate-600">{application.personal.email} · {application.personal.phoneNumber}</div>
              <div className="text-[11px] font-mono mt-1 text-emerald-900 font-semibold">
                KYC Biometrics: {application.faceVerification ? `Certified (${application.faceVerification.verificationId} · ${application.faceVerification.livenessScore}% Liveness)` : 'Standard KYC On File'}
              </div>
            </div>

            <div>
              <span className="text-slate-400 uppercase text-[10px] block font-semibold mb-1">
                Lending Syndicate Desk
              </span>
              <strong className="text-slate-900 text-sm block">Manulife Financial Services Credit Committee</strong>
              <div className="text-slate-600 mt-1">Global Underwriting Desk</div>
              <div className="text-slate-600">Officer: {application.underwriting?.reviewedBy || 'Arthur Montgomery (Senior Underwriter)'}</div>
              <div className="text-[11px] font-mono mt-1 text-slate-500">
                Protocol: ISO 30107-3 L2 Anti-Spoofing
              </div>
            </div>
          </div>

          {/* TERM SHEET SPECIFIC CONTENT */}
          {docType === 'term_sheet' && (
            <div className="space-y-6 text-xs">
              <table className="w-full border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold">
                    <th className="border border-slate-300 p-2.5 text-left">Facility Parameter</th>
                    <th className="border border-slate-300 p-2.5 text-right">Agreed Term Sheet Specification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="border border-slate-300 p-2.5 font-semibold">Approved Facility Principal</td>
                    <td className="border border-slate-300 p-2.5 text-right font-mono font-bold text-sm text-emerald-950">
                      {formatCurrency(amount)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2.5 font-semibold">Stated Facility Purpose</td>
                    <td className="border border-slate-300 p-2.5 text-right">{application.loan.purpose}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2.5 font-semibold">Annual Percentage Rate (APR)</td>
                    <td className="border border-slate-300 p-2.5 text-right font-mono font-bold">{rate}% Fixed</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2.5 font-semibold">Repayment Term</td>
                    <td className="border border-slate-300 p-2.5 text-right">{term} Equal Monthly Installments</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2.5 font-semibold">Calculated Monthly Installment</td>
                    <td className="border border-slate-300 p-2.5 text-right font-mono font-bold text-sm">
                      {formatCurrency(calculation.monthlyRepayment)} / month
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2.5 font-semibold">Total Gross Repayment</td>
                    <td className="border border-slate-300 p-2.5 text-right font-mono">{formatCurrency(calculation.totalRepayment)}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2.5 font-semibold">Upfront Advance Clearance Fees</td>
                    <td className="border border-slate-300 p-2.5 text-right font-mono font-bold text-emerald-800">$0.00 (Guaranteed Zero)</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2.5 font-semibold">Disbursement Clearing Channel</td>
                    <td className="border border-slate-300 p-2.5 text-right">{application.loan.preferredPaymentMethod}</td>
                  </tr>
                </tbody>
              </table>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] leading-relaxed text-emerald-950">
                <strong>Fair Lending Guarantee:</strong> This term sheet is issued without condition of advance fee payment. All covenants, interest accruals, and repayment obligations are governed by English Commercial Law (or jurisdiction of execution).
              </div>
            </div>
          )}

          {/* APPLICATION SUMMARY */}
          {docType === 'summary' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-slate-200 rounded-lg">
                  <span className="font-bold block text-slate-900 mb-1">Employment Records</span>
                  <div>Employer: {application.employment.employerName}</div>
                  <div>Title: {application.employment.occupation}</div>
                  <div>Net Monthly: {formatCurrency(application.employment.monthlyIncome)}</div>
                </div>

                <div className="p-3 border border-slate-200 rounded-lg">
                  <span className="font-bold block text-slate-900 mb-1">Financial Commitments</span>
                  <div>Existing Loans: {formatCurrency(application.financial.existingLoans)}</div>
                  <div>Monthly Debt Servicing: {formatCurrency(application.financial.monthlyObligations)}</div>
                  <div>Rent/Mortgage: {formatCurrency(application.financial.monthlyRent)}</div>
                </div>
              </div>
            </div>
          )}

          {/* AMORTIZATION BREAKDOWN */}
          {docType === 'amortization' && (
            <div className="text-xs">
              <table className="w-full border-collapse border border-slate-300 font-mono text-[11px]">
                <thead className="bg-slate-100 text-slate-900">
                  <tr>
                    <th className="border border-slate-300 p-2 text-left">Cycle</th>
                    <th className="border border-slate-300 p-2 text-right">Principal Paid</th>
                    <th className="border border-slate-300 p-2 text-right">Interest Paid</th>
                    <th className="border border-slate-300 p-2 text-right">Remaining Principal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {calculation.amortizationPreview.map((item) => (
                    <tr key={item.month}>
                      <td className="border border-slate-300 p-1.5 font-sans font-bold">Month {item.month}</td>
                      <td className="border border-slate-300 p-1.5 text-right">${item.principalPaid.toLocaleString()}</td>
                      <td className="border border-slate-300 p-1.5 text-right">${item.interestPaid.toLocaleString()}</td>
                      <td className="border border-slate-300 p-1.5 text-right font-bold">${item.remainingBalance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* COMMITMENT RECEIPT VIEW */}
          {docType === 'commitment_receipt' && (
            <div className="space-y-6 text-xs">
              
              {/* Receipt Header Table */}
              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <div className="bg-slate-100 p-3 border-b border-slate-300 flex justify-between items-center font-mono">
                  <span className="font-bold text-slate-900">RECEIPT NUMBER: {application.commitment?.receiptNumber || `RCPT-2026-${application.id.split('-')[2] || '8841'}-C`}</span>
                  <span className="text-emerald-800 font-bold">STATUS: {application.commitment?.paymentStatus || 'Held in Regulated Escrow'}</span>
                </div>

                <div className="p-4 space-y-3 bg-white">
                  <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-200">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Payer / Legal Entity:</span>
                      <strong className="text-slate-900 text-sm">{application.personal.fullName}</strong>
                      <div className="text-slate-600 text-[11px]">{application.personal.residentialAddress}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Designated Escrow Depository & Rail:</span>
                      <strong className="text-slate-900 text-sm">
                        {application.commitment?.paymentMethod?.includes('USDT') 
                          ? 'BitGo Trust Company Inc. / Fireblocks Regulated Custody' 
                          : 'Barclays Private Clients Escrow Custody'}
                      </strong>
                      <div className="text-slate-600 text-[11px]">
                        {application.commitment?.paymentMethod?.includes('USDT') 
                          ? `USDT Digital Asset Protocol · Parity: 1.00 USDT = $1.00 USD (Charter #D-8841)` 
                          : 'Segregated Client Trust Account #8841-ESCR'}
                      </div>
                    </div>
                  </div>

                  <table className="w-full border-collapse border border-slate-200 font-mono text-[11px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-800">
                        <th className="border border-slate-200 p-2 text-left font-sans font-bold">Item Description</th>
                        <th className="border border-slate-200 p-2 text-right font-sans font-bold">Rate</th>
                        <th className="border border-slate-200 p-2 text-right font-sans font-bold">Statutory Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-200 p-2">
                          <strong className="font-sans block text-slate-900">Requested Credit Facility Principal</strong>
                          <span className="font-sans text-[10px] text-slate-500">Subject to Credit Committee Underwriting</span>
                        </td>
                        <td className="border border-slate-200 p-2 text-right">Base Facility</td>
                        <td className="border border-slate-200 p-2 text-right font-bold">{formatCurrency(application.loan.requestedAmount)}</td>
                      </tr>
                      <tr className="bg-emerald-50/50">
                        <td className="border border-slate-200 p-2">
                          <strong className="font-sans block text-emerald-950">Applicant Financial Commitment (Earnest Escrow Deposit)</strong>
                          <span className="font-sans text-[10px] text-slate-600">Held in segregated escrow custody for borrower allocation</span>
                        </td>
                        <td className="border border-slate-200 p-2 text-right font-bold text-emerald-900">10.00%</td>
                        <td className="border border-slate-200 p-2 text-right font-bold text-emerald-950 text-sm">
                          {formatCurrency(commitmentAmt)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Legal Terms & Purpose */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                  Purpose & Statutory Legal Provisions
                </span>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  The 10% Applicant Financial Commitment represents an earnest commercial liquidity guarantee. It reserves dedicated institutional capital in the lending syndicate queue and authorizes underwriting due diligence, including property appraisals, registry verifications, and compliance filings.
                </p>
              </div>

              {/* Refundability Terms Breakdown */}
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950">
                  <strong className="font-bold block mb-1">100% Credited to Principal upon Closing:</strong>
                  <span>When the facility is executed and disbursed, 100% of this commitment deposit (${commitmentAmt.toLocaleString()}) is credited directly towards reducing the opening loan balance.</span>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-950">
                  <strong className="font-bold block mb-1">100% Refundable if Underwriting Declines:</strong>
                  <span>If Manulife Financial Services' Credit Committee declines the application, 100% of the deposit is promptly returned to the originating account within 3 business days.</span>
                </div>
              </div>

              {/* Mandatory Regulatory Warning: Not a Guarantee */}
              <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl text-amber-950 text-[11px] leading-relaxed">
                <strong className="font-bold text-xs block mb-1 text-amber-900">
                  CRITICAL STATUTORY COMPLIANCE NOTICE: NOT A GUARANTEE OF APPROVAL
                </strong>
                Payment of this commitment deposit DOES NOT constitute a guarantee, promise, or pre-approval of loan disbursement. All lending decisions are determined strictly by the Underwriting Committee based on verified financial eligibility and credit assessment.
              </div>

            </div>
          )}

          {/* Signatures & Verification Seal */}
          <div className="mt-10 pt-6 border-t-2 border-slate-200 grid grid-cols-2 gap-8 text-xs">
            <div>
              <span className="text-slate-400 uppercase text-[10px] block font-semibold mb-2">
                Borrower Electronic Signature
              </span>
              {application.declaration.signatureDataUrl.startsWith('data:image') ? (
                <img
                  src={application.declaration.signatureDataUrl}
                  alt="Borrower Signature"
                  className="h-12 object-contain"
                />
              ) : (
                <div className="font-serif italic text-xl text-emerald-950 pb-2">
                  {application.declaration.signatureDataUrl}
                </div>
              )}
              <span className="border-t border-slate-300 block pt-1 text-[11px] text-slate-500">
                {application.personal.fullName} · {new Date(application.declaration.signedAt).toLocaleDateString()}
              </span>
            </div>

            <div>
              <span className="text-slate-400 uppercase text-[10px] block font-semibold mb-2">
                Underwriting Committee Authorization Seal
              </span>
              <div className="font-mono text-emerald-900 font-bold text-xs pb-3 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>AUTHORIZED UNDERWRITER SEAL</span>
              </div>
              <span className="border-t border-slate-300 block pt-1 text-[11px] text-slate-500">
                Credit Committee · Manulife Financial Services Institutional
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
