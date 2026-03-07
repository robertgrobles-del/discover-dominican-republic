import { es } from "./translations/es";
import { en } from "./translations/en";
import { fr } from "./translations/fr";
import { de } from "./translations/de";
import { pt } from "./translations/pt";
import { it } from "./translations/it";

export type Locale = "es" | "en" | "fr" | "de" | "pt" | "it";

type TranslationDict = Record<string, string>;
type Translations = Record<Locale, TranslationDict>;

export const translations: Translations = { es, en, fr, de, pt, it };
