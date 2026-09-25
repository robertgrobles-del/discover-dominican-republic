import { z } from "zod";
import { AppError } from "./errors.js";

export const MAX_PER_PAGE = 100;

/** Parámetros comunes de listados (docs §3.4). */
export const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(MAX_PER_PAGE).default(24),
  q: z.string().trim().min(1).max(100).optional(),
  sort: z.string().max(100).optional(),
  lang: z.enum(["es", "en", "fr", "de", "pt", "it"]).optional(),
});

export interface SortSpec { column: string; dir: "ASC" | "DESC" }

/** `sort=-created_at,name` → lista blanca de columnas; una columna desconocida es un error 400. */
export function parseSort(raw: string | undefined, allowed: readonly string[], fallback: SortSpec[]): SortSpec[] {
  if (!raw) return fallback;
  const out: SortSpec[] = [];
  for (const part of raw.split(",").map((s) => s.trim()).filter(Boolean)) {
    const dir = part.startsWith("-") ? "DESC" : "ASC";
    const column = part.replace(/^[-+]/, "");
    if (!allowed.includes(column)) throw AppError.validation(`No se puede ordenar por "${column}"`, { allowed });
    out.push({ column, dir });
  }
  return out.length ? out : fallback;
}

export const pageMeta = (page: number, per_page: number, total: number) => ({
  page, per_page, total, total_pages: Math.max(1, Math.ceil(total / per_page)),
});
