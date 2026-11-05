#!/usr/bin/env node
/**
 * Convierte páginas para que sus textos e imágenes se editen desde el panel (ver src/lib/pageContent.ts).
 *
 * Dentro del componente exportado por defecto de cada página:
 *  - cada texto visible de JSX pasa a `{pc.t("p.3", "texto original")}`;
 *  - las propiedades de texto (alt, title, subtitle, description, placeholder, label…) con un literal pasan a
 *    `pc.t(...)`;
 *  - `src`/`image`/`backgroundImage`… con una imagen importada o una ruta literal pasan a `pc.img(...)`;
 *  - se añade `const pc = usePageContent("<página>")` al principio del componente.
 * El texto original queda como respaldo, así que la página se ve igual mientras nadie lo edite.
 *
 * Uso: node scripts/page-content-codemod.cjs [--dry] [archivo.tsx …]   (sin archivos: todas las páginas públicas)
 * Es idempotente: una página que ya usa `usePageContent` se omite.
 */
const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const ROOT = path.resolve(__dirname, "..");
const TEXT_ATTRS = new Set(["alt", "title", "subtitle", "description", "placeholder", "aria-label", "label", "heading", "badge", "eyebrow", "cta", "ctaText", "ctaLabel", "buttonText", "caption", "tagline", "summary", "text"]);
const IMAGE_ATTRS = new Set(["src", "image", "imageUrl", "img", "backgroundImage", "heroImage", "poster", "bgImage", "cover", "coverImage"]);
const SKIP_TAGS = new Set(["style", "script", "code", "pre", "SEOHead"]);
const SEO_ATTRS = new Set(["title", "description"]); // SEOHead sí se convierte, sólo estas dos

const pageSlug = (file) => path.basename(file).replace(/\.tsx$/, "").replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z])([A-Z][a-z])/g, "$1-$2").toLowerCase();
const hasLetters = (s) => /\p{L}{2,}/u.test(s);
/** El texto JSX admite entidades HTML; en una cadena se verían tal cual. */
const ENTITIES = { quot: '"', amp: "&", lt: "<", gt: ">", apos: "'", nbsp: " ", copy: "©", bull: "•", larr: "←", rarr: "→", middot: "·", mdash: "—", ndash: "–", hellip: "…" };
const decode = (s) => s.replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (m, e) => e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : ENTITIES[e.toLowerCase()] ?? m);

function publicPageFiles() {
  const files = new Set();
  const routeFiles = ["touristRoutes", "institutionalRoutes", "planningRoutes", "storeRoutes"].map((f) => path.join(ROOT, "src/routes", `${f}.tsx`));
  for (const rf of [...routeFiles, path.join(ROOT, "src/App.tsx")]) {
    const s = fs.readFileSync(rf, "utf8");
    for (const m of s.matchAll(/import\(["']@\/pages\/([A-Za-z0-9/]+)["']\)|from ["']@\/pages\/([A-Za-z0-9/]+)["']/g)) {
      const rel = m[1] ?? m[2];
      const f = path.join(ROOT, "src/pages", `${rel}.tsx`);
      if (fs.existsSync(f)) files.add(f);
    }
  }
  // Pantallas de administración, cuenta o pago: no son contenido editorial.
  for (const f of [...files]) if (/Admin|Checkout|NotFound/.test(path.basename(f))) files.delete(f);
  return [...files].sort();
}

function tagName(node) {
  const t = ts.isJsxElement(node) ? node.openingElement.tagName : node.tagName;
  return t.getText().replace(/\W+/g, "_");
}

function findComponent(sf) {
  let name = null;
  let comp = null;
  for (const st of sf.statements) {
    if (ts.isFunctionDeclaration(st) && st.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)) return st.body ? st : null;
    if (ts.isExportAssignment(st) && ts.isIdentifier(st.expression)) name = st.expression.text;
  }
  if (!name) {
    // Componentes compartidos (Header, Footer…): la exportación con nombre cuyo nombre coincide con el archivo.
    const base = path.basename(sf.fileName).replace(/\.tsx$/, "");
    for (const st of sf.statements) {
      const exported = st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      if (exported && ts.isFunctionDeclaration(st) && st.name?.text === base && st.body) return st;
      if (exported && ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name) && d.name.text === base) name = base;
    }
    if (!name) return null;
  }
  for (const st of sf.statements) {
    if (ts.isFunctionDeclaration(st) && st.name?.text === name) comp = st;
    if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) {
      if (ts.isIdentifier(d.name) && d.name.text === name && d.initializer) {
        let init = d.initializer;
        if (ts.isCallExpression(init) && init.arguments[0]) init = init.arguments[0]; // memo(() => …)
        if ((ts.isArrowFunction(init) || ts.isFunctionExpression(init)) && init.body && ts.isBlock(init.body)) comp = init;
      }
    }
  }
  return comp && comp.body && ts.isBlock(comp.body) ? comp : null;
}

