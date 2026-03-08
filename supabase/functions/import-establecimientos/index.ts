import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function detectDelimiter(headerLine: string): string {
  // Check tab first (most common in TXT exports), then pipe, then comma
  if (headerLine.includes("\t")) return "\t";
  if (headerLine.includes("|")) return "|";
  return ",";
}

function parseLine(line: string, delimiter: string): string[] {
  if (delimiter === ",") return parseCsvLine(line);
  return line.split(delimiter).map((s) => s.trim());
}

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { csv_text } = await req.json();
    if (!csv_text) {
      return new Response(JSON.stringify({ error: "csv_text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lines = csv_text.split("\n").filter((l: string) => l.trim());
    if (lines.length < 2) {
      return new Response(JSON.stringify({ error: "File has no data rows" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auto-detect delimiter from header line
    const delimiter = detectDelimiter(lines[0]);
    console.log(`Detected delimiter: ${delimiter === "\t" ? "TAB" : delimiter}, total lines: ${lines.length}`);

    // Skip header
    const dataLines = lines.slice(1);

    const records = dataLines.map((line: string) => {
      const cols = parseLine(line, delimiter);
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

    // Insert in batches of 500
    let inserted = 0;
    const batchSize = 500;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const { error } = await supabase.from("establecimientos").insert(batch);
      if (error) {
        console.error("Batch insert error:", error);
        return new Response(
          JSON.stringify({ error: error.message, inserted }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      inserted += batch.length;
    }

    return new Response(
      JSON.stringify({ success: true, inserted, delimiter: delimiter === "\t" ? "tab" : delimiter }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
