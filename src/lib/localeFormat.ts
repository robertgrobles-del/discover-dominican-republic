import type { Locale } from "@/i18n/types";

const INTL_LOCALES: Record<Locale, string> = {
  es: "es-DO", en: "en-US", fr: "fr-FR", de: "de-DE", pt: "pt-BR", it: "it-IT",
};

export function getIntlLocale(locale: Locale): string {
  return INTL_LOCALES[locale] ?? INTL_LOCALES.es;
}

export function formatNumber(value: number, locale: Locale, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(getIntlLocale(locale), options).format(value);
}

export function formatCurrency(value: number, locale: Locale, currency = "DOP"): string {
  return new Intl.NumberFormat(getIntlLocale(locale), { style: "currency", currency }).format(value);
}

export function formatDate(value: Date | string | number, locale: Locale, options?: Intl.DateTimeFormatOptions): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(getIntlLocale(locale), options).format(date);
}
