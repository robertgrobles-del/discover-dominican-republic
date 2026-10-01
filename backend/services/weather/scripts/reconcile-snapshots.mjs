#!/usr/bin/env node
import pg from "pg";

const { Client } = pg;
const args = new Set(process.argv.slice(2));
const allowed = new Set(["--apply", "--verify", "--replace", "--help"]);
for (const arg of args) if (!allowed.has(arg)) throw new Error(`Argumento no reconocido: ${arg}`);
if (args.has("--help") && args.size > 1) throw new Error("--help no se combina con otras opciones.");
if (args.has("--verify") && args.size > 1) throw new Error("--verify no se combina con otras opciones.");
if (args.has("--replace") && !args.has("--apply")) throw new Error("--replace sólo se permite junto con --apply.");

if (args.has("--help")) {
  console.log("Uso: node scripts/reconcile-snapshots.mjs [--apply [--replace]|--verify]");
  console.log("Requiere WEATHER_SOURCE_DATABASE_URL y WEATHER_TARGET_DATABASE_URL (el destino debe ser el WEATHER_DATABASE_URL del servicio).");
  console.log("Sin opción sólo muestra conteos; --apply copia y verifica dentro de una transacción; --verify exige igualdad exacta.");
  console.log("--replace (sólo con --apply) elimina del destino las filas ausentes en el origen; requiere WEATHER_REPLACE_TARGET_CONFIRM igual al nombre exacto de la base destino.");
  process.exit(0);
}

const sourceUrl = process.env.WEATHER_SOURCE_DATABASE_URL;
const targetUrl = process.env.WEATHER_TARGET_DATABASE_URL;
if (!sourceUrl || !targetUrl) throw new Error("Define WEATHER_SOURCE_DATABASE_URL y WEATHER_TARGET_DATABASE_URL.");
if (sourceUrl === targetUrl) throw new Error("Origen y destino no pueden usar el mismo URL.");

const fields = ["id", "location_slug", "location_name", "temperature_c", "feels_like_c", "humidity", "wind_kmh", "condition", "icon", "forecast", "source", "observed_at", "updated_at"];
const projection = `id::text AS id, location_slug, location_name, temperature_c::text AS temperature_c, feels_like_c::text AS feels_like_c, humidity, wind_kmh::text AS wind_kmh, condition, icon, forecast::text AS forecast, source, to_char(observed_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS observed_at, to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS updated_at`;

async function identity(client) {
  return (await client.query("SELECT current_database() AS db, current_user AS usr, coalesce(inet_server_addr()::text, 'local-socket') AS host, coalesce(inet_server_port(), 0) AS port")).rows[0];
}

function normalize(row) {
  return Object.fromEntries(fields.map((field) => [field, field === "forecast" ? JSON.stringify(JSON.parse(row[field])) : row[field] === null ? null : String(row[field])]));
}

function compare(sourceRows, targetRows) {
  const targetBySlug = new Map(targetRows.map((row) => [row.location_slug, row]));
  const mismatches = [];
  for (const source of sourceRows) {
    const target = targetBySlug.get(source.location_slug);
    if (!target) { mismatches.push(`${source.location_slug}: ausente en destino`); continue; }
    const left = normalize(source), right = normalize(target);
    const changed = fields.filter((field) => left[field] !== right[field]);
    if (changed.length) mismatches.push(`${source.location_slug}: distinto en ${changed.join(", ")}`);
    targetBySlug.delete(source.location_slug);
  }
  for (const slug of targetBySlug.keys()) mismatches.push(`${slug}: sólo existe en destino`);
  return mismatches;
}

