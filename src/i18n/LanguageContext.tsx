import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { LanguageCode, LanguageInfo, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './types';
import { es } from './translations/es';
import { en } from './translations/en';
import { fr } from './translations/fr';
import { de } from './translations/de';
import { it } from './translations/it';
import { pt } from './translations/pt';
import { getTranslatedWord } from './wordTranslations';

const STORAGE_KEY = '20words_language';

const TRANSLATION_MAP: Record<LanguageCode, Record<string, string>> = {
  es,
  en,
  fr,
  de,
  it,
  pt,
};

interface LanguageContextType {
  currentLanguage: LanguageCode;
  languageInfo: LanguageInfo;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  tCategory: (catName?: string) => { name: string; description: string };
  tWord: (word: string) => string;
  supportedLanguages: LanguageInfo[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
      if (saved && TRANSLATION_MAP[saved]) {
        return saved;
      }
    } catch {
      // localStorage may fail in some sandboxed iframes
    }
    // Spanish is explicitly mandated as the default language
    return DEFAULT_LANGUAGE;
  });

  const setLanguage = (lang: LanguageCode) => {
    if (TRANSLATION_MAP[lang]) {
      setCurrentLanguageState(lang);
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // Ignore localStorage write failures in sandbox
      }
    }
  };

  const languageInfo = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  }, [currentLanguage]);

  // Core translation function with Spanish fallback and parameter interpolation
  const t = (key: string, params?: Record<string, string | number>): string => {
    const langDict = TRANSLATION_MAP[currentLanguage] || TRANSLATION_MAP.es;
    let template = langDict[key];

    // Fallback to Spanish (mandatory fallback) if missing in target language
    if (!template && currentLanguage !== 'es') {
      template = TRANSLATION_MAP.es[key];
    }

    // If still missing, return key
    if (!template) {
      return key;
    }

    if (!params) {
      return template;
    }

    // Parameter interpolation like {count}, {name}, {code}, {plural}, etc.
    let result = template;
    for (const [pKey, pVal] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
    }

    // Auto-replace {plural} if {count} was provided but not explicit plural
    if (params.count !== undefined && !params.plural) {
      const countNum = Number(params.count);
      const pluralChar = countNum === 1 ? '' : (currentLanguage === 'it' ? 'i' : 's');
      result = result.replace(/\{plural\}/g, pluralChar);
    }

    return result;
  };

  const tCategory = (catName?: string) => {
    if (!catName) {
      return { name: '', description: '' };
    }
    const nameKey = `category.${catName}.name`;
    const descKey = `category.${catName}.desc`;

    const name = t(nameKey);
    const desc = t(descKey);

    return {
      name: name !== nameKey ? name : catName,
      description: desc !== descKey ? desc : '',
    };
  };

  const tWord = (word: string): string => {
    if (!word) return '';
    return getTranslatedWord(word, currentLanguage);
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        languageInfo,
        setLanguage,
        t,
        tCategory,
        tWord,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
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
