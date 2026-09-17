import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { SITE_URL, failure, supabaseForUser, text } from "../supabase";

export default defineTool({
  name: "search_destinations",
  title: "Buscar destinos",
  description:
    "Busca destinos turísticos de República Dominicana por nombre o palabra clave y devuelve su descripción y enlace.",
  inputSchema: {
    query: z
      .string()
      .trim()
      .optional()
      .describe("Texto a buscar en el nombre del destino, por ejemplo 'Samaná'."),
    limit: z.number().int().min(1).max(50).default(10),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return failure("Sesión no autenticada.");
    const db = supabaseForUser(ctx);
    let q = db
      .from("destinations")
      .select("name, slug, short_description, image_url")
      .limit(limit);
    if (query) q = q.ilike("name", `%${query}%`);
    const { data, error } = await q;
    if (error) return failure(error.message);
    return text(
      (data ?? []).map((d) => ({ ...d, url: `${SITE_URL}/destino/${d.slug}` })),
    );
  },
});
