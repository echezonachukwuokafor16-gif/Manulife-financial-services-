/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, Copy, Check, 
  ExternalLink, Info, Clock, ArrowRight, FileText, QrCode, Lock
} from 'lucide-react';
import { USDTConfig } from '../types';
import { formatCurrency } from '../lib/calculator';

interface USDTInformationSectionProps {
  usdtConfig: USDTConfig;
  commitmentAmount: number;
  applicationId?: string;
  applicantName?: string;
  onPreviewReceipt?: () => void;
  onSubmitTxHash?: (txHash: string, network: string, fromAddress: string) => void;
  isCompact?: boolean;
}

export const USDTInformationSection: React.FC<USDTInformationSectionProps> = ({
  usdtConfig,
  commitmentAmount,
  applicationId = 'MFS-2026-PENDING',
  applicantName = 'Valued Applicant',
  onPreviewReceipt,
  onSubmitTxHash,
  isCompact = false,
}) => {
  const [selectedNetworkId, setSelectedNetworkId] = useState<string>(usdtConfig.activeNetworkId || 'erc20');
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);
  const [showQr, setShowQr] = useState<boolean>(false);

  // TxHash submission state for applicant
  const [txHashInput, setTxHashInput] = useState<string>('');
  const [senderWalletInput, setSenderWalletInput] = useState<string>('');
  const [submittedTxSuccess, setSubmittedTxSuccess] = useState<boolean>(false);

  const activeNetwork = usdtConfig.supportedNetworks.find((n) => n.id === selectedNetworkId) || usdtConfig.supportedNetworks[0];
  const equivalentUsdt = Math.round(commitmentAmount / (usdtConfig.exchangeRateUsd || 1.0));

  const handleCopyAddress = () => {
    if (activeNetwork?.depositAddress) {
      navigator.clipboard.writeText(activeNetwork.depositAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2500);
    }
  };

  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txHashInput.trim() || !senderWalletInput.trim()) return;
    if (onSubmitTxHash) {
      onSubmitTxHash(txHashInput.trim(), activeNetwork.name, senderWalletInput.trim());
      setSubmittedTxSuccess(true);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
      
      {/* 1. Header: Cryptocurrency Identification & Regulatory Approval */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-900 text-emerald-400 flex items-center justify-center font-bold text-base shadow-sm border border-emerald-700 shrink-0">
            ₮
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                Optional Cryptocurrency Settlement Rail
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Regulated Custody
              </span>
            </div>
            <h4 className="text-base font-extrabold text-slate-900">
              Tether USD (USDT) Digital Asset Protocol
            </h4>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">
            Exchange Rate (Live Oracle)
          </span>
          <span className="text-sm font-bold font-mono text-emerald-950">
            1.00 USDT = $1.00 USD
          </span>
          <span className="text-[10px] text-slate-400 block">{usdtConfig.oracleProvider}</span>
        </div>
      </div>

      {/* 2. Critical Regulatory Notice: Never Automatic Loan Approval */}
      <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold text-amber-900 block text-xs">
              MANDATORY STATUTORY NOTICE: BLOCKCHAIN PAYMENT IS NEVER A GUARANTEE OF APPROVAL
            </strong>
            <p className="text-[11px] leading-relaxed text-amber-900">
              {usdtConfig.noGuaranteeDisclosure}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Network Selection & Parameters */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Select Supported Blockchain Network *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {usdtConfig.supportedNetworks.filter(n => n.active).map((net) => (
            <button
              key={net.id}
              type="button"
              onClick={() => setSelectedNetworkId(net.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedNetworkId === net.id
                  ? 'border-emerald-800 bg-emerald-50/60 ring-2 ring-emerald-800/20'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-900">{net.name}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                  selectedNetworkId === net.id ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {net.tokenStandard}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>Confirmations: {net.confirmationsRequired} blocks</span>
                <span>Time: {net.estConfirmationMinutes}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Institutional Public Receiving Address Card & Air-gapped Key Guarantee */}
      <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
            <Lock className="w-3.5 h-3.5" />
            <span>Designated Institutional Segregated Custody Address ({activeNetwork.tokenStandard})</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Custodian: {usdtConfig.authorizedCustodian.split('/')[0]}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-950 rounded-lg border border-slate-800">
          <span className="font-mono text-xs sm:text-sm text-emerald-300 break-all select-all font-semibold">
            {activeNetwork.depositAddress}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleCopyAddress}
              className="px-2.5 py-1.5 rounded bg-emerald-800 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
              title="Copy Public Receiving Address"
            >
              {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-200" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAddress ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowQr(!showQr)}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Toggle QR Code"
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* QR Code expansion */}
        {showQr && (
          <div className="p-4 bg-white rounded-lg text-slate-900 text-center animate-fadeIn max-w-xs mx-auto">
            <div className="w-36 h-36 mx-auto bg-slate-100 rounded-lg flex items-center justify-center border border-slate-300 font-mono text-[10px] text-slate-500 mb-2 p-2">
              <div className="flex flex-col items-center">
                <QrCode className="w-20 h-20 text-slate-800 mb-1" />
                <span className="text-[9px] text-slate-400">USDT {activeNetwork.tokenStandard}</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Scan with verified Web3 wallet on {activeNetwork.name}
            </span>
          </div>
        )}

        {/* Air-gapped Key Assurance */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Zero Private Key Exposure:</strong> Private keys and seeds are multi-sig air-gapped with {usdtConfig.authorizedCustodian} and are never stored or handled on application servers.
          </span>
        </div>
      </div>

      {/* 5. Detailed Fee Disclosures, Gas Fees & Refund Conditions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">
            Commitment Principal
          </span>
          <span className="text-base font-extrabold font-mono text-slate-900 mt-0.5 block">
            {equivalentUsdt.toLocaleString()} USDT
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold block">
            = {formatCurrency(commitmentAmount)} (100% Credited to Loan)
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">
            Lender Surcharge Fee
          </span>
          <span className="text-base font-extrabold font-mono text-emerald-900 mt-0.5 block">
            0.00% ($0.00)
          </span>
          <span className="text-[10px] text-slate-500 block">
            Zero Manulife Financial Services fee
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">
            Est. Network Mining Fee
          </span>
          <span className="text-xs font-bold font-mono text-slate-800 mt-0.5 block">
            {activeNetwork.networkGasFeeEst.split('(')[0]}
          </span>
          <span className="text-[10px] text-slate-500 block">
            Paid to blockchain; non-refundable
          </span>
        </div>
      </div>

      {/* 6. Refund Policies & Independent Verification Policy */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
        <h5 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
          <Info className="w-3.5 h-3.5 text-emerald-800" />
          <span>Statutory Refund Policy & Independent Verification</span>
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
          <div className="p-2.5 rounded bg-white border border-slate-200">
            <strong className="text-emerald-950 block mb-0.5">✓ 100% Refundable if Underwriting Declines:</strong>
            <span>{usdtConfig.refundPolicy}</span>
          </div>
          <div className="p-2.5 rounded bg-white border border-slate-200">
            <strong className="text-slate-900 block mb-0.5">✓ Independent Ledger Verification:</strong>
            <span>Settlement requires {activeNetwork.confirmationsRequired} on-chain block confirmations followed by compliance officer sign-off before generating the final escrow receipt.</span>
          </div>
        </div>
      </div>

      {/* 7. Action Bar: Preview Official Receipt & Submit TxHash */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {onPreviewReceipt && (
          <button
            type="button"
            onClick={onPreviewReceipt}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-800" />
            <span>Preview Official USDT Escrow Receipt</span>
          </button>
        )}

        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Custodian: {usdtConfig.authorizedCustodian}</span>
        </div>
      </div>

      {/* Optional: Input TxHash after customer sends transaction */}
      {!submittedTxSuccess && onSubmitTxHash && (
        <form onSubmit={handleTxSubmit} className="pt-3 border-t border-slate-100 space-y-2">
          <span className="text-xs font-bold text-slate-900 block">
            Already Transferred? Submit Blockchain Transaction Hash for Verification:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Your Originating Wallet Address (0x... or T...)"
              value={senderWalletInput}
              onChange={(e) => setSenderWalletInput(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Transaction Hash (TxHash / TxID)"
                value={txHashInput}
                onChange={(e) => setTxHashInput(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-colors shrink-0"
              >
                Submit Hash
              </button>
            </div>
          </div>
        </form>
      )}

      {submittedTxSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>
              <strong>TxHash Submitted:</strong> Queued for independent officer ledger verification.
            </span>
          </div>
          <span className="font-mono text-[10px] text-emerald-800">Status: Pending Confirmations</span>
        </div>
      )}

    </div>
  );
};
