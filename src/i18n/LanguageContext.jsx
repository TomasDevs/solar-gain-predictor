import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Get from localStorage or default to 'cs'
    return localStorage.getItem('language') || 'cs';
  });

  useEffect(() => {
    // Save to localStorage when language changes
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    return translations[language][key] || key;
  };

  const getDayLabel = (dayIndex) => {
    const dayKeys = ['daySun', 'dayMon', 'dayTue', 'dayWed', 'dayThu', 'dayFri', 'daySat'];
    return t(dayKeys[dayIndex]);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getDayLabel }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within LanguageProvider');
  }
  return context;
}
