#!/usr/bin/env node
/**
 * Sincroniza automáticamente los posts, noticias y artículos editoriales en:
 *  1. public/llms.txt      (Índice para agentes de IA según especificación https://llmstxt.org)
 *  2. public/llms-full.txt (Texto completo en Markdown de todas las publicaciones)
 *  3. public/robots.txt    (Permisos y rutas públicas de indexación para buscadores e IA)
 * 
 * Se ejecuta automáticamente en prebuild y build para garantizar que cualquier post nuevo
 * quede siempre reflejado en robots.txt y llms.txt sin intervención manual.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_URL = (process.env.SITE_URL ?? "https://www.descubrerepdom.com").replace(/\/$/, "");
const SITE_NAME = "Descubre República Dominicana";
const SITE_SUMMARY = "Portal oficial de turismo de República Dominicana: noticias de actualidad turística (eventos, cultura, gastronomía, naturaleza, infraestructura y avisos al viajero), guía del e-Ticket, aeropuertos, puertos de cruceros, marinas, eventos y directorio de negocios turísticos por provincia.";

/** Carga de forma segura blogPosts desde src/data/blogData.ts mediante transpilación */
function loadBlogPosts() {
  const filePath = path.join(ROOT, "src", "data", "blogData.ts");
  if (!existsSync(filePath)) {
    console.warn("[sync-seo-llms] Advertencia: No se encontró src/data/blogData.ts");
    return [];
  }
  const source = readFileSync(filePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText;

  const mod = { exports: {} };
  try {
    const fn = new Function("exports", "module", "require", transpiled);
    fn(mod.exports, mod, () => ({}));
    return mod.exports.blogPosts || [];
  } catch (err) {
    console.error("[sync-seo-llms] Error evaluando blogData.ts:", err.message);
    return [];
  }
}

/** Genera el contenido de llms.txt estructurado por secciones semánticas */
function buildLlmsTxt(posts) {
  const noticias = posts.filter(p => p.category === "noticias");
  const prensa = posts.filter(p => p.category === "prensa");
  const articulos = posts.filter(p => p.category === "experiencias" || p.category === "invitados");

  const fmtPost = (p) => {
    const route = (p.category === "noticias" || p.category === "prensa") ? "noticias" : "articulo";
    return `- [${p.title}](${SITE_URL}/${route}/${p.slug}): ${p.excerpt || p.title}`;
  };

  let content = `# ${SITE_NAME}\n\n`;
  content += `> ${SITE_SUMMARY}\n\n`;
  content += `Contenido en español de República Dominicana. Cada noticia y artículo dispone de una versión limpia y una página web interactiva en ${SITE_URL}/noticias/<slug> o ${SITE_URL}/articulo/<slug>. Los metadatos siguen schema.org (NewsArticle y Article).\n\n`;

  if (noticias.length > 0) {
    content += `## Noticias y Actualidad del Sector\n\n`;
    content += noticias.map(fmtPost).join("\n") + "\n\n";
  }

  if (prensa.length > 0) {
    content += `## Notas de Prensa de Aliados & Comunicados\n\n`;
    content += prensa.map(fmtPost).join("\n") + "\n\n";
  }

  if (articulos.length > 0) {
    content += `## Artículos de Viaje y Experiencias\n\n`;
    content += articulos.map(fmtPost).join("\n") + "\n\n";
  }

  content += `## Guías Oficiales y Servicios de Viaje\n\n`;
  content += `- [E-Ticket de República Dominicana: guía del nuevo portal](${SITE_URL}/e-ticket.md): Cómo tramitar 100% gratis el formulario electrónico obligatorio de entrada y salida migratoria en eticket.gob.do.\n`;
  content += `- [Aeropuertos Internacionales de República Dominicana](${SITE_URL}/aeropuerto): Terminales, aerolíneas, conexiones y servicios en terminal (PUJ, SDQ, STI, POP, LRM, AZS, BRX, JBQ).\n`;
  content += `- [Puertos de Cruceros y Marinas Deportivas](${SITE_URL}/puertos-marinas): Puertos marítimos (Amber Cove, Taíno Bay, Sans Souci, Cabo Rojo…) y marinas náuticas (Cap Cana, Casa de Campo, Ocean World…).\n`;
  content += `- [Eventos en República Dominicana](${SITE_URL}/eventos): Agenda cultural, festivales y eventos deportivos por provincia.\n`;
  content += `- [Directorio de Negocios Turísticos](${SITE_URL}/negocios): Alojamientos, restaurantes y servicios turísticos verificados por provincia.\n\n`;

  content += `## Opcional y Recursos Globales\n\n`;
  content += `- [Todas las noticias y artículos en texto completo](${SITE_URL}/llms-full.txt)\n`;
  content += `- [Listado oficial de noticias](${SITE_URL}/noticias)\n`;
  content += `- [Revista & Blog de Viajes](${SITE_URL}/revista)\n`;
  content += `- [Feed RSS de Noticias](${SITE_URL}/noticias/rss.xml)\n`;
  content += `- [Sitemap General XML](${SITE_URL}/sitemap.xml)\n`;

  return content;
}

/** Genera llms-full.txt con el texto Markdown completo de cada publicación */
function buildLlmsFullTxt(posts) {
  let content = `# ${SITE_NAME}: Publicaciones Completas\n\n`;
  content += `> ${SITE_SUMMARY}\n\n`;

  const items = posts.map(p => {
    const route = (p.category === "noticias" || p.category === "prensa") ? "noticias" : "articulo";
    const meta = [
      `- URL: ${SITE_URL}/${route}/${p.slug}`,
      p.publishedAt ? `- Publicada: ${p.publishedAt}` : "",
      p.categoryLabel ? `- Categoría: ${p.categoryLabel}` : "",
      p.author?.name ? `- Autor: ${p.author.name}${p.author.role ? ` (${p.author.role})` : ""}` : "",
      p.tags?.length ? `- Etiquetas: ${p.tags.join(", ")}` : ""
    ].filter(Boolean).join("\n");

    return `## ${p.title}\n\n${p.excerpt ? `> ${p.excerpt}\n\n` : ""}${meta}\n\n${(p.content || "").trim()}`;
  });

  return content + items.join("\n\n---\n\n") + "\n";
}

/** Actualiza public/robots.txt garantizando reglas Allow para cada post/noticia */
function updateRobotsTxt(posts) {
  const robotsPath = path.join(ROOT, "public", "robots.txt");
  let content = existsSync(robotsPath) ? readFileSync(robotsPath, "utf8") : "";

  const postAllows = posts.map(p => {
    const route = (p.category === "noticias" || p.category === "prensa") ? "noticias" : "articulo";
    return `Allow: /${route}/${p.slug}`;
  });

  const sectionHeader = "# Publicaciones editoriales y noticias indexadas";
  const newSection = `${sectionHeader}\n# Sincronizado automáticamente al agregar un post o noticia\n` + postAllows.join("\n") + "\n";

  if (content.includes(sectionHeader)) {
    content = content.replace(new RegExp(`${sectionHeader}[\\s\\S]*?(?=(?:Sitemap:|$))`), newSection + "\n");
  } else {
    // Si no existía la sección, insertarla antes de Sitemap:
    const sitemapIdx = content.indexOf("Sitemap:");
    if (sitemapIdx !== -1) {
      content = content.slice(0, sitemapIdx) + "\n" + newSection + "\n" + content.slice(sitemapIdx);
    } else {
      content += "\n" + newSection;
    }
  }

  // Asegurar directivas globales para agentes de IA y rutas de noticias
  if (!content.includes("Allow: /llms.txt")) {
    content = content.replace("Allow: /\n", "Allow: /\nAllow: /llms.txt\nAllow: /llms-full.txt\nAllow: /noticias/\nAllow: /articulo/\nAllow: /revista/\n");
  }

  return content;
}

function main() {
  const posts = loadBlogPosts();
  console.log(`[sync-seo-llms] Procesando ${posts.length} publicaciones de blogData.ts...`);

  const publicDir = path.join(ROOT, "public");
  const distDir = path.join(ROOT, "dist");

  // 1. Generar llms.txt
  const llmsContent = buildLlmsTxt(posts);
  const llmsPath = path.join(publicDir, "llms.txt");
  writeFileSync(llmsPath, llmsContent, "utf8");
  if (existsSync(distDir)) writeFileSync(path.join(distDir, "llms.txt"), llmsContent, "utf8");
  console.log(`[sync-seo-llms] ✓ public/llms.txt generado con éxito (${posts.length} posts).`);

  // 2. Generar llms-full.txt
  const llmsFullContent = buildLlmsFullTxt(posts);
  const llmsFullPath = path.join(publicDir, "llms-full.txt");
  writeFileSync(llmsFullPath, llmsFullContent, "utf8");
  if (existsSync(distDir)) writeFileSync(path.join(distDir, "llms-full.txt"), llmsFullContent, "utf8");
  console.log(`[sync-seo-llms] ✓ public/llms-full.txt generado con éxito.`);

  // 3. Actualizar robots.txt
  const robotsContent = updateRobotsTxt(posts);
  const robotsPath = path.join(publicDir, "robots.txt");
  writeFileSync(robotsPath, robotsContent, "utf8");
  if (existsSync(distDir)) writeFileSync(path.join(distDir, "robots.txt"), robotsContent, "utf8");
  console.log(`[sync-seo-llms] ✓ public/robots.txt sincronizado con ${posts.length} entradas Allow.`);
}

main();
