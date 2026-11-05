#!/usr/bin/env node
/**
 * Reúne los textos e imágenes editables de cada página y componente compartido (`pc.t`, `pc.tx`, `pc.img` y
 * `pc.data`, ver src/lib/pageContent.ts) en src/generated/pageContentRegistry.json, que usa el editor del panel.
 * Uso: node scripts/page-content-registry.cjs   (también lo ejecutan `npm run page-content` y `prebuild`)
 */
const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "src/generated/pageContentRegistry.json");
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith(".tsx") ? [path.join(dir, e.name)] : []));

// Las mismas reglas que applyData en src/lib/pageContent.ts: mantenerlas iguales.
const NOT_TEXT = new Set(["id", "slug", "key", "href", "link", "url", "to", "path", "route", "icon", "color", "colors", "className", "class", "variant", "gradient", "accent", "bg", "value", "type", "tipo", "category", "categoria", "region", "status", "code", "lang", "locale", "currency", "email", "phone", "telefono", "website", "size", "target", "rel", "categoryColor", "badgeColor", "iconColor", "bgColor", "textColor"]);
const IMAGE_KEYS = new Set(["image", "img", "src", "imagen", "foto", "photo", "heroImage", "cover", "coverImage", "avatar", "logo", "thumbnail", "poster", "backgroundImage", "banner", "picture", "imageUrl", "image_url"]);
const looksLikeText = (s) => /\p{L}{2,}/u.test(s) && !/^(\/|#|https?:|mailto:|tel:)/.test(s) && !/(^|\s)(bg|text|from|to|via|border|ring|shadow|hover|md|lg|sm|flex|grid|w|h|p|m)-[a-z0-9[]/.test(s) && !/^[a-z0-9]+([-_][a-z0-9]+)+$/.test(s);

// Rutas de cada página, para mostrarlas en el editor.
const routesOf = {};
for (const rf of [...fs.readdirSync(path.join(ROOT, "src/routes")).map((f) => path.join(ROOT, "src/routes", f)), path.join(ROOT, "src/App.tsx")]) {
  const s = fs.readFileSync(rf, "utf8");
  const comp = {};
  for (const m of s.matchAll(/const (\w+) = lazy\(\(\) => import\(["']@\/pages\/([A-Za-z0-9/]+)["']\)\)/g)) comp[m[1]] = m[2];
  for (const m of s.matchAll(/import (\w+) from ["']@\/pages\/([A-Za-z0-9/]+)["']/g)) comp[m[1]] = m[2];
  for (const m of s.matchAll(/<Route[^>]*path="([^"]+)"[^>]*element=\{<(\w+)/g)) {
    const file = comp[m[2]];
    if (file) (routesOf[file] ??= []).push(m[1]);
  }
}

const ID = "\u0000id:";
/** Evalúa los literales de datos del módulo. Un identificador (icono, imagen importada) queda como marca con su nombre. */
function moduleData(file, src, names) {
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const out = {};
  sf.forEachChild((st) => {
    if (!ts.isVariableStatement(st)) return;
    for (const d of st.declarationList.declarations) {
      if (!ts.isIdentifier(d.name) || !names.includes(d.name.text) || !d.initializer) continue;
      try {
        const js = ts.transpile(`(${d.initializer.getText(sf)})`, { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020 }).trim().replace(/;$/, "");
        const scope = new Proxy({}, { has: (_t, k) => !["Math", "JSON", "Number", "String", "Array", "Object", "Date", "undefined", "NaN", "Infinity"].includes(k), get: (_t, k) => (typeof k === "string" ? ID + k : undefined) });
        // eslint-disable-next-line no-new-func
        out[d.name.text] = new Function("scope", `with (scope) { return ${js}; }`)(scope);
      } catch { /* literal no evaluable (usa funciones del módulo): sus textos no se listan */ }
    }
  });
  return out;
}
/** Nombre con el que el editor presenta un elemento de una lista («Equipo › Roberto Guzmán»). */
const hintOf = (o) => {
  for (const k of ["name", "nombre", "title", "titulo", "label", "question", "pregunta", "servicio"]) if (typeof o[k] === "string" && !o[k].startsWith(ID)) return o[k].slice(0, 60);
  return undefined;
};
function collect(node, key, prop, texts, images, assets, hint) {
  if (typeof node === "string" && node.startsWith(ID)) {
    // Identificador: si ocupa un campo de imagen es una imagen importada; si no, un icono o similar.
    if (IMAGE_KEYS.has(prop)) images.push({ key, fallback: null, asset: assets[node.slice(ID.length)], kind: "data", hint });
  } else if (typeof node === "string") {
    if (IMAGE_KEYS.has(prop)) images.push({ key, fallback: /^(https?:|\/)/.test(node) ? node : null, kind: "data", hint });
    else if (!NOT_TEXT.has(prop) && looksLikeText(node)) texts.push({ key, fallback: node, kind: "data", hint });
  } else if (Array.isArray(node)) node.forEach((v, i) => collect(v, `${key}.${i}`, prop, texts, images, assets, hint));
  else if (node && typeof node === "object") {
    const h = hintOf(node) ?? hint;
    for (const [k, v] of Object.entries(node)) collect(v, `${key}.${k}`, k, texts, images, assets, h);
  }
}

const unq = (lit) => { try { return JSON.parse(lit); } catch { return lit; } };
const STR = String.raw`"(?:[^"\\]|\\.)*"`;
const pages = [];
const pagesDir = path.join(ROOT, "src/pages");
for (const file of [...walk(pagesDir), ...walk(path.join(ROOT, "src/components"))].sort()) {
  const s = fs.readFileSync(file, "utf8");
  const page = s.match(/usePageContent\(("[^"]+")\)/);
  if (!page) continue;
  const texts = [...s.matchAll(new RegExp(String.raw`pc\.tx?\((${STR}),\s*(${STR})\)`, "g"))].map((m) => ({ key: unq(m[1]), fallback: unq(m[2]) }));
  // Imágenes importadas: variable → archivo, para que el editor muestre la original.
  const assets = Object.fromEntries([...s.matchAll(/import (\w+) from ["']([^"']+\.(?:png|jpe?g|webp|avif|gif|svg))["']/gi)].map((m) => [m[1], m[2].split("/").pop()]));
  const seen = new Set();
  const images = [...s.matchAll(new RegExp(String.raw`pc\.img\((${STR}),\s*([^)]+)\)`, "g"))].map((m) => {
    const fb = m[2].trim();
    return { key: unq(m[1]), fallback: fb.startsWith('"') ? unq(fb) : null, asset: assets[fb] };
  }).filter((i) => !seen.has(i.key) && seen.add(i.key));
  // Sección de cada campo: el último título (h1/h2) que lo precede en la página; el SEO va aparte.
  {
    const at = new Map();
    for (const m of s.matchAll(new RegExp(String.raw`pc\.(?:tx?|img)\((${STR})`, "g"))) if (!at.has(unq(m[1]))) at.set(unq(m[1]), m.index);
    const ordered = [...texts, ...images].sort((a, b) => (at.get(a.key) ?? 0) - (at.get(b.key) ?? 0));
    let section = "Encabezado";
    for (const f of ordered) {
      if (/^h[12]\.\d+$/.test(f.key) && f.fallback) section = f.fallback.replace(/[:：]\s*$/, "").slice(0, 60);
      f.section = f.key.startsWith("SEOHead.") ? "SEO (título y descripción en buscadores)" : section;
    }
  }
  const names = [...s.matchAll(/const (\w+) = pc\.data\("\1", __pcData\.\1\);/g)].map((m) => m[1]);
  if (names.length) for (const [n, v] of Object.entries(moduleData(file, s, names))) collect(v, n, n, texts, images, assets);
  const name = path.basename(file, ".tsx");
  const shared = !file.startsWith(pagesDir);
  pages.push({ page: unq(page[1]), name, shared, routes: shared ? [] : routesOf[path.relative(pagesDir, file).replace(/\\/g, "/").replace(/\.tsx$/, "")] ?? [], texts, images });
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(pages) + "\n");
console.log(`${pages.length} páginas y componentes, ${pages.reduce((n, p) => n + p.texts.length, 0)} textos, ${pages.reduce((n, p) => n + p.images.length, 0)} imágenes → ${path.relative(ROOT, OUT)}`);
