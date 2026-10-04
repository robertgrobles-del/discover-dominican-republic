// Paso posterior a `vite build` (npm lo ejecuta solo, como `postbuild`). Hace dos cosas sobre `dist/`:
//
// 1. Prerenderizado de las fichas clave. El sitio es una SPA: sin esto, todas las rutas responden con el mismo
//    `index.html`, y quien no ejecuta JavaScript (las vistas previas de WhatsApp, Facebook o X, y algunos
//    buscadores) ve el título y la descripción genéricos. Aquí se escribe un `dist/<ruta>/index.html` por ficha
//    con su título, descripción, imagen, URL canónica, datos estructurados y un resumen legible del contenido.
//    Al cargar, la aplicación sustituye ese resumen por la página real.
// 2. Política de seguridad de contenido para los píxeles de publicidad. Sólo si el build trae
//    `VITE_META_PIXEL_ID` o `VITE_TIKTOK_PIXEL_ID` se añaden sus dominios; sin ellos la política no cambia.
//
// Uso: node scripts/postbuild.mjs [carpeta dist]
//   SITE_URL        dominio canónico (por defecto https://descubrerd.com)
//   PRERENDER_API   opcional: base de la API (https://…/api/v1). Si responde, los textos salen del backend,
//                   que es la fuente de verdad; si no, de los archivos con los que se compiló el sitio.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.resolve(ROOT, process.argv[2] ?? "dist");
const SITE_URL = (process.env.SITE_URL ?? "https://descubrerd.com").replace(/\/$/, "");
const API = process.env.PRERENDER_API?.replace(/\/$/, "");
const SITE_NAME = "Descubre República Dominicana";

// ---------- Datos ----------

/** Cada ruta prerenderizada: de qué exportación sale, a qué colección de la API equivale y cómo se describe. */
const SOURCES = [
  { route: "destino", file: "destinations", key: "destinations", api: "destinations", schema: "TouristDestination" },
  { route: "playa", file: "beaches", key: "beaches", api: "beaches", schema: "Beach" },
  { route: "alojamiento", file: "hotels", key: "hotels", api: "hotels", schema: "LodgingBusiness" },
  { route: "restaurante", file: "restaurants", key: "restaurants", api: "restaurants", schema: "Restaurant" },
  { route: "bar", file: "bars", key: "bars", api: "bars", schema: "BarOrPub" },
  { route: "experiencia", file: "experiences", key: "experiences", api: "experiences", schema: "TouristAttraction" },
  { route: "montana", file: "mountains", key: "mountains", api: "mountains", schema: "Mountain" },
  { route: "aeropuerto", file: "airports", key: "airports", api: "airports", schema: "Airport" },
  { route: "articulo", file: "blogData", key: "blogPosts", api: "articles", schema: "Article" },
];

const IMAGE = /\.(jpe?g|png|webp|svg|gif|avif|mp4)$/i;

/** Carga los archivos de `src/data` (TypeScript del frontend) empaquetándolos con esbuild, sin tocarlos. */
async function loadLocalData() {
  const { build } = await import("esbuild"); // bajo demanda: las pruebas importan este archivo sin empaquetar nada
  const outdir = path.join(ROOT, "node_modules", ".cache", "postbuild");
  mkdirSync(outdir, { recursive: true });
  const outfile = path.join(outdir, "data.mjs");
  const files = [...new Set(SOURCES.map((s) => s.file))];
  await build({
    stdin: { contents: files.map((f, i) => `export * as m${i} from "@/data/${f}";`).join("\n"), resolveDir: ROOT, loader: "ts" },
    outfile, bundle: true, platform: "node", format: "esm", logLevel: "silent", target: "node20",
    define: { "import.meta.env": "{}" },
    alias: { "@": path.join(ROOT, "src") },
    plugins: [{
      name: "assets-and-icons",
      setup(b) {
        // Una imagen importada se queda en su nombre de archivo; después se busca su versión con huella en dist/assets.
        b.onResolve({ filter: IMAGE }, (a) => ({ path: a.path, namespace: "asset" }));
        b.onLoad({ filter: /.*/, namespace: "asset" }, (a) => ({ contents: `export default ${JSON.stringify(`/assets/${a.path.split("/").pop()}`)};`, loader: "js" }));
        // Los íconos y React sólo se referencian; aquí no se pinta nada.
        b.onResolve({ filter: /^(lucide-react|react|react-dom)(\/.*)?$/ }, (a) => ({ path: a.path, namespace: "stub" }));
        b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: "module.exports = new Proxy({}, { get: (_t, k) => (k === '__esModule' ? false : () => null) });", loader: "js" }));
      },
    }],
  });
  const mod = await import(`${pathToFileURL(outfile).href}?t=${Date.now()}`);
  return Object.fromEntries(files.map((f, i) => [f, mod[`m${i}`]]));
}

