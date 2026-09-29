// Script de un solo uso (Fase 10.17 del plan maestro): genera AVIF/WebP de la imagen hero del frontend usando el
// `sharp` que ya vive en backend/node_modules, sin agregar ninguna dependencia nueva al frontend.
// Uso: node scripts/gen-hero-variants.mjs
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, "../../src/assets/whale-samana.jpg");
const outDir = path.resolve(here, "../../src/assets");

const img = sharp(src);
const meta = await img.metadata();
console.log(`Origen: ${src} (${meta.width}x${meta.height}, ${meta.format})`);

await sharp(src).avif({ quality: 55 }).toFile(path.join(outDir, "whale-samana.avif"));
await sharp(src).webp({ quality: 70 }).toFile(path.join(outDir, "whale-samana.webp"));
console.log("Generados: whale-samana.avif, whale-samana.webp");
