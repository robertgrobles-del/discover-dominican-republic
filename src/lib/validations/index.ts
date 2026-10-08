import { z } from "zod";

// ─── Autenticación ────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo electrónico es requerido")
    .email("Formato de correo electrónico inválido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100, "Contraseña demasiado larga"),
});

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo electrónico es requerido")
    .email("Formato de correo electrónico inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(100, "Contraseña demasiado larga"),
  display_name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(80, "Nombre demasiado largo")
    .optional(),
});

// ─── DGII: RNC y NCF Dominicanos ──────────────────────────────────────────────

/**
 * Valida un RNC o Cédula dominicana:
 * - RNC Persona Jurídica / Sociedad: 9 dígitos numéricos.
 * - Cédula / Persona Física: 11 dígitos numéricos (con o sin guiones).
 */
export const rncSchema = z
  .string()
  .trim()
  .transform((val) => val.replace(/\D/g, ""))
  .refine((val) => val.length === 9 || val.length === 11, {
    message: "El RNC debe contener exactamente 9 u 11 dígitos numéricos.",
  });

/**
 * Valida la estructura oficial de NCF emitida por la DGII:
 * - Serie B (B01, B02, B14, B15 + 8 dígitos)
 * - Serie E (E31, E32, E44, E45 + 10 dígitos)
 */
export const ncfSchema = z
  .string()
  .trim()
  .toUpperCase()
  .refine(
    (val) => {
      const bSeries = /^B(01|02|03|04|11|12|13|14|15|16)\d{8}$/;
      const eSeries = /^E(31|32|33|34|41|42|43|44|45)\d{10}$/;
      return bSeries.test(val) || eSeries.test(val);
    },
    {
      message: "Formato de Comprobante Fiscal (NCF/e-CF) inválido ante la DGII.",
    }
  );

// ─── Registro de Establecimientos ─────────────────────────────────────────────

export const establishmentRegistrationSchema = z.object({
  tipo_establecimiento: z.enum([
    "general",
    "restaurante",
    "bar",
    "hotel",
    "airbnb",
    "tour",
    "spa",
    "tienda",
  ]),
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre del establecimiento es requerido")
    .max(150, "El nombre no puede exceder 150 caracteres"),
  responsable: z
    .string()
    .trim()
    .min(2, "El nombre del responsable es requerido")
    .max(120, "El nombre del responsable no puede exceder 120 caracteres"),
  email: z
    .string()
    .trim()
    .min(1, "El correo de contacto es requerido")
    .email("Correo electrónico inválido"),
  telefono: z
    .string()
    .trim()
    .min(8, "El teléfono debe tener al menos 8 caracteres")
    .max(25, "Teléfono inválido"),
  direccion: z
    .string()
    .trim()
    .min(5, "La dirección física es requerida")
    .max(250, "La dirección es demasiado larga"),
  provincia: z
    .string()
    .trim()
    .min(2, "Debe seleccionar una provincia válida"),
  website: z.string().trim().max(200).optional().nullable(),
  foto_url: z.string().trim().max(500).optional().nullable(),
  descripcion: z
    .string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(2000, "La descripción no puede exceder 2000 caracteres"),
  rnc: z.string().trim().max(20).optional().nullable(),
  horario: z.string().trim().max(120).optional().nullable(),
  detalles: z.record(z.any()).optional().default({}),
});

// ─── Mensajes de Contacto / Cotizaciones ───────────────────────────────────────

export const contactMessageSchema = z.object({
  nombre: z.string().trim().min(2, "Nombre requerido").max(100),
  email: z.string().trim().email("Email inválido"),
  telefono: z.string().trim().max(25).optional(),
  asunto: z.string().trim().min(3, "Asunto requerido").max(150),
  mensaje: z.string().trim().min(10, "El mensaje debe tener al menos 10 caracteres").max(3000),
});
