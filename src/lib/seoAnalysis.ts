// Análisis SEO de una noticia al estilo de Yoast/AIOSEO: hasta 3 palabras clave, dónde aparecen,
// cuántas veces y su densidad, más comprobaciones generales. Da una puntuación de 0 a 100.

export interface SeoInput {
  keywords: string[]; title: string; seoTitle: string; seoDescription: string; slug: string;
  excerpt: string; body: string; imageAlt: string; hasImage: boolean;
}
export interface SeoCheck { ok: boolean; warn?: boolean; text: string }
export interface KeywordReport {
  keyword: string; count: number; density: number;
  inTitle: boolean; inSlug: boolean; inAlt: boolean; inIntro: boolean; inDescription: boolean;
  checks: SeoCheck[]; score: number; // 0-100 de esta palabra
}
export interface SeoReport { score: number; words: number; keywords: KeywordReport[]; general: SeoCheck[] }

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const toSlug = (s: string) => fold(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Markdown → texto plano: sin imágenes, con el texto de los enlaces y sin símbolos de formato. */
export function plainText(md: string): string {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~|-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const wordsOf = (s: string) => fold(s).match(/[a-z0-9ñ]+/g) ?? [];

/** Veces que aparece la frase entera (palabra a palabra, sin tildes ni mayúsculas). */
export function countPhrase(text: string, phrase: string): number {
  const t = wordsOf(text), p = wordsOf(phrase);
  if (!p.length) return 0;
  let n = 0;
  for (let i = 0; i + p.length <= t.length; i++) if (p.every((w, j) => t[i + j] === w)) n++;
  return n;
}
const has = (text: string, phrase: string) => countPhrase(text, phrase) > 0;

export function analyzeSeo(i: SeoInput): SeoReport {
  const text = plainText(i.body);
  const words = wordsOf(text).length;
  const intro = plainText(i.body.split(/\n\s*\n/).find((p) => plainText(p).length > 0) ?? "");
  const title = i.seoTitle || i.title;
  const description = i.seoDescription || i.excerpt;

  const keywords = i.keywords.map((k) => k.trim()).filter(Boolean).slice(0, 3).map((keyword): KeywordReport => {
    const count = countPhrase(text, keyword);
    const density = words ? (count * wordsOf(keyword).length * 100) / words : 0;
    const r = {
      keyword, count, density,
      inTitle: has(title, keyword) || has(i.title, keyword),
      inSlug: toSlug(i.slug).includes(toSlug(keyword)),
      inAlt: has(i.imageAlt, keyword),
      inIntro: has(intro, keyword),
      inDescription: has(description, keyword),
    };
    const densityOk = density >= 0.5 && density <= 2.5;
    // [cumple, peso, texto]
    const rules: [boolean, number, string, boolean?][] = [
      [r.inTitle, 25, r.inTitle ? "Aparece en el título" : "No aparece en el título"],
      [r.inSlug, 15, r.inSlug ? "Aparece en el slug (URL)" : "No aparece en el slug (URL)"],
      [r.inIntro, 15, r.inIntro ? "Aparece en el primer párrafo" : "No aparece en el primer párrafo"],
      [r.inDescription, 10, r.inDescription ? "Aparece en la descripción" : "No aparece en la descripción para buscadores"],
      [r.inAlt, 10, r.inAlt ? "Aparece en el texto alternativo de la imagen" : "No aparece en el texto alternativo de la imagen"],
      [densityOk, 25,
        count === 0 ? "No aparece en el contenido"
          : density > 2.5 ? `Densidad ${density.toFixed(1)} %: demasiado alta, puede parecer relleno (ideal 0,5–2,5 %)`
          : density < 0.5 ? `Densidad ${density.toFixed(1)} %: baja (ideal 0,5–2,5 %)`
          : `Densidad ${density.toFixed(1)} %: correcta`,
        count > 0 && !densityOk],
    ];
    return {
      ...r,
      checks: rules.map(([ok, , t, warn]) => ({ ok, warn, text: t })),
      score: rules.reduce((s, [ok, w]) => s + (ok ? w : 0), 0),
    };
  });

  const general: [boolean, number, string][] = [
    [title.length >= 30 && title.length <= 65, 10, `Título para buscadores: ${title.length} caracteres (ideal 30–65)`],
    [description.length >= 120 && description.length <= 160, 10, `Descripción: ${description.length} caracteres (ideal 120–160)`],
    [words >= 300, 10, `Contenido: ${words} palabras (mínimo recomendado 300)`],
    [i.hasImage && i.imageAlt.trim().length > 0, 5, i.hasImage ? (i.imageAlt.trim() ? "La imagen destacada tiene texto alternativo" : "Falta el texto alternativo de la imagen") : "Falta la imagen destacada"],
    [/\]\([^)]+\)/.test(i.body.replace(/!\[[^\]]*\]\([^)]*\)/g, "")), 5, "Incluye al menos un enlace"],
  ];
  const generalScore = general.reduce((s, [ok, w]) => s + (ok ? w : 0), 0); // sobre 40
  const kwScore = keywords.length ? keywords.reduce((s, k) => s + k.score, 0) / keywords.length : 0; // sobre 100
  return {
    score: Math.round(generalScore + kwScore * 0.6),
    words, keywords,
    general: general.map(([ok, , t]) => ({ ok, text: t })),
  };
}

export const scoreTone = (n: number) =>
  n >= 70 ? "border-emerald-600 text-emerald-700 dark:text-emerald-400" : n >= 45 ? "border-amber-500 text-amber-700 dark:text-amber-400" : "border-red-600 text-red-700 dark:text-red-400";

/** Palabras clave guardadas como "a|b|c". */
export const splitKeywords = (v: string | null | undefined) => (v ?? "").split("|").slice(0, 3);

