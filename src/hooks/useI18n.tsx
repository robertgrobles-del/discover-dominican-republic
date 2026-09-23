import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { translations, loadTranslation, type Locale } from "@/i18n";

export type { Locale };

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: "es",
  setLocale: () => {},
  t: (key: string) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem("app-locale");
    return (saved as Locale) || "es";
  });
  const [, setLoadedVersion] = useState(0);

  useEffect(() => {
    if (locale !== "es") {
      loadTranslation(locale).then(() => {
        setLoadedVersion((v) => v + 1);
      });
    }
  }, [locale]);

  const handleSetLocale = useCallback(async (newLocale: Locale) => {
    if (newLocale !== "es") {
      await loadTranslation(newLocale);
    }
    setLocale(newLocale);
    localStorage.setItem("app-locale", newLocale);
    document.documentElement.lang = newLocale;
    setLoadedVersion((v) => v + 1);
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[locale]?.[key] || translations.es[key] || key;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export function useTranslation() {
  const { t, locale } = useContext(I18nContext);
  return { t, locale };
}
