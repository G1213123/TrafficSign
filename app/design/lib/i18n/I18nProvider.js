'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { i18n } from './i18n.js';

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState('en');
  // Add a trigger state to force re-renders when language changes
  const [tick, setTick] = useState(0); 

  useEffect(() => {
    // Initialize locale from localStorage or browser preference if needed
    // For now, default to 'en' as per i18n.js
    const savedLocale = localStorage.getItem('locale') || 'en';
    if (savedLocale !== locale) {
        changeLocale(savedLocale);
    }
    
    // Also make sure global i18n object is synced
    i18n.setLocale(savedLocale);
  }, []);

  const changeLocale = (newLocale) => {
    i18n.setLocale(newLocale);
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
    setTick(t => t + 1); // Force re-render of consumers
    
    // Update HTML lang attribute
    document.documentElement.lang = newLocale === 'zh' ? 'zh-HK' : 'en';
  };

  const t = (key) => {
    return i18n.t(key);
  };

  return (
    <I18nContext.Provider value={{ locale, changeLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
