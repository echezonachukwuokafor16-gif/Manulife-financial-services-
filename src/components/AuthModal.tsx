/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, User, Phone, DollarSign, 
  ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, 
  LogIn, UserPlus, Key, Shield
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
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab);
  
  // Sign In State
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sign Up State
  const [fullName, setFullName] = useState<string>('');
  const [signUpEmail, setSignUpEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [signUpPassword, setSignUpPassword] = useState<string>('');
  const [desiredAmount, setDesiredAmount] = useState<number>(100000);

  // Keep activeTab in sync when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setErrorMsg('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
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
          // Success: Administrator login
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

      // Check if existing applicant in storage
      const applications = await storage.getAllApplications();
      const matchedApp = applications.find(
        (app) => app.personal.email.toLowerCase() === trimmedEmail || app.id.toLowerCase() === trimmedEmail
      );

      if (matchedApp) {
        // Successful borrower login
        onSuccess({
          role: 'borrower',
          email: matchedApp.personal.email,
          appId: matchedApp.id,
        });
        onClose();
        return;
      }

      // Generic borrower login for any other email
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

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpEmail || !fullName) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    onClose();
    // Launch official loan application with prefilled data
    onOpenApply(desiredAmount, 36);
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
          <div className="flex bg-slate-800/90 p-1 rounded-xl mt-4 border border-slate-700">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setErrorMsg('');
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
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div className="text-[11px] leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {activeTab === 'signin' ? (
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
          ) : (
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
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2 mt-2"
              >
                <span>Continue to Loan Application</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-1 text-center text-slate-500 text-[11px]">
                <span>Already registered? </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setErrorMsg('');
                  }}
                  className="text-emerald-800 font-semibold hover:underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
