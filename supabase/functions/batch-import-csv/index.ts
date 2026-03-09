import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseRecords(csvText: string) {
  const lines = csvText.split("\n").filter((l: string) => l.trim());
  if (lines.length < 2) return [];

  const dataLines = lines.slice(1);
  return dataLines.map((line: string) => {
    const cols = parseCsvLine(line);
    const fechaRaw = cols[10] || "";
    let fecha: string | null = null;
    if (fechaRaw && /^\d{4}-\d{2}-\d{2}$/.test(fechaRaw)) {
      fecha = fechaRaw;
    }
    return {
      subsector: cols[0] || "Sin categoría",
      actividad: cols[1] || null,
      rut: cols[2] || null,
      numero_identificacion: cols[3] || null,
      nombre: cols[4] || "Sin nombre",
      sector_zona: cols[5] || null,
      provincia: cols[6] || null,
      estatus_proceso: cols[7] || null,
      estatus_licencia: cols[8] || null,
      estatus_establecimiento: cols[9] || null,
      fecha_vencimiento: fecha,
      telefono: cols[11] || null,
      correo: cols[12] || null,
      is_active: true,
    };
  }).filter((r: any) => r.nombre && r.nombre !== "Sin nombre");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { base_url } = await req.json();
    if (!base_url) {
      return new Response(JSON.stringify({ error: "base_url is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const files = [
      "turismo-aventura.csv",
      "gift-shops.csv",
      "hospedaje.csv",
      "agencias-viajes.csv",
      "alimentos-bebidas.csv",
    ];

    const results: { file: string; inserted: number; error?: string }[] = [];

    for (const file of files) {
      try {
        const url = `${base_url}/data/${file}`;
        console.log(`Fetching: ${url}`);
        const resp = await fetch(url);
        if (!resp.ok) {
          results.push({ file, inserted: 0, error: `HTTP ${resp.status}` });
          continue;
        }
        const csvText = await resp.text();
        const records = parseRecords(csvText);
        console.log(`${file}: ${records.length} records parsed`);

        let inserted = 0;
        const batchSize = 500;
        for (let i = 0; i < records.length; i += batchSize) {
          const batch = records.slice(i, i + batchSize);
          const { error } = await supabase.from("establecimientos").insert(batch);
          if (error) {
            console.error(`Batch error for ${file}:`, error);
            results.push({ file, inserted, error: error.message });
            break;
          }
          inserted += batch.length;
        }
        if (!results.find(r => r.file === file)) {
          results.push({ file, inserted });
        }
      } catch (err: any) {
        results.push({ file, inserted: 0, error: err.message });
      }
    }

    const totalInserted = results.reduce((s, r) => s + r.inserted, 0);
    return new Response(
      JSON.stringify({ success: true, total_inserted: totalInserted, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
