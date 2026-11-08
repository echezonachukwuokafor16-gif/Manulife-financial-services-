/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck, LayoutDashboard, FileText, ArrowRight, Mail, Phone, LogIn, UserPlus, LogOut } from 'lucide-react';
import { CompanyContactSettings } from '../types';
import { storage } from '../lib/storage';
import { WhatsAppFilledIcon, TelegramFilledIcon } from './SocialSupportIcons';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

interface HeaderProps {
  currentView: 'home' | 'apply' | 'applicant-portal' | 'admin-portal';
  onNavigate: (view: 'home' | 'apply' | 'applicant-portal' | 'admin-portal') => void;
  onOpenApply: () => void;
  userRole?: 'admin' | 'borrower' | null;
  userEmail?: string;
  onOpenSignIn: () => void;
  onOpenSignUp: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentView, 
  onNavigate, 
  onOpenApply,
  userRole,
  userEmail,
  onOpenSignIn,
  onOpenSignUp,
  onSignOut,
}) => {
  const [contactSettings, setContactSettings] = useState<CompanyContactSettings | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await storage.getContactSettings();
      setContactSettings(data);
    };
    fetchSettings();
    window.addEventListener('verdant_storage_update', fetchSettings);
    return () => window.removeEventListener('verdant_storage_update', fetchSettings);
  }, []);

  const supportEmail = contactSettings?.supportEmail || 'support@manulife-financial.com';
  const directEmail = contactSettings?.directLiaisonEmail || 'echezonachukwuokafor16@gmail.com';
  const phone = contactSettings?.supportPhone || '+44 20 7946 0880';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors">
      {/* Top Support & Official Email Header Ribbon */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <Mail className="w-3.5 h-3.5" />
              <span className="text-slate-300">{t('header.customerSupport', 'Customer Support:')}</span>
              <a href={`mailto:${supportEmail}`} className="text-white hover:text-emerald-300 underline font-mono">
                {supportEmail}
              </a>
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:flex items-center gap-1.5 text-slate-300">
              <span className="text-slate-400">{t('header.directLiaison', 'Direct Officer Liaison:')}</span>
              <a href={`mailto:${directEmail}`} className="text-emerald-300 hover:text-white underline font-mono">
                {directEmail}
              </a>
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-slate-400 text-[10px] sm:text-[11px] flex-wrap">
            {/* WhatsApp Support Link */}
            <a
              href={contactSettings?.whatsappLink || `https://wa.me/${(contactSettings?.whatsappNumber || '+447458198234').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#25D366] hover:text-[#32e074] font-semibold transition-colors"
              title="Chat with Underwriter on WhatsApp"
            >
              <WhatsAppFilledIcon className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            {/* Telegram Support Link */}
            <a
              href={contactSettings?.telegramLink || `https://t.me/${(contactSettings?.telegramUsername || '@ManulifeFinancialSupport').replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#229ED9] hover:text-[#38b3ed] font-semibold transition-colors"
              title="Chat with Underwriter on Telegram"
            >
              <TelegramFilledIcon className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </a>

            <span className="hidden lg:inline text-slate-700">|</span>

            <span className="flex items-center gap-1 hidden md:flex">
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>{t('header.hotline', 'Hotline:')} {phone}</span>
            </span>

            <span className="hidden sm:inline bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800 text-[10px]">
              {t('header.globalSupportBadge', '24/7 Global Client Support')}
            </span>

            {/* Language Translator Dropdown in Header */}
            <LanguageSelector variant="header" />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          
          {/* Zone 1: Brand Wordmark */}
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 group text-left focus:outline-none"
          >
            <img 
              src="/assets/aistudio/file_00000000245881fdbc108ee1cf0b4466_512afb92.png" 
              alt="Manulife Financial Services Logo" 
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-full shadow-sm border border-emerald-100 bg-white group-hover:scale-105 transition-transform shrink-0"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 font-sans whitespace-nowrap shrink-0 group-hover:text-emerald-900 transition-colors">
                Manulife
              </span>
              <span className="text-[10px] uppercase tracking-widest text-emerald-800 font-semibold">
                Financial Services
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (Borrower-Facing) */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button
              onClick={() => {
                onNavigate('home');
                const el = document.getElementById('services');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0"
            >
              {t('header.services', 'Services')}
            </button>
            <button
              onClick={() => {
                onNavigate('home');
                const el = document.getElementById('calculator');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0"
            >
              {t('header.calculator', 'Loan Calculator')}
            </button>
            <button
              onClick={() => {
                onNavigate('home');
                const el = document.getElementById('eligibility');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0"
            >
              {t('header.eligibility', 'Eligibility')}
            </button>
            <button
              onClick={() => {
                onNavigate('home');
                const el = document.getElementById('faq');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0"
            >
              {t('header.faq', 'FAQ')}
            </button>
            <button
              onClick={() => {
                onNavigate('home');
                const el = document.getElementById('contact');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t('header.contact', 'Support & Contact')}</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action & Authentication */}
          <div className="flex items-center gap-2.5 shrink-0">
            {currentView !== 'home' && (
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="hidden sm:inline-flex text-xs font-semibold px-3 py-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                {t('header.returnToOverview', 'Return to Overview')}
              </button>
            )}

            {!userRole ? (
              <>
                <button
                  type="button"
                  onClick={onOpenSignIn}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-emerald-900 transition-colors shadow-sm whitespace-nowrap"
                >
                  <LogIn className="w-4 h-4 text-emerald-800" />
                  <span>{t('header.signIn', 'Sign In')}</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenSignUp}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-800 rounded-lg hover:bg-emerald-900 active:bg-emerald-950 transition-all shadow-sm hover:shadow whitespace-nowrap focus-visible:ring-2 focus-visible:ring-emerald-700"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{t('header.signUp', 'Sign Up')}</span>
                </button>
              </>
            ) : userRole === 'admin' ? (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('admin-portal')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors shadow-sm ${
                    currentView === 'admin-portal'
                      ? 'bg-slate-900 text-emerald-400 ring-2 ring-emerald-500'
                      : 'bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t('header.adminConsole', 'Admin Console')}</span>
                </button>

                <button
                  type="button"
                  onClick={onSignOut}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sign Out of Session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('header.signOut', 'Sign Out')}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('applicant-portal')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors shadow-sm ${
                    currentView === 'applicant-portal'
                      ? 'bg-emerald-800 text-white'
                      : 'bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  <span>{t('header.myAccount', 'My Account')}</span>
                </button>

                <button
                  type="button"
                  onClick={onSignOut}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sign Out of Session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('header.signOut', 'Sign Out')}</span>
                </button>
              </>
            )}
          </div>

        </div>

        {/* Mobile secondary bar */}
        <div className="flex lg:hidden items-center justify-between py-2 border-t border-slate-100 text-xs overflow-x-auto gap-3">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => onNavigate('home')}
              className={`whitespace-nowrap px-2 py-1 rounded ${currentView === 'home' ? 'text-emerald-800 font-semibold' : 'text-slate-600'}`}
            >
              {t('header.returnToOverview', 'Overview')}
            </button>
            <button 
              type="button"
              onClick={() => {
                onNavigate('home');
                const el = document.getElementById('contact');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="whitespace-nowrap px-2 py-1 rounded text-slate-600 flex items-center gap-1"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-700" />
              {t('header.contact', 'Support')}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!userRole ? (
              <>
                <button
                  type="button"
                  onClick={onOpenSignIn}
                  className="whitespace-nowrap px-2.5 py-1 rounded border border-slate-300 text-slate-700 font-semibold flex items-center gap-1 hover:bg-slate-50"
                >
                  <LogIn className="w-3 h-3 text-emerald-800" />
                  <span>{t('header.signIn', 'Sign In')}</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenSignUp}
                  className="whitespace-nowrap px-2.5 py-1 rounded bg-emerald-800 text-white font-semibold flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>{t('header.signUp', 'Sign Up')}</span>
                </button>
              </>
            ) : userRole === 'admin' ? (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('admin-portal')}
                  className="whitespace-nowrap px-2.5 py-1 rounded bg-slate-900 text-emerald-400 font-semibold flex items-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>{t('header.adminConsole', 'Admin Console')}</span>
                </button>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="whitespace-nowrap px-2.5 py-1 rounded text-red-600 font-semibold flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>{t('header.signOut', 'Sign Out')}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('applicant-portal')}
                  className="whitespace-nowrap px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 font-semibold flex items-center gap-1"
                >
                  <UserCheck className="w-3 h-3" />
                  <span>{t('header.myAccount', 'My Account')}</span>
                </button>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="whitespace-nowrap px-2.5 py-1 rounded text-red-600 font-semibold flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>{t('header.signOut', 'Sign Out')}</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
