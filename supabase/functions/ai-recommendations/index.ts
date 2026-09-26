import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    // Limpiar entradas: evita inyección de instrucciones y prompts gigantes
    const clean = (arr: unknown) =>
      (Array.isArray(arr) ? arr : [])
        .filter((v): v is string => typeof v === "string")
        .slice(0, 15)
        .map((v) => v.replace(/[\r\n`{}<>]/g, " ").slice(0, 60));
    const interests = clean(body?.interests);
    const visitedDestinations = clean(body?.visitedDestinations);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch available destinations, experiences, restaurants
    const [{ data: destinations }, { data: experiences }, { data: events }] = await Promise.all([
      supabase.from("destinations").select("name, slug, short_description, highlights").limit(30),
      supabase.from("experiences").select("name, slug, short_description, category, difficulty").eq("is_active", true).limit(20),
      supabase.from("events").select("name, slug, short_description, event_type, start_date").eq("is_active", true).limit(10),
    ]);

    const prompt = `Eres un asistente turístico de República Dominicana. Genera recomendaciones personalizadas.

Intereses del usuario: ${interests?.join(", ") || "no especificados"}
Destinos ya visitados: ${visitedDestinations?.join(", ") || "ninguno"}

Destinos disponibles: ${JSON.stringify(destinations?.map(d => ({ name: d.name, slug: d.slug, desc: d.short_description })))}
Experiencias disponibles: ${JSON.stringify(experiences?.map(e => ({ name: e.name, slug: e.slug, category: e.category })))}
Eventos próximos: ${JSON.stringify(events?.map(e => ({ name: e.name, slug: e.slug, type: e.event_type, date: e.start_date })))}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: "Dame 5 recomendaciones personalizadas con destinos, experiencias y eventos. Para cada una incluye: nombre, tipo (destino/experiencia/evento), slug, razón breve y nivel de match (1-5 estrellas)." }
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_recommendations",
            description: "Return personalized travel recommendations",
            parameters: {
              type: "object",
              properties: {
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      type: { type: "string", enum: ["destino", "experiencia", "evento"] },
                      slug: { type: "string" },
                      reason: { type: "string" },
                      match_score: { type: "number" }
                    },
                    required: ["name", "type", "slug", "reason", "match_score"]
                  }
                }
              },
              required: ["recommendations"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "return_recommendations" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes, intenta más tarde." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const text = await response.text();
      console.error("AI error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    let recommendations = [];

    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      recommendations = parsed.recommendations || [];
    }

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: "Error generando recomendaciones" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