function convert(file, dry) {
  const src = fs.readFileSync(file, "utf8");
  if (src.includes("usePageContent(")) return { file, skipped: "ya convertida" };
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const comp = findComponent(sf);
  if (!comp) return { file, skipped: "sin componente por defecto con cuerpo" };
  const imported = new Set();
  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st) && /\.(png|jpe?g|webp|avif|gif|svg)$/i.test(st.moduleSpecifier.text) && st.importClause?.name) imported.add(st.importClause.name.text);
  }
  const edits = [];
  const counters = {};
  const key = (base) => `${base}.${(counters[base] = (counters[base] ?? 0) + 1)}`;
  const q = (s) => JSON.stringify(s);
  let texts = 0, images = 0;

  const visit = (node, skip) => {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = tagName(node);
      const opening = ts.isJsxElement(node) ? node.openingElement : node;
      const isSeo = tag === "SEOHead";
      for (const attr of opening.attributes.properties) {
        if (!ts.isJsxAttribute(attr) || !attr.initializer) continue;
        const an = attr.name.getText();
        const init = attr.initializer;
        const lit = ts.isStringLiteral(init) ? init.text : ts.isJsxExpression(init) && init.expression && (ts.isStringLiteral(init.expression) || ts.isNoSubstitutionTemplateLiteral(init.expression)) ? init.expression.text : null;
        if ((isSeo ? SEO_ATTRS.has(an) : TEXT_ATTRS.has(an)) && lit !== null && hasLetters(lit) && !skip) {
          edits.push([init.getStart(sf), init.getEnd(), `{pc.t(${q(key(`${tag}.${an}`))}, ${q(ts.isStringLiteral(init) ? decode(lit) : lit)})}`]);
          texts++;
        } else if (IMAGE_ATTRS.has(an) && !skip) {
          if (lit !== null && /^(\/|https?:\/\/).+\.(png|jpe?g|webp|avif|gif|svg)(\?.*)?$/i.test(lit)) {
            edits.push([init.getStart(sf), init.getEnd(), `{pc.img(${q(key(`${tag}.${an}`))}, ${q(lit)})}`]);
            images++;
          } else if (ts.isJsxExpression(init) && init.expression && ts.isIdentifier(init.expression) && imported.has(init.expression.text)) {
            edits.push([init.getStart(sf), init.getEnd(), `{pc.img(${q(key(`${tag}.${an}`))}, ${init.expression.text})}`]);
            images++;
          }
        }
      }
      const childSkip = skip || SKIP_TAGS.has(tag);
      if (ts.isJsxElement(node)) {
        for (const ch of node.children) {
          if (ts.isJsxText(ch) && !childSkip) {
            const raw = ch.getFullText(sf);
            if (!hasLetters(raw)) continue;
            const norm = decode(raw.replace(/\s+/g, " ").trim());
            const lead = /^\s/.test(raw) && !/^\s*\n/.test(raw) ? `{" "}` : "";
            const trail = /\s$/.test(raw) && !/\n\s*$/.test(raw) ? `{" "}` : "";
            edits.push([ch.getFullStart(), ch.getEnd(), `${lead}{pc.t(${q(key(tag))}, ${q(norm)})}${trail}`]);
            texts++;
          } else visit(ch, childSkip);
        }
        for (const a of opening.attributes.properties) ts.forEachChild(a, (c) => visit(c, skip));
        return;
      }
      ts.forEachChild(node, (c) => visit(c, skip));
      return;
    }
    ts.forEachChild(node, (c) => visit(c, skip));
  };
  visit(comp.body, false);
  if (!edits.length) return { file, skipped: "sin textos ni imágenes en el componente" };

  const slug = pageSlug(file);
  edits.push([comp.body.getStart(sf) + 1, comp.body.getStart(sf) + 1, `\n  const pc = usePageContent(${q(slug)});`]);
  const lastImport = [...sf.statements].filter(ts.isImportDeclaration).pop();
  const at = lastImport ? lastImport.getEnd() : 0;
  edits.push([at, at, `\nimport { usePageContent } from "@/lib/pageContent";`]);
  edits.sort((a, b) => b[0] - a[0] || b[1] - a[1]);
  let out = src;
  for (const [s, e, txt] of edits) out = out.slice(0, s) + txt + out.slice(e);
  if (!dry) fs.writeFileSync(file, out);
  return { file, slug, texts, images };
}

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const files = args.filter((a) => !a.startsWith("--")).map((f) => path.resolve(f));
const results = (files.length ? files : publicPageFiles()).map((f) => convert(f, dry));
let t = 0, i = 0;
for (const r of results) {
  if (r.skipped) console.log(`omitida  ${path.relative(ROOT, r.file)}: ${r.skipped}`);
  else { t += r.texts; i += r.images; }
}
const done = results.filter((r) => !r.skipped);
console.log(`\n${done.length} páginas convertidas (${t} textos, ${i} imágenes)${dry ? " [simulación]" : ""}; ${results.length - done.length} omitidas.`);
