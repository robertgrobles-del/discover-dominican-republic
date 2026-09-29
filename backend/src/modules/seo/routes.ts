import type { FastifyInstance } from "fastify";
import { COLLECTIONS } from "../content/collections.js";

const BASE_URL = process.env.PUBLIC_APP_URL || "https://descubrerd.do";

export async function seoRoutes(app: FastifyInstance) {
  // Handler común para sitemap XML
  const sitemapHandler = async (_req: any, reply: any) => {
    const today = new Date().toISOString().slice(0, 10);
    const urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> = [
      { loc: `${BASE_URL}/`, lastmod: today, changefreq: "daily", priority: "1.0" },
      { loc: `${BASE_URL}/destinos`, lastmod: today, changefreq: "daily", priority: "0.9" },
      { loc: `${BASE_URL}/alojamientos`, lastmod: today, changefreq: "daily", priority: "0.9" },
      { loc: `${BASE_URL}/restaurantes`, lastmod: today, changefreq: "daily", priority: "0.8" },
      { loc: `${BASE_URL}/playas`, lastmod: today, changefreq: "weekly", priority: "0.8" },
      { loc: `${BASE_URL}/actividades`, lastmod: today, changefreq: "weekly", priority: "0.8" },
      { loc: `${BASE_URL}/eventos`, lastmod: today, changefreq: "daily", priority: "0.8" },
      { loc: `${BASE_URL}/marketplace`, lastmod: today, changefreq: "daily", priority: "0.8" },
      { loc: `${BASE_URL}/para-empresas`, lastmod: today, changefreq: "monthly", priority: "0.7" },
    ];

    // Consultar PostgreSQL para cada colección registrada
    for (const c of COLLECTIONS) {
      try {
        const query = `
          SELECT slug, updated_at, created_at 
          FROM "${c.table}" 
          WHERE slug IS NOT NULL 
          ORDER BY COALESCE(updated_at, created_at) DESC 
          LIMIT 1000
        `;
        const res = await app.db.query(query);
        for (const row of res.rows) {
          const modDate = row.updated_at || row.created_at || new Date();
          const lastmod = new Date(modDate).toISOString().slice(0, 10);
          const slugStr = String(row.slug);
          urls.push({
            loc: `${BASE_URL}/${c.path}/${slugStr}`,
            lastmod,
            changefreq: "weekly",
            priority: "0.6",
          });
        }
      } catch (err) {
        // Algunas tablas pueden no tener columna slug o updated_at; ignorar de forma silenciosa
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
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
