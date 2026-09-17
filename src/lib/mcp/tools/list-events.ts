import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { SITE_URL, failure, supabaseForUser, text } from "../supabase";

export default defineTool({
  name: "list_upcoming_events",
  title: "Próximos eventos",
  description:
    "Lista los próximos eventos activos en República Dominicana con fecha, lugar y enlace.",
  inputSchema: {
    from: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe("Fecha mínima en formato YYYY-MM-DD. Por defecto hoy."),
    limit: z.number().int().min(1).max(50).default(10),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ from, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return failure("Sesión no autenticada.");
    const start = from ?? new Date().toISOString().slice(0, 10);
    const db = supabaseForUser(ctx);
    const { data, error } = await db
      .from("events")
      .select("name, slug, short_description, start_date, end_date, venue, address, price_range")
      .eq("is_active", true)
      .gte("start_date", start)
      .order("start_date", { ascending: true })
      .limit(limit);
    if (error) return failure(error.message);
    return text(
      (data ?? []).map((e) => ({ ...e, url: `${SITE_URL}/evento/${e.slug}` })),
    );
  },
});
