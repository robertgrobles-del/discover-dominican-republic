import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { SITE_URL, failure, supabaseForUser, text } from "../supabase";

export default defineTool({
  name: "list_articles",
  title: "Artículos del blog",
  description:
    "Lista los artículos publicados del blog de viajes, opcionalmente filtrados por categoría o texto.",
  inputSchema: {
    query: z.string().trim().optional().describe("Texto a buscar en el título."),
    category: z.string().trim().optional().describe("Categoría exacta del artículo."),
    limit: z.number().int().min(1).max(50).default(10),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, category, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return failure("Sesión no autenticada.");
    const db = supabaseForUser(ctx);
    let q = db
      .from("articles")
      .select("title, slug, excerpt, category, author_name, published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(limit);
    if (query) q = q.ilike("title", `%${query}%`);
    if (category) q = q.eq("category", category);
    const { data, error } = await q;
    if (error) return failure(error.message);
    return text(
      (data ?? []).map((a) => ({ ...a, url: `${SITE_URL}/articulo/${a.slug}` })),
    );
  },
});
