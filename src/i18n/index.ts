import { es } from "./translations/es";

export type Locale = "es" | "en" | "fr" | "de" | "pt" | "it";

export type TranslationDict = Record<string, string>;

// Only Spanish (base language) is bundled initially to save ~700KB of JS
export const translations: Record<Locale, TranslationDict> = {
  es,
  en: {},
  fr: {},
  de: {},
  pt: {},
  it: {},
};

export async function loadTranslation(locale: Locale): Promise<TranslationDict> {
  if (locale === "es" || (translations[locale] && Object.keys(translations[locale]).length > 0)) {
    return translations[locale];
  }

  try {
    switch (locale) {
      case "en": {
        const mod = await import("./translations/en");
        translations.en = mod.en;
        return mod.en;
      }
      case "fr": {
        const mod = await import("./translations/fr");
        translations.fr = mod.fr;
        return mod.fr;
      }
      case "de": {
        const mod = await import("./translations/de");
        translations.de = mod.de;
        return mod.de;
      }
      case "pt": {
        const mod = await import("./translations/pt");
        translations.pt = mod.pt;
        return mod.pt;
      }
      case "it": {
        const mod = await import("./translations/it");
        translations.it = mod.it;
        return mod.it;
      }
      default:
        return es;
    }
  } catch (err) {
    console.warn(`Failed to load translation for ${locale}, falling back to Spanish`, err);
    return es;
  }
}
