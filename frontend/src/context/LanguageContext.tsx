import React, { createContext, useState, ReactNode } from "react";

export type Language = "en" | "de";

export interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
  bannerSeen: boolean;
  setBannerSeen: (seen: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>("de");
  const [bannerSeen, setBannerSeenState] = useState<boolean>(true);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  const setBannerSeen = (seen: boolean) => {
    setBannerSeenState(seen);
  };

  return (
    <LanguageContext.Provider
      value={{ language, changeLanguage, bannerSeen, setBannerSeen }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
