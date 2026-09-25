import type { FastifyBaseLogger } from "fastify";
import type { PoolClient } from "pg";
import type { Env } from "../../config/env.js";
import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import { MAPPING_BY_MODEL, MAPPING_BY_UID, MAPPINGS, type FieldMap, type Mapping } from "./mappings.js";

/** Entrada de Strapi 5 (formato plano): atributos + id, documentId, locale, fechas. */
export interface CmsEntry extends Record<string, unknown> { documentId: string; locale?: string | null; publishedAt?: string | null; updatedAt?: string | null }
export interface WebhookPayload { event: string; model?: string; uid?: string; entry?: Record<string, unknown> }
export interface SyncResult { outcome: "applied" | "ignored"; detail: string; entityId?: string }

const q = (n: string) => `"${n}"`;
const JSON_KINDS = new Set(["json", "list", "medias"]);
const TRANSLATABLE_KINDS = new Set(["text", "richtext"]);

// ---------- Conversión de valores de Strapi ----------
function blocksToMarkdown(blocks: unknown[]): string {
  const text = (nodes: unknown): string => Array.isArray(nodes) ? nodes.map((n) => {
    const x = n as { type?: string; text?: string; children?: unknown[]; url?: string; bold?: boolean; italic?: boolean };
    if (x.type === "link") return `[${text(x.children)}](${x.url ?? ""})`;
    const t = x.text ?? text(x.children);
    return x.bold ? `**${t}**` : x.italic ? `*${t}*` : t;
  }).join("") : "";
  return blocks.map((b) => {
    const x = b as { type?: string; level?: number; format?: string; children?: unknown[] };
    if (x.type === "heading") return `${"#".repeat(Math.min(6, x.level ?? 2))} ${text(x.children)}`;
    if (x.type === "list") return (x.children ?? []).map((li, i) => `${x.format === "ordered" ? `${i + 1}.` : "-"} ${text((li as { children?: unknown[] }).children)}`).join("\n");
    if (x.type === "quote") return `> ${text(x.children)}`;
    return text(x.children);
  }).filter(Boolean).join("\n\n");
}

export function convertValue(kind: FieldMap["kind"], raw: unknown, abs: (u: string) => string): unknown {
  if (raw === undefined || raw === null) return kind === "medias" || kind === "list" ? [] : null;
  switch (kind) {
    case "text": { const s = String(raw).trim(); return s === "" ? null : s; }
    case "richtext": {
      const s = Array.isArray(raw) ? blocksToMarkdown(raw) : String(raw);
      return s.trim() === "" ? null : s;
    }
    case "number": { const n = typeof raw === "number" ? raw : Number(raw); return Number.isFinite(n) ? n : null; }
    case "bool": return raw === true || raw === "true";
    case "json": return raw;
    case "media": {
      const first = (Array.isArray(raw) ? raw[0] : raw) as { url?: string } | string | undefined;
      const url = typeof first === "string" ? first : first?.url;
      return url ? abs(url) : null;
    }
    case "medias": return (Array.isArray(raw) ? raw : [raw]).map((m) => (typeof m === "string" ? m : (m as { url?: string })?.url)).filter((u): u is string => !!u).map(abs);
    case "list":
      if (Array.isArray(raw)) return raw;
      if (typeof raw === "object") return Object.entries(raw as Record<string, unknown>).filter(([, v]) => v === true).map(([k]) => k);
      return [String(raw)];
  }
}

/**
 * Sincroniza el contenido publicado en Strapi hacia las tablas de esta API (docs §4.3, opción B). Strapi es la fuente editorial;
 * aquí sólo se refleja lo publicado. Es idempotente y tolera eventos desordenados (gana la fecha de actualización más reciente).
 */
export class CmsSyncService {
  constructor(private readonly env: Env, private readonly db: Db, private readonly log: FastifyBaseLogger) {}

