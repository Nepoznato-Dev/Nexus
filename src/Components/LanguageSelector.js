import React, { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from './LanguageProvider.js';
import './LanguageSelector.css';

/**
 * Language Selector Component - Dropdown to select app language
 */
export default function LanguageSelector() {
  const { language, supportedLanguages, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    setIsOpen(false);
  };

  const currentLang = supportedLanguages[language];

  return (
    <div className="language-selector">
      <button
        className="language-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Select language"
      >
        <Globe className="w-4 h-4" />
        <span className="language-flag">{currentLang?.flag}</span>
        <span className="language-name">{currentLang?.native}</span>
      </button>

      {isOpen && (
        <div className="language-dropdown">
          <div className="language-header">
            <span>Available Languages</span>
          </div>
          <div className="language-grid">
            {Object.entries(supportedLanguages).map(([code, info]) => (
              <button
                key={code}
                className={`language-option ${code === language ? 'active' : ''}`}
                onClick={() => handleLanguageChange(code)}
                title={info.name}
              >
                <span className="option-flag">{info.flag}</span>
                <span className="option-name">{info.native}</span>
                {code === language && <Check className="w-3 h-3 check-icon" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
