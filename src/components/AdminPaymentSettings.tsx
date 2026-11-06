/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, Unlock, Key, CheckCircle2, AlertTriangle, 
  RefreshCw, Copy, Check, ExternalLink, Plus, Save, Clock, 
  FileText, ArrowRight, ShieldAlert, UserCheck, Layers, Radio,
  Mail, Phone, Building, Globe
} from 'lucide-react';
import { 
  PaymentSettings, 
  PaymentMethodConfig, 
  USDTConfig, 
  PaymentAuditLog, 
  CryptoTransactionVerification,
  CompanyContactSettings
} from '../types';
import { storage } from '../lib/storage';
import { formatCurrency } from '../lib/calculator';

interface AdminPaymentSettingsProps {
  onBackToPipeline?: () => void;
  adminName?: string;
  adminEmail?: string;
  initialTab?: 'methods' | 'usdt_custody' | 'verification_queue' | 'contact_support' | 'audit_trail';
}

export const AdminPaymentSettings: React.FC<AdminPaymentSettingsProps> = ({
  onBackToPipeline,
  adminName = 'A. Montgomery (Senior Underwriter & Compliance Officer)',
  adminEmail = 'admin@manulife-financial.com',
  initialTab = 'methods',
}) => {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<PaymentAuditLog[]>([]);
  const [cryptoVerifications, setCryptoVerifications] = useState<CryptoTransactionVerification[]>([]);
  const [contactSettings, setContactSettings] = useState<CompanyContactSettings | null>(null);
  const [editableContact, setEditableContact] = useState<CompanyContactSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'methods' | 'usdt_custody' | 'verification_queue' | 'contact_support' | 'audit_trail'>(initialTab);

  // Edit states
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');
  
  // 2FA Security Modal state for sensitive changes
  const [show2FAModal, setShow2FAModal] = useState<boolean>(false);
  const [twoFactorCode, setTwoFactorCode] = useState<string>('');
  const [twoFactorError, setTwoFactorError] = useState<string>('');
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);
  const [pendingActionDescription, setPendingActionDescription] = useState<string>('');

  // Editable forms
  const [editableUsdt, setEditableUsdt] = useState<USDTConfig | null>(null);
  const [editableMethods, setEditableMethods] = useState<PaymentMethodConfig[]>([]);

  // Verification review modal
  const [selectedVerification, setSelectedVerification] = useState<CryptoTransactionVerification | null>(null);
  const [verificationNotes, setVerificationNotes] = useState<string>('');

  const loadData = async () => {
    const currentSettings = await storage.getPaymentSettings();
    setSettings(currentSettings);
    setEditableUsdt(JSON.parse(JSON.stringify(currentSettings.usdtConfig)));
    setEditableMethods(JSON.parse(JSON.stringify(currentSettings.methods)));

    const logs = await storage.getPaymentAuditLogs();
    setAuditLogs(logs);

    const verifications = await storage.getCryptoVerifications();
    setCryptoVerifications(verifications);

    const currentContact = await storage.getContactSettings();
    setContactSettings(currentContact);
    setEditableContact(JSON.parse(JSON.stringify(currentContact)));
  };

  const handleSaveContactSettings = () => {
    if (!editableContact) return;

    requestSensitiveAction(
      `Updated institutional support and officer liaison email addresses (Support: ${editableContact.supportEmail}, Direct Liaison: ${editableContact.directLiaisonEmail})`,
      async () => {
        setIsSaving(true);
        await storage.saveContactSettings(editableContact, adminName, adminEmail);
        setContactSettings(editableContact);
        setIsSaving(false);
        setSaveSuccessMsg('Support email addresses and contact information saved successfully and updated across the platform.');
        setTimeout(() => setSaveSuccessMsg(''), 4500);
      }
    );
  };

  const handleResetDefaultContact = () => {
    if (!editableContact) return;
    setEditableContact({
      ...editableContact,
      supportEmail: 'support@manulife-financial.com',
      directLiaisonEmail: 'echezonachukwuokafor16@gmail.com',
      supportPhone: '+44 20 7946 0880',
      londonEmail: 'london.desk@manulife-financial.com',
      zurichEmail: 'zurich.desk@manulife-financial.com',
      nyEmail: 'ny.desk@manulife-financial.com',
      officeHours: '24/7 Global Underwriting Desk (Mon-Fri 06:00 - 22:00 GMT)',
    });
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('verdant_storage_update', handleUpdate);
    return () => window.removeEventListener('verdant_storage_update', handleUpdate);
  }, []);

  // Request 2FA before executing sensitive action
  const requestSensitiveAction = (actionDesc: string, actionFn: () => Promise<void>) => {
    setPendingActionDescription(actionDesc);
    setPendingAction(() => actionFn);
    setTwoFactorCode('');
    setTwoFactorError('');
    setShow2FAModal(true);
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    // Realistic demo 2FA check (accepts demo code '849201' or any 6 digits)
    if (twoFactorCode.trim().length !== 6 || !/^\d+$/.test(twoFactorCode.trim())) {
      setTwoFactorError('Please enter a valid 6-digit numeric authenticator token.');
      return;
    }

    setShow2FAModal(false);
    if (pendingAction) {
      await pendingAction();
      setPendingAction(null);
    }
  };

  // Toggle Payment Method
  const handleToggleMethod = (methodId: string) => {
    const target = editableMethods.find(m => m.id === methodId);
    if (!target) return;
    const newStatus = !target.enabled;

    requestSensitiveAction(
      `${newStatus ? 'Enabled' : 'Disabled'} payment method: ${target.name}`,
      async () => {
        const updated = editableMethods.map(m => m.id === methodId ? { ...m, enabled: newStatus } : m);
        setEditableMethods(updated);
        if (settings) {
          const newSettings: PaymentSettings = {
            ...settings,
            methods: updated,
          };
          await storage.savePaymentSettings(
            newSettings, 
            adminName, 
            adminEmail, 
            `${newStatus ? 'Enabled' : 'Disabled'} payment rail: ${target.name}`,
            true
          );
          setSettings(newSettings);
          setSaveSuccessMsg(`Payment method "${target.name}" ${newStatus ? 'activated' : 'deactivated'} successfully.`);
          setTimeout(() => setSaveSuccessMsg(''), 4000);
        }
      }
    );
  };

  // Save USDT custody settings
  const handleSaveUsdtConfig = () => {
    if (!editableUsdt || !settings) return;

    requestSensitiveAction(
      'Updated USDT cryptocurrency custody and network configuration',
      async () => {
        setIsSaving(true);
        const newSettings: PaymentSettings = {
          ...settings,
          usdtConfig: editableUsdt,
        };
        await storage.savePaymentSettings(
          newSettings,
          adminName,
          adminEmail,
          'Updated USDT custody details, network parameters, and refund policies',
          true
        );
        setSettings(newSettings);
        setIsSaving(false);
        setSaveSuccessMsg('USDT Cryptocurrency custody settings committed and recorded in audit log.');
        setTimeout(() => setSaveSuccessMsg(''), 4500);
      }
    );
  };

  // Verify Crypto Transaction
  const handleVerifyTransaction = async (verificationId: string, status: 'verified' | 'rejected') => {
    requestSensitiveAction(
      `${status === 'verified' ? 'Approved & Certified' : 'Rejected'} on-chain USDT transaction ledger credit`,
      async () => {
        await storage.updateCryptoVerificationStatus(
          verificationId,
          status,
          adminName,
          verificationNotes || (status === 'verified' ? 'On-chain block confirmations verified on explorer.' : 'Insufficient on-chain confirmations or incorrect sender.')
        );
        setSelectedVerification(null);
        setVerificationNotes('');
        setSaveSuccessMsg(`Transaction verification status marked as "${status.toUpperCase()}". Official escrow receipt updated.`);
        setTimeout(() => setSaveSuccessMsg(''), 4000);
      }
    );
  };

  if (!settings || !editableUsdt) {
    return (
      <div className="py-16 text-center text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-800" />
        <p className="text-xs">Loading secure payment settings vault...</p>
      </div>
    );
  }

  const pendingVerificationsCount = cryptoVerifications.filter(v => v.status === 'pending_verification').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Security Status */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400 font-bold text-xl shrink-0">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-emerald-400 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Restricted Underwriting & Payment Governance Vault</span>
                <span className="text-slate-500">·</span>
                <span className="text-emerald-300 font-mono">2FA ENFORCED</span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">
                Payment Settings & Cryptocurrency Custody Desk
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Manage authorized fiat payment rails, configure regulated USDT digital asset custody, verify on-chain ledger settlements, and audit configuration modifications.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onBackToPipeline && (
              <button
                type="button"
                onClick={onBackToPipeline}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>Return to Loan Pipeline</span>
              </button>
            )}
          </div>
        </div>

        {/* Security Disclosures Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Private Key Protection:</strong> Institutional keys are multi-sig air-gapped in HSM vaults (BitGo). Never exposed on web servers.</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Dual-Control Policy:</strong> All modifications to settlement rails require 2FA TOTP authentication and generate immutable audit logs.</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span><strong>Zero Guarantee Mandate:</strong> Blockchain transactions are never treated as automatic loan approval.</span>
          </div>
        </div>
      </div>

      {/* Success Notification Bar */}
      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-950 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span className="font-semibold">{saveSuccessMsg}</span>
        </div>
      )}

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('methods')}
          className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'methods'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Approved Payment Rails ({editableMethods.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('usdt_custody')}
          className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'usdt_custody'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-emerald-900 text-emerald-400 flex items-center justify-center text-[10px] font-bold">₮</span>
          <span>USDT Cryptocurrency Custody</span>
          {editableUsdt.enabled && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('verification_queue')}
          className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'verification_queue'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Independent Verification Queue</span>
          {pendingVerificationsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-mono">
              {pendingVerificationsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contact_support')}
          className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'contact_support'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Mail className="w-4 h-4 text-emerald-500" />
          <span>Support & Email Settings</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-medium">
            Active
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit_trail')}
          className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'audit_trail'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Audit Log Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: APPROVED PAYMENT METHODS MANAGEMENT */}
      {activeTab === 'methods' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Institutional Payment Rails & Settlement Gateways
              </h3>
              <p className="text-xs text-slate-500">
                Configure settlement rails made available to loan applicants for their 10% statutory financial commitment deposit.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Last Updated: {new Date(settings.updatedAt).toLocaleDateString()} by {settings.updatedBy}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {editableMethods.map((method) => (
              <div
                key={method.id}
                className={`p-5 rounded-2xl border transition-all ${
                  method.enabled
                    ? 'bg-white border-slate-200 shadow-sm'
                    : 'bg-slate-50/70 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      method.category === 'crypto'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-100 text-slate-800 border border-slate-300'
                    }`}>
                      {method.category === 'crypto' ? '₮' : '$'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{method.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          method.category === 'crypto' ? 'bg-purple-100 text-purple-900' : 'bg-blue-100 text-blue-900'
                        }`}>
                          {method.category}
                        </span>
                        {method.requiresIndependentVerification && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-900">
                            Independent Verification Required
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-1 gap-x-4 text-xs text-slate-600 mt-2 font-mono">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-sans">Provider / Custodian:</span>
                          <span className="font-semibold text-slate-800">{method.providerName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-sans">Account Ref / Address:</span>
                          <span className="font-semibold text-slate-800 truncate block max-w-xs">{method.providerAccountOrAddress}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-sans">Settlement SLA:</span>
                          <span className="font-semibold text-slate-800">{method.processingTime}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 mt-2">
                        {method.notes}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleMethod(method.id)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
                        method.enabled
                          ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                          : 'bg-emerald-800 text-white hover:bg-emerald-900'
                      }`}
                    >
                      {method.enabled ? 'Deactivate Rail' : 'Activate Rail'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: USDT CRYPTOCURRENCY CUSTODY & NETWORK SETTINGS */}
      {activeTab === 'usdt_custody' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Tether USD (USDT) Institutional Custody Parameters
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {editableUsdt.isLegalApprovalGranted ? 'Legal Approval Granted' : 'Pending Review'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure supported blockchain ledgers, multi-sig custody custodian, fee structures, and legal disclosures.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveUsdtConfig}
              disabled={isSaving}
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center gap-2"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Commit Settings (2FA Required)</span>
            </button>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Custodian & License */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Authorized Digital Asset Custodian *
              </label>
              <input
                type="text"
                value={editableUsdt.authorizedCustodian}
                onChange={(e) => setEditableUsdt({ ...editableUsdt, authorizedCustodian: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Regulated financial institution holding escrow wallets</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custodian Regulatory License Ref *
              </label>
              <input
                type="text"
                value={editableUsdt.custodianLicenseRef}
                onChange={(e) => setEditableUsdt({ ...editableUsdt, custodianLicenseRef: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Statutory fiduciary charter or trust company license</span>
            </div>

            {/* Oracle Provider & Exchange Rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Price Oracle Data Source *
              </label>
              <input
                type="text"
                value={editableUsdt.oracleProvider}
                onChange={(e) => setEditableUsdt({ ...editableUsdt, oracleProvider: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Decentralized spot rate provider (fixed 1:1 USD peg parity)</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lender Surcharge Fee Percentage (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="5"
                  value={editableUsdt.custodySurchargePct}
                  onChange={(e) => setEditableUsdt({ ...editableUsdt, custodySurchargePct: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
              <span className="text-[11px] text-emerald-700 mt-1 block font-medium">Must be 0.00% to uphold zero upfront lending fee policy</span>
            </div>

          </div>

          {/* Supported Networks Table & Public Receiving Addresses */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Supported Blockchain Networks & Segregated Public Custody Addresses</span>
              <span className="text-xs text-slate-500 font-normal">Private keys are air-gapped in HSM vaults</span>
            </h4>

            <div className="space-y-3">
              {editableUsdt.supportedNetworks.map((net, idx) => (
                <div key={net.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{net.name} ({net.tokenStandard})</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        net.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {net.active ? 'Active Network' : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={net.active}
                          onChange={(e) => {
                            const updated = [...editableUsdt.supportedNetworks];
                            updated[idx].active = e.target.checked;
                            setEditableUsdt({ ...editableUsdt, supportedNetworks: updated });
                          }}
                          className="w-4 h-4 text-emerald-800 rounded border-slate-300"
                        />
                        <span>Enable for Borrowers</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Public Receiving Deposit Address (Multi-Sig Vault) *
                      </label>
                      <input
                        type="text"
                        value={net.depositAddress}
                        onChange={(e) => {
                          const updated = [...editableUsdt.supportedNetworks];
                          updated[idx].depositAddress = e.target.value;
                          setEditableUsdt({ ...editableUsdt, supportedNetworks: updated });
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded font-mono text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Required On-Chain Confirmations *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="256"
                        value={net.confirmationsRequired}
                        onChange={(e) => {
                          const updated = [...editableUsdt.supportedNetworks];
                          updated[idx].confirmationsRequired = Number(e.target.value);
                          setEditableUsdt({ ...editableUsdt, supportedNetworks: updated });
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded font-mono text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Disclosures & Refund Policies Configuration */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <h4 className="text-sm font-bold text-slate-900">
              Statutory Disclosures & Borrower Conditions
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mandatory "Non-Guarantee of Loan Approval" Notice *
              </label>
              <textarea
                rows={2}
                value={editableUsdt.noGuaranteeDisclosure}
                onChange={(e) => setEditableUsdt({ ...editableUsdt, noGuaranteeDisclosure: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Refund Policy Disclosure *
                </label>
                <textarea
                  rows={3}
                  value={editableUsdt.refundPolicy}
                  onChange={(e) => setEditableUsdt({ ...editableUsdt, refundPolicy: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gas Fee & Network Miner Policy *
                </label>
                <textarea
                  rows={3}
                  value={editableUsdt.gasFeePolicy}
                  onChange={(e) => setEditableUsdt({ ...editableUsdt, gasFeePolicy: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: INDEPENDENT TRANSACTION VERIFICATION QUEUE */}
      {activeTab === 'verification_queue' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Cryptocurrency Ledger Verification Queue
                </h3>
                <p className="text-xs text-slate-500">
                  Compliance officers must independently verify on-chain transaction hashes, block confirmations, and match funds against BitGo trust ledger entries before issuing formal commitment receipts.
                </p>
              </div>
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200">
                Independent Verification Mandatory
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Ref & Applicant</th>
                  <th className="py-3 px-4">Amount & Network</th>
                  <th className="py-3 px-4">TxHash / Explorer</th>
                  <th className="py-3 px-4">Confirmations</th>
                  <th className="py-3 px-4">Verification Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {cryptoVerifications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No cryptocurrency transactions currently pending verification.
                    </td>
                  </tr>
                ) : (
                  cryptoVerifications.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 block">{item.applicationId}</span>
                        <span className="text-slate-500">{item.applicantName}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-emerald-950 block">
                          {item.amountUsdt.toLocaleString()} USDT
                        </span>
                        <span className="text-[10px] text-slate-500">{item.network}</span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px]">
                        <span className="text-slate-700 truncate block max-w-xs">{item.txHash}</span>
                        <span className="text-[10px] text-emerald-700 flex items-center gap-1 mt-0.5">
                          <ExternalLink className="w-3 h-3" />
                          <span>Etherscan / Tronscan Verified</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span className="font-bold text-slate-900">{item.confirmations}</span> / {item.requiredConfirmations} blocks
                      </td>

                      <td className="py-3 px-4">
                        {item.status === 'verified' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Verified by Officer
                          </span>
                        ) : item.status === 'rejected' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800">
                            Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                            <Clock className="w-3.5 h-3.5" />
                            Pending Verification
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {item.status === 'pending_verification' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedVerification(item);
                                handleVerifyTransaction(item.id, 'verified');
                              }}
                              className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-semibold"
                            >
                              Verify & Certify
                            </button>
                            <button
                              type="button"
                              onClick={() => handleVerifyTransaction(item.id, 'rejected')}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-red-700 rounded text-xs font-semibold"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">
                            {item.receiptNumber}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: IMMUTABLE PAYMENT AUDIT LOG TRAIL */}
      {activeTab === 'audit_trail' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Payment Settings Audit Log Trail
              </h3>
              <p className="text-xs text-slate-500">
                Tamper-evident record of all administrator modifications, 2FA authorizations, payment method updates, and ledger actions.
              </p>
            </div>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-mono font-semibold">
              {auditLogs.length} Logged Events
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Timestamp & IP</th>
                  <th className="py-3 px-4">Administrator Responsible</th>
                  <th className="py-3 px-4">Action Performed</th>
                  <th className="py-3 px-4">Details & Parameters</th>
                  <th className="py-3 px-4">2FA Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-semibold text-slate-900 block">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400">{log.ipAddress}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <strong className="text-slate-900 block">{log.adminName}</strong>
                      <span className="text-slate-500 text-[11px] font-mono">{log.adminEmail}</span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {log.action}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 max-w-md">
                      {log.details}
                    </td>

                    <td className="py-3.5 px-4">
                      {log.twoFactorVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <Check className="w-3 h-3 text-emerald-700" />
                          2FA Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                          System
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: EDITABLE SUPPORT & CONTACT EMAILS */}
      {activeTab === 'contact_support' && editableContact && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-emerald-800 mb-1">
                  <Mail className="w-4 h-4" />
                  <span>Institutional Communication & Borrower Support Desk</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Global Support & Officer Liaison Email Settings
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Configure and edit official customer support inboxes, direct underwriter liaisons, and regional desk emails. Updates are instantly synchronized across the top navigation ribbon, contact page, borrower portal, official receipts, and footer.
                </p>
              </div>

              {contactSettings?.updatedAt && (
                <div className="text-right text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200 shrink-0">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Last Modified</span>
                  <span className="font-mono font-bold text-slate-800 block">
                    {new Date(contactSettings.updatedAt).toLocaleDateString()} {new Date(contactSettings.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-slate-500 text-[10px] block mt-0.5">
                    by {contactSettings.updatedBy || adminName}
                  </span>
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8 space-y-8">
              
              {/* Section 1: Primary Support & Direct Underwriter Liaison */}
              <div>
                <div className="flex items-center gap-2 pb-3 mb-5 border-b border-slate-100">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">1</span>
                  <h4 className="text-sm font-bold text-slate-900">
                    Primary Borrower Support & Direct Escalation Channels
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Primary Support Email */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      Primary Customer Support Email *
                    </label>
                    <p className="text-[11px] text-slate-500">
                      General inquiries, loan documentation support, and borrower assistance. Displayed prominently in header ribbon and footer.
                    </p>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-emerald-700 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={editableContact.supportEmail}
                        onChange={(e) => setEditableContact({ ...editableContact, supportEmail: e.target.value })}
                        placeholder="support@manulife-financial.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                  </div>

                  {/* Direct Officer Liaison Email */}
                  <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-emerald-950">
                        Direct Officer Liaison Email *
                      </label>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-900">
                        High Priority
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      Direct escalation liaison address for confidential underwriting cases and senior credit committee communications.
                    </p>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-emerald-800 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={editableContact.directLiaisonEmail}
                        onChange={(e) => setEditableContact({ ...editableContact, directLiaisonEmail: e.target.value })}
                        placeholder="echezonachukwuokafor16@gmail.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Telephone Hotline */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      Priority Telephone Hotline *
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Official telephone connection routed through encrypted PBX exchange for borrower verification.
                    </p>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={editableContact.supportPhone}
                        onChange={(e) => setEditableContact({ ...editableContact, supportPhone: e.target.value })}
                        placeholder="+44 20 7946 0880"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                  </div>

                  {/* Operating Hours */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      Global Operating & Underwriting Schedule
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Official hours of the credit assessment committee displayed on the contact desk.
                    </p>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={editableContact.officeHours}
                        onChange={(e) => setEditableContact({ ...editableContact, officeHours: e.target.value })}
                        placeholder="24/7 Global Underwriting Desk (Mon-Fri 06:00 - 22:00 GMT)"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Regional Lending Desk Inboxes */}
              <div>
                <div className="flex items-center gap-2 pb-3 mb-5 border-b border-slate-100">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">2</span>
                  <h4 className="text-sm font-bold text-slate-900">
                    Regulated Regional Underwriting Desk Inboxes
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* London Desk */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">London HQ Desk</span>
                      <span className="text-[10px] font-mono bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">GMT</span>
                    </div>
                    <div className="relative">
                      <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={editableContact.londonEmail}
                        onChange={(e) => setEditableContact({ ...editableContact, londonEmail: e.target.value })}
                        placeholder="london.desk@manulife-financial.com"
                        className="w-full pl-8 pr-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block">100 Bishopsgate, London</span>
                  </div>

                  {/* Zurich Desk */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Zurich Private Credit</span>
                      <span className="text-[10px] font-mono bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">CET</span>
                    </div>
                    <div className="relative">
                      <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={editableContact.zurichEmail}
                        onChange={(e) => setEditableContact({ ...editableContact, zurichEmail: e.target.value })}
                        placeholder="zurich.desk@manulife-financial.com"
                        className="w-full pl-8 pr-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block">Bahnhofstrasse 45, Zürich</span>
                  </div>

                  {/* New York Desk */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Americas Division</span>
                      <span className="text-[10px] font-mono bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">EST</span>
                    </div>
                    <div className="relative">
                      <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={editableContact.nyEmail}
                        onChange={(e) => setEditableContact({ ...editableContact, nyEmail: e.target.value })}
                        placeholder="ny.desk@manulife-financial.com"
                        className="w-full pl-8 pr-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block">One Vanderbilt, New York</span>
                  </div>
                </div>
              </div>

              {/* Live Preview Strip */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-emerald-400">Live Borrower Display Preview</span>
                  <span className="text-[10px] font-mono text-slate-400">Synchronized Globally</span>
                </div>
                <div className="text-xs flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>
                    <strong className="text-slate-400">Support: </strong>
                    <span className="text-emerald-300 font-mono">{editableContact.supportEmail}</span>
                  </span>
                  <span>·</span>
                  <span>
                    <strong className="text-slate-400">Direct Liaison: </strong>
                    <span className="text-white font-mono">{editableContact.directLiaisonEmail}</span>
                  </span>
                  <span>·</span>
                  <span>
                    <strong className="text-slate-400">Hotline: </strong>
                    <span className="text-slate-200 font-mono">{editableContact.supportPhone}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleResetDefaultContact}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset to Corporate Defaults</span>
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleSaveContactSettings}
                    disabled={isSaving}
                    className="w-full sm:w-auto px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Deploying Changes...' : 'Save & Publish Email Settings (2FA)'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 2FA AUTHENTICATION MODAL FOR SENSITIVE CHANGES */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-300 p-6 text-xs text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Two-Factor Authentication (2FA) Required
                  </h4>
                  <span className="text-[10px] text-slate-400">Sensitive Configuration Governance</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShow2FAModal(false)}
                className="text-slate-400 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-xs">
                <strong>Pending Action:</strong> {pendingActionDescription}
              </div>

              <p className="text-slate-600 text-xs">
                To protect institutional custody rails and prevent unauthorized wallet alterations, enter the 6-digit TOTP code from your registered hardware authenticator.
              </p>

              <form onSubmit={handleVerify2FA} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      6-Digit Authenticator Token *
                    </label>
                    <span className="text-[10px] text-emerald-800 font-mono">
                      (Demo Passcode: 849201)
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    placeholder="849201"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    className="w-full text-center tracking-[0.5em] font-mono font-bold text-xl py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                {twoFactorError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                    {twoFactorError}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Authenticate & Authorize Change
                  </button>
                  <button
                    type="button"
                    onClick={() => setShow2FAModal(false)}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
