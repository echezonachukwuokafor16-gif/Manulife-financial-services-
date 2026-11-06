/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, ShieldCheck, CheckCircle2, Clock, AlertCircle, FileText, 
  Download, Send, MessageSquare, Bell, User, Building, DollarSign, 
  Upload, Check, ArrowRight, ExternalLink, Mail, Phone, Scan, Award, Camera, Sparkles, RefreshCw
} from 'lucide-react';
import { LoanApplication, ApplicationNotification, SupportMessage, PaymentSettings, CryptoTransactionVerification, CompanyContactSettings, FaceVerification } from '../types';
import { storage } from '../lib/storage';
import { formatCurrency, calculateLoanRepayment } from '../lib/calculator';
import { USDTInformationSection } from './USDTInformationSection';
import { FaceVerificationModal } from './FaceVerificationModal';

interface ApplicantDashboardProps {
  initialAppId?: string | null;
  onOpenDocumentModal: (application: LoanApplication, docType: 'term_sheet' | 'summary' | 'amortization' | 'commitment_receipt') => void;
  onOpenNewApplication: () => void;
}

export const ApplicantDashboard: React.FC<ApplicantDashboardProps> = ({
  initialAppId,
  onOpenDocumentModal,
  onOpenNewApplication,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(initialAppId || '');
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null);
  const [notifications, setNotifications] = useState<ApplicationNotification[]>([]);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'terms' | 'documents' | 'notifications' | 'support' | 'payment_escrow' | 'face_kyc'>('overview');
  const [uploadedSuccessNote, setUploadedSuccessNote] = useState<string | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [appCryptoVerifications, setAppCryptoVerifications] = useState<CryptoTransactionVerification[]>([]);
  const [contactSettings, setContactSettings] = useState<CompanyContactSettings | null>(null);
  const [showFaceModal, setShowFaceModal] = useState<boolean>(false);

  const loadData = async () => {
    const apps = await storage.getAllApplications();
    setApplications(apps);

    const currentSettings = await storage.getPaymentSettings();
    setPaymentSettings(currentSettings);

    const contact = await storage.getContactSettings();
    setContactSettings(contact);

    if (searchQuery) {
      const match = apps.find(
        (a) => a.id.toLowerCase() === searchQuery.toLowerCase() || 
               a.personal.email.toLowerCase() === searchQuery.toLowerCase()
      );
      if (match) {
        setSelectedApp(match);
        const notifs = await storage.getNotifications(match.id);
        setNotifications(notifs);
        const msgs = await storage.getMessages(match.id);
        setMessages(msgs);
        const verifs = await storage.getCryptoVerifications(match.id);
        setAppCryptoVerifications(verifs);
        return;
      }
    }

    // Default to first application if none selected
    if (!selectedApp && apps.length > 0) {
      const defaultApp = apps[0];
      setSelectedApp(defaultApp);
      setSearchQuery(defaultApp.id);
      const notifs = await storage.getNotifications(defaultApp.id);
      setNotifications(notifs);
      const msgs = await storage.getMessages(defaultApp.id);
      setMessages(msgs);
      const verifs = await storage.getCryptoVerifications(defaultApp.id);
      setAppCryptoVerifications(verifs);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('verdant_storage_update', handleUpdate);
    return () => window.removeEventListener('verdant_storage_update', handleUpdate);
  }, [searchQuery, initialAppId]);

  const handleSelectApp = async (app: LoanApplication) => {
    setSelectedApp(app);
    setSearchQuery(app.id);
    const notifs = await storage.getNotifications(app.id);
    setNotifications(notifs);
    const msgs = await storage.getMessages(app.id);
    setMessages(msgs);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = applications.find(
      (a) => a.id.toLowerCase() === searchQuery.trim().toLowerCase() ||
             a.personal.email.toLowerCase() === searchQuery.trim().toLowerCase()
    );
    if (found) {
      handleSelectApp(found);
    } else {
      alert(`No application found for reference "${searchQuery}". Please verify the application ID or email.`);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedApp) return;

    const msg: SupportMessage = {
      id: `msg-${Date.now()}`,
      applicationId: selectedApp.id,
      sender: 'applicant',
      senderName: selectedApp.personal.fullName,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    await storage.sendMessage(msg);
    setNewMessage('');
    const updated = await storage.getMessages(selectedApp.id);
    setMessages(updated);
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedApp) return;

    const newDoc = {
      id: `doc-${Date.now()}`,
      name: file.name,
      type: file.type || 'application/pdf',
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadedAt: new Date().toISOString(),
      status: 'pending' as const,
    };

    const updatedApp: LoanApplication = {
      ...selectedApp,
      documents: [...selectedApp.documents, newDoc],
      status: 'underwriting', // moves to underwriting upon document upload
    };

    await storage.saveApplication(updatedApp);
    setSelectedApp(updatedApp);
    setUploadedSuccessNote(`"${file.name}" uploaded securely. Application moved to Underwriting Review.`);
    setTimeout(() => setUploadedSuccessNote(null), 6000);
  };

  // Status badge styling
  const renderStatusBadge = (status: LoanApplication['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            Approved · Term Sheet Ready
          </span>
        );
      case 'underwriting':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-3.5 h-3.5 text-blue-700" />
            In Active Underwriting Review
          </span>
        );
      case 'documents_required':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
            Additional Documents Required
          </span>
        );
      case 'disbursed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
            Facility Fully Disbursed
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800 border border-slate-300">
            Decision: Declined
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-600" />
            Pending Initial Review
          </span>
        );
    }
  };

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header & Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img 
                src="/assets/aistudio/file_00000000245881fdbc108ee1cf0b4466_512afb92.png" 
                alt="Manulife Financial Services" 
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-full shadow-sm border border-emerald-100 bg-white shrink-0" 
              />
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-emerald-800 mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Manulife Financial Services · Borrower Portal</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Applicant Facility Dashboard
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Access underwriting progress, authorized term sheets, and officer communications.
                </p>
              </div>
            </div>

            {/* Quick App Lookup & Switcher */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter Reference (e.g. MFS-2026-8194) or Email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-20 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-[11px] font-semibold transition-colors"
                >
                  Lookup
                </button>
              </form>

              <button
                onClick={onOpenNewApplication}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shadow-sm"
              >
                + New Application
              </button>
            </div>
          </div>

          {/* Quick Demo Selector Chips */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Quick Demo Records:</span>
            {applications.slice(0, 4).map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={() => handleSelectApp(app)}
                className={`px-3 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                  selectedApp?.id === app.id
                    ? 'bg-emerald-900 text-white border-emerald-900'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {app.personal.fullName} ({app.id}) · {app.status}
              </button>
            ))}
          </div>
        </div>

        {selectedApp ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column (8 cols): Primary details, Timeline, Approved Terms */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Application Header Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                  <div className="flex items-center gap-4">
                    {selectedApp.personal.photoUrl ? (
                      <img
                        src={selectedApp.personal.photoUrl}
                        alt={selectedApp.personal.fullName}
                        className="w-14 h-14 rounded-full object-cover border-2 border-emerald-800 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg">
                        {selectedApp.personal.fullName.slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {selectedApp.personal.fullName}
                      </h2>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                        <span className="font-mono font-semibold text-emerald-900">{selectedApp.id}</span>
                        <span>·</span>
                        <span>{selectedApp.personal.email}</span>
                        {selectedApp.faceVerification ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <ShieldCheck className="w-3 h-3 text-emerald-700" />
                            Biometric Face Verified ({selectedApp.faceVerification.livenessScore}%)
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActiveTab('face_kyc')}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 hover:bg-amber-200 transition-colors"
                          >
                            <Scan className="w-3 h-3 text-amber-700" />
                            Face Verification Pending
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    {renderStatusBadge(selectedApp.status)}
                  </div>
                </div>

                {/* Timeline stages */}
                <div className="py-6 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-4">
                    Underwriting Workflow Timeline
                  </span>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs mb-1">
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-slate-900">Submitted</span>
                      <span className="text-[10px] text-slate-400">Step 1-5 Validated</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1 ${
                        selectedApp.status !== 'pending_review'
                          ? 'bg-emerald-800 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {selectedApp.status !== 'pending_review' ? <Check className="w-4 h-4" /> : '2'}
                      </div>
                      <span className="font-semibold text-slate-900">Underwriting</span>
                      <span className="text-[10px] text-slate-400">Risk & DTI Triage</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1 ${
                        selectedApp.status === 'approved' || selectedApp.status === 'disbursed'
                          ? 'bg-emerald-800 text-white'
                          : selectedApp.status === 'documents_required'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {selectedApp.status === 'approved' || selectedApp.status === 'disbursed' ? (
                          <Check className="w-4 h-4" />
                        ) : selectedApp.status === 'documents_required' ? (
                          '!'
                        ) : (
                          '3'
                        )}
                      </div>
                      <span className="font-semibold text-slate-900">Committee</span>
                      <span className="text-[10px] text-slate-400">
                        {selectedApp.status === 'approved' ? 'Approved' : selectedApp.status === 'documents_required' ? 'Docs Needed' : 'In Review'}
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1 ${
                        selectedApp.status === 'disbursed'
                          ? 'bg-purple-800 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {selectedApp.status === 'disbursed' ? <Check className="w-4 h-4" /> : '4'}
                      </div>
                      <span className="font-semibold text-slate-900">Disbursement</span>
                      <span className="text-[10px] text-slate-400">Wire Settlement</span>
                    </div>
                  </div>
                </div>

                {/* Navigation Sub-Tabs */}
                <div className="pt-4 flex items-center gap-2 overflow-x-auto text-xs">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      activeTab === 'overview' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Dossier Details
                  </button>

                  <button
                    onClick={() => setActiveTab('terms')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                      activeTab === 'terms' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>Approved Terms</span>
                    {selectedApp.status === 'approved' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('documents')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      activeTab === 'documents' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Documents ({selectedApp.documents.length})
                  </button>

                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                      activeTab === 'notifications' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>Notifications</span>
                    {unreadNotifsCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px]">
                        {unreadNotifsCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('support')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                      activeTab === 'support' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Officer Desk</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('face_kyc')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                      activeTab === 'face_kyc' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Scan className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Face Verification</span>
                    {selectedApp.faceVerification ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    ) : (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500 text-white font-mono font-bold">Check</span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('payment_escrow')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                      activeTab === 'payment_escrow' ? 'bg-emerald-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-emerald-900 text-emerald-300 flex items-center justify-center text-[10px] font-bold border border-emerald-700">₮</span>
                    <span>Payment & Escrow (USDT)</span>
                  </button>
                </div>
              </div>

              {/* ACTION CALLOUT: If documents required */}
              {selectedApp.status === 'documents_required' && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-amber-950">
                        Underwriting Request: Additional Documents Required
                      </h3>
                      <p className="text-xs text-amber-900 mt-1 mb-3 leading-relaxed">
                        The Credit Committee has reviewed your application and requests the following items to finalize your binding approval:
                      </p>

                      <ul className="list-disc list-inside text-xs text-amber-950 mb-4 space-y-1">
                        {selectedApp.underwriting?.requestedDocuments?.map((item, idx) => (
                          <li key={idx} className="font-semibold">{item}</li>
                        )) || (
                          <li>Please provide the last 3 months business bank statements</li>
                        )}
                      </ul>

                      {/* Dropzone */}
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>Attach Requested Document</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={handleDocumentUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {uploadedSuccessNote && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>{uploadedSuccessNote}</span>
                </div>
              )}

              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                  <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                    Submitted Application Dossier
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    {/* Facility Summary */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                      <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                        Credit Facility Request
                      </span>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Requested Amount:</span>
                        <span className="font-mono font-bold text-slate-900">{formatCurrency(selectedApp.loan.requestedAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Purpose:</span>
                        <span className="font-semibold text-slate-900">{selectedApp.loan.purpose}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Requested Period:</span>
                        <span className="font-semibold text-slate-900">{selectedApp.loan.repaymentPeriodMonths} Months</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Disbursement Rail:</span>
                        <span className="font-semibold text-slate-900">{selectedApp.loan.preferredPaymentMethod}</span>
                      </div>
                    </div>

                    {/* Employment */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                      <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                        Employment & Revenue
                      </span>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Employer:</span>
                        <span className="font-semibold text-slate-900">{selectedApp.employment.employerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Occupation:</span>
                        <span className="font-semibold text-slate-900">{selectedApp.employment.occupation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Employment Type:</span>
                        <span className="font-semibold text-slate-900">{selectedApp.employment.employmentType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Monthly Net Income:</span>
                        <span className="font-mono font-bold text-emerald-900">{formatCurrency(selectedApp.employment.monthlyIncome)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial & Signature row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs pt-4 border-t border-slate-100">
                    <div>
                      <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-2">
                        Financial Obligations
                      </span>
                      <div className="space-y-1.5 text-slate-600">
                        <div className="flex justify-between">
                          <span>Existing Loan Balances:</span>
                          <span className="font-mono font-medium">{formatCurrency(selectedApp.financial.existingLoans)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monthly Debt Servicing:</span>
                          <span className="font-mono font-medium">{formatCurrency(selectedApp.financial.monthlyObligations)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monthly Rent / Mortgage:</span>
                          <span className="font-mono font-medium">{formatCurrency(selectedApp.financial.monthlyRent)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-2">
                        Electronic Signature
                      </span>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        {selectedApp.declaration.signatureDataUrl.startsWith('data:image') ? (
                          <img
                            src={selectedApp.declaration.signatureDataUrl}
                            alt="Signature"
                            className="h-12 object-contain"
                          />
                        ) : (
                          <span className="text-lg font-serif italic text-emerald-950 block">
                            {selectedApp.declaration.signatureDataUrl}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 block mt-1">
                          Digitally stamped on {new Date(selectedApp.declaration.signedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Applicant Financial Commitment Card */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-800" />
                        <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                          Applicant Financial Commitment (10% Statutory Escrow)
                        </span>
                      </div>
                      <button
                        onClick={() => onOpenDocumentModal(selectedApp, 'commitment_receipt')}
                        className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-semibold text-emerald-900 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-800" />
                        <span>View Official Receipt</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Requested Facility:</span>
                        <span className="font-mono font-bold text-slate-900">{formatCurrency(selectedApp.loan.requestedAmount)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">10% Commitment:</span>
                        <span className="font-mono font-bold text-emerald-900">
                          {formatCurrency(selectedApp.commitment?.commitmentAmount || Math.round(selectedApp.loan.requestedAmount * 0.10))}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Escrow Status:</span>
                        <span className="font-semibold text-slate-800">{selectedApp.commitment?.paymentStatus || 'Held in Regulated Escrow'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Receipt Number:</span>
                        <span className="font-mono font-semibold text-emerald-800">
                          {selectedApp.commitment?.receiptNumber || `RCPT-2026-${selectedApp.id.split('-')[2] || '8841'}-C`}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-lg text-[11px] text-emerald-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <span><strong>Refundability:</strong> 100% credited to principal on loan closing or refunded if underwriting conditions are declined.</span>
                      <span className="text-[10px] text-slate-500 font-medium">Custody: Barclays Private Clients Escrow</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: APPROVED TERMS */}
              {activeTab === 'terms' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Official Credit Committee Underwriting Decision
                      </h3>
                      <p className="text-xs text-slate-500">
                        Binding term sheet parameters and approved repayment schedule.
                      </p>
                    </div>
                    {selectedApp.status === 'approved' && (
                      <button
                        onClick={() => onOpenDocumentModal(selectedApp, 'term_sheet')}
                        className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Term Sheet</span>
                      </button>
                    )}
                  </div>

                  {selectedApp.status === 'approved' || selectedApp.status === 'disbursed' ? (
                    <div>
                      <div className="p-6 bg-gradient-to-br from-emerald-950 to-slate-900 text-white rounded-2xl shadow-lg mb-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-emerald-400 text-xs font-mono uppercase tracking-wider">
                              Approved Facility Amount
                            </span>
                            <div className="text-4xl font-extrabold font-mono text-white mt-1">
                              {formatCurrency(selectedApp.underwriting?.approvedAmount || selectedApp.loan.requestedAmount)}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-400 text-xs uppercase tracking-wider">
                              Interest Benchmark
                            </span>
                            <div className="text-2xl font-bold font-mono text-emerald-300">
                              {selectedApp.underwriting?.approvedRate || 5.45}% Fixed APR
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
                          <div>
                            <span className="text-slate-400 block">Amortization Term:</span>
                            <span className="font-semibold text-white">{selectedApp.underwriting?.approvedPeriodMonths || selectedApp.loan.repaymentPeriodMonths} Months</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Risk Classification:</span>
                            <span className="font-semibold text-emerald-300">{selectedApp.underwriting?.riskTier || 'Tier 1 (Prime)'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Underwriting Officer:</span>
                            <span className="font-semibold text-white">{selectedApp.underwriting?.reviewedBy || 'Arthur Montgomery'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Officer Notes */}
                      {selectedApp.underwriting?.officerNotes && (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                          <strong className="text-slate-900 block mb-1">Underwriter Remarks:</strong>
                          <p className="text-slate-600 leading-relaxed">{selectedApp.underwriting.officerNotes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
                      <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700">Official Term Sheet In Progress</p>
                      <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                        Your application is currently being evaluated. Once the Credit Committee completes review, your approved terms will be presented here.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: DOCUMENTS */}
              {activeTab === 'documents' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900">
                      Uploaded & Official Documents
                    </h3>
                    <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Document</span>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleDocumentUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="space-y-3">
                    {selectedApp.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-emerald-800" />
                          <div>
                            <span className="font-bold text-slate-900 block">{doc.name}</span>
                            <span className="text-slate-400 text-[11px]">{doc.size} · Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            doc.status === 'verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {doc.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Standard Document Downloads */}
                  <div className="pt-4 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-3">
                      Generate Official Documents
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => onOpenDocumentModal(selectedApp, 'commitment_receipt')}
                        className="p-3 text-left bg-emerald-50/70 hover:bg-emerald-100/70 rounded-xl border border-emerald-200 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <span className="text-xs font-bold text-emerald-950 block">Commitment Receipt</span>
                          <span className="text-[11px] text-emerald-700">10% earnest escrow receipt</span>
                        </div>
                        <Download className="w-4 h-4 text-emerald-800" />
                      </button>

                      <button
                        onClick={() => onOpenDocumentModal(selectedApp, 'summary')}
                        className="p-3 text-left bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">Application Summary</span>
                          <span className="text-[11px] text-slate-500">Official receipt with timestamp</span>
                        </div>
                        <Download className="w-4 h-4 text-emerald-800" />
                      </button>

                      <button
                        onClick={() => onOpenDocumentModal(selectedApp, 'amortization')}
                        className="p-3 text-left bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">Amortization Schedule</span>
                          <span className="text-[11px] text-slate-500">Monthly breakdown schedule</span>
                        </div>
                        <Download className="w-4 h-4 text-emerald-800" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                  <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                    Official Committee Notifications
                  </h3>

                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4">No notifications on file for this application.</p>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 rounded-xl border text-xs transition-colors ${
                            notif.isRead
                              ? 'bg-slate-50 border-slate-200 text-slate-700'
                              : 'bg-emerald-50/60 border-emerald-300 text-emerald-950 font-medium'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <Bell className="w-4 h-4 text-emerald-800" />
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(notif.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="leading-relaxed text-slate-600 mb-2">{notif.message}</p>
                          {!notif.isRead && (
                            <button
                              onClick={() => {
                                storage.markNotificationRead(notif.id);
                                setNotifications((prev) =>
                                  prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
                                );
                              }}
                              className="text-[11px] font-semibold text-emerald-800 hover:underline"
                            >
                              Mark as Read
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: SUPPORT CHAT WITH OFFICER */}
              {activeTab === 'support' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col h-[540px]">
                  <div className="pb-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Direct Underwriter Messaging Channel
                      </h3>
                      <p className="text-xs text-slate-500">
                        End-to-end encrypted thread with your credit committee officer.
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      OFFICER ASSIGNED
                    </span>
                  </div>

                  {/* Officer Direct Liaison Header Ribbon */}
                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 my-2 text-xs flex flex-wrap items-center justify-between gap-2 shrink-0">
                    <div className="flex items-center gap-2 text-emerald-950">
                      <Mail className="w-4 h-4 text-emerald-800 shrink-0" />
                      <span className="font-semibold">Direct Officer Liaison:</span>
                      <a 
                        href={`mailto:${contactSettings?.directLiaisonEmail || 'echezonachukwuokafor16@gmail.com'}`} 
                        className="font-mono font-bold text-emerald-900 underline hover:text-emerald-700"
                      >
                        {contactSettings?.directLiaisonEmail || 'echezonachukwuokafor16@gmail.com'}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-800 text-[11px]">
                      <span>General Support:</span>
                      <a href={`mailto:${contactSettings?.supportEmail || 'support@manulife-financial.com'}`} className="font-mono underline">
                        {contactSettings?.supportEmail || 'support@manulife-financial.com'}
                      </a>
                    </div>
                  </div>

                  {/* Messages scroll box */}
                  <div className="flex-1 overflow-y-auto py-4 space-y-3">
                    {messages.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-10">No messages yet. Send a note below.</p>
                    ) : (
                      messages.map((msg) => {
                        const isMe = msg.sender === 'applicant';
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                          >
                            <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-medium">
                              {msg.senderName} · {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <div
                              className={`p-3 rounded-xl max-w-md text-xs leading-relaxed ${
                                isMe
                                  ? 'bg-emerald-800 text-white rounded-br-none'
                                  : 'bg-slate-100 text-slate-900 rounded-bl-none border border-slate-200'
                              }`}
                            >
                              {msg.message}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Message input */}
                  <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex gap-2 shrink-0">
                    <input
                      type="text"
                      placeholder="Type message to the underwriting desk..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 6: PAYMENT & ESCROW INFORMATION (USDT CRYPTOCURRENCY) */}
              {activeTab === 'payment_escrow' && paymentSettings && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                  
                  {/* Summary Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-1">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Escrow Custody & Payment Architecture</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Applicant Financial Commitment Settlement Rail
                      </h3>
                      <p className="text-xs text-slate-500">
                        Official details for statutory escrow allocation, banking wire instructions, and optional USDT stablecoin settlement.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenDocumentModal(selectedApp, 'commitment_receipt')}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Official Escrow Receipt</span>
                    </button>
                  </div>

                  {/* Existing Application Commitment Overview */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-sans">Current Selected Rail:</span>
                        <span className="font-bold text-slate-900 block truncate">{selectedApp.commitment?.paymentMethod || selectedApp.loan.preferredPaymentMethod}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-sans">10% Commitment Deposit:</span>
                        <span className="font-bold text-emerald-900 block">
                          {formatCurrency(selectedApp.commitment?.commitmentAmount || Math.round(selectedApp.loan.requestedAmount * 0.10))}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-sans">Escrow Custodian:</span>
                        <span className="font-semibold text-slate-800 block truncate">
                          {selectedApp.commitment?.paymentMethod?.includes('USDT') ? 'BitGo Trust Company Inc.' : 'Barclays Private Clients Escrow'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-sans">Official Receipt Ref:</span>
                        <span className="font-semibold text-emerald-800 block">
                          {selectedApp.commitment?.receiptNumber || `RCPT-2026-${selectedApp.id.split('-')[2] || '8841'}-C`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* If the applicant has submitted on-chain cryptocurrency records */}
                  {appCryptoVerifications.length > 0 && (
                    <div className="p-4 rounded-xl bg-emerald-950 text-white border border-emerald-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold text-xs">Cryptographic Ledger Settlement On File</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-800 text-emerald-200">
                          {appCryptoVerifications[0].status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono text-emerald-200 pt-2 border-t border-emerald-800">
                        <div>
                          <span className="text-slate-400 block text-[10px] font-sans">Network:</span>
                          <span className="font-bold text-white">{appCryptoVerifications[0].network}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-sans">Confirmations:</span>
                          <span className="font-bold text-white">{appCryptoVerifications[0].confirmations} / {appCryptoVerifications[0].requiredConfirmations} blocks</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-sans">Verified By:</span>
                          <span className="text-white">{appCryptoVerifications[0].verifiedBy || 'Pending Compliance Sign-off'}</span>
                        </div>
                      </div>

                      <div className="text-[11px] font-mono text-slate-300 break-all bg-emerald-900/60 p-2 rounded">
                        <span className="text-slate-400">TxHash: </span>{appCryptoVerifications[0].txHash}
                      </div>
                    </div>
                  )}

                  {/* Full USDT Cryptocurrency Information & Instructions */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-2">
                      USDT Cryptocurrency Information & Settlement Instructions
                    </h4>
                    <p className="text-xs text-slate-500 mb-4">
                      Borrowers can optionally fund their 10% commitment deposit via USDT stablecoins on supported networks. Review network standards, custody rules, fee disclosures, and refund policies below.
                    </p>

                    <USDTInformationSection
                      usdtConfig={paymentSettings.usdtConfig}
                      commitmentAmount={selectedApp.commitment?.commitmentAmount || Math.round(selectedApp.loan.requestedAmount * 0.10)}
                      applicationId={selectedApp.id}
                      applicantName={selectedApp.personal.fullName}
                      onPreviewReceipt={() => onOpenDocumentModal(selectedApp, 'commitment_receipt')}
                      onSubmitTxHash={async (hash, network, fromAddr) => {
                        const amt = selectedApp.commitment?.commitmentAmount || Math.round(selectedApp.loan.requestedAmount * 0.10);
                        await storage.submitCryptoVerification({
                          applicationId: selectedApp.id,
                          applicantName: selectedApp.personal.fullName,
                          amountUsdt: amt,
                          equivalentUsd: amt,
                          network,
                          txHash: hash,
                          fromAddress: fromAddr,
                          toAddress: paymentSettings.usdtConfig.supportedNetworks[0].depositAddress,
                          requiredConfirmations: 32,
                          receiptNumber: selectedApp.commitment?.receiptNumber || `RCPT-2026-${selectedApp.id.split('-')[2]}-C-CRYPTO`,
                          notes: 'Submitted via applicant portal Payment & Escrow view.',
                        });
                        const updated = await storage.getCryptoVerifications(selectedApp.id);
                        setAppCryptoVerifications(updated);
                      }}
                    />
                  </div>

                </div>
              )}

              {/* TAB 7: BIOMETRIC KYC & FACE VERIFICATION */}
              {activeTab === 'face_kyc' && (
                <div className="space-y-6">
                  {selectedApp.faceVerification ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                            <ShieldCheck className="w-7 h-7" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-0.5">
                              <span>Biometric KYC Certificate</span>
                              <span className="text-slate-400">·</span>
                              <span className="font-mono text-emerald-700">ISO 30107-3 L2 PASS</span>
                            </div>
                            <h3 className="text-xl font-extrabold text-slate-900">
                              Facial Identity Verified & Certified
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowFaceModal(true)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Re-scan Face</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Print Certificate</span>
                          </button>
                        </div>
                      </div>

                      {/* Side-by-side Facial Comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Live Verified Capture */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-4">
                          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-700 shrink-0 shadow-sm bg-black">
                            <img
                              src={selectedApp.faceVerification.faceImageUrl}
                              alt="Live Optical Capture"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-0 right-0 bg-emerald-700 text-white p-0.5 rounded-bl">
                              <Check className="w-3 h-3" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 font-bold block">
                              Live Optical Scan Capture
                            </span>
                            <span className="font-bold text-sm text-slate-900 block">
                              TrueDepth Optical Mesh
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono block">
                              {new Date(selectedApp.faceVerification.verifiedAt).toLocaleDateString()} {new Date(selectedApp.faceVerification.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {selectedApp.faceVerification.deviceInfo || 'Standard Biometric WebRTC'}
                            </span>
                          </div>
                        </div>

                        {/* Cross-Referenced Government ID / Profile */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-4">
                          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-300 shrink-0 shadow-sm bg-slate-200">
                            <img
                              src={selectedApp.faceVerification.idCardImageUrl || selectedApp.personal.photoUrl}
                              alt="Government Identity Record"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                              Registered Identity Photo
                            </span>
                            <span className="font-bold text-sm text-slate-900 block truncate max-w-[200px]">
                              {selectedApp.personal.fullName}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono block">
                              Cross-Match: {selectedApp.faceVerification.matchConfidence}% Confidence
                            </span>
                            <span className="text-[10px] text-emerald-700 font-semibold block">
                              ✓ Facial Landmark Vector Match Validated
                            </span>
                          </div>
                        </div>

                      </div>

                      {/* 4 Biometric Telemetry Dials */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center">
                          <span className="text-[10px] font-mono text-emerald-800 block">Liveness Score</span>
                          <span className="text-2xl font-extrabold font-mono text-emerald-950 mt-1 block">
                            {selectedApp.faceVerification.livenessScore}%
                          </span>
                          <span className="text-[10px] text-emerald-700">3D Micro-Depth PASS</span>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                          <span className="text-[10px] font-mono text-slate-500 block">Facial Match</span>
                          <span className="text-2xl font-extrabold font-mono text-slate-900 mt-1 block">
                            {selectedApp.faceVerification.matchConfidence}%
                          </span>
                          <span className="text-[10px] text-slate-500">Geometry Topography</span>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                          <span className="text-[10px] font-mono text-slate-500 block">Anti-Spoofing</span>
                          <span className="text-2xl font-extrabold font-mono text-emerald-800 mt-1 block">
                            {selectedApp.faceVerification.antiSpoofingStatus.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-emerald-700">0.01% PAD Risk</span>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                          <span className="text-[10px] font-mono text-slate-500 block">Audit Certificate</span>
                          <span className="text-sm font-extrabold font-mono text-slate-900 mt-2 block truncate">
                            {selectedApp.faceVerification.verificationId}
                          </span>
                          <span className="text-[10px] text-slate-400">Institutional Seal</span>
                        </div>
                      </div>

                      {/* Audit Fingerprint Box */}
                      <div className="p-4 rounded-xl bg-slate-900 text-white space-y-1.5 font-mono text-[11px] border border-slate-800">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="text-emerald-400 font-semibold">Cryptographic Biometric Audit Hash</span>
                          <span>SHA-256</span>
                        </div>
                        <div className="break-all text-slate-300 font-mono text-[10px]">
                          {selectedApp.faceVerification.auditHash}
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-6 shadow-sm max-w-xl mx-auto">
                      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto shadow-inner">
                        <Scan className="w-8 h-8" />
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full font-bold">
                          Action Recommended
                        </span>
                        <h3 className="text-xl font-extrabold text-slate-900">
                          Biometric Face Verification Pending
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Your application has not completed the live 3-second biometric optical facial scan. Completing this verification confirms your identity against fraud and clears underwriting compliance for loan release.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 text-slate-700">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>Optical liveness check prevents identity theft and impersonation</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>Satisfies European & North American AML/KYC Level 2 standards</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>Enables expedited credit committee decision within 2 hours</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowFaceModal(true)}
                        className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Start Live Face Verification Now</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Right Column (4 cols): Quick Contacts & Security Card */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Quick Facility Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md">
                <span className="text-xs text-emerald-400 font-mono uppercase tracking-wider block mb-1">
                  Facility Reference
                </span>
                <span className="text-xl font-bold font-mono tracking-tight text-white block">
                  {selectedApp.id}
                </span>

                <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="font-semibold text-emerald-300 capitalize">{selectedApp.status.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Created:</span>
                    <span className="font-mono text-slate-300">{new Date(selectedApp.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Preferred Rail:</span>
                    <span className="font-semibold text-slate-300">{selectedApp.loan.preferredPaymentMethod.split(' ')[0]}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => onOpenDocumentModal(selectedApp, 'summary')}
                    className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download Summary PDF</span>
                  </button>
                </div>
              </div>

              {/* Direct Support Desk Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-800" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Application Support & Officer Liaison
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  For underwriting queries, commitment fee receipts, or direct credit committee appeals:
                </p>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block mb-0.5">
                      Direct Officer Liaison
                    </span>
                    <a 
                      href={`mailto:${contactSettings?.directLiaisonEmail || 'echezonachukwuokafor16@gmail.com'}`}
                      className="font-mono font-bold text-emerald-950 hover:text-emerald-700 underline break-all block"
                    >
                      {contactSettings?.directLiaisonEmail || 'echezonachukwuokafor16@gmail.com'}
                    </a>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                      Customer Support
                    </span>
                    <a 
                      href={`mailto:${contactSettings?.supportEmail || 'support@manulife-financial.com'}`}
                      className="font-mono text-slate-800 hover:text-emerald-800 underline block"
                    >
                      {contactSettings?.supportEmail || 'support@manulife-financial.com'}
                    </a>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-500">Priority Hotline</span>
                    <span className="font-mono text-slate-900 font-bold">{contactSettings?.supportPhone || '+44 20 7946 0880'}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <Search className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Application Selected</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
              Enter your official loan reference number above or choose one of the demo records to view the dashboard.
            </p>
          </div>
        )}

      </div>

      {/* BIOMETRIC FACE VERIFICATION MODAL */}
      {selectedApp && (
        <FaceVerificationModal
          isOpen={showFaceModal}
          onClose={() => setShowFaceModal(false)}
          onVerificationComplete={async (verification) => {
            await storage.updateFaceVerification(selectedApp.id, verification);
            setSelectedApp({
              ...selectedApp,
              faceVerification: verification,
            });
            setShowFaceModal(false);
          }}
          applicantName={selectedApp.personal.fullName}
          referencePhotoUrl={selectedApp.personal.photoUrl}
        />
      )}
    </div>
  );
};
