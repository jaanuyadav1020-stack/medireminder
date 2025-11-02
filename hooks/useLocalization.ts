import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export const availableLanguages = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  hi: 'हिन्दी',
  bn: 'বাংলা',
  ta: 'தமிழ்',
  mr: 'मराठी',
  te: 'తెలుగు',
  kn: 'ಕನ್ನಡ',
  gu: 'ગુજરાતી',
  ml: 'മലയാളം',
  pa: 'ਪੰਜਾਬੀ',
  ur: 'اردو',
};
export type Language = keyof typeof availableLanguages;

interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: { [key: string]: string | number }) => string;
  locale: string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

const getNestedValue = (obj: any, key: string): string | undefined => {
  return key.split('.').reduce((acc, part) => acc && acc[part], obj);
};


export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const storedLang = localStorage.getItem('medirem-language');
    return (storedLang && storedLang in availableLanguages ? storedLang : 'en') as Language;
  });
  const [translations, setTranslations] = useState<any>({});
  
  const locale = {
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
      hi: 'hi-IN',
      bn: 'bn-IN',
      ta: 'ta-IN',
      mr: 'mr-IN',
      te: 'te-IN',
      kn: 'kn-IN',
      gu: 'gu-IN',
      ml: 'ml-IN',
      pa: 'pa-IN',
      ur: 'ur-IN',
  }[language];

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const response = await fetch(`/locales/${language}.json`);
        if (!response.ok) {
            console.error(`Could not load translations for ${language}, falling back to English.`);
            const fallbackResponse = await fetch(`/locales/en.json`);
            const data = await fallbackResponse.json();
            setTranslations(data);
            return;
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error('Failed to fetch translations:', error);
        // Load English as a fallback in case of network error
        try {
            const fallbackResponse = await fetch(`/locales/en.json`);
            const data = await fallbackResponse.json();
            setTranslations(data);
        } catch (fallbackError) {
            console.error('Failed to fetch fallback translations:', fallbackError);
        }
      }
    };
    fetchTranslations();
  }, [language]);

  const setLanguage = (lang: Language) => {
    if (lang in availableLanguages) {
      setLanguageState(lang);
      localStorage.setItem('medirem-language', lang);
    }
  };

  const t = useCallback((key: string, replacements?: { [key: string]: string | number }): string => {
    let translation = getNestedValue(translations, key) || key;
    if (replacements) {
      Object.keys(replacements).forEach(placeholder => {
        translation = translation.replace(`{${placeholder}}`, String(replacements[placeholder]));
      });
    }
    return translation;
  }, [translations]);

  const value = { language, setLanguage, t, locale };

  if (Object.keys(translations).length === 0) {
    return null; // or a loading spinner
  }

  // FIX: Replaced JSX with React.createElement to fix parsing errors in a .ts file.
  return React.createElement(LocalizationContext.Provider, { value }, children);
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};