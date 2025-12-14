import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { translate, translations, type Language } from "./translations";

type I18nContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languages: { code: Language; label: string }[];
};

const I18N_STORAGE_KEY = "fizicamd_language";

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const defaultLang = (localStorage.getItem(I18N_STORAGE_KEY) as Language | null) ?? "ro";
  const [language, setLanguageState] = useState<Language>(
    translations[defaultLang] ? defaultLang : "ro"
  );

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(I18N_STORAGE_KEY, lang);
  };

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key: string) => translate(language, key),
      languages: (Object.keys(translations) as Language[]).map((code) => ({
        code,
        label: translate(code, "common.languageName"),
      })),
    }),
    [language]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}
