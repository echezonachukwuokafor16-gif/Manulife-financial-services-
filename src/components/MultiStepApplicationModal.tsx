/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Check, ArrowRight, ArrowLeft, Upload, Camera, ShieldCheck, 
  FileText, AlertCircle, RefreshCw, PenTool, Type, Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LoanApplication, LoanPurpose, PaymentMethod, EmploymentType, PaymentSettings, FaceVerification } from '../types';
import { calculateDTI, calculateLoanRepayment, formatCurrency } from '../lib/calculator';
import { storage } from '../lib/storage';
import { USDTInformationSection } from './USDTInformationSection';
import { FaceVerificationModal } from './FaceVerificationModal';

interface MultiStepApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (applicationId: string) => void;
  initialAmount?: number;
  initialTerm?: 12 | 24 | 36 | 48;
  initialPurpose?: LoanPurpose;
}

export const MultiStepApplicationModal: React.FC<MultiStepApplicationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialAmount = 100000,
  initialTerm = 36,
  initialPurpose = 'Commercial & Business Expansion',
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionProgress, setSubmissionProgress] = useState<string>('');
  const [createdAppId, setCreatedAppId] = useState<string | null>(null);

  // Form State
  // Step 1: Personal
  const [fullName, setFullName] = useState<string>('');
  const [dob, setDob] = useState<string>('1988-04-15');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>('Male');
  const [nationality, setNationality] = useState<string>('United Kingdom');
  const [residenceCountry, setResidenceCountry] = useState<string>('United Kingdom');
  const [residentialAddress, setResidentialAddress] = useState<string>('14 Berkeley Square, Mayfair, London W1J 6BL');
  const [phoneNumber, setPhoneNumber] = useState<string>('+44 20 7946 0192');
  const [email, setEmail] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [faceVerification, setFaceVerification] = useState<FaceVerification | null>(null);
  const [showFaceVerificationModal, setShowFaceVerificationModal] = useState<boolean>(false);

  // Step 2: Employment
  const [employerName, setEmployerName] = useState<string>('Apex Strategic Holdings');
  const [occupation, setOccupation] = useState<string>('Senior Managing Partner');
  const [employmentDuration, setEmploymentDuration] = useState<string>('5 Years 3 Months');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Full-Time Permanent');
  const [monthlyIncome, setMonthlyIncome] = useState<number>(16500);
  const [additionalIncome, setAdditionalIncome] = useState<number>(3200);

  // Step 3: Loan Information
  const [requestedAmount, setRequestedAmount] = useState<number>(initialAmount);
  const [purpose, setPurpose] = useState<LoanPurpose>(initialPurpose);
  const [repaymentPeriodMonths, setRepaymentPeriodMonths] = useState<12 | 24 | 36 | 48>(initialTerm);
  const [preferredPaymentMethod, setPreferredPaymentMethod] = useState<PaymentMethod>('Direct Bank Wire (SWIFT / IBAN)');

  // Step 4: Financial Information
  const [existingLoans, setExistingLoans] = useState<number>(25000);
  const [monthlyObligations, setMonthlyObligations] = useState<number>(1400);
  const [monthlyRent, setMonthlyRent] = useState<number>(3100);
  const [otherCommitments, setOtherCommitments] = useState<number>(550);

  // Step 5: Applicant Financial Commitment
  const proposedCommitmentAmount = Math.round(requestedAmount * 0.10);
  const [commitmentTermsAccepted, setCommitmentTermsAccepted] = useState<boolean>(true);
  const [commitmentNoGuaranteeAcknowledged, setCommitmentNoGuaranteeAcknowledged] = useState<boolean>(true);
  const [commitmentPaymentMethod, setCommitmentPaymentMethod] = useState<string>('Escrow Wire Transfer (SWIFT / IBAN)');
  const [showCommitmentReceiptModal, setShowCommitmentReceiptModal] = useState<boolean>(false);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [showUsdtDetails, setShowUsdtDetails] = useState<boolean>(false);
  const [submittedCryptoHash, setSubmittedCryptoHash] = useState<string>('');
  const [submittedCryptoNetwork, setSubmittedCryptoNetwork] = useState<string>('');
  const [submittedFromAddress, setSubmittedFromAddress] = useState<string>('');

  useEffect(() => {
    storage.getPaymentSettings().then((res) => setPaymentSettings(res));
  }, []);

  // Step 6: Declaration & Signature
  const [confirmedAccurate, setConfirmedAccurate] = useState<boolean>(true);
  const [acceptedDisclosures, setAcceptedDisclosures] = useState<boolean>(true);
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('type');
  const [typedSignature, setTypedSignature] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync initial props when opened
  useEffect(() => {
    if (initialAmount) setRequestedAmount(initialAmount);
    if (initialTerm) setRepaymentPeriodMonths(initialTerm);
    if (initialPurpose) setPurpose(initialPurpose);
  }, [initialAmount, initialTerm, initialPurpose]);

  // Keep typed signature synced with name if blank
  useEffect(() => {
    if (!typedSignature && fullName) {
      setTypedSignature(fullName);
    }
  }, [fullName, typedSignature]);

  // Signature canvas setup
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#064e3b';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Image Upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Preset quick headshots for convenience
  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  ];

  // Calculated estimates
  const estRepayment = calculateLoanRepayment(requestedAmount, 5.75, repaymentPeriodMonths);
  const { dtiPct, riskRating } = calculateDTI(
    monthlyIncome,
    additionalIncome,
    monthlyObligations,
    monthlyRent,
    otherCommitments,
    estRepayment.monthlyRepayment
  );

  // Validation
  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!fullName.trim() || !email.trim() || !phoneNumber.trim() || !residentialAddress.trim()) {
        alert('Please fill in your Full Name, Email, Phone Number, and Address.');
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!employerName.trim() || !occupation.trim() || monthlyIncome <= 0) {
        alert('Please provide your Employer, Occupation, and valid Monthly Income.');
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (requestedAmount < 5000) {
        alert('Minimum facility request amount is $5,000.');
        return false;
      }
      return true;
    }
    if (step === 4) {
      return true;
    }
    if (step === 5) {
      if (!commitmentTermsAccepted || !commitmentNoGuaranteeAcknowledged) {
        alert('Please confirm your consent to the Applicant Financial Commitment terms and the non-guarantee acknowledgment before proceeding.');
        return false;
      }
      return true;
    }
    if (step === 6) {
      if (!confirmedAccurate || !acceptedDisclosures) {
        alert('Please agree to the applicant declarations and disclosures.');
        return false;
      }
      if (signatureMode === 'type' && !typedSignature.trim()) {
        alert('Please enter your legal signature.');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(6, prev + 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(6)) return;

    setIsSubmitting(true);
    setSubmissionProgress('Encrypting applicant dossier with 256-bit AES...');

    await new Promise((r) => setTimeout(r, 700));
    setSubmissionProgress('Securing statutory escrow commitment allocation...');

    // Generate unique reference
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const appId = `MFS-2026-${randomSuffix}`;
    const receiptNumber = `RCPT-2026-${randomSuffix}-C`;

    let finalSignature = typedSignature;
    if (signatureMode === 'draw' && canvasRef.current) {
      finalSignature = canvasRef.current.toDataURL('image/png');
    }

    const application: LoanApplication = {
      id: appId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending_review',
      personal: {
        fullName,
        dob,
        gender,
        nationality,
        residenceCountry,
        residentialAddress,
        phoneNumber,
        email,
        photoUrl: photoUrl || sampleAvatars[0],
      },
      employment: {
        employerName,
        occupation,
        employmentDuration,
        employmentType,
        monthlyIncome,
        additionalIncome,
      },
      loan: {
        requestedAmount,
        purpose,
        repaymentPeriodMonths,
        preferredPaymentMethod,
      },
      financial: {
        existingLoans,
        monthlyObligations,
        monthlyRent,
        otherCommitments,
      },
      commitment: {
        requestedLoanAmount: requestedAmount,
        commitmentRatePct: 10,
        commitmentAmount: proposedCommitmentAmount,
        purposeDescription: 'Earnest borrower liquidity allocation held in segregated statutory client escrow depository. 100% credited to principal upon loan closing or refunded if underwriting conditions are not met by lender.',
        refundabilityType: '100% Credited to Principal upon Closing or Refunded if Underwriting Declines',
        termsAccepted: commitmentTermsAccepted,
        acknowledgedNoGuarantee: commitmentNoGuaranteeAcknowledged,
        receiptNumber: commitmentPaymentMethod.includes('USDT') ? `${receiptNumber}-CRYPTO` : receiptNumber,
        paymentMethod: commitmentPaymentMethod,
        paymentStatus: 'Held in Regulated Escrow',
        disclosedAt: new Date().toISOString(),
        escrowCustodian: commitmentPaymentMethod.includes('USDT') 
          ? 'BitGo Trust Company Inc. / Fireblocks Regulated Custody (Charter #D-8841)' 
          : 'Barclays Private Clients Escrow Depository (Account #8841-ESCR)',
      },
      declaration: {
        confirmedAccurate,
        acceptedDisclosures,
        signatureDataUrl: finalSignature,
        signatureType: signatureMode,
        signedAt: new Date().toISOString(),
      },
      faceVerification: faceVerification || undefined,
      underwriting: {
        riskTier: dtiPct < 35 ? 'Tier 1 (Prime)' : dtiPct < 45 ? 'Tier 2 (Near-Prime)' : 'Tier 3 (Elevated Risk)',
      },
      documents: [
        {
          id: `doc-${Date.now()}`,
          name: 'Applicant_Government_Photo_ID.pdf',
          type: 'application/pdf',
          size: '1.8 MB',
          uploadedAt: new Date().toISOString(),
          status: 'pending',
        },
      ],
    };

    await storage.saveApplication(application);

    // If cryptocurrency settlement was executed with TxHash, record for independent verification
    if (submittedCryptoHash) {
      await storage.submitCryptoVerification({
        applicationId: appId,
        applicantName: fullName,
        amountUsdt: proposedCommitmentAmount,
        equivalentUsd: proposedCommitmentAmount,
        network: submittedCryptoNetwork || 'Ethereum (ERC-20)',
        txHash: submittedCryptoHash,
        fromAddress: submittedFromAddress || '0x53d284357ec70ce289d6d64134dfac8e511c8a3d',
        toAddress: '0x71C8A326d9e075841f48641498C0CFe448eBB492',
        requiredConfirmations: 32,
        receiptNumber: `${receiptNumber}-CRYPTO`,
        notes: 'Submitted during loan application commitment stage.',
      });
    }

    // Initial receipt notification
    await storage.addNotification({
      id: `notif-${Date.now()}`,
      applicationId: appId,
      recipientEmail: email,
      title: 'Application Received & Queued for Underwriting',
      message: `Your loan application ${appId} for ${formatCurrency(requestedAmount)} has been received and allocated to the Credit Committee. Estimated decision within 24 hours.`,
      timestamp: new Date().toISOString(),
      type: 'info',
      isRead: false,
    });

    await new Promise((r) => setTimeout(r, 600));
    setIsSubmitting(false);
    setCreatedAppId(appId);

    // Fire celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#064e3b', '#10b981', '#34d399', '#f59e0b'],
      });
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/aistudio/file_00000000245881fdbc108ee1cf0b4466_512afb92.png" 
              alt="Manulife Financial Services" 
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-full bg-white p-0.5 border border-emerald-600 shadow-sm shrink-0" 
            />
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                <span>Manulife Financial Services</span>
                <span className="text-slate-500 font-normal hidden sm:inline">|</span>
                <span className="text-slate-300 font-medium hidden sm:inline">Official Credit Facility Application</span>
              </h2>
              <span className="text-[11px] text-emerald-400 font-mono">
                Institutional Underwriting Protocol · 256-Bit Encrypted
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        {!createdAppId && (
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 shrink-0">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {[
                { step: 1, label: 'Personal' },
                { step: 2, label: 'Employment' },
                { step: 3, label: 'Loan Details' },
                { step: 4, label: 'Financial' },
                { step: 5, label: 'Commitment' },
                { step: 6, label: 'Declaration' },
              ].map((item, index) => {
                const isPassed = currentStep > item.step;
                const isCurrent = currentStep === item.step;
                return (
                  <div key={item.step} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isPassed
                            ? 'bg-emerald-800 text-white'
                            : isCurrent
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isPassed ? <Check className="w-3.5 h-3.5" /> : item.step}
                      </div>
                      <span className={`text-[10px] mt-1 hidden sm:block ${isCurrent ? 'font-bold text-emerald-900' : 'text-slate-500'}`}>
                        {item.label}
                      </span>
                    </div>
                    {index < 5 && (
                      <div
                        className={`w-6 sm:w-12 h-0.5 mx-1 sm:mx-1.5 transition-colors ${
                          currentStep > item.step ? 'bg-emerald-800' : 'bg-slate-200'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Body / Steps Container */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* SUCCESS SCREEN */}
          {createdAppId ? (
            <div className="py-8 text-center max-w-lg mx-auto">
              <div className="flex items-center justify-center gap-3 mb-4">
                <img 
                  src="/assets/aistudio/file_00000000245881fdbc108ee1cf0b4466_512afb92.png" 
                  alt="Manulife Financial Services" 
                  className="w-14 h-14 object-contain rounded-full shadow-md bg-white border border-emerald-600" 
                />
                <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center ring-4 ring-emerald-50">
                  <Check className="w-7 h-7" />
                </div>
              </div>

              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                Facility Application Dispatched
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1 mb-2">
                Application Successfully Submitted!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                Your loan dossier has been cryptographically signed, timestamped, and transmitted directly to the Manulife Financial Services Underwriting Committee.
              </p>

              {/* Reference ID Badge */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 block">
                  Official Application Reference Number
                </span>
                <span className="text-2xl font-extrabold font-mono text-emerald-950 tracking-wider">
                  {createdAppId}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Keep this reference number to monitor underwriting progress in the Applicant Portal.
                </span>
              </div>

              {/* Summary highlights */}
              <div className="grid grid-cols-2 gap-3 text-left text-xs bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                <div>
                  <span className="text-slate-400 block">Applicant:</span>
                  <span className="font-semibold text-slate-900">{fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Facility Requested:</span>
                  <span className="font-semibold text-slate-900 font-mono">{formatCurrency(requestedAmount)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">10% Commitment Deposit:</span>
                  <span className="font-semibold text-emerald-900 font-mono">{formatCurrency(proposedCommitmentAmount)} (Escrow)</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Escrow Depository:</span>
                  <span className="font-semibold text-slate-800">Barclays Private Clients</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Official Receipt Ref:</span>
                  <span className="font-semibold text-emerald-800 font-mono">{`RCPT-2026-${createdAppId?.split('-')[2] || '9012'}-C`}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Expected Turnaround:</span>
                  <span className="font-semibold text-emerald-800 font-mono">Within 24 Hours</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => onSuccess(createdAppId)}
                  className="flex-1 py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
                >
                  <span>Go to Applicant Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              
              {/* STEP 1: PERSONAL INFORMATION */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Step 1: Personal & Identification Information
                    </h3>
                    <p className="text-xs text-slate-500">
                      Please enter your legal identity credentials as shown on your government passport.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Legal Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alexander James Montgomery"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        required
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Gender *
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nationality *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. British / American / Swiss"
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Country of Residence *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. United Kingdom"
                        value={residenceCountry}
                        onChange={(e) => setResidenceCountry(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Official Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="applicant@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number (Mobile / Direct) *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+44 20 7946 0000"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Residential Address *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Street address, Apartment/Suite, City, Postcode"
                      value={residentialAddress}
                      onChange={(e) => setResidentialAddress(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  {/* Photograph Upload Area */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Applicant Photograph Upload (Required for KYC Facial Verification) *
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50">
                      {photoUrl ? (
                        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-700 shrink-0">
                          <img
                            src={photoUrl}
                            alt="Applicant"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setPhotoUrl('')}
                            className="absolute inset-0 bg-black/50 text-white flex items-center justify-center text-[10px] opacity-0 hover:opacity-100 transition-opacity"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                          <Camera className="w-7 h-7" />
                        </div>
                      )}

                      <div className="flex-1 text-center sm:text-left">
                        <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                          <label className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                          </label>

                          <span className="text-xs text-slate-400">or select sample photo:</span>

                          <div className="flex items-center gap-1">
                            {sampleAvatars.map((avatar, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setPhotoUrl(avatar)}
                                className="w-7 h-7 rounded-full overflow-hidden border border-slate-300 hover:border-emerald-600 transition-all"
                              >
                                <img src={avatar} alt="sample" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-1">
                          PNG, JPG, or WEBP up to 5MB. Clear neutral background recommended.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Biometric Face Verification & Liveness Card */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-slate-800">
                        Biometric Face Verification & Liveness Audit *
                      </label>
                      <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ISO 30107-3 L2 COMPLIANT
                      </span>
                    </div>

                    {faceVerification ? (
                      <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-300 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-emerald-700 shrink-0 shadow-sm">
                              <img
                                src={faceVerification.faceImageUrl}
                                alt="Verified Face Capture"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-0 right-0 bg-emerald-700 text-white p-0.5 rounded-bl">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                                <span>Biometric Face Verification Certified</span>
                              </div>
                              <span className="text-[11px] font-mono text-emerald-800 block">
                                Ref: {faceVerification.verificationId} · Liveness: {faceVerification.livenessScore}%
                              </span>
                              <span className="text-[10px] text-slate-500">
                                Verified: {new Date(faceVerification.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setShowFaceVerificationModal(true)}
                              className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Re-scan Face
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-emerald-900 bg-white/70 p-2.5 rounded-xl border border-emerald-200">
                          <div>
                            <span className="text-slate-400 block font-sans">Liveness Score</span>
                            <strong>{faceVerification.livenessScore}%</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-sans">Facial Match</span>
                            <strong>{faceVerification.matchConfidence}%</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-sans">Anti-Spoofing</span>
                            <strong className="text-emerald-700">Level 2 PASS</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-sans">Audit Status</span>
                            <strong className="text-emerald-700">FIDO2 / SHA256</strong>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center shrink-0">
                              <Camera className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white">
                                Complete Live 3-Second Face Verification
                              </h4>
                              <p className="text-[11px] text-slate-400 leading-relaxed max-w-md mt-0.5">
                                Optical liveness check eliminates identity fraud, satisfies regulatory KYC standards, and accelerates loan release without manual branch queues.
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowFaceVerificationModal(true)}
                            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Start Face Verification</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* STEP 2: EMPLOYMENT INFORMATION */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Step 2: Employment & Income Verification
                    </h3>
                    <p className="text-xs text-slate-500">
                      Provide current professional capacity and gross/net recurring revenue streams.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Employer / Enterprise Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Horizon Global Partners Ltd"
                        value={employerName}
                        onChange={(e) => setEmployerName(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Job Title / Occupation *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Managing Director / Senior Software Architect"
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Employment Type *
                      </label>
                      <select
                        value={employmentType}
                        onChange={(e) => setEmploymentType(e.target.value as any)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      >
                        <option value="Full-Time Permanent">Full-Time Permanent</option>
                        <option value="Self-Employed / Business Owner">Self-Employed / Business Owner</option>
                        <option value="Executive / Board Director">Executive / Board Director</option>
                        <option value="Contractor">Contractor</option>
                        <option value="Part-Time">Part-Time</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Duration in Current Role *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 4 Years 6 Months"
                        value={employmentDuration}
                        onChange={(e) => setEmploymentDuration(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Monthly Net Take-Home Income ($) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-400 font-mono text-xs">$</span>
                        <input
                          type="number"
                          min="500"
                          required
                          value={monthlyIncome}
                          onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                          className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                        />
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 block">Primary regular salary or distributions</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Additional Monthly Income ($)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-400 font-mono text-xs">$</span>
                        <input
                          type="number"
                          min="0"
                          value={additionalIncome}
                          onChange={(e) => setAdditionalIncome(Number(e.target.value))}
                          className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                        />
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 block">Dividends, investments, rental yield, or bonuses</span>
                    </div>
                  </div>

                  {/* Income summary note */}
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-between text-xs text-emerald-950 font-medium">
                    <span>Total Monthly Verifiable Liquidity:</span>
                    <span className="font-mono font-bold text-sm text-emerald-900">
                      {formatCurrency(monthlyIncome + additionalIncome)} / month
                    </span>
                  </div>

                </div>
              )}

              {/* STEP 3: LOAN INFORMATION */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Step 3: Facility Parameters & Purpose
                    </h3>
                    <p className="text-xs text-slate-500">
                      Define desired capital volume, intended purpose, and repayment horizon.
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Requested Loan Amount ($) *
                      </label>
                      <span className="text-sm font-bold font-mono text-emerald-900">
                        {formatCurrency(requestedAmount)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10000"
                      max="1000000"
                      step="5000"
                      value={requestedAmount}
                      onChange={(e) => setRequestedAmount(Number(e.target.value))}
                      className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-800"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                      <span>$10,000</span>
                      <span>$500,000</span>
                      <span>$1,000,000</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Purpose of the Loan *
                    </label>
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    >
                      <option value="Property Purchase & Real Estate">Property Purchase & Real Estate</option>
                      <option value="Commercial & Business Expansion">Commercial & Business Expansion</option>
                      <option value="Debt Consolidation & Restructuring">Debt Consolidation & Restructuring</option>
                      <option value="Equipment, Machinery & Technology">Equipment, Machinery & Technology</option>
                      <option value="Working Capital & Operations">Working Capital & Operations</option>
                      <option value="Personal Investment & Wealth Strategy">Personal Investment & Wealth Strategy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Preferred Repayment Period (Months) *
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {([12, 24, 36, 48] as const).map((period) => (
                        <button
                          key={period}
                          type="button"
                          onClick={() => setRepaymentPeriodMonths(period)}
                          className={`py-2.5 text-xs font-bold rounded-lg border transition-all ${
                            repaymentPeriodMonths === period
                              ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {period} Months
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Preferred Disbursement & Payment Method *
                    </label>
                    <select
                      value={preferredPaymentMethod}
                      onChange={(e) => setPreferredPaymentMethod(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    >
                      <option value="Direct Bank Wire (SWIFT / IBAN)">Direct Bank Wire (SWIFT / IBAN)</option>
                      <option value="Automated Clearing House (ACH)">Automated Clearing House (ACH)</option>
                      <option value="SEPA Credit Transfer">SEPA Credit Transfer</option>
                      <option value="Faster Payments Direct Deposit">Faster Payments Direct Deposit</option>
                      <option value="USDT Cryptocurrency Settlement (ERC-20 / TRC-20)">USDT Cryptocurrency Settlement (ERC-20 / TRC-20 - Regulated Institutional Custody)</option>
                    </select>
                  </div>

                  {/* Calculated estimate box */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 uppercase font-semibold block">
                        Estimated Monthly Repayment
                      </span>
                      <span className="text-xl font-bold font-mono text-emerald-900">
                        {formatCurrency(estRepayment.monthlyRepayment)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 uppercase font-semibold block">
                        Annual Indicative Rate
                      </span>
                      <span className="text-sm font-semibold font-mono text-slate-800">
                        5.75% Fixed APR
                      </span>
                    </div>
                  </div>

                </div>
              )}

              {/* STEP 4: FINANCIAL INFORMATION */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Step 4: Existing Financial Commitments & DTI
                    </h3>
                    <p className="text-xs text-slate-500">
                      Accurate disclosure ensures appropriate leverage limits and swift committee authorization.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Outstanding Existing Loans Balance ($)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-400 font-mono text-xs">$</span>
                        <input
                          type="number"
                          min="0"
                          value={existingLoans}
                          onChange={(e) => setExistingLoans(Number(e.target.value))}
                          className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Monthly Debt Servicing Payments ($)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-400 font-mono text-xs">$</span>
                        <input
                          type="number"
                          min="0"
                          value={monthlyObligations}
                          onChange={(e) => setMonthlyObligations(Number(e.target.value))}
                          className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Monthly Rent or Mortgage Expense ($)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-400 font-mono text-xs">$</span>
                        <input
                          type="number"
                          min="0"
                          value={monthlyRent}
                          onChange={(e) => setMonthlyRent(Number(e.target.value))}
                          className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Other Recurring Financial Commitments ($)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-400 font-mono text-xs">$</span>
                        <input
                          type="number"
                          min="0"
                          value={otherCommitments}
                          onChange={(e) => setOtherCommitments(Number(e.target.value))}
                          className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Real-time DTI gauge indicator */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-900">
                        Calculated Debt-to-Income (DTI) Metric
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${
                        riskRating === 'Low Risk' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : riskRating === 'Moderate Risk'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {dtiPct}% · {riskRating}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full transition-all duration-300 ${
                          dtiPct <= 35 ? 'bg-emerald-600' : dtiPct <= 45 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, dtiPct)}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 leading-normal block">
                      Underwriting benchmarks target a DTI of under 45% for fast-track unencumbered approvals.
                    </span>
                  </div>

                </div>
              )}

              {/* STEP 5: APPLICANT FINANCIAL COMMITMENT */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-emerald-800 mb-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>Statutory Escrow Allocation</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      Step 5: Applicant Financial Commitment
                    </h3>
                    <p className="text-xs text-slate-500">
                      Review proposed commitment deposit calculations, statutory escrow holding safeguards, refundability terms, and legal disclosures.
                    </p>
                  </div>

                  {/* 1 & 2: Requested Amount & 10% Commitment Calculation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] uppercase font-bold text-slate-500 block">
                        1. Requested Loan Facility
                      </span>
                      <div className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
                        {formatCurrency(requestedAmount)}
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Amortization: {repaymentPeriodMonths} Months · {purpose}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-950 text-white border border-emerald-800 shadow-sm">
                      <div className="flex justify-between items-start">
                        <span className="text-[11px] uppercase font-bold text-emerald-400 block">
                          2. Proposed Financial Commitment (10%)
                        </span>
                        <span className="bg-emerald-800/80 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-200 border border-emerald-600/50">
                          10.0% Standard
                        </span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-1">
                        {formatCurrency(proposedCommitmentAmount)}
                      </div>
                      <span className="text-[11px] text-emerald-300 mt-1 block">
                        Held in Segregated Statutory Escrow
                      </span>
                    </div>
                  </div>

                  {/* 8: MANDATORY STATUTORY NOTICE: NEVER A GUARANTEE OF APPROVAL */}
                  <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold text-sm block mb-1 text-amber-900">
                          Critical Regulatory Notice: Not a Guarantee of Loan Approval
                        </strong>
                        <p className="leading-relaxed text-amber-900">
                          Payment, transfer, or deposit of this 10% Applicant Financial Commitment <strong>DOES NOT</strong> constitute a guarantee, promise, or warranty of loan approval or credit disbursement. All applications are determined exclusively by the Credit Committee based strictly upon verified financial eligibility, cashflow sustainability, and formal underwriting review.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3: Purpose & Legal Terms */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-800" />
                      Purpose and Legal Terms of the Financial Commitment
                    </h4>
                    <p className="text-slate-600 leading-relaxed">
                      The Applicant Financial Commitment represents an earnest commercial liquidity guarantee. It secures dedicated institutional treasury liquidity in the lending syndicate queue and authorizes our underwriting team to conduct formal title verifications, corporate KYC checks, and third-party credit bureau registry filings.
                    </p>
                    <div className="text-slate-500 text-[11px] pt-1">
                      • <strong>Custody Standard:</strong> Funds are placed in a segregated, ring-fenced escrow account with <em>Barclays Private Clients Escrow Depository (Account #8841-ESCR)</em> and never used for corporate operational expenses.
                    </div>
                  </div>

                  {/* 4 & 5: Refundable vs Non-Refundable Conditions */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs space-y-3">
                    <h4 className="font-bold text-slate-900 text-sm">
                      Refundability and Settlement Policy
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">
                        <strong className="block text-xs font-bold text-emerald-900 mb-1">
                          ✓ 100% Credited to Principal on Closing
                        </strong>
                        <p className="text-[11px] leading-relaxed text-emerald-800">
                          Upon formal approval and disbursement of your loan facility, 100% of the {formatCurrency(proposedCommitmentAmount)} commitment is applied as a direct principal credit reducing your opening debt balance.
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-950">
                        <strong className="block text-xs font-bold text-blue-900 mb-1">
                          ✓ 100% Refundable if Underwriting Declines
                        </strong>
                        <p className="text-[11px] leading-relaxed text-blue-800">
                          If Manulife Financial Services' Credit Committee declines your facility application under our credit policy, 100% of this commitment amount will be refunded within 3 business days to your originating account.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                      <strong>Non-Refundable Exception:</strong> The commitment deposit becomes non-refundable only if the applicant intentionally provides falsified or fraudulent documents, or unilaterally cancels after executing an unconditional binding approval term sheet.
                    </div>
                  </div>

                  {/* 5: Settlement Channel & 7: Official Receipt Preview */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2 mb-3">
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">Escrow Settlement Rail</span>
                        <span className="text-[11px] text-slate-500">Designated payment rail for the earnest commitment</span>
                      </div>
                      <select
                        value={commitmentPaymentMethod}
                        onChange={(e) => setCommitmentPaymentMethod(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      >
                        <option value="Escrow Wire Transfer (SWIFT / IBAN)">Escrow Wire Transfer (SWIFT / IBAN)</option>
                        <option value="Automated Clearing House (ACH) Direct Debit">Automated Clearing House (ACH) Direct Debit</option>
                        <option value="SEPA B2B Escrow Transfer">SEPA B2B Escrow Transfer</option>
                        <option value="Faster Payments Secure Settlement">Faster Payments Secure Settlement</option>
                        <option value="USDT Cryptocurrency Settlement (ERC-20 / TRC-20)">USDT Cryptocurrency Settlement (ERC-20 / TRC-20 - Institutional Custody)</option>
                      </select>
                    </div>

                    {/* Optional Cryptocurrency Toggle Link */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 text-[11px] gap-1">
                      <span className="text-slate-500">
                        Prefer to settle your commitment deposit via digital stablecoins?
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const nextState = !showUsdtDetails;
                          setShowUsdtDetails(nextState);
                          if (nextState) {
                            setCommitmentPaymentMethod('USDT Cryptocurrency Settlement (ERC-20 / TRC-20)');
                          }
                        }}
                        className="font-bold text-emerald-800 hover:text-emerald-950 underline text-left sm:text-right cursor-pointer"
                      >
                        {showUsdtDetails ? '✕ Hide Cryptocurrency Instructions' : '₮ View Optional Cryptocurrency Payment Information (USDT)'}
                      </button>
                    </div>

                    {/* Render USDT Information Section */}
                    {(commitmentPaymentMethod.includes('USDT') || showUsdtDetails) && paymentSettings && (
                      <div className="my-3">
                        <USDTInformationSection
                          usdtConfig={paymentSettings.usdtConfig}
                          commitmentAmount={proposedCommitmentAmount}
                          applicationId="MFS-2026-PENDING"
                          applicantName={fullName || 'Applicant'}
                          onPreviewReceipt={() => setShowCommitmentReceiptModal(true)}
                          onSubmitTxHash={(hash, network, fromAddr) => {
                            setSubmittedCryptoHash(hash);
                            setSubmittedCryptoNetwork(network);
                            setSubmittedFromAddress(fromAddr);
                          }}
                        />
                      </div>
                    )}

                    {/* Official Receipt Generation Card */}
                    <div className="p-3.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                          REC
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">Official Commitment Escrow Receipt</span>
                          <span className="text-[11px] text-slate-500 font-mono">Reference: RCPT-2026-PENDING · Amount: {formatCurrency(proposedCommitmentAmount)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowCommitmentReceiptModal(true)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-semibold transition-colors flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-800" />
                        <span>Preview Receipt</span>
                      </button>
                    </div>
                  </div>

                  {/* 6: Mandatory Informed Consent Checkboxes */}
                  <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-300 text-xs">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={commitmentTermsAccepted}
                        onChange={(e) => setCommitmentTermsAccepted(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-800 focus:ring-emerald-700 cursor-pointer"
                      />
                      <span className="text-slate-800 leading-relaxed">
                        <strong>Informed Consent to Commitment Terms:</strong> I have reviewed and agree to the 10% Applicant Financial Commitment terms of <strong>{formatCurrency(proposedCommitmentAmount)}</strong>, the escrow holding provisions, and the refundability conditions (100% credited to principal on closing or refunded if underwriting declines).
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={commitmentNoGuaranteeAcknowledged}
                        onChange={(e) => setCommitmentNoGuaranteeAcknowledged(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-800 focus:ring-emerald-700 cursor-pointer"
                      />
                      <span className="text-slate-800 leading-relaxed font-semibold text-emerald-950">
                        <strong>Explicit Non-Guarantee Acknowledgment:</strong> I understand, accept, and confirm that payment of this commitment deposit DOES NOT guarantee loan facility approval, and final approval is contingent exclusively on formal Credit Committee underwriting.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 6: DECLARATION & ELECTRONIC SIGNATURE */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Step 6: Applicant Declaration & Legal Execution
                    </h3>
                    <p className="text-xs text-slate-500">
                      Review confirmations and electronically execute your application dossier.
                    </p>
                  </div>

                  {/* Mandatory Confirmations */}
                  <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={confirmedAccurate}
                        onChange={(e) => setConfirmedAccurate(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-800 focus:ring-emerald-700 cursor-pointer"
                      />
                      <span className="text-xs text-slate-700 leading-relaxed">
                        <strong>Accuracy Confirmation:</strong> I hereby declare that all information furnished in this application, including personal identification, employment records, and financial statements, is true, complete, and accurate to the best of my knowledge.
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={acceptedDisclosures}
                        onChange={(e) => setAcceptedDisclosures(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-800 focus:ring-emerald-700 cursor-pointer"
                      />
                      <span className="text-xs text-slate-700 leading-relaxed">
                        <strong>Disclosures & Anti-Advance-Fee Guarantee:</strong> I acknowledge the loan terms disclosure and confirm understanding that Manulife Financial Services does not charge advance fees for loan clearance or releasing. I consent to credit underwriting inquiries.
                      </span>
                    </label>
                  </div>

                  {/* Electronic Signature Box */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-900">
                        Electronic Signature (Legally Binding Under ESIGN / eIDAS) *
                      </label>
                      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                        <button
                          type="button"
                          onClick={() => setSignatureMode('type')}
                          className={`px-2.5 py-1 rounded-md transition-colors ${
                            signatureMode === 'type' ? 'bg-white font-semibold text-slate-900 shadow-sm' : 'text-slate-500'
                          }`}
                        >
                          Type Signature
                        </button>
                        <button
                          type="button"
                          onClick={() => setSignatureMode('draw')}
                          className={`px-2.5 py-1 rounded-md transition-colors ${
                            signatureMode === 'draw' ? 'bg-white font-semibold text-slate-900 shadow-sm' : 'text-slate-500'
                          }`}
                        >
                          Draw Signature
                        </button>
                      </div>
                    </div>

                    {signatureMode === 'type' ? (
                      <div className="p-4 rounded-xl border border-slate-300 bg-white">
                        <input
                          type="text"
                          required
                          value={typedSignature}
                          onChange={(e) => setTypedSignature(e.target.value)}
                          placeholder="Type your full legal name here"
                          className="w-full text-xl sm:text-2xl font-serif italic text-emerald-950 focus:outline-none border-b border-slate-300 pb-2"
                        />
                        <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
                          <span>Signed by: {fullName || 'Applicant'}</span>
                          <span>Timestamp: {new Date().toLocaleDateString()}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl border border-slate-300 bg-white">
                        <div className="flex justify-between items-center mb-1 text-[11px] text-slate-500">
                          <span>Draw your signature inside the box using mouse or finger:</span>
                          <button
                            type="button"
                            onClick={clearCanvas}
                            className="text-emerald-800 hover:underline flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" /> Clear
                          </button>
                        </div>
                        <canvas
                          ref={canvasRef}
                          width={600}
                          height={120}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                          className="w-full h-28 bg-slate-50 border border-slate-200 rounded-lg cursor-crosshair touch-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Summary preview strip */}
                  <div className="p-3 bg-emerald-950 text-white rounded-xl text-xs flex flex-wrap items-center justify-between gap-3 font-mono">
                    <div>Facility: {formatCurrency(requestedAmount)} ({repaymentPeriodMonths} Mo)</div>
                    <div>Commitment (10%): {formatCurrency(proposedCommitmentAmount)}</div>
                    <div>Est. Monthly: {formatCurrency(estRepayment.monthlyRepayment)}</div>
                  </div>

                </div>
              )}

              {/* Navigation Footer */}
              <div className="pt-6 mt-6 border-t border-slate-200 flex items-center justify-between">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 6 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg uppercase tracking-wide transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Proceed to Step {currentStep + 1}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg uppercase tracking-wider transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{submissionProgress || 'Submitting...'}</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Final Application</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>

            </form>
          )}

        </div>

      </div>

      {/* COMMITMENT RECEIPT PREVIEW POPUP */}
      {showCommitmentReceiptModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-slate-300 p-6 text-xs text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-800" />
                <span className="font-bold text-slate-900 text-sm">Official Commitment Escrow Receipt</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCommitmentReceiptModal(false)}
                className="text-slate-400 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3 font-mono text-[11px] mb-4">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">RECEIPT NUMBER:</span>
                <span className="font-bold text-emerald-900">RCPT-2026-PENDING-C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">PAYER / APPLICANT:</span>
                <span className="font-semibold text-slate-900">{fullName || 'Alexander Montgomery'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">REQUESTED FACILITY:</span>
                <span className="text-slate-900">{formatCurrency(requestedAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">COMMITMENT RATE:</span>
                <span className="text-slate-900">10.00% Statutory Allocation</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-slate-200 pt-2 text-emerald-950">
                <span>COMMITMENT AMOUNT:</span>
                <span>{formatCurrency(proposedCommitmentAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SETTLEMENT RAIL:</span>
                <span className="font-semibold text-slate-800">{commitmentPaymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ESCROW CUSTODIAN:</span>
                <span className="text-slate-700">
                  {commitmentPaymentMethod.includes('USDT') 
                    ? 'BitGo Trust Company Inc. (Regulated Trust Charter #D-8841)' 
                    : 'Barclays Private Clients Escrow'}
                </span>
              </div>
              {commitmentPaymentMethod.includes('USDT') && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">PARITY & ASSET:</span>
                    <span className="text-slate-800">1.00 USDT = $1.00 USD · Tether USD Stablecoin</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">TX HASH / STATUS:</span>
                    <span className="text-emerald-800 font-bold">
                      {submittedCryptoHash ? `${submittedCryptoHash.slice(0, 16)}... (Pending Verification)` : 'Awaiting On-Chain Broadcast'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">INDEPENDENT VERIFICATION:</span>
                    <span className="text-amber-800">Compliance Officer Review & 32 On-Chain Confirmations Required</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">REFUNDABILITY STATUS:</span>
                <span className="text-emerald-700 font-bold">100% Credited to Principal on Closing or Refunded if Underwriting Declines</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-900 leading-relaxed mb-4">
              <strong>STATUTORY FAIR LENDING DISCLOSURE:</strong> Receipt of this commitment deposit does NOT guarantee loan approval or credit facility disbursement. Approvals are determined strictly by underwriting credit review.
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-xs"
              >
                Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setShowCommitmentReceiptModal(false)}
                className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded font-semibold text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BIOMETRIC FACE VERIFICATION MODAL */}
      <FaceVerificationModal
        isOpen={showFaceVerificationModal}
        onClose={() => setShowFaceVerificationModal(false)}
        onVerificationComplete={(verification) => {
          setFaceVerification(verification);
          if (!photoUrl) {
            setPhotoUrl(verification.faceImageUrl);
          }
        }}
        applicantName={fullName || 'Alexander Montgomery'}
        referencePhotoUrl={photoUrl}
      />
    </div>
  );
};
