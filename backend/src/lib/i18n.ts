import type { Db } from "../db/pool.js";

export const LOCALES = ["es", "en", "fr", "de", "pt", "it"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "es";

/** Idioma pedido: `?lang=` tiene prioridad sobre `Accept-Language`; lo desconocido cae al idioma base. */
export function resolveLocale(lang: string | undefined, acceptLanguage: string | undefined): Locale {
  if (lang && (LOCALES as readonly string[]).includes(lang)) return lang as Locale;
  for (const part of (acceptLanguage ?? "").split(",")) {
    const code = part.split(";")[0]?.trim().slice(0, 2).toLowerCase();
    if (code && (LOCALES as readonly string[]).includes(code)) return code as Locale;
  }
  return DEFAULT_LOCALE;
}

/**
 * Sustituye campos por su traducción (`entity_translations`, docs §5.15). Los campos sin traducción
 * conservan el texto base en español; se devuelve cuántas filas quedaron sin traducir del todo.
 */
export async function applyTranslations<T extends { id: string }>(
  db: Db, entityType: string, rows: T[], locale: Locale, fields: readonly (keyof T & string)[],
): Promise<{ rows: T[]; fallback: boolean }> {
  if (locale === DEFAULT_LOCALE || rows.length === 0) return { rows, fallback: false };
  const { rows: tr } = await db.query<{ entity_id: string; field_name: string; translation_text: string }>(
    "SELECT entity_id, field_name, translation_text FROM entity_translations WHERE entity_type = $1 AND language = $2 AND entity_id = ANY($3::uuid[]) AND field_name = ANY($4)",
    [entityType, locale, rows.map((r) => r.id), fields as string[]],
  );
  const byId = new Map<string, Map<string, string>>();
  for (const t of tr) (byId.get(t.entity_id) ?? byId.set(t.entity_id, new Map()).get(t.entity_id)!).set(t.field_name, t.translation_text);
  let fallback = false;
  const out = rows.map((r) => {
    const t = byId.get(r.id);
    if (!t) { fallback = true; return r; }
    const copy = { ...r } as Record<string, unknown>;
    for (const f of fields) if (t.has(f)) copy[f] = t.get(f);
    return copy as T;
  });
  return { rows: out, fallback };
}