/** Textos del backend por slug, si hay API y responde. Un fallo no detiene el build: se usan los locales. */
async function loadApiOverrides(collection) {
  if (!API) return new Map();
  try {
    const rows = [];
    for (let page = 1; page <= 20; page++) {
      const res = await fetch(`${API}/${collection}?per_page=100&page=${page}&fields=*`, { signal: AbortSignal.timeout(15_000) });
      if (!res.ok) throw new Error(`${res.status}`);
      const body = await res.json();
      rows.push(...body.data);
      if (page >= (body.meta?.total_pages ?? 1)) break;
    }
    return new Map(rows.filter((r) => r.slug).map((r) => [r.slug, r]));
  } catch (err) {
    console.warn(`[postbuild] ${collection}: la API no respondió (${err.message}); se usan los datos locales.`);
    return new Map();
  }
}

// ---------- HTML ----------

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const clip = (s, max) => { const t = String(s ?? "").replace(/\s+/g, " ").trim(); return t.length <= max ? t : `${t.slice(0, max - 1).replace(/\s+\S*$/, "")}…`; };

/** Nombre con huella de una imagen empaquetada (`/assets/playa.jpg` → `/assets/playa-AbC123.jpg`). */
function hashedAssets(dist) {
  const dir = path.join(dist, "assets");
  const files = existsSync(dir) ? readdirSync(dir) : [];
  return (url) => {
    if (typeof url !== "string" || !url.startsWith("/assets/")) return url;
    const name = url.slice("/assets/".length), ext = path.extname(name), base = name.slice(0, -ext.length);
    const hit = files.find((f) => f === name || (f.startsWith(`${base}-`) && f.endsWith(ext) && f.length === base.length + ext.length + 9));
    return hit ? `/assets/${hit}` : undefined;
  };
}
const absolute = (url) => (!url ? undefined : /^https?:\/\//.test(url) ? url : `${SITE_URL}${url}`);

/** Sustituye una etiqueta de la cabecera si existe; si no, la añade antes de `</head>`. */
function setTag(html, pattern, tag) {
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace("</head>", `    ${tag}\n  </head>`);
}
const metaName = (html, name, content) => setTag(html, new RegExp(`<meta\\s+name="${name}"[^>]*>`, "i"), `<meta name="${name}" content="${esc(content)}" />`);
const metaProp = (html, prop, content) => setTag(html, new RegExp(`<meta\\s+property="${prop}"[^>]*>`, "i"), `<meta property="${prop}" content="${esc(content)}" />`);

/** Página de una ficha a partir de la plantilla compilada. */
export function renderPage(template, page) {
  const title = `${page.name} | ${SITE_NAME}`;
  const description = clip(page.summary || page.description, 160);
  const image = absolute(page.image) ?? `${SITE_URL}/og-image.jpg`;
  let html = template.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);
  html = metaName(html, "description", description);
  html = setTag(html, /<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${esc(page.url)}" />`);
  html = metaProp(html, "og:title", title);
  html = metaProp(html, "og:description", description);
  html = metaProp(html, "og:type", page.schema === "Article" ? "article" : "website");
  html = metaProp(html, "og:url", page.url);
  html = metaProp(html, "og:image", image);
  html = metaProp(html, "og:image:secure_url", image);
  html = metaProp(html, "og:image:alt", page.name);
  // Las dimensiones y el tipo de la plantilla son de la imagen genérica: no valen para la de la ficha.
  if (page.image) html = html.replace(/\s*<meta\s+property="og:image:(width|height|type)"[^>]*>/gi, "");
  html = metaName(html, "twitter:title", title);
  html = metaName(html, "twitter:description", description);
  html = metaName(html, "twitter:image", image);
  const jsonLd = {
    "@context": "https://schema.org", "@type": page.schema, name: page.name, description: clip(page.description || page.summary, 500), url: page.url,
    ...(page.image ? { image } : {}),
    ...(page.schema === "Article" ? { headline: page.name } : {}),
    ...(typeof page.latitude === "number" && typeof page.longitude === "number" ? { geo: { "@type": "GeoCoordinates", latitude: page.latitude, longitude: page.longitude } } : {}),
    ...(typeof page.rating === "number" && page.reviewCount > 0 ? { aggregateRating: { "@type": "AggregateRating", ratingValue: page.rating, reviewCount: page.reviewCount } } : {}),
  };
  // `<` escapado: un texto con `</script>` no puede cerrar el bloque.
  html = html.replace("</head>", `    <script type="application/ld+json" data-prerendered>${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>\n  </head>`);
  const body = [
    `<main data-prerendered style="max-width:48rem;margin:0 auto;padding:2rem 1rem;font-family:system-ui,sans-serif;line-height:1.6">`,
    `<h1>${esc(page.name)}</h1>`,
    page.place ? `<p><strong>${esc(page.place)}</strong></p>` : "",
    page.image ? `<img src="${esc(page.image)}" alt="${esc(page.name)}" width="800" height="450" style="max-width:100%;height:auto;border-radius:12px" />` : "",
    `<p>${esc(clip(page.description || page.summary, 1200))}</p>`,
    page.highlights.length ? `<ul>${page.highlights.slice(0, 8).map((h) => `<li>${esc(clip(h, 160))}</li>`).join("")}</ul>` : "",
    `<p><a href="/">${SITE_NAME}</a></p>`,
    `</main>`,
  ].join("");
  return html.replace(/<div id="root">\s*<\/div>/, `<div id="root">${body}</div>`);
}

/** Convierte un registro local (y su fila del backend, si hay) en lo que necesita la página. */
export function toPage(source, item, row, resolveAsset) {
  const slug = item.slug ?? item.id;
  const name = row?.name ?? row?.title ?? item.name ?? item.title;
  if (!slug || !name || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) return null;
  const remoteImage = typeof row?.image_url === "string" && !row.image_url.startsWith("/assets/") ? row.image_url : undefined;
  return {
    path: `${source.route}/${slug}`, url: `${SITE_URL}/${source.route}/${slug}`, schema: source.schema, name,
    summary: row?.short_description ?? row?.excerpt ?? item.shortDescription ?? item.excerpt ?? "",
    description: row?.description ?? item.description ?? item.excerpt ?? "",
    image: remoteImage ?? resolveAsset(item.imageUrl ?? item.image),
    place: [item.destinationName, item.province ?? item.provinceName ?? item.city].filter(Boolean).join(", "),
    highlights: (Array.isArray(row?.highlights) ? row.highlights : item.highlights ?? item.activities ?? item.tags ?? []).filter((h) => typeof h === "string"),
    latitude: Number(row?.latitude ?? item.latitude ?? item.coordinates?.lat) || undefined,
    longitude: Number(row?.longitude ?? item.longitude ?? item.coordinates?.lng) || undefined,
    rating: Number(row?.rating ?? item.rating) || undefined,
    reviewCount: Number(row?.review_count ?? item.reviewCount) || 0,
  };
}

// ---------- Política de seguridad para los píxeles ----------

const PIXEL_SOURCES = {
  VITE_META_PIXEL_ID: { "script-src": ["https://connect.facebook.net"], "connect-src": ["https://www.facebook.com", "https://connect.facebook.net"], "img-src": ["https://www.facebook.com"] },
  VITE_TIKTOK_PIXEL_ID: { "script-src": ["https://analytics.tiktok.com"], "connect-src": ["https://analytics.tiktok.com"], "img-src": ["https://analytics.tiktok.com"] },
};

/** Añade a la política los dominios de los píxeles configurados. Sin identificadores, devuelve el HTML igual. */
export function allowPixels(html, env = process.env) {
  const extra = {};
  for (const [variable, sources] of Object.entries(PIXEL_SOURCES)) {
    if (!env[variable]?.trim()) continue;
    for (const [directive, hosts] of Object.entries(sources)) extra[directive] = [...(extra[directive] ?? []), ...hosts];
  }
  if (Object.keys(extra).length === 0) return html;
  return html.replace(/(<meta\s+http-equiv="Content-Security-Policy"\s+content=")([^"]*)(")/i, (_all, open, policy, close) => {
    const directives = policy.split(";").map((d) => d.trim()).filter(Boolean).map((d) => {
      const [name, ...values] = d.split(/\s+/);
      const add = (extra[name] ?? []).filter((host) => !values.includes(host));
      delete extra[name];
      return [name, ...values, ...add].join(" ");
    });
    for (const [name, hosts] of Object.entries(extra)) directives.push([name, "'self'", ...hosts].join(" "));
    return `${open}${directives.join("; ")};${close}`;
  });
}

