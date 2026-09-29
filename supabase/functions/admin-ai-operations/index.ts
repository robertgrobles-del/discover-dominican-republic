import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, tone = "aventurero", entityType = "beaches" } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "El parámetro 'prompt' es requerido." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    let text = "";
    let highlights: string[] = [];

    if (GEMINI_API_KEY) {
      try {
        const systemInstruction = `Eres un redactor turístico profesional especializado en la República Dominicana para la plataforma "Descubre RD".
Tu objetivo es generar una descripción fascinante, cautivadora y con alto valor SEO para una entidad turística del tipo: ${entityType}.
Tono solicitado: ${tone}.
Devuelve la respuesta en formato JSON con la siguiente estructura:
{
  "text": "Descripción detallada y atractiva de 2 o 3 párrafos.",
  "highlights": ["Punto destacado 1", "Punto destacado 2", "Punto destacado 3"]
}`;

        const aiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GEMINI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gemini-2.5-flash",
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: `Genera una ficha turística para: ${prompt}` },
            ],
            response_format: { type: "json_object" }
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = JSON.parse(aiData.choices?.[0]?.message?.content || "{}");
          text = content.text || "";
          highlights = content.highlights || [];
        }
      } catch (e) {
        console.error("Fallo llamada a API IA, usando generador inteligente de respaldo:", e);
      }
    }

    // Fallback inteligente si no hay clave de API o si falló el servicio externo
    if (!text) {
      const name = prompt.split(",")[0]?.trim() || "Destino Turístico";
      const capName = name.charAt(0).toUpperCase() + name.slice(1);

      if (tone === "aventurero") {
        text = `¡Prepárate para una aventura inolvidable en ${capName}! Este rincón paradisíaco de la República Dominicana ofrece una experiencia auténtica y vibrante. Rodeado de paisajes impresionantes, es el escenario idóneo para viajeros que buscan reconectar con la naturaleza caribeña y vivir momentos memorables llenos de adrenalina y serenidad.`;
        highlights = [
          "Acceso a rutas ecológicas y senderismo guiado",
          "Aguas cristalinas y vistas panorámicas de ensueño",
          "Ambiente perfecto para fotografía y ecoturismo activo"
        ];
      } else if (tone === "lujoso") {
        text = `Descubre la elegancia y exclusividad en ${capName}. Diseñado para los gustos más exigentes, este destino destaca por su hospitalidad de clase mundial, gastronomía de autor y comodidades de primer nivel en el corazón del Caribe dominicano.`;
        highlights = [
          "Servicio personalizado y amenidades de alta gama",
          "Ubicación privilegiada con privacidad absoluta",
          "Experiencias culinarias gourmet y bienestar integral"
        ];
      } else {
        text = `Visita ${capName} y déjate envolver por los encantos de la República Dominicana. Una joya imprescindible que combina hospitalidad cálida, historia viva y una atmósfera relajante para disfrutar en familia o en pareja.`;
        highlights = [
          "Ubicación estratégica y fácil acceso",
          "Atención hospitalaria y ambiente acogedor",
          "Excelente gastronomía local y actividades para todos"
        ];
      }
    }

    return new Response(
      JSON.stringify({ text, highlights, success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Error al procesar la solicitud" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
