import { defineTool } from "@lovable.dev/mcp-js";
import { failure, supabaseForUser, text } from "../supabase";

export default defineTool({
  name: "get_my_travel_profile",
  title: "Mi perfil de viajero",
  description:
    "Devuelve el perfil de viajero de la persona conectada: nombre, idioma, intereses y progreso de gamificación.",
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_args, ctx) => {
    if (!ctx.isAuthenticated()) return failure("Sesión no autenticada.");
    const db = supabaseForUser(ctx);
    const userId = ctx.getUserId();

    const [profile, gamification] = await Promise.all([
      db
        .from("profiles")
        .select("display_name, bio, preferred_language, travel_interests")
        .eq("id", userId)
        .maybeSingle(),
      db
        .from("user_gamification")
        .select("total_xp, current_level, coins, streak_days, total_missions_completed")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

    if (profile.error) return failure(profile.error.message);
    if (gamification.error) return failure(gamification.error.message);

    return text({
      email: ctx.getUserEmail(),
      profile: profile.data,
      gamification: gamification.data,
    });
  },
});