// ---------- Ejecución ----------

async function main() {
  const indexFile = path.join(DIST, "index.html");
  if (!existsSync(indexFile)) throw new Error(`No existe ${indexFile}: ejecuta antes "vite build".`);
  const template = allowPixels(readFileSync(indexFile, "utf8"));
  if (!/<div id="root">\s*<\/div>/.test(template)) throw new Error('index.html no tiene <div id="root"></div> vacío: no se puede prerenderizar.');
  writeFileSync(indexFile, template);

  const data = await loadLocalData();
  const resolveAsset = hashedAssets(DIST);
  let total = 0;
  for (const source of SOURCES) {
    const items = data[source.file]?.[source.key];
    if (!Array.isArray(items)) throw new Error(`src/data/${source.file} no exporta la lista "${source.key}".`);
    const overrides = await loadApiOverrides(source.api);
    let written = 0;
    for (const item of items) {
      const page = toPage(source, item, overrides.get(item.slug), resolveAsset);
      if (!page) continue;
      const dir = path.join(DIST, page.path);
      mkdirSync(dir, { recursive: true });
      writeFileSync(path.join(dir, "index.html"), renderPage(template, page));
      written++;
    }
    total += written;
    console.log(`[postbuild] /${source.route}/:slug  ${String(written).padStart(3)} páginas${overrides.size ? " (textos del backend)" : ""}`);
  }
  const pixels = Object.keys(PIXEL_SOURCES).filter((v) => process.env[v]?.trim());
  console.log(`[postbuild] ${total} páginas prerenderizadas en ${path.relative(ROOT, DIST)}/ · píxeles en la política: ${pixels.length ? pixels.join(", ") : "ninguno"}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => { console.error(`[postbuild] ${err.message}`); process.exit(1); });
}
