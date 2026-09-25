import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { resolveLocale, applyTranslations } from "../../lib/i18n.js";
import { listQuery, pageMeta, parseSort } from "../../lib/pagination.js";
import { PUBLIC_CACHE } from "../../plugins/etag.js";

const SORTABLE = ["name", "region", "created_at"] as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const province = z.object({
  id: z.string().uuid(),
  slug: z.string().nullable(),
  name: z.string(),
  region: z.string().nullable(),
  description: z.string().nullable(),
  image_url: z.string().nullable(),
  seo: z.object({ title: z.string().nullable(), description: z.string().nullable(), og_image: z.string().nullable() }),
  updated_at: z.string().nullable(),
});
type Province = z.infer<typeof province>;

const COLUMNS = "id, slug, name, region, description, image_url, seo_title, seo_description, og_image_url, updated_at";
interface Row { id: string; slug: string | null; name: string; region: string | null; description: string | null; image_url: string | null; seo_title: string | null; seo_description: string | null; og_image_url: string | null; updated_at: Date | null }
const toDto = (r: Row): Province => ({
  id: r.id, slug: r.slug, name: r.name, region: r.region, description: r.description, image_url: r.image_url,
  seo: { title: r.seo_title, description: r.seo_description, og_image: r.og_image_url },
  updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : null,
});

// Sólo contenido publicado y no eliminado es público (docs §4.1).
const PUBLIC = "status = 'published' AND deleted_at IS NULL AND (published_at IS NULL OR published_at <= now())";

export async function provincesRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get(
    "/provinces",
    {
      schema: {
        tags: ["territorio"], summary: "Listado de provincias",
        description: "Contenido CMS publicado. Filtros: `filter[region]`, búsqueda `q` (sin acentos), orden `sort` (name, region, created_at), idioma `lang` o `Accept-Language`.",
        querystring: listQuery.extend({ "filter[region]": z.string().max(60).optional() }),
        response: {
          200: z.object({
            data: z.array(province),
            meta: z.object({ page: z.number(), per_page: z.number(), total: z.number(), total_pages: z.number(), locale: z.string(), fallback_locale: z.string().optional() }),
          }),
        },
      },
    },
    async (req, reply) => {
      const { page, per_page, q, sort, lang, ...rest } = req.query;
      const region = rest["filter[region]"];
      const locale = resolveLocale(lang, req.headers["accept-language"]);
      const order = parseSort(sort, SORTABLE, [{ column: "name", dir: "ASC" }]);

      const where: string[] = [PUBLIC];
      const params: unknown[] = [];
      if (region) { params.push(region); where.push(`unaccent(lower(region)) = unaccent(lower($${params.length}))`); }
      if (q) { params.push(`%${q}%`); where.push(`(unaccent(name) ILIKE unaccent($${params.length}) OR unaccent(coalesce(description, '')) ILIKE unaccent($${params.length}))`); }
      const whereSql = where.join(" AND ");

      const total = (await app.db.query<{ n: number }>(`SELECT count(*)::int AS n FROM provinces WHERE ${whereSql}`, params)).rows[0]!.n;
      const orderSql = order.map((o) => `${o.column} ${o.dir}`).join(", ");
      const { rows } = await app.db.query<Row>(
        `SELECT ${COLUMNS} FROM provinces WHERE ${whereSql} ORDER BY ${orderSql}, id LIMIT ${per_page} OFFSET ${(page - 1) * per_page}`, params,
      );
      const dto = rows.map(toDto);
      const tr = await applyTranslations(app.db, "provinces", dto, locale, ["name", "description"]);
      reply.header("cache-control", PUBLIC_CACHE).header("content-language", locale);
      return { data: tr.rows, meta: { ...pageMeta(page, per_page, total), locale, ...(tr.fallback ? { fallback_locale: "es" } : {}) } };
    },
  );

  r.get(
    "/provinces/:idOrSlug",
    {
      schema: {
        tags: ["territorio"], summary: "Detalle de una provincia por id (uuid) o slug",
        params: z.object({ idOrSlug: z.string().min(1).max(120) }),
        querystring: z.object({ lang: listQuery.shape.lang }),
        response: { 200: z.object({ data: province, meta: z.object({ locale: z.string() }) }) },
      },
    },
    async (req, reply) => {
      const { idOrSlug } = req.params;
      const byId = UUID.test(idOrSlug);
      const { rows } = await app.db.query<Row>(
        `SELECT ${COLUMNS} FROM provinces WHERE ${byId ? "id = $1" : "slug = $1"} AND ${PUBLIC} LIMIT 1`, [idOrSlug],
      );
      if (!rows[0]) throw AppError.notFound("Provincia");
      const locale = resolveLocale(req.query.lang, req.headers["accept-language"]);
      const tr = await applyTranslations(app.db, "provinces", [toDto(rows[0])], locale, ["name", "description"]);
      reply.header("cache-control", PUBLIC_CACHE).header("content-language", locale);
      return { data: tr.rows[0]!, meta: { locale } };
    },
  );
}