  /** Con URL y token se consulta a Strapi para obtener la entrada completa (con relaciones y medios); sin ellos se usa el cuerpo del webhook. */
  get canFetch() { return !!(this.env.CMS_URL && this.env.CMS_API_TOKEN); }
  private get defaultLocale() { return this.env.CMS_DEFAULT_LOCALE; }
  private abs = (u: string) => (/^https?:\/\//i.test(u) ? u : `${(this.env.CMS_PUBLIC_URL ?? this.env.CMS_URL ?? "").replace(/\/$/, "")}${u.startsWith("/") ? "" : "/"}${u}`);

  // ---------- Strapi REST ----------
  private async api<T>(path: string): Promise<T> {
    if (!this.canFetch) throw new AppError("SERVICE_UNAVAILABLE", "El CMS no está configurado (CMS_URL y CMS_API_TOKEN)");
    try {
      const res = await fetch(`${this.env.CMS_URL!.replace(/\/$/, "")}${path}`, { headers: { authorization: `Bearer ${this.env.CMS_API_TOKEN}`, accept: "application/json" }, signal: AbortSignal.timeout(10_000) });
      if (res.status === 404) return null as T;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as T;
    } catch (err) {
      this.log.warn({ err: (err as Error).message, path }, "Fallo consultando el CMS");
      throw new AppError("UPSTREAM_ERROR", "No se pudo consultar el CMS");
    }
  }

  /** Versión publicada de una entrada en un idioma, con relaciones y medios. */
  async fetchEntry(m: Mapping, documentId: string, locale: string): Promise<CmsEntry | null> {
    const res = await this.api<{ data: CmsEntry | null } | null>(`/api/${m.plural}/${encodeURIComponent(documentId)}?locale=${locale}&status=published&populate=*`);
    return res?.data ?? null;
  }

  async locales(): Promise<string[]> {
    try {
      const res = await this.api<{ code: string }[] | null>("/api/i18n/locales");
      const codes = (res ?? []).map((l) => l.code);
      if (codes.length) return [this.defaultLocale, ...codes.filter((c) => c !== this.defaultLocale)];
    } catch { /* se usa la lista fija */ }
    return [this.defaultLocale, ...["en", "fr", "de", "it", "pt"].filter((c) => c !== this.defaultLocale)];
  }

  // ---------- Webhook ----------
  async handleWebhook(payload: WebhookPayload): Promise<SyncResult> {
    const model = payload.model ?? payload.uid?.split(".").pop() ?? "";
    const m = MAPPING_BY_MODEL.get(model) ?? (payload.uid ? MAPPING_BY_UID.get(payload.uid) : undefined);
    const raw = payload.entry as CmsEntry | undefined;
    const log = async (r: SyncResult | { outcome: "error"; detail: string }) => this.record("webhook", payload.event, model, raw?.documentId, raw?.locale ?? undefined, r.outcome, r.detail);
    try {
      if (!m) { const r: SyncResult = { outcome: "ignored", detail: `modelo sin mapeo: ${model || "?"}` }; await log(r); return r; }
      if (!raw?.documentId) throw AppError.validation("La entrada no trae documentId");
      const locale = raw.locale ?? this.defaultLocale;
      let result: SyncResult;
      switch (payload.event) {
        case "entry.publish": result = await this.publish(m, raw, locale); break;
        case "entry.unpublish": result = await this.unpublish(m, raw.documentId, locale); break;
        case "entry.delete": result = await this.remove(m, raw.documentId, locale); break;
        case "entry.create": case "entry.update":
          // Con Draft & Publish una edición no cambia lo publicado: se espera al evento "publish".
          result = m.draftAndPublish ? { outcome: "ignored", detail: "borrador: se aplica al publicar" } : await this.publish(m, raw, locale);
          break;
        default: result = { outcome: "ignored", detail: `evento no manejado: ${payload.event}` };
      }
      await log(result);
      return result;
    } catch (err) {
      await log({ outcome: "error", detail: (err as Error).message.slice(0, 300) });
      throw err;
    }
  }

  // ---------- Publicar ----------
  private async publish(m: Mapping, payloadEntry: CmsEntry, locale: string): Promise<SyncResult> {
    // La entrada del webhook puede venir sin relaciones ni medios completos: si se puede, se pide a Strapi la versión publicada.
    let entry = payloadEntry;
    if (this.canFetch) {
      const full = await this.fetchEntry(m, payloadEntry.documentId, locale);
      if (full) entry = full;
    }
    return this.applyPublished(m, entry, locale, 0);
  }

  async applyPublished(m: Mapping, entry: CmsEntry, locale: string, depth: number): Promise<SyncResult> {
    const uid = `api::${m.model}.${m.model}`;
    const updatedAt = entry.updatedAt ? new Date(entry.updatedAt) : new Date();
    return this.tx(async (c) => {
      const known = await c.query<{ locale: string; entity_id: string; cms_updated_at: Date | null }>("SELECT locale, entity_id, cms_updated_at FROM cms_entries WHERE cms_uid = $1 AND document_id = $2", [uid, entry.documentId]);
      const same = known.rows.find((r) => r.locale === locale);
      if (same?.cms_updated_at && same.cms_updated_at > updatedAt) return { outcome: "ignored", detail: "evento más antiguo que el ya aplicado", entityId: same.entity_id } as SyncResult;
      let entityId = known.rows[0]?.entity_id;

      if (locale !== this.defaultLocale) {
        if (!entityId) {
          // Llegó una traducción antes que el idioma base: se intenta traer el base; si no, se espera.
          if (this.canFetch && depth < 2) {
            const base = await this.fetchEntry(m, entry.documentId, this.defaultLocale);
            if (base) entityId = (await this.applyPublished(m, base, this.defaultLocale, depth + 1)).entityId;
          }
          if (!entityId) return { outcome: "ignored", detail: `falta el idioma base (${this.defaultLocale}); se aplicará cuando se publique` };
        }
        await this.writeTranslations(c, m, entityId, locale, entry);
        await this.linkEntry(c, uid, entry.documentId, locale, m.table, entityId, updatedAt);
        return { outcome: "applied", detail: `traducción ${locale} actualizada`, entityId };
      }

      // ----- idioma base: columnas de la tabla -----
      const values = new Map<string, unknown>();
      // Un atributo ausente del payload (p. ej. aún no existe en el CMS) no toca la columna; uno presente con null la vacía.
      for (const f of m.fields) if (f.from in entry) values.set(f.to, convertValue(f.kind, entry[f.from], this.abs));
      for (const rel of m.relations ?? []) if (rel.from in entry) values.set(rel.column, await this.resolveRelation(c, rel.model, entry[rel.from], locale, depth));
      if (m.fallbackImage && values.has(m.fallbackImage.gallery) && !values.get(m.fallbackImage.column)) values.set(m.fallbackImage.column, (values.get(m.fallbackImage.gallery) as string[])[0] ?? null);
      const slug = values.get("slug") as string | null;
      if (!slug) throw AppError.validation("La entrada no tiene slug");
      const nameCol = m.fields.find((f) => f.to === "name" || f.to === "title")!.to;
      if (!values.get(nameCol)) throw AppError.validation(`La entrada no tiene ${nameCol === "name" ? "nombre" : "título"}`);
      if (m.table === "experiences" && values.has("duration") && values.get("duration") !== null) values.set("duration", `${values.get("duration")} h`);

      // Vincula con una fila existente del mismo slug (contenido cargado antes del CMS) en lugar de duplicarla.
      if (!entityId) {
        const bySlug = await c.query<{ id: string }>(`SELECT id FROM ${q(m.table)} WHERE slug = $1 OR $1 = ANY(slug_history) LIMIT 1`, [slug]);
        entityId = bySlug.rows[0]?.id;
      }
      const publishedAt = entry.publishedAt ? new Date(entry.publishedAt) : new Date();
      const cols = [...values.keys()];
      const jsonCols = new Set(m.fields.filter((f) => JSON_KINDS.has(f.kind)).map((f) => f.to));
      const args = cols.map((k) => (jsonCols.has(k) ? JSON.stringify(values.get(k)) : values.get(k)));
      const ph = (i: number) => `$${i + 1}${jsonCols.has(cols[i]!) ? "::jsonb" : ""}`;

      if (entityId) {
        const cur = await c.query<{ slug: string | null }>(`SELECT slug FROM ${q(m.table)} WHERE id = $1`, [entityId]);
        const oldSlug = cur.rows[0]?.slug;
        const sets = cols.map((k, i) => `${q(k)} = ${ph(i)}`);
        // Si cambia el slug se conserva el anterior para redirigir enlaces viejos (SEO).
        const history = oldSlug && oldSlug !== slug ? `, slug_history = (SELECT ARRAY(SELECT DISTINCT unnest(slug_history || ARRAY[$${cols.length + 3}::text])))` : "";
        const params = [...args, entityId, publishedAt, ...(history ? [oldSlug] : [])];
        await c.query(
          `UPDATE ${q(m.table)} SET ${sets.join(", ")}, status = 'published', published_at = $${cols.length + 2}, unpublished_at = NULL, deleted_at = NULL, version = version + 1${history} WHERE id = $${cols.length + 1}`, params,
        );
      } else {
        const res = await c.query<{ id: string }>(
          `INSERT INTO ${q(m.table)} (${cols.map(q).join(", ")}, status, published_at) VALUES (${cols.map((_, i) => ph(i)).join(", ")}, 'published', $${cols.length + 1}) RETURNING id`, [...args, publishedAt],
        );
        entityId = res.rows[0]!.id;
      }
      await this.linkEntry(c, uid, entry.documentId, locale, m.table, entityId, updatedAt);
      return { outcome: "applied", detail: `${m.table}/${slug} publicado`, entityId };
    });
  }

  private async writeTranslations(c: PoolClient, m: Mapping, entityId: string, locale: string, entry: CmsEntry) {
    for (const f of m.fields) {
      if (!f.localized || !TRANSLATABLE_KINDS.has(f.kind)) continue; // sólo texto se traduce en entity_translations
      const v = convertValue(f.kind, entry[f.from], this.abs) as string | null;
      if (v === null) await c.query("DELETE FROM entity_translations WHERE entity_type = $1 AND entity_id = $2 AND language = $3 AND field_name = $4", [m.table, entityId, locale, f.to]);
      else await c.query(
        `INSERT INTO entity_translations (entity_type, entity_id, language, field_name, translation_text) VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (entity_type, entity_id, language, field_name) DO UPDATE SET translation_text = EXCLUDED.translation_text, updated_at = now()`, [m.table, entityId, locale, f.to, v],
      );
    }
  }

  private async linkEntry(c: PoolClient, uid: string, documentId: string, locale: string, table: string, entityId: string, updatedAt: Date) {
    await c.query(
      `INSERT INTO cms_entries (cms_uid, document_id, locale, table_name, entity_id, cms_updated_at) VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (cms_uid, document_id, locale) DO UPDATE SET entity_id = EXCLUDED.entity_id, cms_updated_at = EXCLUDED.cms_updated_at, last_synced_at = now()`,
      [uid, documentId, locale, table, entityId, updatedAt],
    );
  }

  /** Relación de Strapi → id propio (buscando el destino ya sincronizado; si falta y se puede, se trae del CMS). */
  private async resolveRelation(c: PoolClient, model: string, value: unknown, locale: string, depth: number): Promise<string | null> {
    const rel = (Array.isArray(value) ? value[0] : value) as { documentId?: string } | null | undefined;
    if (!rel?.documentId) return null;
    const target = MAPPING_BY_MODEL.get(model);
    if (!target) return null;
    const uid = `api::${model}.${model}`;
    const find = async () => (await c.query<{ entity_id: string }>("SELECT entity_id FROM cms_entries WHERE cms_uid = $1 AND document_id = $2 LIMIT 1", [uid, rel.documentId])).rows[0]?.entity_id ?? null;
    let id = await find();
    if (!id && this.canFetch && depth < 2) {
      const entry = await this.fetchEntry(target, rel.documentId, this.defaultLocale);
      if (entry) { await this.applyPublished(target, entry, this.defaultLocale, depth + 1); id = await find(); }
    }
    if (!id) this.log.warn({ model, documentId: rel.documentId }, "Relación aún no sincronizada: se deja vacía");
    return id;
  }

  // ---------- Despublicar / eliminar ----------
  private async unpublish(m: Mapping, documentId: string, locale: string): Promise<SyncResult> {
    const uid = `api::${m.model}.${m.model}`;
    return this.tx(async (c) => {
      const row = (await c.query<{ entity_id: string }>("SELECT entity_id FROM cms_entries WHERE cms_uid = $1 AND document_id = $2 ORDER BY (locale = $3) DESC LIMIT 1", [uid, documentId, this.defaultLocale])).rows[0];
      if (!row) return { outcome: "ignored", detail: "la entrada no estaba sincronizada" } as SyncResult;
      if (locale !== this.defaultLocale) {
        await c.query("DELETE FROM entity_translations WHERE entity_type = $1 AND entity_id = $2 AND language = $3", [m.table, row.entity_id, locale]);
        await c.query("DELETE FROM cms_entries WHERE cms_uid = $1 AND document_id = $2 AND locale = $3", [uid, documentId, locale]);
        return { outcome: "applied", detail: `traducción ${locale} retirada`, entityId: row.entity_id };
      }
      await c.query(`UPDATE ${q(m.table)} SET status = 'draft', unpublished_at = now(), version = version + 1 WHERE id = $1`, [row.entity_id]);
      return { outcome: "applied", detail: `${m.table} despublicado`, entityId: row.entity_id };
    });
  }

  private async remove(m: Mapping, documentId: string, locale: string): Promise<SyncResult> {
    const uid = `api::${m.model}.${m.model}`;
    return this.tx(async (c) => {
      const row = (await c.query<{ entity_id: string }>("SELECT entity_id FROM cms_entries WHERE cms_uid = $1 AND document_id = $2 LIMIT 1", [uid, documentId])).rows[0];
      if (!row) return { outcome: "ignored", detail: "la entrada no estaba sincronizada" } as SyncResult;
      if (locale !== this.defaultLocale) {
        await c.query("DELETE FROM entity_translations WHERE entity_type = $1 AND entity_id = $2 AND language = $3", [m.table, row.entity_id, locale]);
        await c.query("DELETE FROM cms_entries WHERE cms_uid = $1 AND document_id = $2 AND locale = $3", [uid, documentId, locale]);
        return { outcome: "applied", detail: `traducción ${locale} eliminada`, entityId: row.entity_id };
      }
      // Borrado lógico: la fila y su historial se conservan; deja de ser pública.
      await c.query(`UPDATE ${q(m.table)} SET status = 'archived', deleted_at = now(), version = version + 1 WHERE id = $1`, [row.entity_id]);
      await c.query("DELETE FROM cms_entries WHERE cms_uid = $1 AND document_id = $2", [uid, documentId]);
      return { outcome: "applied", detail: `${m.table} eliminado (borrado lógico)`, entityId: row.entity_id };
    });
  }

  // ---------- Carga completa ----------
  /** Trae todo lo publicado en Strapi (todos los idiomas) y lo aplica. Los destinos van primero porque otros tipos los referencian. */
  async backfill(models?: string[]): Promise<{ model: string; locale: string; applied: number; ignored: number; errors: number }[]> {
    const wanted = MAPPINGS.filter((m) => !models?.length || models.includes(m.model));
    if (models?.length) for (const x of models) if (!MAPPING_BY_MODEL.has(x)) throw AppError.validation(`Modelo desconocido: ${x}`, { allowed: MAPPINGS.map((m) => m.model) });
    const locales = await this.locales();
    const summary: { model: string; locale: string; applied: number; ignored: number; errors: number }[] = [];
    for (const m of wanted) {
      for (const locale of locales) {
        const s = { model: m.model, locale, applied: 0, ignored: 0, errors: 0 };
        for (let page = 1; ; page++) {
          const res = await this.api<{ data: CmsEntry[]; meta?: { pagination?: { pageCount?: number } } } | null>(
            `/api/${m.plural}?locale=${locale}&status=published&populate=*&pagination[page]=${page}&pagination[pageSize]=100`,
          );
          if (!res) break; // el tipo aún no existe en el CMS
          for (const entry of res.data) {
            try {
              const r = await this.applyPublished(m, entry, locale, 0);
              s[r.outcome === "applied" ? "applied" : "ignored"]++;
              await this.record("backfill", "entry.publish", m.model, entry.documentId, locale, r.outcome, r.detail);
            } catch (err) {
              s.errors++;
              await this.record("backfill", "entry.publish", m.model, entry.documentId, locale, "error", (err as Error).message.slice(0, 300));
            }
          }
          if (page >= (res.meta?.pagination?.pageCount ?? 1)) break;
        }
        summary.push(s);
      }
    }
    return summary;
  }

  // ---------- utilidades ----------
  private async record(source: "webhook" | "backfill", event: string, model: string | undefined, documentId: string | undefined, locale: string | undefined, outcome: string, detail: string) {
    await this.db.query("INSERT INTO cms_sync_log (source, event, model, document_id, locale, outcome, detail) VALUES ($1, $2, $3, $4, $5, $6, $7)", [source, event, model ?? null, documentId ?? null, locale ?? null, outcome, detail.slice(0, 500)])
      .catch((err) => this.log.warn({ err: (err as Error).message }, "No se pudo registrar la sincronización"));
  }

  private async tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
    const c = await this.db.connect();
    try { await c.query("BEGIN"); const out = await fn(c); await c.query("COMMIT"); return out; }
    catch (e) { await c.query("ROLLBACK"); throw e; }
    finally { c.release(); }
  }
}
