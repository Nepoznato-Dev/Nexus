import React, { createContext, useContext, useState, useEffect } from 'react';
import { t, getCurrentLanguage, setLanguage, SUPPORTED_LANGUAGES } from '../../i18n.js';

/**
 * Language Context for entire app
 */
const LanguageContext = createContext();

/**
 * Language Provider Component
 */
export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => getCurrentLanguage());
  const [isRTL, setIsRTL] = useState(SUPPORTED_LANGUAGES[language]?.rtl || false);

  useEffect(() => {
    // Initialize language on mount
    const initial = getCurrentLanguage();
    setLanguageState(initial);
    setIsRTL(SUPPORTED_LANGUAGES[initial]?.rtl || false);
  }, []);

  const changeLanguage = (lang) => {
    const result = setLanguage(lang);
    if (result.success) {
      setLanguageState(lang);
      setIsRTL(SUPPORTED_LANGUAGES[lang]?.rtl || false);
      
      // Dispatch custom event for other components to update
      window.dispatchEvent(new CustomEvent('languageChange', { detail: { lang } }));
      
      return result;
    }
    return result;
  };

  const translate = (path) => t(path, language);

  return (
    <LanguageContext.Provider
      value={{
        language,
        isRTL,
        changeLanguage,
        translate,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to use language context
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

export default LanguageProvider;
