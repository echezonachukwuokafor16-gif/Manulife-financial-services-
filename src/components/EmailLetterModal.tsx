/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Mail, CheckCircle2, ShieldCheck, Printer, ExternalLink, Building, Lock } from 'lucide-react';
import { EmailNotificationRecord } from '../types';

interface EmailLetterModalProps {
  email: EmailNotificationRecord | null;
  onClose: () => void;
}

export const EmailLetterModal: React.FC<EmailLetterModalProps> = ({ email, onClose }) => {
  if (!email) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Email Header Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider block">
                Official Email Notification Record
              </span>
              <h3 className="text-sm font-bold text-white truncate max-w-md">
                {email.subject}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Print Email Record"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Email Metadata Ribbon */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 text-xs text-slate-600 font-mono space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 uppercase text-[10px] w-12 font-sans font-bold">From:</span>
              <span className="font-semibold text-slate-900">{email.fromName} &lt;{email.fromEmail}&gt;</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
              <span>Delivered (TLS 1.3 Verified)</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 uppercase text-[10px] w-12 font-sans font-bold">To:</span>
            <span className="font-semibold text-slate-800">{email.recipientName} &lt;{email.recipientEmail}&gt;</span>
          </div>

          {email.ccEmail && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 uppercase text-[10px] w-12 font-sans font-bold">CC:</span>
              <span className="font-semibold text-emerald-800">Direct Officer Liaison &lt;{email.ccEmail}&gt;</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
            <div>
              <span className="text-slate-400 uppercase text-[10px] font-sans font-bold mr-2">Dispatched:</span>
              <span>{new Date(email.sentAt).toUTCString()}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[10px] font-sans font-bold mr-2">Dossier Ref:</span>
              <span className="font-bold text-slate-900">{email.applicationId}</span>
            </div>
          </div>
        </div>

        {/* Rendered HTML Letter Content */}
        <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto space-y-6">
          
          {/* Institutional Letterhead */}
          <div className="flex items-center justify-between border-b-2 border-emerald-900 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 text-white flex items-center justify-center font-bold text-lg font-serif">
                M
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                  MANULIFE FINANCIAL SERVICES
                </h4>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  Institutional Credit & Syndicate Treasury · Global Lending Desk
                </p>
              </div>
            </div>

            <div className="text-right text-[10px] text-slate-500 font-mono hidden sm:block">
              <div>London · Zurich · New York</div>
              <div>FCA Ref: 894102 · ISO 27001</div>
            </div>
          </div>

          {/* Email Body */}
          <div className="text-xs text-slate-800 space-y-4 leading-relaxed font-sans">
            <p className="font-semibold text-sm text-slate-900">
              Dear {email.recipientName},
            </p>

            <div 
              className="prose prose-xs max-w-none text-slate-700 space-y-3"
              dangerouslySetInnerHTML={{ __html: email.htmlContent || email.plainTextContent || email.message || '' }}
            />

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 mt-4 font-mono">
              <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400">
                Official Transaction Parameters
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Facility Reference:</span>
                <span className="font-bold text-slate-900">{email.applicationId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Security Verification:</span>
                <span className="text-emerald-800 font-bold">256-Bit HSM Multi-Sig Signed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Officer Liaison Contact:</span>
                <span className="text-slate-900">{email.ccEmail || 'support@manulife-financial.com'}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 text-slate-600 space-y-1">
              <p className="font-semibold text-slate-900">Respectfully,</p>
              <p className="font-bold text-emerald-950">Underwriting & Credit Committee Directorate</p>
              <p className="text-[11px] text-slate-500">Manulife Financial Services (UK) Ltd · 14 Berkeley Square, London W1J 6BL</p>
            </div>
          </div>

          {/* Security & Statutory Disclaimer */}
          <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-[10px] text-slate-500 leading-normal flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <strong>Confidentiality Notice:</strong> This official dispatch contains confidential and legally privileged financial information intended solely for {email.recipientEmail}. All statutory earnest commitments are settled exclusively via Tether (USDT) on-chain multi-sig vaults. Blockchain transactions do not guarantee automatic loan approval.
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Message ID: {email.id}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors shadow-sm"
          >
            Close Email View
          </button>
        </div>

      </div>
    </div>
  );
};
