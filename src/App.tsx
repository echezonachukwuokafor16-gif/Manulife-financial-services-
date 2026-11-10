/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { LoanCalculatorSection } from './components/LoanCalculatorSection';
import { AntiAdvanceFeeBanner } from './components/AntiAdvanceFeeBanner';
import { EligibilitySection } from './components/EligibilitySection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FAQSection } from './components/FAQSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { MultiStepApplicationModal } from './components/MultiStepApplicationModal';
import { ApplicantDashboard } from './components/ApplicantDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { OfficialDocumentModal } from './components/OfficialDocumentModal';
import { LegalModal } from './components/LegalModals';
import { AuthModal } from './components/AuthModal';
import { EmailToastNotification } from './components/EmailToastNotification';
import { EmailLetterModal } from './components/EmailLetterModal';
import { LoanApplication, LoanPurpose, EmailNotificationRecord } from './types';
import { LanguageProvider } from './context/LanguageContext';
import { LanguageSelector } from './components/LanguageSelector';
import { initReferralCapture } from './lib/storage';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'apply' | 'applicant-portal' | 'admin-portal'>('home');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [prefilledAmount, setPrefilledAmount] = useState<number>(100000);
  const [prefilledTerm, setPrefilledTerm] = useState<12 | 24 | 36 | 48>(36);
  const [prefilledPurpose, setPrefilledPurpose] = useState<LoanPurpose>('Commercial & Business Expansion');
  const [globalLetterEmail, setGlobalLetterEmail] = useState<EmailNotificationRecord | null>(null);
  const [activeReferralCode, setActiveReferralCode] = useState<string | null>(null);

  // Authentication & Session state
  const [userSession, setUserSession] = useState<{ role: 'admin' | 'borrower' | null; email?: string }>(() => {
    try {
      const saved = sessionStorage.getItem('mfs_session');
      return saved ? JSON.parse(saved) : { role: null };
    } catch {
      return { role: null };
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');

  // Dashboard & Document Viewer state
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [documentViewer, setDocumentViewer] = useState<{
    application: LoanApplication | null;
    docType: 'term_sheet' | 'summary' | 'amortization' | 'commitment_receipt';
    isOpen: boolean;
  }>({
    application: null,
    docType: 'term_sheet',
    isOpen: false,
  });

  // Legal Modal
  const [legalType, setLegalType] = useState<'privacy' | 'terms' | null>(null);

  const handleAuthSuccess = (session: { role: 'admin' | 'borrower'; email: string; appId?: string }) => {
    setUserSession({ role: session.role, email: session.email });
    try {
      sessionStorage.setItem('mfs_session', JSON.stringify({ role: session.role, email: session.email }));
    } catch {}

    if (session.role === 'admin') {
      setCurrentView('admin-portal');
    } else {
      if (session.appId) {
        setSelectedAppId(session.appId);
      }
      setCurrentView('applicant-portal');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = () => {
    setUserSession({ role: null });
    try {
      sessionStorage.removeItem('mfs_session');
    } catch {}
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSignIn = () => {
    setAuthModalTab('signin');
    setIsAuthModalOpen(true);
  };

  const handleOpenSignUp = () => {
    setAuthModalTab('signup');
    setIsAuthModalOpen(true);
  };

  // Discreet administrative access listener & Referral Link Capture
  React.useEffect(() => {
    const detectedRef = initReferralCapture();
    if (detectedRef) {
      setActiveReferralCode(detectedRef);
    }

    const checkHash = () => {
      if (window.location.hash === '#admin' || window.location.hash === '#underwriting') {
        setCurrentView('admin-portal');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setCurrentView('admin-portal');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkHash);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleOpenApply = (
    amount = 100000,
    term: 12 | 24 | 36 | 48 = 36,
    purpose: LoanPurpose = 'Commercial & Business Expansion'
  ) => {
    setPrefilledAmount(amount);
    setPrefilledTerm(term);
    setPrefilledPurpose(purpose);
    setIsApplyModalOpen(true);
  };

  const handleApplicationSuccess = (newAppId: string) => {
    setSelectedAppId(newAppId);
    setIsApplyModalOpen(false);
    setCurrentView('applicant-portal');
  };

  const handleOpenDocument = (
    application: LoanApplication,
    docType: 'term_sheet' | 'summary' | 'amortization' | 'commitment_receipt'
  ) => {
    setDocumentViewer({
      application,
      docType,
      isOpen: true,
    });
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-800 selection:text-white">
        
        {/* Top Header */}
        <Header
          currentView={currentView}
          onNavigate={(view) => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenApply={() => handleOpenApply(prefilledAmount, prefilledTerm, prefilledPurpose)}
          userRole={userSession.role}
          userEmail={userSession.email}
          onOpenSignIn={handleOpenSignIn}
          onOpenSignUp={handleOpenSignUp}
          onSignOut={handleSignOut}
        />

        {/* Main Content Views */}
        <main className="flex-1">
          {currentView === 'home' && (
            <>
              <HeroSection
                onApplyClick={(amount, term) => handleOpenApply(amount || 75000, term || 36)}
                onExploreCalculator={() => {
                  const el = document.getElementById('calculator');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              />

              <ServicesSection
                onSelectService={(purpose) => handleOpenApply(150000, 36, purpose)}
              />

              <LoanCalculatorSection
                onApplyWithTerms={(amount, term) => handleOpenApply(amount, term)}
              />

              <AntiAdvanceFeeBanner />

              <EligibilitySection
                onOpenApply={() => handleOpenApply(100000, 36)}
              />

              <TestimonialsSection />

              <FAQSection />

              <ContactSection />
            </>
          )}

          {currentView === 'applicant-portal' && (
            <ApplicantDashboard
              initialAppId={selectedAppId}
              onOpenDocumentModal={handleOpenDocument}
              onOpenNewApplication={() => handleOpenApply(100000, 36)}
            />
          )}

          {currentView === 'admin-portal' && (
            <AdminDashboard
              onOpenDocumentModal={handleOpenDocument}
              isInitiallyAuthenticated={userSession.role === 'admin'}
              onSignOut={handleSignOut}
              onAuthSuccess={() => {
                setUserSession({ role: 'admin', email: 'admin@manulife-financial.com' });
                try {
                  sessionStorage.setItem('mfs_session', JSON.stringify({ role: 'admin', email: 'admin@manulife-financial.com' }));
                } catch {}
              }}
            />
          )}
        </main>

        {/* Footer */}
        <Footer
          onNavigate={(view) => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenApply={() => handleOpenApply(100000, 36)}
          onOpenLegal={(type) => setLegalType(type)}
        />

        {/* Floating Quick Language Translator Widget */}
        <LanguageSelector variant="floating" />

        {/* Multi-Step Application Modal */}
        <MultiStepApplicationModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          onSuccess={handleApplicationSuccess}
          initialAmount={prefilledAmount}
          initialTerm={prefilledTerm}
          initialPurpose={prefilledPurpose}
        />

        {/* Document Viewer & Printer */}
        <OfficialDocumentModal
          isOpen={documentViewer.isOpen}
          application={documentViewer.application}
          docType={documentViewer.docType}
          onClose={() => setDocumentViewer((prev) => ({ ...prev, isOpen: false }))}
        />

        {/* Legal & Privacy Policy Modal */}
        <LegalModal
          type={legalType}
          onClose={() => setLegalType(null)}
        />

        {/* Unified Sign In & Sign Up Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          initialTab={authModalTab}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
          onOpenApply={(amount, term, purpose) => handleOpenApply(amount || 100000, term || 36, purpose)}
        />

        {/* Real-time Institutional Email Dispatch Toast Notification */}
        <EmailToastNotification
          onOpenEmail={(email) => setGlobalLetterEmail(email)}
        />

        {/* Global Official Email Letterhead Viewer */}
        {globalLetterEmail && (
          <EmailLetterModal
            email={globalLetterEmail}
            onClose={() => setGlobalLetterEmail(null)}
          />
        )}

      </div>
    </LanguageProvider>
  );
}
