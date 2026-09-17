import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { SITE_URL, failure, supabaseForUser, text } from "../supabase";

const TABLES = {
  restaurantes: { table: "restaurants", path: "restaurante" },
  bares: { table: "bars", path: "bar" },
  hoteles: { table: "hotels", path: "alojamiento" },
  playas: { table: "beaches", path: "playa" },
  experiencias: { table: "experiences", path: "experiencia" },
} as const;

export default defineTool({
  name: "search_places",
  title: "Buscar lugares y experiencias",
  description:
    "Busca restaurantes, bares, hoteles, playas o experiencias publicadas en el portal, con filtro por texto.",
  inputSchema: {
    kind: z
      .enum(["restaurantes", "bares", "hoteles", "playas", "experiencias"])
      .describe("Tipo de lugar a buscar."),
    query: z.string().trim().optional().describe("Texto a buscar en el nombre."),
    limit: z.number().int().min(1).max(50).default(10),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ kind, query, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return failure("Sesión no autenticada.");
    const { table, path } = TABLES[kind];
    const db = supabaseForUser(ctx);
    let q = db
      .from(table)
      .select("name, slug, short_description, rating, price_range")
      .limit(limit);
    if (query) q = q.ilike("name", `%${query}%`);
    const { data, error } = await q;
    if (error) return failure(error.message);
    return text(
      (data ?? []).map((row) => ({
        ...row,
        url: `${SITE_URL}/${path}/${row.slug}`,
      })),
    );
  },
});
