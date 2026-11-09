/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, User, Phone, DollarSign, 
  ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, 
  LogIn, UserPlus, Key, Shield, HelpCircle, ArrowLeft
} from 'lucide-react';
import { storage } from '../lib/storage';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'signin' | 'signup';
  onClose: () => void;
  onSuccess: (session: { role: 'admin' | 'borrower'; email: string; appId?: string }) => void;
  onOpenApply: (amount?: number, term?: 12 | 24 | 36 | 48, purpose?: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialTab = 'signin',
  onClose,
  onSuccess,
  onOpenApply,
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'forgot'>(initialTab);
  
  // Sign In State
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sign Up State
  const [fullName, setFullName] = useState<string>('');
  const [signUpEmail, setSignUpEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [signUpPassword, setSignUpPassword] = useState<string>('');
  const [showSignUpPassword, setShowSignUpPassword] = useState<boolean>(false);
  const [desiredAmount, setDesiredAmount] = useState<number>(100000);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [resetCode, setResetCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [forgotStep, setForgotStep] = useState<'request' | 'verify'>('request');

  // Keep activeTab in sync when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();

      if (!trimmedEmail || !trimmedPassword) {
        setErrorMsg('Please enter both your email address and password.');
        setIsSubmitting(false);
        return;
      }

      // Check if Admin Credentials
      const isAdminEmail = 
        trimmedEmail === 'admin@manulife-financial.com' || 
        trimmedEmail === 'admin' ||
        trimmedEmail.endsWith('@manulife-financial.com');

      const isAdminPasscode = 
        trimmedPassword === 'admin2026' || 
        trimmedPassword.toLowerCase() === 'admin';

      if (isAdminEmail) {
        if (isAdminPasscode) {
          onSuccess({
            role: 'admin',
            email: 'admin@manulife-financial.com',
          });
          onClose();
          return;
        } else {
          setErrorMsg('Access Denied: Invalid administrator password. Please check your credentials.');
          setIsSubmitting(false);
          return;
        }
      }

      // Try server login API
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
        });
        const loginData = await response.json();
        if (response.ok && loginData.success) {
          onSuccess({
            role: loginData.role,
            email: loginData.email,
            appId: loginData.appId,
          });
          onClose();
          return;
        } else if (!response.ok && response.status === 401) {
          setErrorMsg(loginData.error || 'Invalid email or password.');
          setIsSubmitting(false);
          return;
        }
      } catch {
        // Fallback to local storage check
      }

      // Check if existing applicant in storage
      const applications = await storage.getAllApplications();
      const matchedApp = applications.find(
        (app) => app.personal.email.toLowerCase() === trimmedEmail || app.id.toLowerCase() === trimmedEmail
      );

      // Check registered credentials
      const savedPassword = storage.getUserCredential(trimmedEmail);
      if (savedPassword && savedPassword !== trimmedPassword) {
        setErrorMsg('Invalid password for this registered account. Please check your credentials or reset your password.');
        setIsSubmitting(false);
        return;
      }

      if (matchedApp) {
        onSuccess({
          role: 'borrower',
          email: matchedApp.personal.email,
          appId: matchedApp.id,
        });
        onClose();
        return;
      }

      // Generic borrower login
      if (trimmedPassword.length >= 4) {
        onSuccess({
          role: 'borrower',
          email: trimmedEmail,
        });
        onClose();
        return;
      } else {
        setErrorMsg('Password must be at least 4 characters long.');
      }
    } catch (err: any) {
      setErrorMsg('An error occurred during authentication. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const trimmedEmail = signUpEmail.trim().toLowerCase();
    const trimmedName = fullName.trim();
    const trimmedPassword = signUpPassword.trim();

    if (!trimmedEmail || !trimmedName) {
      setErrorMsg('Please enter your full name and email address.');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    // Password validation (Requirement 5)
    if (!trimmedPassword || trimmedPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long for account security.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Check duplicate in existing local list
      const existing = await storage.getApplicationByEmail(trimmedEmail);
      if (existing) {
        setErrorMsg(`An account with email "${trimmedEmail}" already exists (File Ref: ${existing.id}). Please sign in or use a different email.`);
        setIsSubmitting(false);
        return;
      }

      const newApp = await storage.registerBorrower({
        fullName: trimmedName,
        email: trimmedEmail,
        phone: phone.trim() || '+1 (555) 019-2834',
        password: trimmedPassword,
        desiredAmount: desiredAmount || 100000,
        purpose: 'Commercial & Business Expansion',
      });

      // Dispatch event to sync Admin Portal and all subscriber components instantly
      window.dispatchEvent(new Event('verdant_storage_update'));

      setSuccessMsg(`✓ Registration successful! Your dossier #${newApp.id} is active. Logging you in...`);

      setTimeout(() => {
        onSuccess({
          role: 'borrower',
          email: newApp.personal.email,
          appId: newApp.id,
        });
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!forgotEmail.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await storage.requestPasswordReset(forgotEmail.trim());
      setSuccessMsg(result.message || `Verification code sent to ${forgotEmail}.`);
      setForgotStep('verify');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch reset code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyAndResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!resetCode.trim() || !newPassword.trim()) {
      setErrorMsg('Please enter both the verification code and your new password.');
      return;
    }

    if (newPassword.trim().length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await storage.resetPasswordWithCode(forgotEmail.trim(), resetCode.trim(), newPassword.trim());
      setSuccessMsg(result.message || 'Password reset successfully! Please sign in with your new password.');
      setTimeout(() => {
        setActiveTab('signin');
        setEmail(forgotEmail.trim());
        setPassword(newPassword.trim());
        setForgotStep('request');
        setForgotEmail('');
        setResetCode('');
        setNewPassword('');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification code invalid or expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs">
        
        {/* Header Ribbon */}
        <div className="bg-slate-900 text-white p-6 pb-5 text-center relative border-b border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            ✕
          </button>

          <img 
            src="/assets/aistudio/file_00000000245881fdbc108ee1cf0b4466_512afb92.png" 
            alt="Manulife Financial Services" 
            className="w-14 h-14 object-contain rounded-full mx-auto mb-2.5 shadow-md border border-emerald-500/30 bg-white" 
          />

          <h2 className="text-lg font-bold text-white tracking-tight">
            Manulife Financial Services
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Institutional Lending & Credit Management Portal
          </p>

          {/* Tab Switcher */}
          {activeTab !== 'forgot' ? (
            <div className="flex bg-slate-800/90 p-1 rounded-xl mt-4 border border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signin');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'signin'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signup');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'signup'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>
          ) : (
            <div className="mt-4 flex items-center justify-between text-xs text-slate-300">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signin');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="flex items-center gap-1.5 text-emerald-400 hover:underline font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
              <span className="font-semibold text-white">Password Recovery</span>
            </div>
          )}
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div className="text-[11px] leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div className="text-[11px] leading-relaxed font-semibold">{successMsg}</div>
            </div>
          )}

          {activeTab === 'signin' && (
            /* SIGN IN FORM */
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Email Address or Officer ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="name@example.com or admin@manulife-financial.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-semibold">
                    Password / Access Passcode
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('forgot');
                      setForgotEmail(email);
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="text-[11px] text-emerald-800 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-75"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Account'}</span>
              </button>

              <div className="pt-2 text-center text-slate-500 text-[11px]">
                <span>Don't have a borrower account yet? </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-emerald-800 font-semibold hover:underline"
                >
                  Sign Up
                </button>
              </div>

              {/* Administrative Note */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-slate-400 text-[10px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Underwriting officers can log in directly with official credentials.</span>
              </div>
            </form>
          )}

          {activeTab === 'signup' && (
            /* SIGN UP FORM */
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Full Legal Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. Jonathan Vance"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="email"
                    placeholder="applicant@example.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Account Password * (Min 6 Characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    placeholder="Create a secure password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 p-0.5"
                    title={showSignUpPassword ? 'Hide password' : 'Show password'}
                  >
                    {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 019-2834"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Initial Desired Loan Facility ($)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="number"
                    min={10000}
                    step={5000}
                    value={desiredAmount}
                    onChange={(e) => setDesiredAmount(Number(e.target.value))}
                    className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-75"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? 'Registering Account...' : 'Complete Registration'}</span>
              </button>

              <div className="pt-1 text-center text-slate-500 text-[11px]">
                <span>Already registered? </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-emerald-800 font-semibold hover:underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {activeTab === 'forgot' && (
            /* FORGOT PASSWORD FORM (Requirement 4) */
            <div className="space-y-4">
              {forgotStep === 'request' ? (
                <form onSubmit={handleRequestResetCode} className="space-y-4">
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Enter the email address associated with your credit file. We will send you an official 6-digit verification code to reset your password.
                  </p>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Account Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        placeholder="your.email@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-75"
                  >
                    <Key className="w-4 h-4" />
                    <span>{isSubmitting ? 'Sending Code...' : 'Send Verification Code'}</span>
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('signin')}
                      className="text-slate-500 hover:text-slate-900 text-xs underline"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyAndResetPassword} className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-600 block">Verification code sent to:</span>
                    <strong className="text-slate-900 font-mono text-xs block">{forgotEmail}</strong>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      6-Digit Verification Code *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 582914"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-center tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      New Password * (Min 6 Characters)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-75"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isSubmitting ? 'Updating Password...' : 'Reset Password & Sign In'}</span>
                  </button>

                  <div className="flex items-center justify-between pt-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setForgotStep('request')}
                      className="text-slate-500 hover:underline"
                    >
                      ← Re-enter email
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('signin')}
                      className="text-emerald-800 font-semibold hover:underline"
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
