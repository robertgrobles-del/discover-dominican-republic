/**
 * Lectura de imágenes sin librerías: detecta el formato por sus primeros bytes (no por lo que diga el cliente) y extrae sus dimensiones
 * de la cabecera. Sirve para validar lo que realmente se subió y para descartar archivos que sólo fingen ser imágenes.
 */
export type ImageMime = "image/jpeg" | "image/png" | "image/webp" | "image/gif";
export interface ImageInfo { mime: ImageMime; width: number; height: number }

export function sniffMime(b: Buffer): ImageMime | null {
  if (b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length >= 12 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  if (b.length >= 6 && (b.toString("ascii", 0, 6) === "GIF87a" || b.toString("ascii", 0, 6) === "GIF89a")) return "image/gif";
  return null;
}

export function readImage(b: Buffer): ImageInfo | null {
  const mime = sniffMime(b);
  if (!mime) return null;
  try {
    if (mime === "image/png") return b.length >= 24 && b.toString("ascii", 12, 16) === "IHDR" ? { mime, width: b.readUInt32BE(16), height: b.readUInt32BE(20) } : null;
    if (mime === "image/gif") return b.length >= 10 ? { mime, width: b.readUInt16LE(6), height: b.readUInt16LE(8) } : null;
    if (mime === "image/jpeg") {
      let o = 2;
      while (o + 9 < b.length) {
        if (b[o] !== 0xff) { o++; continue; }
        const marker = b[o + 1]!;
        if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { o += 2; continue; }
        const len = b.readUInt16BE(o + 2);
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) return { mime, height: b.readUInt16BE(o + 5), width: b.readUInt16BE(o + 7) };
        if (len < 2) return null;
        o += 2 + len;
      }
      return null;
    }
    // WebP: VP8 (con pérdida), VP8L (sin pérdida) o VP8X (extendido).
    const chunk = b.toString("ascii", 12, 16);
    if (chunk === "VP8 " && b.length >= 30) return { mime, width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
    if (chunk === "VP8L" && b.length >= 25) { const bits = b.readUInt32LE(21); return { mime, width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }; }
    if (chunk === "VP8X" && b.length >= 30) return { mime, width: 1 + (b[24]! | (b[25]! << 8) | (b[26]! << 16)), height: 1 + (b[27]! | (b[28]! << 8) | (b[29]! << 16)) };
  } catch { return null; }
  return null;
}
