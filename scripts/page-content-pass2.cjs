#!/usr/bin/env node
/**
 * Segundo pase de la conversión de páginas (ver src/lib/pageContent.ts). Sobre los archivos que ya usan
 * `usePageContent`:
 *  1. Los textos dentro de JSX pasan de `pc.t` a `pc.tx`, que oculta el elemento si el texto se vacía en el panel
 *     (las propiedades —alt, title, placeholder— siguen con `pc.t`, que devuelve una cadena).
 *  2. Las listas y objetos de datos definidos fuera del componente (tarjetas, pasos, preguntas frecuentes…) se
 *     envuelven con `pc.data("<nombre>", …)` dentro del componente, para que sus textos e imágenes sean editables.
 *  3. Las imágenes importadas que el componente usa fuera de un `src` (fondos CSS, listas internas) pasan por
 *     `pc.img("asset.<nombre>", …)`.
 * Es idempotente. Uso: node scripts/page-content-pass2.cjs [--dry] [archivo …]
 */
const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const ROOT = path.resolve(__dirname, "..");
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith(".tsx") ? [path.join(dir, e.name)] : []));
const unwrap = (n) => { while (n && (ts.isAsExpression(n) || ts.isSatisfiesExpression(n) || ts.isParenthesizedExpression(n) || ts.isTypeAssertionExpression?.(n))) n = n.expression; return n; };
const hasText = (node, sf) => {
  let found = false;
  const v = (n) => { if (found) return; if ((ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) && /\p{L}{2,}.*\s.*\p{L}{2,}|^\p{Lu}\p{L}+$/u.test(n.text)) found = true; else ts.forEachChild(n, v); };
  v(node);
  return found;
};

function convert(file, dry) {
  let src = fs.readFileSync(file, "utf8");
  if (!src.includes("usePageContent(")) return null;
  const before = src;
  // 1) Texto dentro de JSX → pc.tx (los atributos llevan `=` delante y se quedan con pc.t).
  src = src.replace(/(?<!=)\{pc\.t\(/g, "{pc.tx(");

  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  // Componente: el bloque que contiene `const pc = usePageContent(...)`.
  let pcStmt = null;
  const findPc = (n) => { if (pcStmt) return; if (ts.isVariableStatement(n) && /^const pc = usePageContent\(/.test(n.getText(sf))) pcStmt = n; else ts.forEachChild(n, findPc); };
  findPc(sf);
  if (!pcStmt || !ts.isBlock(pcStmt.parent)) return finish(file, before, src, dry, 0, 0);
  const body = pcStmt.parent;

  const images = new Set();
  for (const st of sf.statements) if (ts.isImportDeclaration(st) && /\.(png|jpe?g|webp|avif|gif|svg)$/i.test(st.moduleSpecifier.text) && st.importClause?.name) images.add(st.importClause.name.text);

  // Nombres ya declarados en el nivel superior del componente (no se pueden volver a declarar).
  const declared = new Set();
  for (const st of body.statements) if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) {
    const add = (name) => { if (ts.isIdentifier(name)) declared.add(name.text); else name.elements?.forEach((e) => e.name && add(e.name)); };
    add(d.name);
  }
  const already = new Set([...src.matchAll(/const (\w+) = pc\.data\("\1", __pcData\.\1\);/g)].map((m) => m[1]));

  // 2) Listas/objetos de datos del módulo usados dentro del componente.
  const candidates = new Map();
  for (const st of sf.statements) {
    if (!ts.isVariableStatement(st) || !(st.declarationList.flags & ts.NodeFlags.Const)) continue;
    for (const d of st.declarationList.declarations) {
      const init = unwrap(d.initializer);
      if (!ts.isIdentifier(d.name) || !init || d.name.text === "__pcData") continue;
      if (/Local$/.test(d.name.text)) continue; // respaldo de una colección del backend: se edita allí
      if ((ts.isArrayLiteralExpression(init) || ts.isObjectLiteralExpression(init)) && hasText(init, sf)) candidates.set(d.name.text, d);
    }
  }
  const used = new Set();
  const edits = [];
  const visit = (n) => {
    if (ts.isIdentifier(n)) {
      const p = n.parent;
      const isRef = !(ts.isPropertyAccessExpression(p) && p.name === n) && !(ts.isPropertyAssignment(p) && p.name === n) && !ts.isShorthandPropertyAssignment(p)
        && !(ts.isJsxAttribute(p) && p.name === n) && !ts.isTypeReferenceNode(p) && !ts.isTypeQueryNode(p) && !(ts.isVariableDeclaration(p) && p.name === n) && !ts.isBindingElement(p) && !(ts.isParameter(p) && p.name === n);
      if (isRef && candidates.has(n.text)) used.add(n.text);
      // 3) Imagen importada usada fuera de un pc.img(...)
      if (isRef && images.has(n.text)) {
        const call = ts.isCallExpression(p) && p.expression.getText(sf) === "pc.img";
        if (!call) edits.push([n.getStart(sf), n.getEnd(), `pc.img("asset.${n.text}", ${n.text})`]);
      }
    }
    ts.forEachChild(n, visit);
  };
  for (const st of body.statements) if (st !== pcStmt) visit(st);

  const fresh = [...used].filter((n) => !declared.has(n) && !already.has(n));
  if (fresh.length) {
    edits.push([pcStmt.getEnd(), pcStmt.getEnd(), fresh.map((n) => `\n  const ${n} = pc.data("${n}", __pcData.${n});`).join("")]);
  }
  edits.sort((a, b) => b[0] - a[0]);
  for (const [s, e, txt] of edits) src = src.slice(0, s) + txt + src.slice(e);
  if (fresh.length) {
    const all = [...already, ...fresh];
    src = src.replace(/\n\/\/ Datos del módulo editables[^\n]*\nconst __pcData = \{[^\n]*\};\n?/, "\n");
    src = `${src.replace(/\s*$/, "")}\n\n// Datos del módulo editables desde el panel (ver pc.data en src/lib/pageContent.ts).\nconst __pcData = { ${all.join(", ")} };\n`;
  }
  return finish(file, before, src, dry, fresh.length, edits.length - (fresh.length ? 1 : 0));
}
function finish(file, before, src, dry, data, imgs) {
  if (src !== before && !dry) fs.writeFileSync(file, src);
  return { file, changed: src !== before, data, imgs };
}

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const given = args.filter((a) => !a.startsWith("--")).map((f) => path.resolve(f));
const files = given.length ? given : [...walk(path.join(ROOT, "src/pages")), ...walk(path.join(ROOT, "src/components"))];
const res = files.map((f) => convert(f, dry)).filter(Boolean);
console.log(`${res.filter((r) => r.changed).length} archivos cambiados de ${res.length}; ${res.reduce((n, r) => n + r.data, 0)} listas de datos y ${res.reduce((n, r) => n + r.imgs, 0)} imágenes sueltas${dry ? " [simulación]" : ""}.`);
