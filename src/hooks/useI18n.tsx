import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { translations, loadTranslation } from "@/i18n/catalog";
import type { Locale } from "@/i18n/types";
import { setAutoTranslateLocale } from "@/i18n/autoTranslate";

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
    // 1. Check URL search param e.g. ?lang=en
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get("lang");
      if (urlLang && ["es", "en", "fr", "de", "pt", "it"].includes(urlLang)) {
        return urlLang as Locale;
      }
    } catch {}

    // 2. Check localStorage
    let saved: string | null = null;
    try { saved = localStorage.getItem("app-locale"); } catch { /* Storage may be blocked by browser policy. */ }
    if (saved && ["es", "en", "fr", "de", "pt", "it"].includes(saved)) {
      return saved as Locale;
    }

    // 3. Fallback to browser language
    try {
      const navLang = navigator.language?.slice(0, 2);
      if (navLang && ["es", "en", "fr", "de", "pt", "it"].includes(navLang)) {
        return navLang as Locale;
      }
    } catch {}

    return "es";
  });
  const [, setLoadedVersion] = useState(0);

  useEffect(() => {
    document.documentElement.lang = locale;
    if (locale !== "es") {
      loadTranslation(locale).then(() => {
        setLoadedVersion((v) => v + 1);
      });
    }
  }, [locale]);

  // Translate page content that is still hardcoded in Spanish (see autoTranslate.ts).
  useEffect(() => {
    setAutoTranslateLocale(locale);
  }, [locale]);

  const handleSetLocale = useCallback(async (newLocale: Locale) => {
    if (newLocale !== "es") {
      await loadTranslation(newLocale);
    }
    setLocale(newLocale);
    try { localStorage.setItem("app-locale", newLocale); } catch { /* URL remains the shareable source of truth. */ }
    const url = new URL(window.location.href);
    if (newLocale === "es") url.searchParams.delete("lang");
    else url.searchParams.set("lang", newLocale);
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
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