const source = new Client({ connectionString: sourceUrl, application_name: "descubre-weather-reconcile-source" });
const target = new Client({ connectionString: targetUrl, application_name: "descubre-weather-reconcile-target" });
let inTransaction = false;
try {
  await Promise.all([source.connect(), target.connect()]);
  const [sourceId, targetId] = await Promise.all([identity(source), identity(target)]);
  if (sourceId.db === targetId.db && sourceId.host === targetId.host && sourceId.port === targetId.port) {
    throw new Error("Origen y destino resuelven al mismo servidor y base; se cancela para evitar una falsa extracción.");
  }
  if (args.has("--replace") && process.env.WEATHER_REPLACE_TARGET_CONFIRM !== targetId.db) {
    throw new Error(`Modo destructivo cancelado: define WEATHER_REPLACE_TARGET_CONFIRM exactamente como el nombre de la base destino (${targetId.db}).`);
  }
  const sourceRows = (await source.query(`SELECT ${projection} FROM public.weather_snapshots ORDER BY location_slug`)).rows;
  const targetRows = (await target.query(`SELECT ${projection} FROM public.weather_snapshots ORDER BY location_slug`)).rows;
  console.log(`Origen ${sourceId.db}: ${sourceRows.length} filas; destino ${targetId.db}: ${targetRows.length} filas.`);

  if (args.has("--apply")) {
    if (!sourceRows.length) throw new Error("El origen no tiene filas; no se aplica una reconciliación vacía.");
    await target.query("BEGIN");
    inTransaction = true;
    for (const row of sourceRows) {
      await target.query(
        `INSERT INTO public.weather_snapshots (${fields.join(", ")}) VALUES ($1::uuid,$2,$3,$4::numeric,$5::numeric,$6,$7::numeric,$8,$9,$10::jsonb,$11,$12::timestamptz,$13::timestamptz)
         ON CONFLICT (location_slug) DO UPDATE SET id = EXCLUDED.id, location_name = EXCLUDED.location_name, temperature_c = EXCLUDED.temperature_c, feels_like_c = EXCLUDED.feels_like_c, humidity = EXCLUDED.humidity, wind_kmh = EXCLUDED.wind_kmh, condition = EXCLUDED.condition, icon = EXCLUDED.icon, forecast = EXCLUDED.forecast, source = EXCLUDED.source, observed_at = EXCLUDED.observed_at, updated_at = EXCLUDED.updated_at`,
        fields.map((field) => row[field]),
      );
    }
    if (args.has("--replace")) {
      const slugs = sourceRows.map((row) => row.location_slug);
      const deleted = await target.query("DELETE FROM public.weather_snapshots WHERE NOT (location_slug = ANY($1::text[]))", [slugs]);
      console.log(`Filas extras eliminadas del destino: ${deleted.rowCount ?? 0}.`);
    }
    const after = (await target.query(`SELECT ${projection} FROM public.weather_snapshots ORDER BY location_slug`)).rows;
    const mismatches = compare(sourceRows, after);
    if (mismatches.length) throw new Error(`La verificación falló: ${mismatches.slice(0, 10).join("; ")}`);
    const sourceAfter = (await source.query(`SELECT ${projection} FROM public.weather_snapshots ORDER BY location_slug`)).rows;
    const sourceChanges = compare(sourceRows, sourceAfter);
    if (sourceChanges.length) throw new Error(`El origen cambió durante la copia (${sourceChanges.length} diferencias); se revierte destino. Congela escritores y reintenta.`);
    await target.query("COMMIT");
    inTransaction = false;
    console.log(`Aplicación y verificación correctas: ${sourceRows.length} filas.`);
  } else if (args.has("--verify")) {
    const mismatches = compare(sourceRows, targetRows);
    if (mismatches.length) throw new Error(`Reconciliación pendiente (${mismatches.length} diferencias): ${mismatches.slice(0, 10).join("; ")}`);
    console.log(`Verificación correcta: ${sourceRows.length} filas equivalentes.`);
  } else {
    console.log("Sólo inspección; no se modificó ninguna base. Usa --apply para copiar y verificar.");
  }
} catch (error) {
  if (inTransaction) await target.query("ROLLBACK");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await Promise.allSettled([source.end(), target.end()]);
}
