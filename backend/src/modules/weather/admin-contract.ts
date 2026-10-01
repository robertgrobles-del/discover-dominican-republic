import { z } from "zod";

export const pageQuery = z.object({ page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(200).default(50) });
export const idParams = z.object({ id: z.string().uuid() });
export const weatherSnapshotBody = z.object({
  location_slug: z.string().max(10_000).optional(), location_name: z.string().max(10_000).optional(),
  temperature_c: z.number().finite().optional(), feels_like_c: z.number().finite().nullable().optional(),
  humidity: z.number().int().nullable().optional(), wind_kmh: z.number().finite().nullable().optional(),
  condition: z.string().max(10_000).optional(), icon: z.string().max(10_000).nullable().optional(),
  forecast: z.any().optional().refine((value) => JSON.stringify(value ?? null).length <= 100_000, "JSON demasiado grande"),
  source: z.string().max(10_000).optional(), observed_at: z.string().datetime({ offset: true }).optional(),
}).strict();
