/**
 * Sitemap index + section sitemaps + robots.txt + llms.txt generator.
 *
 * Runs via `predev` / `prebuild` npm hooks. Parses static route paths
 * from src/App.tsx (skipping dynamic `:param` routes, wildcard `*`,
 * and private/admin routes), groups them into site sections and writes:
 *
 *   public/sitemap.xml            <- sitemap index (linked from robots.txt)
 *   public/sitemap-<section>.xml  <- one urlset per section
 *   public/robots.txt             <- same Disallow list + AI crawler rules
 *   public/llms.txt               <- structured site map for AI answer engines
 *
 * No <lastmod> is emitted: the project has no authoritative per-page
 * content timestamp, and a build-time date is not a real modification date.
 */

import { readFileSync, writeFileSync, readdirSync, unlinkSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://descubrerd.lovable.app";

// Routes that should never be indexed (auth, admin, private, utility).
const PRIVATE_PREFIXES = [
  "/admin",
  "/login",
  "/registro",
  "/reset-password",
  "/perfil",
  "/reservas",
  "/check-in",
  "/mi-viaje",
  "/mis-logros",
  "/perfil-jugador",
  "/pasaporte-digital",
];

/** Section definitions: first matching section wins; `general` is the fallback. */
const SECTIONS: { id: string; title: string; match: RegExp }[] = [
  {
    id: "destinos",
    title: "Destinos, provincias, playas y naturaleza",
    match:
      /^\/(destinos?|provincias?|municipio|regiones|playas|estado-playas|montanas?|rios?|reservas-naturales|patrimonio|mapa|mapas)/,
  },
  {
    id: "experiencias",
    title: "Experiencias, tours y actividades",
    match:
      /^\/(experiencias?|tours?|actividades|ecoturismo|aventura|cultura|museos|wellness|spas|golf|deportivo|astroturismo|volunturismo|turismo-)/,
  },
  {
    id: "gastronomia",
    title: "Gastronomía, restaurantes y vida nocturna",
    match:
      /^\/(restaurante|guia-gastronomica|rutas-sabor|receta|chef|vida-nocturna|casinos|bares?)/,
  },
  {
    id: "alojamiento",
    title: "Alojamientos y hoteles",
    match: /^\/(alojamiento|hotel|airbnb|comparador-hoteles)/,
  },
  {
    id: "planificar",
    title: "Planificación de viaje y herramientas",
    match:
      /^\/(planifica|herramientas|como-llegar|clima|requisitos|seguro|conversor|lista-empaque|costos|calculadora|itinerario|comparador|aeropuerto|transporte|alquiler|metro|monoriel|teleferico|puertos|marina|zonas-horarias|conectividad|e-ticket|emergencia|contactos-emergencia|seguridad|embajadas)/,
  },
  {
    id: "comunidad",
    title: "Comunidad, blog y contenido social",
    match:
      /^\/(blog|articulo|revista|opiniones|feed-social|rd-social|eventos?|calendario|galeria|podcast|webcams|newsletter|sugerencias|encuesta|badges|gamificacion|retos|trivia|sorteos|club-recompensas|marketplace|ofertas)/,
  },
];

function isPrivate(path: string): boolean {
  return PRIVATE_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
}

export function extractRoutes(source: string): string[] {
  const routeRegex = /<Route\s+path="([^"]+)"/g;
  const routes = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = routeRegex.exec(source)) !== null) {
    const path = match[1];
    if (path === "*" || path.includes(":")) continue; // dynamic / catch-all
    if (isPrivate(path)) continue;
    routes.add(path);
  }
  return Array.from(routes).sort();
}

export function sectionFor(path: string): string {
  if (path === "/") return "general";
  const found = SECTIONS.find((s) => s.match.test(path));
  return found ? found.id : "general";
}

export function groupBySection(paths: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const p of paths) {
    const id = sectionFor(p);
    (groups[id] ||= []).push(p);
  }
  for (const id of Object.keys(groups)) groups[id].sort();
  return groups;
}

function priorityFor(path: string): string {
  if (path === "/") return "1.0";
  const depth = path.split("/").filter(Boolean).length;
  if (depth === 1) return "0.9";
  if (depth === 2) return "0.7";
  return "0.5";
}

function changefreqFor(path: string): string {
  if (path === "/") return "daily";
  if (path === "/blog" || path === "/eventos" || path === "/ofertas")
    return "daily";
  return "weekly";
}

