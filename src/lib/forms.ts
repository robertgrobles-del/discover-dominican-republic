import { z } from "zod";

// Mirrors backend/src/modules/forms/routes.ts newsletter subscribe contract.
export const newsletterSubscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  name: z.string().trim().max(80).optional(),
  lists: z.array(z.string().trim().min(1).max(40)).max(10).optional(),
  locale: z.enum(["es", "en", "fr", "de", "pt", "it"]).optional(),
  source: z.string().trim().max(60).optional(),
  website: z.string().max(200).optional(),
});

export const businessClaimDraftSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: z.string().trim().min(7).max(30),
  role: z.string().trim().min(2).max(80),
  miturLicense: z.string().trim().max(80),
  rnc: z.string().trim().max(30),
  notes: z.string().trim().max(1000),
});

export function getFormErrorMessage(error: unknown): string {
  if (typeof navigator !== "undefined" && !navigator.onLine) return "No hay conexión. Revisa tu red; tus datos siguen en el formulario y puedes reintentar.";
  const status = typeof error === "object" && error !== null && "status" in error ? Number(error.status) : 0;
  if (status === 400 || status === 422) return "Revisa los datos indicados e inténtalo de nuevo.";
  if (status === 409) return "Esta solicitud ya fue registrada. Actualiza la página si necesitas verificar su estado.";
  if (status === 413) return "El contenido supera el tamaño permitido. Reduce el archivo o el texto.";
  if (status === 429) return "Recibimos muchas solicitudes. Espera un momento antes de volver a intentarlo.";
  if (status >= 500) return "El servicio está temporalmente indisponible. Tus datos siguen en el formulario; vuelve a intentarlo.";
  return "No pudimos completar la solicitud. Tus datos siguen en el formulario; vuelve a intentarlo.";
}

/** Client-side guard for text imports; the receiving server must still validate content. */
export async function readValidatedTextFile(file: File, extensions: string[], maxBytes: number): Promise<string> {
  const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  if (!extensions.includes(extension)) throw new Error(`Formato no permitido. Usa: ${extensions.join(", ")}.`);
  if (file.size === 0) throw new Error("El archivo está vacío.");
  if (file.size > maxBytes) throw new Error(`El archivo supera el máximo de ${Math.floor(maxBytes / 1024 / 1024)} MB.`);
  const text = await file.text();
  if (text.includes("\0")) throw new Error("El archivo no parece ser texto válido.");
  return text;
}
