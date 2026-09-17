import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { failure, supabaseForUser, text } from "../supabase";

export default defineTool({
  name: "list_my_favorites",
  title: "Mis favoritos",
  description: "Lista los lugares guardados como favoritos por la persona conectada.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).default(25),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) return failure("Sesión no autenticada.");
    const db = supabaseForUser(ctx);
    const { data, error } = await db
      .from("favorites")
      .select("item_type, item_name, item_location, item_id, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return failure(error.message);
    return text(data ?? []);
  },
});