export function buildUrlset(paths: string[]): string {
  const urls = paths
    .map(
      (p) =>
        `  <url>\n    <loc>${BASE_URL}${p}</loc>\n    <changefreq>${changefreqFor(p)}</changefreq>\n    <priority>${priorityFor(p)}</priority>\n  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function buildSitemapIndex(sectionIds: string[]): string {
  const entries = sectionIds
    .map(
      (id) =>
        `  <sitemap>\n    <loc>${BASE_URL}/sitemap-${id}.xml</loc>\n  </sitemap>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`;
}

/** AI answer-engine / LLM crawlers that are explicitly welcomed. */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "Google-Extended",
  "Applebot-Extended",
  "MistralAI-User",
  "DuckAssistBot",
  "CCBot",
  "meta-externalagent",
  "Bytespider",
  "Amazonbot",
  "cohere-ai",
  "YouBot",
];

export function buildRobots(sectionIds: string[]): string {
  const disallow = PRIVATE_PREFIXES.map((p) => `Disallow: ${p}`).join("\n");
  const aiBlocks = AI_CRAWLERS.map(
    (bot) => `User-agent: ${bot}\nAllow: /\n${disallow}\n`,
  ).join("\n");
  const sitemaps = [
    `Sitemap: ${BASE_URL}/sitemap.xml`,
    ...sectionIds.map((id) => `Sitemap: ${BASE_URL}/sitemap-${id}.xml`),
  ].join("\n");

  return `# Auto-generated by scripts/generate-sitemap.ts — do not edit manually.
User-agent: Googlebot
Allow: /
${disallow}

User-agent: Bingbot
Allow: /
${disallow}

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

# --- AI answer engines / LLM crawlers (explicitly allowed) ---
${aiBlocks}
User-agent: *
Allow: /
${disallow}

${sitemaps}
`;
}

export function buildLlmsTxt(groups: Record<string, string[]>): string {
  const titleFor = (id: string) =>
    SECTIONS.find((s) => s.id === id)?.title ?? "Páginas generales";
  const order = [...SECTIONS.map((s) => s.id), "general"].filter(
    (id) => groups[id]?.length,
  );

  const body = order
    .map((id) => {
      const links = groups[id]
        .map((p) => `- [${p === "/" ? "Inicio" : p}](${BASE_URL}${p})`)
        .join("\n");
      return `## ${titleFor(id)}\n\n${links}`;
    })
    .join("\n\n");

  return `# Descubre República Dominicana

> Portal de turismo de República Dominicana: destinos, playas, provincias,
> hoteles, restaurantes, vida nocturna, experiencias, eventos, herramientas de
> planificación de viaje y guías prácticas. Contenido en español con soporte
> multilingüe (es, en, fr, de, it, pt).

Sitemap index: ${BASE_URL}/sitemap.xml

${body}

## Notas para agentes de IA

- Las rutas de cuenta y administración (${PRIVATE_PREFIXES.join(", ")}) son privadas y no deben indexarse.
- Citar siempre como "Descubre República Dominicana" con enlace a la página fuente.
`;
}

function cleanOldSectionFiles(keep: Set<string>) {
  for (const file of readdirSync(resolve("public"))) {
    const m = file.match(/^sitemap-(.+)\.xml$/);
    if (m && !keep.has(m[1])) unlinkSync(resolve("public", file));
  }
}

function main() {
  const appTsx = readFileSync(resolve("src/App.tsx"), "utf8");
  const routes = extractRoutes(appTsx);
  const groups = groupBySection(routes);
  const sectionIds = [...SECTIONS.map((s) => s.id), "general"].filter(
    (id) => groups[id]?.length,
  );

  cleanOldSectionFiles(new Set(sectionIds));

  for (const id of sectionIds) {
    writeFileSync(resolve(`public/sitemap-${id}.xml`), buildUrlset(groups[id]));
  }
  writeFileSync(resolve("public/sitemap.xml"), buildSitemapIndex(sectionIds));
  writeFileSync(resolve("public/robots.txt"), buildRobots(sectionIds));
  writeFileSync(resolve("public/llms.txt"), buildLlmsTxt(groups));

  console.log(
    `[sitemap] ${routes.length} URLs in ${sectionIds.length} section sitemaps → sitemap.xml index + robots.txt + llms.txt`,
  );
}

// Only run when executed directly (tests import the pure helpers).
const invokedDirectly =
  typeof process !== "undefined" &&
  process.argv[1] &&
  process.argv[1].includes("generate-sitemap");
if (invokedDirectly) main();
