import { createContext, Fragment, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { CATALOG_SOURCE } from "@/lib/catalogSource";
import { detectLocale } from "@/lib/detectLocale";
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
  const [locale, setLocale] = useState<Locale>(detectLocale);
  const [, setLoadedVersion] = useState(0);
  // Cambia cuando el catálogo del backend llega en otro idioma: las pantallas leen arreglos que se actualizan
  // en su sitio, así que hay que volver a montarlas para que muestren los textos nuevos.
  const [catalogVersion, setCatalogVersion] = useState(0);

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
    if (CATALOG_SOURCE === "api") {
      void import("@/services/catalogHydration")
        .then((m) => m.rehydrateCatalog(newLocale))
        .then((changed) => { if (changed) setCatalogVersion((v) => v + 1); })
        .catch(() => undefined);
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[locale]?.[key] || translations.es[key] || key;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      <Fragment key={catalogVersion}>{children}</Fragment>
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
