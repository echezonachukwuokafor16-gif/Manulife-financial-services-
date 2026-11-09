/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LoanStatus = 
  | 'pending_review' 
  | 'underwriting' 
  | 'documents_required' 
  | 'approved' 
  | 'declined' 
  | 'disbursed';

export type EmploymentType = 
  | 'Full-Time Permanent' 
  | 'Self-Employed / Business Owner' 
  | 'Contractor' 
  | 'Executive / Board Director' 
  | 'Part-Time';

export type LoanPurpose = 
  | 'Property Purchase & Real Estate' 
  | 'Commercial & Business Expansion' 
  | 'Debt Consolidation & Restructuring' 
  | 'Equipment, Machinery & Technology' 
  | 'Working Capital & Operations' 
  | 'Personal Investment & Wealth Strategy';

export type PaymentMethod = 
  | 'Direct Bank Wire (SWIFT / IBAN)' 
  | 'Automated Clearing House (ACH)' 
  | 'SEPA Credit Transfer' 
  | 'Faster Payments Direct Deposit'
  | 'USDT Cryptocurrency Settlement (ERC-20 / TRC-20)';

export interface LoanApplication {
  id: string; // e.g. VCC-2026-4892
  createdAt: string;
  updatedAt: string;
  status: LoanStatus;
  
  // Step 1: Personal Information
  personal: {
    fullName: string;
    dob: string;
    gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
    nationality: string;
    residenceCountry: string;
    residentialAddress: string;
    phoneNumber: string;
    email: string;
    photoUrl?: string; // Base64 or object URL
  };

  // Step 2: Employment Information
  employment: {
    employerName: string;
    occupation: string;
    employmentDuration: string; // e.g. "4 years 6 months"
    employmentType: EmploymentType;
    monthlyIncome: number;
    additionalIncome: number;
  };

  // Step 3: Loan Information
  loan: {
    requestedAmount: number;
    purpose: LoanPurpose;
    repaymentPeriodMonths: 12 | 24 | 36 | 48;
    preferredPaymentMethod: PaymentMethod;
  };

  // Step 4: Financial Information
  financial: {
    existingLoans: number;
    monthlyObligations: number;
    monthlyRent: number;
    otherCommitments: number;
  };

  // Step 5: Applicant Financial Commitment
  commitment: {
    requestedLoanAmount: number;
    commitmentRatePct: number; // 10%
    commitmentAmount: number; // 10% of requested amount
    purposeDescription: string;
    refundabilityType: string;
    termsAccepted: boolean;
    acknowledgedNoGuarantee: boolean;
    receiptNumber: string;
    paymentMethod: string;
    paymentStatus: 'Held in Regulated Escrow' | 'Pending Settlement' | 'Credited to Loan Balance';
    disclosedAt: string;
    escrowCustodian: string;
  };

  // Step 6: Declaration & Digital Signature
  declaration: {
    confirmedAccurate: boolean;
    acceptedDisclosures: boolean;
    signatureDataUrl: string; // drawn signature or typed glyph
    signatureType: 'draw' | 'type';
    signedAt: string;
  };

  // Biometric KYC Face Verification
  faceVerification?: FaceVerification;

  // Underwriting & Officer Review Details
  underwriting?: {
    riskTier: 'Tier 1 (Prime)' | 'Tier 2 (Near-Prime)' | 'Tier 3 (Elevated Risk)';
    approvedAmount?: number;
    approvedRate?: number; // annual percentage e.g. 5.65
    approvedPeriodMonths?: 12 | 24 | 36 | 48;
    officerNotes?: string;
    requestedDocuments?: string[];
    disbursementReference?: string;
    reviewedBy?: string;
    decisionDate?: string;
  };

  // Uploaded applicant documents
  documents: {
    id: string;
    name: string;
    type: string;
    size: string;
    uploadedAt: string;
    status: 'verified' | 'pending' | 'rejected';
  }[];
}

export interface FaceVerification {
  verified: boolean;
  verifiedAt: string;
  verificationId: string; // e.g. BIO-2026-8194
  livenessScore: number; // e.g. 99.4
  matchConfidence: number; // e.g. 98.8
  antiSpoofingStatus: 'Passed' | 'Flagged' | 'Inconclusive';
  faceImageUrl: string;
  idCardImageUrl?: string;
  livenessChecks: {
    blinkDetected: boolean;
    headTurnDetected: boolean;
    depthAnalyzed: boolean;
    lightingPass: boolean;
    antiPresentationAttack: boolean;
  };
  deviceInfo?: string;
  auditHash: string;
}

export interface ApplicationNotification {
  id: string;
  applicationId: string;
  recipientEmail: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'action_required' | 'success' | 'alert';
  isRead: boolean;
}

export interface SupportMessage {
  id: string;
  applicationId: string;
  sender: 'applicant' | 'officer';
  senderName: string;
  message: string;
  timestamp: string;
}

