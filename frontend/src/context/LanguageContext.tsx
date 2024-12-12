import React, { createContext, useState, ReactNode } from "react";

export type Language = "en" | "de";

export interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>("de");

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
