import type { FastifyInstance } from "fastify";
import { COLLECTIONS } from "../../contracts/content-collections.js";
import { hasContentColumn as hasCol } from "../../contracts/content-schema.js";

const BASE_URL = (process.env.PUBLIC_APP_URL || "https://descubrerd.com").replace(/\/$/, "");
const XML_ENTITIES: Record<string, string> = { "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" };
const escapeXml = (value: string) => value.replace(/[<>&'"]/g, (char) => XML_ENTITIES[char]!);
// Only include collection details that have a matching public frontend route.
const PUBLIC_DETAIL_ROUTES: Record<string, string> = {
  provinces: "provincia", municipalities: "municipio", destinations: "destino", beaches: "playa",
  mountains: "montana", rivers: "rio", airports: "aeropuerto", hotels: "alojamiento",
  restaurants: "restaurante", bars: "bar", spas_wellness: "spa", experiences: "experiencia",
  tour_packages: "tour", events: "evento", clinics: "clinica",
  stadiums: "estadio", shopping_centers: "centro-comercial", travel_agencies: "agencia",
  tour_operators: "operador", articles: "articulo", job_vacancies: "empleo",
};

export async function seoRoutes(app: FastifyInstance) {
  // Handler común para sitemap XML
  const sitemapHandler = async (req: any, reply: any) => {
    const today = new Date().toISOString().slice(0, 10);
    const urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> = [
      { loc: `${BASE_URL}/`, lastmod: today, changefreq: "daily", priority: "1.0" },
      { loc: `${BASE_URL}/destinos`, lastmod: today, changefreq: "daily", priority: "0.9" },
      { loc: `${BASE_URL}/alojamientos`, lastmod: today, changefreq: "daily", priority: "0.9" },
      { loc: `${BASE_URL}/restaurante`, lastmod: today, changefreq: "daily", priority: "0.8" },
      { loc: `${BASE_URL}/playas`, lastmod: today, changefreq: "weekly", priority: "0.8" },
      { loc: `${BASE_URL}/actividades`, lastmod: today, changefreq: "weekly", priority: "0.8" },
      { loc: `${BASE_URL}/eventos`, lastmod: today, changefreq: "daily", priority: "0.8" },
      { loc: `${BASE_URL}/marketplace`, lastmod: today, changefreq: "daily", priority: "0.8" },
      { loc: `${BASE_URL}/para-empresas`, lastmod: today, changefreq: "monthly", priority: "0.7" },
    ];

    const seen = new Set(urls.map(({ loc }) => loc));
    // Add only currently public content; private/draft rows must never enter a crawl feed.
    for (const c of COLLECTIONS) {
      try {
        const route = PUBLIC_DETAIL_ROUTES[c.table];
        if (!route) continue;
        if (!hasCol(c.table, "slug")) continue;
        const visibility = [
          hasCol(c.table, "status") ? "status = 'published'" : null,
          hasCol(c.table, "deleted_at") ? "deleted_at IS NULL" : null,
          hasCol(c.table, "published_at") ? "(published_at IS NULL OR published_at <= now())" : null,
          hasCol(c.table, "is_active") ? "COALESCE(is_active, true)" : null,
          c.visible,
        ].filter(Boolean).join(" AND ");
        const dateColumns = ["updated_at", "created_at"].filter((column) => hasCol(c.table, column));
        const dateExpression = dateColumns.length ? `COALESCE(${dateColumns.join(", ")})` : "NULL::timestamptz";
        const query = `
          SELECT slug, ${dateExpression} AS modified_at
          FROM "${c.table}" 
          WHERE slug IS NOT NULL ${visibility ? `AND ${visibility}` : ""}
          ORDER BY ${dateExpression} DESC NULLS LAST
          LIMIT 1000
        `;
        const res = await app.db.query(query);
        for (const row of res.rows) {
          const lastmod = row.modified_at ? new Date(row.modified_at).toISOString().slice(0, 10) : today;
          const slugStr = encodeURIComponent(String(row.slug));
          const loc = `${BASE_URL}/${route}/${slugStr}`;
          if (seen.has(loc)) continue;
          seen.add(loc);
          urls.push({
            loc,
            lastmod,
            changefreq: "weekly",
            priority: "0.6",
          });
        }
      } catch (err) {
        req.log.warn({ err, table: c.table }, "Unable to add collection to sitemap");
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    reply.header("Content-Type", "application/xml; charset=utf-8");
    reply.header("Cache-Control", "public, max-age=3600, s-maxage=86400");
    return reply.send(xml);
  };

  app.get("/sitemap.xml", sitemapHandler);
  app.get("/api/v1/sitemap.xml", sitemapHandler);
}
