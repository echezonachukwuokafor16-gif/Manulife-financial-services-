/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown, Search, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SupportedLanguage } from '../types';

interface LanguageSelectorProps {
  variant?: 'compact' | 'header' | 'floating';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = 'header',
  className = '' 
}) => {
  const { currentLanguage, currentOption, setLanguage, supportedLanguages, isTranslating, t } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const filteredLanguages = supportedLanguages.filter(lang => 
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Variant: Top Header Ribbon
  if (variant === 'header') {
    return (
      <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-400"
          aria-haspopup="true"
          aria-expanded={isOpen}
          title={t('translator.changeLanguage', 'Change Language / Idioma')}
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-mono text-sm leading-none">{currentOption.flag}</span>
          <span className="font-medium text-slate-100">{currentOption.nativeName}</span>
          <span className="text-[9px] uppercase font-mono px-1 py-0.2 bg-slate-900 rounded text-slate-400">
            {currentOption.code}
          </span>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1.5 w-64 rounded-xl bg-slate-900 text-white border border-slate-700 shadow-2xl py-2 z-50 text-xs animate-fadeIn">
            <div className="px-3 pb-2 border-b border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1.5">
                <span>{t('translator.selectLanguage', 'Select Language')}</span>
                <span className="text-[10px] text-emerald-400 font-mono">12 Languages</span>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('translator.searchPlaceholder', 'Search language...')}
                  className="w-full pl-8 pr-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto py-1 scrollbar-thin">
              {filteredLanguages.length === 0 ? (
                <div className="px-3 py-3 text-center text-slate-500 text-xs">
                  No language found
                </div>
              ) : (
                filteredLanguages.map((lang) => {
                  const isActive = lang.code === currentLanguage;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleSelect(lang.code)}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors ${
                        isActive 
                          ? 'bg-emerald-950/70 text-emerald-300 font-semibold' 
                          : 'text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base leading-none">{lang.flag}</span>
                        <div>
                          <span className="block text-xs font-medium text-white">{lang.nativeName}</span>
                          <span className="block text-[10px] text-slate-400">{lang.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-mono text-slate-400">
                          {lang.code}
                        </span>
                        {isActive && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="px-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Auto full-page translation</span>
              <span className="text-emerald-400 font-semibold">Active</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Variant: Floating Action Widget (Bottom corner)
  return (
    <div className={`fixed bottom-6 right-6 z-40 ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg hover:shadow-xl border border-slate-700/80 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 active:scale-95"
        title={t('translator.changeLanguage', 'Language Translator')}
        aria-label="Language Selector"
      >
        <Globe className={`w-4 h-4 text-emerald-400 ${isTranslating ? 'animate-spin' : 'group-hover:rotate-45 transition-transform'}`} />
        <span className="text-sm">{currentOption.flag}</span>
        <span className="text-xs font-semibold text-slate-100 hidden sm:inline">{currentOption.nativeName}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-14 right-0 w-72 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-2xl p-3 z-50 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-xs text-slate-100">{t('translator.selectLanguage', 'Select Language')}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('translator.searchPlaceholder', 'Search language...')}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
              autoFocus
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1 py-1 scrollbar-thin">
            {filteredLanguages.map((lang) => {
              const isActive = lang.code === currentLanguage;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between transition-colors ${
                    isActive 
                      ? 'bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800/80' 
                      : 'text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <span className="text-xs font-medium">{lang.nativeName}</span>
                    <span className="text-[11px] text-slate-400">({lang.name})</span>
                  </div>
                  {isActive && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Current: <strong className="text-white">{currentOption.name}</strong></span>
            <span className="text-emerald-400 font-medium">Auto-Translated</span>
          </div>
        </div>
      )}
    </div>
  );
};
