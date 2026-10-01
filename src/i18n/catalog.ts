import { es } from "./translations/es";
import type { Locale, TranslationDict } from "./types";

// Spanish is bundled initially; other dictionaries load only when requested.
export const translations: Record<Locale, TranslationDict> = { es, en: {}, fr: {}, de: {}, pt: {}, it: {} };

export async function loadTranslation(locale: Locale): Promise<TranslationDict> {
  if (locale === "es" || Object.keys(translations[locale]).length > 0) return translations[locale];
  try {
    switch (locale) {
      case "en": translations.en = (await import("./translations/en")).en; break;
      case "fr": translations.fr = (await import("./translations/fr")).fr; break;
      case "de": translations.de = (await import("./translations/de")).de; break;
      case "pt": translations.pt = (await import("./translations/pt")).pt; break;
      case "it": translations.it = (await import("./translations/it")).it; break;
    }
    return translations[locale];
  } catch (error) {
    console.warn(`Failed to load translation for ${locale}, falling back to Spanish`, error);
    return es;
  }
}
