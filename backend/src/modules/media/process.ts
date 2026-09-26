import sharp from "sharp";
import type { ImageMime } from "./images.js";

/** Anchos de las variantes (en webp). Nunca se agranda una imagen: si el original es menor, esa variante no existe y se usa el original. */
export const VARIANTS = { thumb: 320, medium: 800, large: 1600 } as const;
export type VariantName = keyof typeof VARIANTS;
const MAX_PIXELS = 60_000_000;

export interface Processed {
  original: { data: Buffer; width: number; height: number; mime: ImageMime };
  variants: { name: VariantName; data: Buffer; width: number; height: number; mime: "image/webp" }[];
  /** Falso si se conservó el archivo tal cual (gif, que puede ser animado). */
  sanitized: boolean;
}

/**
 * Decodifica y vuelve a codificar la imagen: descarta metadatos (EXIF con GPS, comentarios, miniaturas incrustadas), aplica la
 * orientación y neutraliza archivos "políglotas" (imagen válida con datos escondidos). Lanza si el archivo no se puede decodificar.
 */
export async function processImage(buf: Buffer, mime: ImageMime): Promise<Processed> {
  const opts = { limitInputPixels: MAX_PIXELS, failOn: "error" as const };
  if (mime === "image/gif") {
    // Se conserva el gif (puede ser animado), pero se comprueba que decodifique.
    const m = await sharp(buf, { ...opts, animated: true }).metadata();
    if (!m.width || !m.height) throw new Error("gif inválido");
    return { original: { data: buf, width: m.width, height: m.pageHeight ?? m.height, mime }, variants: [], sanitized: false };
  }
  const pipe = sharp(buf, opts).rotate();       // la orientación EXIF se aplica a los píxeles y la etiqueta desaparece
  const enc = mime === "image/png" ? pipe.png({ compressionLevel: 9 }) : mime === "image/webp" ? pipe.webp({ quality: 88 }) : pipe.jpeg({ quality: 88, mozjpeg: true });
  const { data, info } = await enc.toBuffer({ resolveWithObject: true });   // sin withMetadata(): no se copia ningún metadato
  const variants: Processed["variants"] = [];
  for (const [name, width] of Object.entries(VARIANTS) as [VariantName, number][]) {
    if (info.width <= width) continue;
    const v = await sharp(data, opts).resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer({ resolveWithObject: true });
    variants.push({ name, data: v.data, width: v.info.width, height: v.info.height, mime: "image/webp" });
  }
  return { original: { data, width: info.width, height: info.height, mime }, variants, sanitized: true };
}
