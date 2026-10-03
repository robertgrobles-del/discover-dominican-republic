// Auditoría de contraste WCAG de los colores del sistema de diseño (mejora 120 del plan de arquitectura).
// Lee los tokens HSL de src/index.css en cada tema y calcula el contraste de los pares texto/fondo que usa la interfaz.
// Uso: node scripts/check-contrast.mjs [--json] [--strict]
//   Sin --strict falla sólo si un par baja de su mínimo registrado en BASELINE (no empeorar).
//   Con --strict falla cualquier par por debajo de AA.
import { readFile } from "node:fs/promises";

const AA_TEXT = 4.5, AA_UI = 3, AAA_TEXT = 7;
/** [texto, fondo, mínimo exigido]. Los pares de interfaz (bordes, foco) sólo necesitan 3:1. */
const PAIRS = [
  ["foreground", "background", AA_TEXT], ["card-foreground", "card", AA_TEXT], ["popover-foreground", "popover", AA_TEXT],
  ["primary-foreground", "primary", AA_TEXT], ["secondary-foreground", "secondary", AA_TEXT], ["accent-foreground", "accent", AA_TEXT],
  ["muted-foreground", "muted", AA_TEXT], ["muted-foreground", "background", AA_TEXT], ["muted-foreground", "card", AA_TEXT],
  ["destructive-foreground", "destructive", AA_TEXT], ["sponsored-fg", "sponsored-bg", AA_TEXT], ["text-secondary", "surface", AA_TEXT],
  ["primary", "background", AA_UI], ["focus-ring", "background", AA_UI], ["border-strong", "background", AA_UI],
];
/** Pares que hoy no alcanzan AA, con su contraste actual: la auditoría impide que bajen más mientras se corrigen. */
const BASELINE = {
  ":root|destructive-foreground|destructive": 3.7, ":root|border-strong|background": 2.4,
  ".light|primary-foreground|primary": 2.6, ".light|accent-foreground|accent": 2.6, ".light|destructive-foreground|destructive": 3.7,
  ".light|primary|background": 2.5, ".light|border-strong|background": 2.3,
  'html[data-contrast="high"]|destructive-foreground|destructive': 3.7,
  'html[data-contrast="high"] .sol-de-playa|destructive-foreground|destructive': 3.7, 'html[data-contrast="high"] .sol-de-playa|border-strong|background': 2.4,
  ".sol-de-playa|destructive-foreground|destructive": 3.7, ".sol-de-playa|border-strong|background": 2.4,
};

function hslToRgb(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}
const luminance = (rgb) => rgb.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)).reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
export function contrast(a, b) {
  const [hi, lo] = [luminance(hslToRgb(...a)), luminance(hslToRgb(...b))].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Tokens `--nombre: H S% L%;` de cada bloque que define `--background`. El primero es el tema base; los demás lo heredan. */
export function parseThemes(css) {
  const themes = [];
  for (const block of css.matchAll(/([^{}]+)\{([^{}]*--background:[^{}]*)\}/g)) {
    const tokens = {};
    for (const m of block[2].matchAll(/--([a-z-]+):\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*;/g)) tokens[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
    themes.push({ selector: block[1].trim().split("\n").pop().trim(), tokens: themes.length ? { ...themes[0].tokens, ...tokens } : tokens });
  }
  return themes;
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop());
if (isMain) {
  const themes = parseThemes(await readFile(new URL("../src/index.css", import.meta.url), "utf8"));
  if (themes.length < 2) { console.error("No se encontraron los dos temas en src/index.css"); process.exit(2); }
  const strict = process.argv.includes("--strict");
  const rows = [];
  themes.forEach((theme) => {
    const name = theme.selector;
    for (const [fg, bg, min] of PAIRS) {
      if (!theme.tokens[fg] || !theme.tokens[bg]) continue;
      const ratio = Math.floor(contrast(theme.tokens[fg], theme.tokens[bg]) * 10) / 10;
      const floor = strict ? min : Math.min(min, BASELINE[`${name}|${fg}|${bg}`] ?? min);
      rows.push({ theme: name, text: fg, background: bg, ratio, required: min, level: ratio >= AAA_TEXT ? "AAA" : ratio >= min ? "AA" : "insuficiente", ok: ratio >= floor });
    }
  });
  if (process.argv.includes("--json")) console.log(JSON.stringify(rows, null, 2));
  else for (const r of rows) console.log(`${r.ok ? (r.level === "insuficiente" ? "~" : "✓") : "✗"} ${r.theme.padEnd(42)} ${`${r.text} sobre ${r.background}`.padEnd(46)} ${r.ratio.toFixed(1).padStart(5)}:1  (mínimo ${r.required}) ${r.level}`);
  const below = rows.filter((r) => r.level === "insuficiente"), failed = rows.filter((r) => !r.ok);
  console.log(`\n${rows.length} pares revisados · ${below.length} por debajo de AA · ${failed.length} fallan la auditoría${strict ? " (modo estricto)" : ""}`);
  process.exit(failed.length ? 1 : 0);
}
