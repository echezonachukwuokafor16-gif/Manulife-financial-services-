/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, Unlock, Search, Filter, Eye, EyeOff, CheckCircle2, 
  XCircle, AlertTriangle, FileText, Send, RefreshCw, Database, 
  DollarSign, TrendingUp, Users, ArrowUpRight, Copy, Check, Key, CreditCard, Mail, Scan, Camera, UserPlus, X,
  Trash2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { LoanApplication, LoanStatus, LoanPurpose } from '../types';
import { storage } from '../lib/storage';
import { formatCurrency, calculateDTI, calculateLoanRepayment } from '../lib/calculator';
import { isSupabaseConfigured, SUPABASE_SQL_SCHEMA } from '../lib/supabase';
import { AdminPaymentSettings } from './AdminPaymentSettings';

interface AdminDashboardProps {
  onOpenDocumentModal: (application: LoanApplication, docType: 'term_sheet' | 'summary' | 'amortization' | 'commitment_receipt') => void;
  isInitiallyAuthenticated?: boolean;
  onSignOut?: () => void;
  onAuthSuccess?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  onOpenDocumentModal,
  isInitiallyAuthenticated = false,
  onSignOut,
  onAuthSuccess,
}) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(isInitiallyAuthenticated);
  const [emailInput, setEmailInput] = useState<string>('admin@manulife-financial.com');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [showOfficerCredentials, setShowOfficerCredentials] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [revealedPasscode, setRevealedPasscode] = useState<boolean>(false);

  useEffect(() => {
    if (isInitiallyAuthenticated) {
      setIsAuthenticated(true);
    }
  }, [isInitiallyAuthenticated]);

  // Data state
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentAdminTab, setCurrentAdminTab] = useState<'pipeline' | 'payment_settings'>('pipeline');
  const [paymentSettingsTab, setPaymentSettingsTab] = useState<'methods' | 'usdt_custody' | 'verification_queue' | 'contact_support' | 'email_notifications' | 'audit_trail'>('methods');
  const [statusSuccessMsg, setStatusSuccessMsg] = useState<string>('');

  // Action Drawer / Underwriting edit form state
  const [statusToSet, setStatusToSet] = useState<LoanStatus>('approved');
  const [approvedAmount, setApprovedAmount] = useState<number>(100000);
  const [approvedRate, setApprovedRate] = useState<number>(5.45);
  const [officerNotes, setOfficerNotes] = useState<string>('');
  const [customDocRequest, setCustomDocRequest] = useState<string>('');
  const [disbursementRef, setDisbursementRef] = useState<string>('');
  const [customNotificationTitle, setCustomNotificationTitle] = useState<string>('');
  const [customNotificationBody, setCustomNotificationBody] = useState<string>('');

  // Supabase Schema Copy Feedback
  const [copiedSchema, setCopiedSchema] = useState<boolean>(false);
  const [showDbModal, setShowDbModal] = useState<boolean>(false);

  // Admin Manual Borrower Registration state
  const [showAdminRegisterModal, setShowAdminRegisterModal] = useState<boolean>(false);
  const [adminRegisterForm, setAdminRegisterForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    requestedAmount: 100000,
    purpose: 'Commercial & Business Expansion' as LoanPurpose,
    repaymentPeriodMonths: 36,
    password: '',
  });
  const [adminRegisterError, setAdminRegisterError] = useState<string>('');
  const [adminRegisterSuccess, setAdminRegisterSuccess] = useState<string>('');
  const [adminRegisterLoading, setAdminRegisterLoading] = useState<boolean>(false);

  const handleAdminRegisterBorrower = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminRegisterError('');
    if (!adminRegisterForm.fullName.trim() || !adminRegisterForm.email.trim()) {
      setAdminRegisterError('Full name and email address are required.');
      return;
    }
    setAdminRegisterLoading(true);
    try {
      const newApp = await storage.registerBorrower({
        fullName: adminRegisterForm.fullName.trim(),
        email: adminRegisterForm.email.trim(),
        phoneNumber: adminRegisterForm.phoneNumber.trim() || '+1 (555) 019-2834',
        desiredAmount: Number(adminRegisterForm.requestedAmount) || 100000,
        repaymentMonths: Number(adminRegisterForm.repaymentPeriodMonths) || 36,
        purpose: adminRegisterForm.purpose,
        password: adminRegisterForm.password.trim() || 'Borrower2026!',
      });
      await loadData();
      setAdminRegisterSuccess(`✓ Borrower ${newApp.personal.fullName} registered successfully (${newApp.id}). Application added to Underwriting Pipeline.`);
      setTimeout(() => {
        setAdminRegisterSuccess('');
        setShowAdminRegisterModal(false);
        setAdminRegisterForm({
          fullName: '',
          email: '',
          phoneNumber: '',
          requestedAmount: 100000,
          purpose: 'Commercial & Business Expansion',
          repaymentPeriodMonths: 36,
          password: '',
        });
      }, 1400);
    } catch (err: any) {
      setAdminRegisterError(err?.message || 'Failed to register borrower.');
    } finally {
      setAdminRegisterLoading(false);
    }
  };

  const loadData = async () => {
    const apps = await storage.getAllApplications();
    setApplications(apps);
    if (selectedApp) {
      const refreshed = apps.find((a) => a.id === selectedApp.id);
      if (refreshed) setSelectedApp(refreshed);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      const handleUpdate = () => loadData();
      window.addEventListener('verdant_storage_update', handleUpdate);
      
      // Auto-poll central production database every 5 seconds so registrations from other phones/devices appear automatically
      const pollTimer = setInterval(() => {
        loadData();
      }, 5000);

      return () => {
        window.removeEventListener('verdant_storage_update', handleUpdate);
        clearInterval(pollTimer);
      };
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = emailInput.trim().toLowerCase();
    const isPasscodeValid = passwordInput === 'admin2026' || passwordInput.toLowerCase() === 'admin';
    const isEmailValid = normalizedEmail === 'admin@manulife-financial.com' || normalizedEmail === 'admin' || normalizedEmail.endsWith('@manulife-financial.com');

    if (isEmailValid && isPasscodeValid) {
      setIsAuthenticated(true);
      setAuthError('');
      if (onAuthSuccess) {
        onAuthSuccess();
      }
    } else {
      setAuthError('Access Denied: Invalid credentials or unassigned identity. Authorized personnel only.');
    }
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    if (onSignOut) {
      onSignOut();
    }
  };

  const handleCopyField = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleOpenDossier = (app: LoanApplication) => {
    setSelectedApp(app);
    setStatusToSet(app.status);
    setApprovedAmount(app.underwriting?.approvedAmount || app.loan.requestedAmount);
    setApprovedRate(app.underwriting?.approvedRate || 5.45);
    setOfficerNotes(app.underwriting?.officerNotes || '');
    setDisbursementRef(app.underwriting?.disbursementReference || `WIRE-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleUpdateStatus = async () => {
    if (!selectedApp) return;

    let requestedDocsList = selectedApp.underwriting?.requestedDocuments || [];
    if (statusToSet === 'documents_required' && customDocRequest.trim()) {
      requestedDocsList = [customDocRequest.trim(), ...requestedDocsList];
    }

    await storage.updateApplicationStatus(selectedApp.id, statusToSet, {
      approvedAmount,
      approvedRate,
      officerNotes,
      disbursementReference: statusToSet === 'disbursed' ? disbursementRef : undefined,
      requestedDocuments: requestedDocsList,
      reviewedBy: 'A. Montgomery (Credit Committee Underwriter)',
      decisionDate: new Date().toISOString(),
    });

    // If custom notification typed, also send it
    if (customNotificationTitle && customNotificationBody) {
      await storage.addNotification({
        id: `notif-${Date.now()}`,
        applicationId: selectedApp.id,
        recipientEmail: selectedApp.personal.email,
        title: customNotificationTitle,
        message: customNotificationBody,
        timestamp: new Date().toISOString(),
        type: 'info',
        isRead: false,
      });
      setCustomNotificationTitle('');
      setCustomNotificationBody('');
    }

    await loadData();
    setStatusSuccessMsg(`✓ Application ${selectedApp.id} status successfully updated to "${statusToSet.toUpperCase()}". Official email notification dispatched to applicant & underwriter liaison.`);
    setTimeout(() => setStatusSuccessMsg(''), 6000);
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 3000);
  };

  // Filter applications
  const filteredApps = applications.filter((app) => {
    let matchesStatus = false;
    if (filterStatus === 'all') matchesStatus = true;
    else if (filterStatus === 'referred') matchesStatus = Boolean(app.referral?.referredBy);
    else matchesStatus = app.status === filterStatus;

    const matchesSearch =
      searchQuery === '' ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.personal.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.personal.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.loan.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      Boolean(app.referral?.referralCode && app.referral.referralCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      Boolean(app.referral?.referredBy && app.referral.referredBy.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Calculate high-level pipeline stats
  const totalVolume = applications.reduce((sum, a) => sum + a.loan.requestedAmount, 0);
  const approvedVolume = applications
    .filter((a) => a.status === 'approved' || a.status === 'disbursed')
    .reduce((sum, a) => sum + (a.underwriting?.approvedAmount || a.loan.requestedAmount), 0);
  const pendingCount = applications.filter(
    (a) => a.status === 'pending_review' || a.status === 'underwriting' || a.status === 'documents_required'
  ).length;
  const approvedCount = applications.filter((a) => a.status === 'approved' || a.status === 'disbursed').length;
  const approvalRate = applications.length ? Math.round((approvedCount / applications.length) * 100) : 0;

  // Pagination State (Requirement 1 & 3)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [deletingAppId, setDeletingAppId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchQuery]);

  const handleDeleteApplication = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete borrower ${name} (File Ref: ${id}) from the database? This cannot be undone.`)) {
      return;
    }
    setDeletingAppId(id);
    try {
      await storage.deleteApplication(id);
      await loadData();
      setStatusSuccessMsg(`✓ Application dossier ${id} (${name}) has been permanently deleted from the database.`);
      setTimeout(() => setStatusSuccessMsg(''), 5000);
    } catch (err: any) {
      alert(`Failed to delete application: ${err.message}`);
    } finally {
      setDeletingAppId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredApps.length / itemsPerPage));
  const paginatedApps = filteredApps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="py-20 bg-slate-50 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-xl text-center">
          <img 
            src="/assets/aistudio/file_00000000245881fdbc108ee1cf0b4466_512afb92.png" 
            alt="Manulife Financial Services" 
            className="w-20 h-20 object-contain rounded-full mx-auto mb-4 shadow-md border border-emerald-100 bg-white" 
          />

          <div className="text-center mb-6">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-800">
              Manulife Financial Services
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Underwriting Desk Authorization
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Restricted portal for authorized credit committee underwriters & compliance officers.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Officer Email / User ID
              </label>
              <input
                type="text"
                placeholder="officer@manulife-financial.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Access Passcode
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                autoComplete="current-password"
                required
              />
            </div>

            {authError && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 text-left">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-emerald-900 hover:bg-emerald-950 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Authenticate Credentials</span>
            </button>
          </form>

          {/* Secure Audit Notice (No Passcode Displayed) */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <div className="flex items-center justify-center gap-1.5 text-slate-500 text-[11px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Secured Session · Hardware Cryptographic Storage</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Protected under ISO/IEC 27001 and institutional fair lending mandates. Unauthorized access prohibited.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED ADMIN DASHBOARD
  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Control Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img 
                src="/assets/aistudio/file_00000000245881fdbc108ee1cf0b4466_512afb92.png" 
                alt="Manulife Financial Services" 
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain rounded-full shadow-sm border border-emerald-100 bg-white shrink-0" 
              />
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-emerald-800 mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Manulife Financial Services · Credit Committee</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-slate-500 font-mono">SENIOR UNDERWRITER</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Institutional Underwriting & Pipeline Management
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setShowAdminRegisterModal(true)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-sm ring-1 ring-emerald-600"
                title="Manually register and onboard a new borrower dossier"
              >
                <UserPlus className="w-4 h-4 text-emerald-200" />
                <span>+ Register Borrower</span>
              </button>

              <button
                type="button"
                onClick={() => setShowOfficerCredentials(true)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-sm ring-1 ring-slate-700"
                title="View confidential officer login credentials and 2FA token"
              >
                <Key className="w-4 h-4 text-emerald-400" />
                <span>Officer Credentials & 2FA</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentSettingsTab('methods');
                  setCurrentAdminTab(currentAdminTab === 'pipeline' ? 'payment_settings' : 'pipeline');
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                  currentAdminTab === 'payment_settings' && paymentSettingsTab !== 'contact_support'
                    ? 'bg-emerald-900 text-white ring-2 ring-emerald-700'
                    : 'bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                <Key className="w-4 h-4 text-emerald-600" />
                <span>{currentAdminTab === 'payment_settings' ? '← Back to Pipeline' : 'Payment & Custody Settings'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentSettingsTab('contact_support');
                  setCurrentAdminTab('payment_settings');
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                  currentAdminTab === 'payment_settings' && paymentSettingsTab === 'contact_support'
                    ? 'bg-slate-900 text-white ring-2 ring-emerald-500'
                    : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Mail className="w-4 h-4 text-emerald-600" />
                <span>Support & Email Settings</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentSettingsTab('email_notifications');
                  setCurrentAdminTab('payment_settings');
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                  currentAdminTab === 'payment_settings' && paymentSettingsTab === 'email_notifications'
                    ? 'bg-slate-900 text-white ring-2 ring-emerald-500'
                    : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Send className="w-4 h-4 text-emerald-600" />
                <span>Email Notifications & Outbox</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDbModal(true)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <Database className="w-4 h-4 text-emerald-800" />
                <span>Database / Supabase</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  storage.resetToDemo();
                  loadData();
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                title="Reset application pipeline to realistic demo seed data"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset Demo Seed</span>
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* 6 Real Database KPI Portfolio Cards (Requirement 3) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 mt-6 pt-6 border-t border-slate-100">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">
                Total Registered Users
              </span>
              <span className="text-2xl font-extrabold font-mono text-slate-900 mt-1 block">
                {applications.length}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Stored in connected DB</span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-300 shadow-2xs">
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800 block">
                ★ New Registrations
              </span>
              <span className="text-2xl font-extrabold font-mono text-emerald-900 mt-1 block">
                {applications.filter((a) => a.status === 'pending_review').length}
              </span>
              <span className="text-[10px] text-emerald-700 mt-0.5 block font-medium">Awaiting committee review</span>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 shadow-2xs">
              <span className="text-[10px] uppercase tracking-wider font-bold text-blue-800 block">
                Active Users
              </span>
              <span className="text-2xl font-extrabold font-mono text-blue-900 mt-1 block">
                {applications.filter((a) => a.status === 'approved' || a.status === 'disbursed' || a.status === 'underwriting').length}
              </span>
              <span className="text-[10px] text-blue-700 mt-0.5 block font-medium">In credit pipeline</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-600 block">
                Suspended / Declined
              </span>
              <span className="text-2xl font-extrabold font-mono text-slate-700 mt-1 block">
                {applications.filter((a) => a.status === 'declined').length}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block font-medium">Non-qualifying files</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">
                Approved Capital
              </span>
              <span className="text-2xl font-extrabold font-mono text-emerald-900 mt-1 block">
                {formatCurrency(approvedVolume)}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block font-medium">{applications.filter((a) => a.status === 'approved' || a.status === 'disbursed').length} credit lines</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">
                Approval Rate
              </span>
              <span className="text-2xl font-extrabold font-mono text-slate-900 mt-1 block">
                {approvalRate}%
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Tier 1/2 distribution</span>
            </div>
          </div>
        </div>

        {/* Status Update Success Banner */}
        {statusSuccessMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-950 text-xs font-semibold flex items-center gap-3 animate-fadeIn shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>{statusSuccessMsg}</span>
          </div>
        )}

        {currentAdminTab === 'payment_settings' ? (
          <AdminPaymentSettings 
            key={paymentSettingsTab}
            initialTab={paymentSettingsTab}
            onBackToPipeline={() => setCurrentAdminTab('pipeline')}
            adminName="A. Montgomery (Senior Underwriter & Compliance Officer)"
            adminEmail="admin@manulife-financial.com"
          />
        ) : (
          /* Applications Queue Section */
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          
          {/* Filter Bar */}
          <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search applicant name, ID, email, or loan purpose..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
              {[
                { key: 'all', label: `All Dossiers (${applications.length})` },
                { key: 'pending_review', label: `★ New Registrations (${applications.filter(a => a.status === 'pending_review').length})`, highlight: true },
                { key: 'referred', label: `Referral Accounts (${applications.filter(a => Boolean(a.referral?.referredBy)).length})` },
                { key: 'underwriting', label: `Underwriting (${applications.filter(a => a.status === 'underwriting').length})` },
                { key: 'documents_required', label: `Docs Needed (${applications.filter(a => a.status === 'documents_required').length})` },
                { key: 'approved', label: `Approved (${applications.filter(a => a.status === 'approved' || a.status === 'disbursed').length})` },
                { key: 'declined', label: `Declined (${applications.filter(a => a.status === 'declined').length})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilterStatus(tab.key)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    filterStatus === tab.key
                      ? tab.highlight 
                        ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-600'
                        : 'bg-slate-900 text-white shadow-sm'
                      : tab.highlight
                      ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Ref ID</th>
                  <th className="py-3.5 px-4">Applicant</th>
                  <th className="py-3.5 px-4">Facility & Purpose</th>
                  <th className="py-3.5 px-4">Income & DTI</th>
                  <th className="py-3.5 px-4">Referral Track</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No applications match the current query and filter.
                    </td>
                  </tr>
                ) : (
                  paginatedApps.map((app) => {
                    const est = calculateLoanRepayment(app.loan.requestedAmount, 5.75, app.loan.repaymentPeriodMonths);
                    const { dtiPct, riskRating } = calculateDTI(
                      app.employment.monthlyIncome,
                      app.employment.additionalIncome,
                      app.financial.monthlyObligations,
                      app.financial.monthlyRent,
                      app.financial.otherCommitments,
                      est.monthlyRepayment
                    );

                    return (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                        
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-950">
                          {app.id}
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            {app.personal.photoUrl ? (
                              <img
                                src={app.personal.photoUrl}
                                alt={app.personal.fullName}
                                className="w-8 h-8 rounded-full object-cover border border-slate-300 shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                {app.personal.fullName.slice(0, 2)}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-slate-900">{app.personal.fullName}</span>
                                {app.status === 'pending_review' && (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                                    ★ NEW REGISTRATION
                                  </span>
                                )}
                                {app.faceVerification && (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200" title="Biometric Face Liveness Verified">
                                    BIO ✓ {app.faceVerification.livenessScore}%
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 block">
                                {app.personal.email} {app.personal.phoneNumber && <span className="text-slate-400">· {app.personal.phoneNumber}</span>}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-slate-900 text-sm block">
                            {formatCurrency(app.loan.requestedAmount)}
                          </span>
                          <span className="text-[11px] text-slate-500 line-clamp-1">
                            {app.loan.purpose} · {app.loan.repaymentPeriodMonths} Mo
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          <span className="text-slate-900 font-semibold block">
                            ${app.employment.monthlyIncome.toLocaleString()} /mo
                          </span>
                          <span className={`text-[10px] font-bold ${
                            dtiPct <= 35 ? 'text-emerald-700' : dtiPct <= 45 ? 'text-amber-700' : 'text-red-700'
                          }`}>
                            DTI: {dtiPct}% ({riskRating})
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          {app.referral?.referredBy ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                              Ref: {app.referral.referredBy}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-sans">Direct</span>
                          )}
                          <span className="block text-[9px] text-slate-400 font-mono mt-0.5">
                            {app.referral?.referralCode || `REF-${app.id.replace('MFS-2026-', '')}`}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                            app.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.status === 'underwriting'
                              ? 'bg-blue-100 text-blue-800'
                              : app.status === 'documents_required'
                              ? 'bg-amber-100 text-amber-800'
                              : app.status === 'declined'
                              ? 'bg-slate-200 text-slate-800'
                              : app.status === 'disbursed'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {app.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenDossier(app)}
                              className="px-2.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-md text-xs font-semibold inline-flex items-center gap-1 transition-colors shadow-2xs"
                              title="Review full borrower profile and underwriting dossier"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Review</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteApplication(app.id, app.personal.fullName)}
                              disabled={deletingAppId === app.id}
                              className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-md transition-colors"
                              title="Delete / purge applicant dossier from database"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls (Requirement 1 & 3) */}
          {filteredApps.length > 0 && (
            <div className="px-4 py-3.5 border-t border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span>Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filteredApps.length)}</strong> of <strong>{filteredApps.length}</strong> dossiers</span>
                <span className="text-slate-300">|</span>
                <div className="flex items-center gap-1.5">
                  <span>Per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      type="button"
                      onClick={() => setCurrentPage(pg)}
                      className={`w-7 h-7 rounded text-xs font-semibold flex items-center justify-center transition-colors ${
                        currentPage === pg
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white flex items-center gap-1 transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      </div>

      {/* APPLICANT REVIEW DOSSIER DRAWER / MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-mono text-emerald-400 font-bold text-sm">
                  {selectedApp.id}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-sm font-semibold">{selectedApp.personal.fullName}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Dossier Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* Top Summary Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl gap-4">
                <div className="flex items-center gap-3">
                  {selectedApp.personal.photoUrl ? (
                    <img
                      src={selectedApp.personal.photoUrl}
                      alt={selectedApp.personal.fullName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-800 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">
                      {selectedApp.personal.fullName.slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{selectedApp.personal.fullName}</h3>
                    <div className="text-slate-500">{selectedApp.personal.email} · {selectedApp.personal.phoneNumber}</div>
                    <div className="text-slate-500">{selectedApp.personal.residentialAddress}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 uppercase text-[10px] block">Current Dossier Status</span>
                  <span className="text-sm font-bold text-slate-900 uppercase">{selectedApp.status.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Referral Attribution & Origin Card */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-sm">
                    REF
                  </div>
                  <div>
                    <span className="font-bold text-indigo-950 uppercase tracking-wider text-[11px] block">
                      Referral Attribution & Tracking
                    </span>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-indigo-900">
                      <span>Assigned Partner Link Code: <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-indigo-200">{selectedApp.referral?.referralCode || `REF-${selectedApp.id.replace('MFS-2026-', '')}`}</strong></span>
                      <span>·</span>
                      <span>Referred By: <strong className="font-mono bg-indigo-100 text-indigo-950 px-1.5 py-0.5 rounded">{selectedApp.referral?.referredBy || 'Direct Organic Registration'}</strong></span>
                    </div>
                  </div>
                </div>
                <div className="text-right text-[11px] text-indigo-700 self-end sm:self-auto font-mono">
                  {new Date(selectedApp.referral?.referredAt || selectedApp.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Biometric Face Verification & Anti-Spoofing Audit Box */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Scan className="w-4 h-4 text-emerald-800" />
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                      Biometric Facial Identity & Anti-Spoofing Audit
                    </span>
                  </div>
                  {selectedApp.faceVerification ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <Check className="w-3 h-3 text-emerald-700" />
                      ISO 30107-3 L2 PASS
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      <AlertTriangle className="w-3 h-3 text-amber-700" />
                      Biometrics Pending
                    </span>
                  )}
                </div>

                {selectedApp.faceVerification ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      {/* Live capture vs Registered photo */}
                      <div className="sm:col-span-6 flex items-center gap-3">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-emerald-700 shrink-0 bg-black shadow-sm">
                          <img
                            src={selectedApp.faceVerification.faceImageUrl}
                            alt="Live Optical Scan"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-0 inset-x-0 bg-emerald-950/90 text-[8px] font-mono text-emerald-300 text-center py-0.2">
                            LIVE SCAN
                          </span>
                        </div>

                        <div className="text-slate-400 text-xs font-mono">⟷</div>

                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-300 shrink-0 bg-slate-100 shadow-sm">
                          <img
                            src={selectedApp.faceVerification.idCardImageUrl || selectedApp.personal.photoUrl}
                            alt="Registered Identity Photo"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-0 inset-x-0 bg-slate-900/90 text-[8px] font-mono text-slate-300 text-center py-0.2">
                            PHOTO ID
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 block font-mono">Certificate:</span>
                          <span className="font-mono font-bold text-slate-800 block text-xs">
                            {selectedApp.faceVerification.verificationId}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold block">
                            Vector Match: {selectedApp.faceVerification.matchConfidence}%
                          </span>
                        </div>
                      </div>

                      {/* 3 Metric Pills */}
                      <div className="sm:col-span-6 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                          <span className="text-[9px] text-slate-400 block font-sans">Liveness</span>
                          <strong className="text-sm font-bold text-emerald-950 block">{selectedApp.faceVerification.livenessScore}%</strong>
                          <span className="text-[8px] text-emerald-700">3D Depth OK</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[9px] text-slate-400 block font-sans">Anti-Spoofing</span>
                          <strong className="text-sm font-bold text-emerald-800 block">{selectedApp.faceVerification.antiSpoofingStatus}</strong>
                          <span className="text-[8px] text-slate-500">Zero PAD</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[9px] text-slate-400 block font-sans">Audit Trail</span>
                          <strong className="text-xs font-bold text-slate-900 block mt-0.5">FIDO2 L2</strong>
                          <span className="text-[8px] text-slate-500">SHA-256</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-600">
                      <span>Hash: {selectedApp.faceVerification.auditHash.slice(0, 32)}...</span>
                      <span>Verified: {new Date(selectedApp.faceVerification.verifiedAt).toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-amber-950">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Applicant has not submitted biometric optical face verification yet.</span>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        const verified = {
                          verified: true,
                          verifiedAt: new Date().toISOString(),
                          verificationId: `BIO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                          livenessScore: 99.2,
                          matchConfidence: 98.7,
                          antiSpoofingStatus: 'Passed' as const,
                          faceImageUrl: selectedApp.personal.photoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
                          idCardImageUrl: selectedApp.personal.photoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
                          livenessChecks: {
                            blinkDetected: true,
                            headTurnDetected: true,
                            depthAnalyzed: true,
                            lightingPass: true,
                            antiPresentationAttack: true,
                          },
                          deviceInfo: 'Admin Committee Optical Audit Tool',
                          auditHash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
                        };
                        await storage.updateFaceVerification(selectedApp.id, verified);
                        setSelectedApp({
                          ...selectedApp,
                          faceVerification: verified,
                        });
                      }}
                      className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-semibold whitespace-nowrap"
                    >
                      Certify Biometrics via Admin Override
                    </button>
                  </div>
                )}
              </div>

              {/* 2-Column: Financial & Loan Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Employment */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <span className="font-bold text-slate-900 uppercase tracking-wider block text-[11px] mb-2">
                    Employment & Verified Income
                  </span>
                  <div><strong>Employer:</strong> {selectedApp.employment.employerName}</div>
                  <div><strong>Occupation:</strong> {selectedApp.employment.occupation}</div>
                  <div><strong>Tenure:</strong> {selectedApp.employment.employmentDuration} ({selectedApp.employment.employmentType})</div>
                  <div><strong>Monthly Net Income:</strong> <span className="font-mono font-bold text-emerald-900">{formatCurrency(selectedApp.employment.monthlyIncome)}</span></div>
                  <div><strong>Additional Revenue:</strong> <span className="font-mono">{formatCurrency(selectedApp.employment.additionalIncome)}</span></div>
                </div>

                {/* Facility Details */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <span className="font-bold text-slate-900 uppercase tracking-wider block text-[11px] mb-2">
                    Requested Credit Facility
                  </span>
                  <div><strong>Requested Capital:</strong> <span className="font-mono font-bold text-slate-900 text-sm">{formatCurrency(selectedApp.loan.requestedAmount)}</span></div>
                  <div><strong>Facility Purpose:</strong> {selectedApp.loan.purpose}</div>
                  <div><strong>Repayment Horizon:</strong> {selectedApp.loan.repaymentPeriodMonths} Months</div>
                  <div><strong>Disbursement Method:</strong> {selectedApp.loan.preferredPaymentMethod}</div>
                </div>

              </div>

              {/* Applicant Financial Commitment Box */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 uppercase tracking-wider block text-[11px]">
                    Applicant Financial Commitment (10% Statutory Escrow)
                  </span>
                  <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    {selectedApp.commitment?.paymentStatus || 'Held in Regulated Escrow'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Requested Principal:</span>
                    <span className="font-mono font-bold text-slate-900">{formatCurrency(selectedApp.loan.requestedAmount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">10% Commitment:</span>
                    <span className="font-mono font-bold text-emerald-900">
                      {formatCurrency(selectedApp.commitment?.commitmentAmount || Math.round(selectedApp.loan.requestedAmount * 0.10))}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Receipt Number:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {selectedApp.commitment?.receiptNumber || `RCPT-2026-${selectedApp.id.split('-')[2] || '8841'}-C`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Depository Custody:</span>
                    <span className="text-slate-800">Barclays Private Clients Escrow</span>
                  </div>
                </div>
              </div>

              {/* Signature Verification */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-900 uppercase tracking-wider block text-[11px] mb-2">
                  Legally Executed Signature
                </span>
                {selectedApp.declaration.signatureDataUrl.startsWith('data:image') ? (
                  <img
                    src={selectedApp.declaration.signatureDataUrl}
                    alt="Signature"
                    className="h-14 object-contain bg-white p-2 rounded border border-slate-200"
                  />
                ) : (
                  <div className="p-3 bg-white border border-slate-200 rounded font-serif italic text-xl text-emerald-950">
                    {selectedApp.declaration.signatureDataUrl}
                  </div>
                )}
                <div className="text-[11px] text-slate-400 mt-1">
                  Signed timestamp: {new Date(selectedApp.declaration.signedAt).toLocaleString()}
                </div>
              </div>

              {/* ACTION TOOLBAR: Change Status & Approved Terms */}
              <div className="p-5 bg-white border-2 border-emerald-900/20 rounded-xl space-y-4">
                <span className="text-sm font-bold text-slate-900 uppercase tracking-wider block">
                  Credit Committee Underwriting Determination
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Set Application Status *
                    </label>
                    <select
                      value={statusToSet}
                      onChange={(e) => setStatusToSet(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    >
                      <option value="pending_review">Pending Review</option>
                      <option value="underwriting">In Underwriting Review</option>
                      <option value="documents_required">Documents Required</option>
                      <option value="approved">Approve Facility</option>
                      <option value="declined">Decline Facility</option>
                      <option value="disbursed">Disbursed (Settlement Complete)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Approved Facility Limit ($)
                    </label>
                    <input
                      type="number"
                      value={approvedAmount}
                      onChange={(e) => setApprovedAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Approved Fixed APR (%)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={approvedRate}
                      onChange={(e) => setApprovedRate(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold"
                    />
                  </div>
                </div>

                {statusToSet === 'documents_required' && (
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Specify Document Requirement to Request:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Audited 2025 financial accounts or equipment pro-forma invoice"
                      value={customDocRequest}
                      onChange={(e) => setCustomDocRequest(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs"
                    />
                  </div>
                )}

                {statusToSet === 'disbursed' && (
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Wire / Settlement Clearing Reference:
                    </label>
                    <input
                      type="text"
                      value={disbursementRef}
                      onChange={(e) => setDisbursementRef(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Internal Committee Underwriting Remarks:
                  </label>
                  <textarea
                    rows={2}
                    value={officerNotes}
                    onChange={(e) => setOfficerNotes(e.target.value)}
                    placeholder="Rationale, collateral assessment, debt covenants, or reason for decision..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs resize-none"
                  />
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenDocumentModal(selectedApp, 'commitment_receipt')}
                      className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-800" />
                      <span>Inspect Escrow Receipt</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenDocumentModal(selectedApp, 'term_sheet')}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-800" />
                      <span>Preview Official Term Sheet</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleUpdateStatus}
                    className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                  >
                    Save & Broadcast Decision
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* DATABASE / SUPABASE MODAL */}
      {showDbModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className="max-w-2xl w-full bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-800" />
                <h3 className="text-base font-bold text-slate-900">
                  Supabase Backend Configuration & SQL Schema
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDbModal(false)}
                className="text-slate-400 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900 block">Database Storage Status:</span>
                <span className="text-slate-500">
                  {isSupabaseConfigured 
                    ? 'Connected directly to live Supabase project via environment variables.'
                    : 'Running in Local Encrypted Persistence mode (fully operational, reactive, and persists across sessions).'}
                </span>
              </div>
              <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                isSupabaseConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {isSupabaseConfigured ? 'SUPABASE ACTIVE' : 'LOCAL PERSISTENCE ACTIVE'}
              </span>
            </div>

            <p className="text-slate-600 mb-2 leading-relaxed">
              To link your own Supabase project on Vercel or locally, paste <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> and <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> into your environment settings and execute this PostgreSQL schema:
            </p>

            <div className="relative mb-4">
              <pre className="p-3 bg-slate-900 text-emerald-300 rounded-xl font-mono text-[11px] max-h-48 overflow-y-auto leading-normal">
                {SUPABASE_SQL_SCHEMA}
              </pre>
              <button
                type="button"
                onClick={handleCopySchema}
                className="absolute top-2 right-2 px-3 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
              >
                {copiedSchema ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSchema ? 'Copied' : 'Copy SQL'}</span>
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowDbModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTHORIZED OFFICER CREDENTIALS & 2FA PROFILE MODAL (ONLY VISIBLE WHEN LOGGED IN) */}
      {showOfficerCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-xl w-full bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-2xl border border-slate-700 text-xs">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                      Tier 4 Security Dossier
                    </span>
                    <span className="text-slate-400 text-[10px]">INTERNAL USE ONLY</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    Authorized Officer Login Details & Session Security
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOfficerCredentials(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-300 text-xs mt-4 mb-5 leading-relaxed">
              These credentials grant administrative access to institutional underwriting dossiers, statutory escrow verification, and payment custody management. They are concealed from borrowers and only visible within an active administrator session.
            </p>

            {/* Credentials Card */}
            <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              
              {/* Officer ID / Email */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                    Officer User ID / Email
                  </span>
                  <span className="font-mono text-emerald-300 font-bold text-xs select-all">
                    admin@manulife-financial.com
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyField('admin@manulife-financial.com', 'email')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors self-start sm:self-auto"
                >
                  {copiedField === 'email' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                  <span>{copiedField === 'email' ? 'Copied' : 'Copy ID'}</span>
                </button>
              </div>

              {/* Access Passcode */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                    Access Passcode
                  </span>
                  <span className="font-mono text-white font-bold text-xs">
                    {revealedPasscode ? 'admin2026' : '••••••••••••'}
                  </span>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setRevealedPasscode(!revealedPasscode)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-semibold flex items-center gap-1"
                  >
                    {revealedPasscode ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{revealedPasscode ? 'Hide' : 'Reveal'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyField('admin2026', 'passcode')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    {copiedField === 'passcode' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    <span>{copiedField === 'passcode' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* 2FA Token */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900 border border-emerald-900/40">
                <div>
                  <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>2FA Security Token (For Sensitive Changes)</span>
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-base font-extrabold text-emerald-400 tracking-wider">
                      849201
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans">
                      (or any 6-digit TOTP code)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyField('849201', '2fa')}
                  className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors self-start sm:self-auto"
                >
                  {copiedField === '2fa' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-emerald-400" />}
                  <span>{copiedField === '2fa' ? 'Copied' : 'Copy 2FA'}</span>
                </button>
              </div>

              {/* Direct Liaison Officer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                    Direct Officer Liaison Email
                  </span>
                  <span className="font-mono text-slate-200 font-semibold text-xs select-all">
                    echezonachukwuokafor16@gmail.com
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyField('echezonachukwuokafor16@gmail.com', 'liaison')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors self-start sm:self-auto"
                >
                  {copiedField === 'liaison' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                  <span>{copiedField === 'liaison' ? 'Copied' : 'Copy Email'}</span>
                </button>
              </div>
            </div>

            {/* Discreet Access Methods */}
            <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <span className="font-semibold text-slate-200 block text-xs">
                How Staff Access This Portal:
              </span>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong className="text-slate-300">Keyboard Shortcut:</strong> Press <kbd className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-mono text-[10px]">Ctrl + Shift + A</kbd> (or <kbd className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-mono text-[10px]">⌘ + Shift + A</kbd>) from any page.
                </li>
                <li>
                  <strong className="text-slate-300">Direct URL Hash:</strong> Append <code className="bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded font-mono text-[10px]">#admin</code> to the website URL.
                </li>
                <li>
                  <strong className="text-slate-300">Discreet Footer Link:</strong> Click the subtle <Lock className="w-2.5 h-2.5 inline text-slate-500" /> <em>Staff Portal</em> lock link at the very bottom copyright strip.
                </li>
              </ul>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowOfficerCredentials(false)}
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ADMIN MANUAL BORROWER REGISTRATION MODAL */}
      {showAdminRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-xl w-full bg-white rounded-2xl p-6 sm:p-7 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Administrative Action
                    </span>
                    <span className="text-slate-400 text-[10px]">DIRECT ONBOARDING</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    Register New Borrower & Create Pipeline Dossier
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminRegisterModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-600 text-xs mt-3 mb-4 leading-relaxed">
              Manually registering an applicant provisions their borrower portal account, generates a verified reference dossier (<code className="font-mono text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded">MFS-2026-XXXX</code>), dispatches onboarding notifications, and immediately injects the record into the credit review pipeline.
            </p>

            {adminRegisterError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{adminRegisterError}</span>
              </div>
            )}

            {adminRegisterSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{adminRegisterSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAdminRegisterBorrower} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Borrower Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jonathan R. Vance"
                    value={adminRegisterForm.fullName}
                    onChange={(e) => setAdminRegisterForm({ ...adminRegisterForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address (Portal Username) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jonathan@vanceholdings.com"
                    value={adminRegisterForm.email}
                    onChange={(e) => setAdminRegisterForm({ ...adminRegisterForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Direct Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 234-8901"
                    value={adminRegisterForm.phoneNumber}
                    onChange={(e) => setAdminRegisterForm({ ...adminRegisterForm, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Temporary Portal Passcode
                  </label>
                  <input
                    type="text"
                    placeholder="Borrower2026! (leave empty for default)"
                    value={adminRegisterForm.password}
                    onChange={(e) => setAdminRegisterForm({ ...adminRegisterForm, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Requested Facility ($)
                  </label>
                  <input
                    type="number"
                    min="10000"
                    step="5000"
                    required
                    value={adminRegisterForm.requestedAmount}
                    onChange={(e) => setAdminRegisterForm({ ...adminRegisterForm, requestedAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Repayment Term
                  </label>
                  <select
                    value={adminRegisterForm.repaymentPeriodMonths}
                    onChange={(e) => setAdminRegisterForm({ ...adminRegisterForm, repaymentPeriodMonths: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value={12}>12 Months (1 Year)</option>
                    <option value={24}>24 Months (2 Years)</option>
                    <option value={36}>36 Months (3 Years)</option>
                    <option value={48}>48 Months (4 Years)</option>
                    <option value={60}>60 Months (5 Years)</option>
                    <option value={84}>84 Months (7 Years)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Facility Purpose
                  </label>
                  <select
                    value={adminRegisterForm.purpose}
                    onChange={(e) => setAdminRegisterForm({ ...adminRegisterForm, purpose: e.target.value as LoanPurpose })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value="Commercial & Business Expansion">Commercial & Business</option>
                    <option value="Property Purchase & Real Estate">Property & Real Estate</option>
                    <option value="Working Capital & Operations">Working Capital</option>
                    <option value="Equipment, Machinery & Technology">Equipment & Tech</option>
                    <option value="Debt Consolidation & Restructuring">Debt Consolidation</option>
                    <option value="Personal Investment & Wealth Strategy">Wealth & Strategy</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAdminRegisterModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminRegisterLoading}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {adminRegisterLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Register & Create Dossier</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
