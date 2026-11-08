/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, ExternalLink, X } from 'lucide-react';
import { EmailNotificationRecord } from '../types';

interface EmailToastNotificationProps {
  onOpenEmail: (email: EmailNotificationRecord) => void;
}

export const EmailToastNotification: React.FC<EmailToastNotificationProps> = ({ onOpenEmail }) => {
  const [activeToast, setActiveToast] = useState<EmailNotificationRecord | null>(null);

  useEffect(() => {
    const handleEmailDispatched = (e: Event) => {
      const custom = e as CustomEvent<EmailNotificationRecord>;
      if (custom && custom.detail) {
        setActiveToast(custom.detail);
        const timer = setTimeout(() => {
          setActiveToast((prev) => (prev?.id === custom.detail.id ? null : prev));
        }, 7000);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('mfs_email_dispatched', handleEmailDispatched);
    return () => window.removeEventListener('mfs_email_dispatched', handleEmailDispatched);
  }, []);

  if (!activeToast) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl shadow-2xl border-2 border-emerald-500/50 p-4 animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
          <Mail className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0 text-xs">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-bold text-white uppercase text-[10px] tracking-wider text-emerald-400">
              Email Dispatched
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <p className="font-semibold text-slate-100 truncate text-xs mb-1">
            {activeToast.subject}
          </p>

          <div className="text-[11px] text-slate-400 space-y-0.5 font-mono">
            <div className="truncate">To: {activeToast.recipientEmail}</div>
            {activeToast.ccEmail && (
              <div className="truncate text-emerald-300/80">CC: {activeToast.ccEmail}</div>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onOpenEmail(activeToast);
                setActiveToast(null);
              }}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Preview Letter</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setActiveToast(null)}
              className="px-2.5 py-1.5 text-slate-400 hover:text-white text-[11px] font-medium transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveToast(null)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
