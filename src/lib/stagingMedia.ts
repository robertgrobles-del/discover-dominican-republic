// Subida de imágenes del panel de staging: se convierten a WebP en el navegador y se envían a /admin/media.
import { fetchApi } from "@/lib/fastifyClient";

const MAX_SIDE = 1920;                 // px del lado mayor; suficiente para portada y cuerpo
const MAX_BYTES = 2 * 1024 * 1024;     // mismo límite que el servidor (MAX_IMAGE_BYTES en api/index.ts)
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
export const IMAGE_ACCEPT = ACCEPTED.join(",");

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo convertir la imagen"))), "image/webp", quality));
}

/** Reduce la imagen y la convierte a WebP; baja la calidad hasta que quepa en el límite. */
export async function toWebp(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  if (!ACCEPTED.includes(file.type)) throw new Error("Formato no admitido: usa JPG, PNG, WebP, GIF o AVIF");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = Object.assign(document.createElement("canvas"), { width, height });
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  for (const quality of [0.85, 0.75, 0.6, 0.45]) {
    const blob = await toBlob(canvas, quality);
    // Un navegador sin codificador WebP devuelve PNG en silencio: mejor avisar que subir otro formato.
    if (blob.type !== "image/webp") throw new Error("Este navegador no puede convertir a WebP; usa Chrome, Edge o Firefox");
    if (blob.size <= MAX_BYTES) return { blob, width, height };
  }
  throw new Error("La imagen sigue pesando más de 2 MB tras comprimirla; usa una más pequeña");
}

export const toBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });

/** Convierte y sube; devuelve la URL pública de la imagen. */
export async function uploadImage(file: File, alt?: string): Promise<string> {
  const { blob, width, height } = await toWebp(file);
  const res = await fetchApi<{ data: { url: string } }>("/admin/media", {
    method: "POST",
    body: JSON.stringify({ data: await toBase64(blob), width, height, alt }),
  });
  return res.data.url;
}
