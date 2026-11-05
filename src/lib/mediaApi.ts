import { fetchApi } from "@/lib/fastifyClient";

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
/** Límites por uso: `PURPOSES` de backend/src/modules/media/routes.ts. */
export const MEDIA_LIMITS = { avatar: 2, review_photo: 5, ugc: 8, listing_image: 8, cms: 10 } as const;
export type MediaPurpose = keyof typeof MEDIA_LIMITS;

/**
 * Sube una foto en tres pasos (pedir la dirección firmada, enviar el archivo, confirmar). El servidor valida que sea
 * una imagen real y le quita los metadatos. Las fotos de usuarios pueden quedar `in_review` sin `url` hasta moderarse.
 */
export async function uploadMedia(file: File, purpose: MediaPurpose): Promise<{ asset_id: string; status: string; url?: string }> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) throw new Error(`«${file.name}» no es JPG, PNG, WebP ni GIF.`);
  if (file.size > MEDIA_LIMITS[purpose] * 1024 * 1024) throw new Error(`«${file.name}» pesa más de ${MEDIA_LIMITS[purpose]} MB.`);

  const ticket = await fetchApi<{ data: { asset_id: string; upload: { url: string; headers: Record<string, string> } } }>("/media/upload-url", {
    method: "POST",
    body: JSON.stringify({ mime: file.type, size: file.size, purpose, alt: file.name.replace(/\.[^.]+$/, "").slice(0, 200) }),
  });
  // La dirección firmada autoriza por sí sola: el archivo va crudo, sin sesión ni JSON.
  const put = await fetch(ticket.data.upload.url, { method: "PUT", headers: ticket.data.upload.headers, body: file });
  if (!put.ok) throw new Error(`No se pudo subir «${file.name}» (${put.status}).`);

  const done = await fetchApi<{ data: { status: string; url?: string } }>(`/media/${ticket.data.asset_id}/complete`, { method: "POST" });
  return { asset_id: ticket.data.asset_id, ...done.data };
}