export interface LoanCalculationResult {
  loanAmount: number;
  annualInterestRate: number;
  repaymentPeriodMonths: number;
  monthlyRepayment: number;
  totalRepayment: number;
  totalInterest: number;
  amortizationPreview: {
    month: number;
    principalPaid: number;
    interestPaid: number;
    remainingBalance: number;
  }[];
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  category: 'fiat' | 'crypto';
  enabled: boolean;
  providerName: string;
  providerAccountOrAddress: string;
  processingTime: string;
  transactionFeePct: number;
  fixedFee: number;
  currency: string;
  notes: string;
  requiresIndependentVerification: boolean;
}

export interface USDTConfig {
  enabled: boolean;
  isLegalApprovalGranted: boolean;
  authorizedCustodian: string;
  custodianLicenseRef: string;
  supportedNetworks: {
    id: string;
    name: string;
    tokenStandard: string;
    active: boolean;
    depositAddress: string;
    confirmationsRequired: number;
    estConfirmationMinutes: string;
    networkGasFeeEst: string;
    contractAddress: string;
  }[];
  activeNetworkId: string;
  exchangeRateUsd: number; // 1 USDT = $1.00 USD
  oracleProvider: string;
  custodySurchargePct: number; // 0.00%
  gasFeePolicy: string;
  refundPolicy: string;
  paymentConditions: string[];
  noGuaranteeDisclosure: string;
  independentVerificationRequired: boolean;
}

export interface PaymentAuditLog {
  id: string;
  timestamp: string;
  adminName: string;
  adminEmail: string;
  action: string;
  details: string;
  ipAddress: string;
  twoFactorVerified: boolean;
}

export interface CryptoTransactionVerification {
  id: string;
  applicationId: string;
  applicantName: string;
  amountUsdt: number;
  equivalentUsd: number;
  network: string;
  txHash: string;
  fromAddress: string;
  toAddress: string;
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  status: 'pending_verification' | 'verified' | 'rejected';
  confirmations: number;
  requiredConfirmations: number;
  receiptNumber: string;
  notes?: string;
}

export interface PaymentSettings {
  updatedAt: string;
  updatedBy: string;
  methods: PaymentMethodConfig[];
  usdtConfig: USDTConfig;
}

export interface CompanyContactSettings {
  supportEmail: string;
  directLiaisonEmail: string;
  supportPhone: string;
  whatsappNumber?: string;
  whatsappLink?: string;
  whatsappEnabled?: boolean;
  telegramUsername?: string;
  telegramLink?: string;
  telegramEnabled?: boolean;
  londonEmail: string;
  zurichEmail: string;
  nyEmail: string;
  officeHours: string;
  updatedAt: string;
  updatedBy: string;
}

export interface EmailNotificationRecord {
  id: string;
  applicationId: string;
  recipientEmail: string;
  recipientName: string;
  ccEmail?: string;
  fromEmail: string;
  fromName: string;
  subject: string;
  previewText?: string;
  htmlContent?: string;
  plainTextContent?: string;
  message?: string;
  badgeText?: string;
  trigger?: string;
  triggerEvent: 
    | 'application_submitted'
    | 'status_changed'
    | 'usdt_deposit_received'
    | 'usdt_deposit_verified'
    | 'documents_required'
    | 'face_kyc_completed'
    | 'officer_message'
    | 'system_test';
  status: 'delivered' | 'sent' | 'queued';
  sentAt: string;
  deliveredAt: string;
  timestamp?: string;
  openedAt?: string;
  details?: { label: string; value: string }[];
}

export interface EmailDispatchSettings {
  enabled: boolean;
  senderName: string;
  senderDisplayName?: string;
  senderEmail: string;
  liaisonEmail: string;
  directLiaisonEmail?: string;
  notifyOnNewApplication: boolean;
  notifyOnApplicationSubmitted?: boolean;
  notifyOnUsdtDeposit: boolean;
  notifyOnUsdtReceived?: boolean;
  notifyOnUsdtVerified?: boolean;
  notifyOnStatusChange: boolean;
  notifyOnFaceKyc: boolean;
  notifyOnDocumentUpload: boolean;
  notifyOnDocumentsRequired?: boolean;
  notifyOnOfficerMessage: boolean;
  smtpRelayHost: string;
  encryption: 'TLS' | 'SSL';
  updatedAt: string;
  updatedBy: string;
}

export type SupportedLanguage = 
  | 'en' // English
  | 'es' // Spanish
  | 'fr' // French
  | 'de' // German
  | 'zh' // Chinese (Simplified)
  | 'ar' // Arabic
  | 'pt' // Portuguese
  | 'ja' // Japanese
  | 'it' // Italian
  | 'ru' // Russian
  | 'nl' // Dutch
  | 'tr'; // Turkish

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export interface TestimonialItem {
  id: string;
  authorName: string;
  role: string;
  company: string;
  location: string;
  facilityAmount: number;
  facilityType: string;
  sector: string;
  quote: string;
  turnaroundTime: string;
  closingDate: string;
  verifiedAuditDesk: string;
  avatarUrl?: string;
  rating?: number;
}


