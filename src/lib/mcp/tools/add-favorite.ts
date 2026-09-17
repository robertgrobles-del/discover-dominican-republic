import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { failure, supabaseForUser, text } from "../supabase";

export default defineTool({
  name: "add_favorite",
  title: "Guardar favorito",
  description:
    "Guarda un lugar (destino, playa, hotel, restaurante, bar o experiencia) en los favoritos de la persona conectada.",
  inputSchema: {
    item_id: z.string().trim().min(1).describe("Identificador o slug del lugar."),
    item_type: z
      .enum(["destino", "playa", "hotel", "restaurante", "bar", "experiencia", "evento"])
      .describe("Tipo de lugar guardado."),
    item_name: z.string().trim().min(1).max(200).describe("Nombre visible del lugar."),
    item_location: z.string().trim().max(200).optional().describe("Ubicación del lugar."),
    item_image: z.string().trim().url().optional().describe("URL de la imagen del lugar."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return failure("Sesión no autenticada.");
    const db = supabaseForUser(ctx);
    const { data, error } = await db
      .from("favorites")
      .insert({ ...input, user_id: ctx.getUserId() })
      .select("id, item_name, item_type")
      .single();
    if (error) return failure(error.message);
    return text({ saved: data });
  },
});
