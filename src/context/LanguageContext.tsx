/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SupportedLanguage, LanguageOption } from '../types';
import { SUPPORTED_LANGUAGES, TRANSLATIONS, TranslationDictionary } from '../lib/translations';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  currentOption: LanguageOption;
  setLanguage: (lang: SupportedLanguage) => void;
  isTranslating: boolean;
  t: (path: string, fallback?: string) => string;
  supportedLanguages: LanguageOption[];
  resetToEnglish: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper to set Google Translate cookie across all domain paths
const setGoogleTranslateCookie = (langCode: string) => {
  try {
    const cookieValue = `/en/${langCode}`;
    const date = new Date();
    date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
    const expires = `; expires=${date.toUTCString()}`;
    
    document.cookie = `googtrans=${cookieValue}${expires}; path=/;`;
    document.cookie = `googtrans=${cookieValue}${expires}; path=/; domain=${window.location.hostname};`;
  } catch (err) {
    console.warn('Cookie setting failed in sandboxed context:', err);
  }
};

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem('mfs_language') as SupportedLanguage;
      if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
        return saved;
      }
    } catch {}
    return 'en';
  });

  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  const currentOption = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  // Initialize and load Google Translate script in background for full-page text translation
  useEffect(() => {
    // Set document lang & text direction
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentOption.dir;

    if (window.google?.translate) return;

    window.googleTranslateElementInit = () => {
      try {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'en,es,fr,de,zh-CN,ar,pt,ja,it,ru,nl,tr,hi,ko,pl,sv,vi,id,uk,el,he',
              autoDisplay: false,
              layout: window.google.translate.TranslateElement.InlineLayout?.HORIZONTAL || 0,
            },
            'google_translate_hidden_element'
          );
        }
      } catch (e) {
        console.warn('Google Translate initialization:', e);
      }
    };

    const scriptId = 'google-translate-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.onerror = () => {
        // Fallback silently to client dictionary
        console.info('Client-side dictionary active for language translation.');
      };
      document.body.appendChild(script);
    }
  }, [currentLanguage, currentOption.dir]);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setIsTranslating(true);
    setCurrentLanguageState(lang);

    try {
      localStorage.setItem('mfs_language', lang);
    } catch {}

    const selectedOption = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];
    document.documentElement.lang = lang;
    document.documentElement.dir = selectedOption.dir;

    // Trigger Google Translate engine
    const googleLangCode = lang === 'zh' ? 'zh-CN' : lang;
    setGoogleTranslateCookie(googleLangCode);

    // Fire select change event on Google Translate combo if present
    try {
      const selectElem = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (selectElem) {
        selectElem.value = googleLangCode;
        selectElem.dispatchEvent(new Event('change'));
      }
    } catch (e) {
      console.warn('Google Translate trigger event:', e);
    }

    setTimeout(() => {
      setIsTranslating(false);
    }, 400);
  }, []);

  const resetToEnglish = useCallback(() => {
    setLanguage('en');
  }, [setLanguage]);

  // Nested property resolver for dictionary
  const t = useCallback((path: string, fallback?: string): string => {
    const keys = path.split('.');
    
    // 1. Try current language dictionary
    let value: any = TRANSLATIONS[currentLanguage];
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        value = undefined;
        break;
      }
    }

    if (typeof value === 'string') {
      return value;
    }

    // 2. Fallback to English dictionary
    let enValue: any = TRANSLATIONS.en;
    for (const key of keys) {
      if (enValue && typeof enValue === 'object' && key in enValue) {
        enValue = enValue[key];
      } else {
        enValue = undefined;
        break;
      }
    }

    if (typeof enValue === 'string') {
      return enValue;
    }

    // 3. Fallback to passed fallback text or last key
    return fallback !== undefined ? fallback : keys[keys.length - 1];
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        currentOption,
        setLanguage,
        isTranslating,
        t,
        supportedLanguages: SUPPORTED_LANGUAGES,
        resetToEnglish,
      }}
    >
      {/* Invisible container for Google Translate element */}
      <div id="google_translate_hidden_element" className="hidden" aria-hidden="true" />
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
