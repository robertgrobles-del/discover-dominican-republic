// Importador universal de catálogo empresarial para Descubre RD
// Soporta CSV, TSV, JSON y archivos delimitados con detección automática de columnas.
// Uso:
//   npm run db:import-excel -- --file ruta/al/archivo.csv --type hotels
//   npm run db:import-excel -- --file ruta/al/archivo.csv --type restaurants --dry-run
//   npm run db:import-excel -- --file empresas.csv --type travel_agencies
//   npm run db:import-excel -- --file empresas.csv --type establecimientos
import pg from "pg";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { v5 as uuidv5 } from "uuid";
import { slugify } from "../src/lib/slug.js";

const NS = "7f1c1a52-6d7b-4d6a-9d0a-5a0c7c2e0d11";
const idOf = (table: string, key: string) => uuidv5(`${table}:${key}`, NS);

interface ImportStats {
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
}

function parseDelimited(content: string, delimiter?: string): Record<string, string>[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Auto-detect delimiter if not specified
  if (!delimiter) {
    const firstLine = lines[0]!;
    if (firstLine.includes("\t")) delimiter = "\t";
    else if (firstLine.includes(";")) delimiter = ";";
    else delimiter = ",";
  }

  const parseLine = (line: string, delim: string): string[] => {
    const res: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i]!;
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delim && !inQuotes) {
        res.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    res.push(current.trim());
    return res;
  };

  const headers = parseLine(lines[0]!, delimiter).map((h) => h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9_]/g, "_").replace(/^_+|_+$/g, ""));
  const records: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]!, delimiter);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]!] = values[j] ?? "";
    }
    records.push(row);
  }

  return records;
}

function pick(row: Record<string, string>, ...keys: string[]): string | null {
  for (const k of keys) {
    const norm = k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9_]/g, "_");
    if (row[norm] && row[norm]!.trim()) return row[norm]!.trim();
  }
  return null;
}

function pickNumber(row: Record<string, string>, ...keys: string[]): number | null {
  const val = pick(row, ...keys);
  if (!val) return null;
  const cleaned = val.replace(/[^0-9.-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function pickBool(row: Record<string, string>, ...keys: string[]): boolean {
  const val = pick(row, ...keys);
  if (!val) return false;
  return /^(true|si|s|1|yes|y|activo|publicado)$/i.test(val);
}

function pickArray(row: Record<string, string>, ...keys: string[]): string[] {
  const val = pick(row, ...keys);
  if (!val) return [];
  return val.split(/[,;|•\n]+/).map((s) => s.trim()).filter(Boolean);
}

async function run() {
  const args = process.argv.slice(2);
  const getArg = (name: string) => {
    const idx = args.indexOf(`--${name}`);
    return idx >= 0 ? args[idx + 1] : undefined;
  };
  const hasFlag = (name: string) => args.includes(`--${name}`);

  const filePath = getArg("file");
  const targetType = getArg("type") || "establecimientos";
  const dryRun = hasFlag("dry-run");

  if (!filePath) {
    console.log(`
Descubre RD - Importador Empresarial desde Hoja de Cálculo / CSV
===============================================================
Uso:
  npx tsx scripts/import-excel.ts --file <ruta.csv> --type <tipo> [--dry-run]

Tipos disponibles:
  - hotels           (Hoteles, Resorts, Alojamientos)
  - restaurants      (Restaurantes, Cafés, Gastronomía)
  - travel_agencies  (Agencias de Viajes y Operadores)
  - spas_wellness    (Spas, Centros de Bienestar)
  - ports_marinas    (Puertos de Cruceros y Marinas)
  - establecimientos (Directorio Maestro de Empresas y Comercios Turísticos)

Ejemplo:
  npx tsx scripts/import-excel.ts --file ./empresas_sectur.csv --type hotels --dry-run
`);
    process.exit(1);
  }

  const resolvedPath = resolve(process.cwd(), filePath);
  if (!existsSync(resolvedPath)) {
    console.error(`Error: Archivo no encontrado en ${resolvedPath}`);
    process.exit(1);
  }

  console.log(`Iniciando importación desde: ${resolvedPath}`);
  console.log(`Colección destino: ${targetType} ${dryRun ? "(MODO SIMULACIÓN - DRY RUN)" : ""}\n`);

  const fileContent = readFileSync(resolvedPath, "utf-8");
  let rows: Record<string, string>[] = [];

  if (resolvedPath.endsWith(".json")) {
    try {
      const parsed = JSON.parse(fileContent);
      rows = Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      console.error("Error al parsear JSON:", (e as Error).message);
      process.exit(1);
    }
  } else {
    rows = parseDelimited(fileContent);
  }

  console.log(`Filas leídas del archivo: ${rows.length}\n`);
  if (rows.length === 0) {
    console.warn("No se encontraron registros para procesar.");
    process.exit(0);
  }

  const url = process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5434/descubre_rd";
  const pool = new pg.Pool({ connectionString: url, max: 1 });
  const client = await pool.connect();

  const stats: ImportStats = { total: rows.length, inserted: 0, updated: 0, skipped: 0, errors: [] };

  try {
    await client.query("BEGIN");

    // Cache existing provinces and destinations for matching
    const provRes = await client.query<{ id: string; name: string; slug: string }>("SELECT id, name, slug FROM provinces");
    const destRes = await client.query<{ id: string; name: string; slug: string; province_id: string }>("SELECT id, name, slug, province_id FROM destinations");

    const matchProvince = (nameOrSlug?: string | null): string | null => {
      if (!nameOrSlug) return null;
      const s = slugify(nameOrSlug);
      const found = provRes.rows.find((p) => p.slug === s || slugify(p.name) === s);
      return found ? found.id : null;
    };

    const matchDestination = (nameOrSlug?: string | null): string | null => {
      if (!nameOrSlug) return null;
      const s = slugify(nameOrSlug);
      const found = destRes.rows.find((d) => d.slug === s || slugify(d.name) === s);
      return found ? found.id : null;
    };

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]!;
      const name = pick(r, "name", "nombre", "hotel", "restaurante", "empresa", "establecimiento", "titulo", "title");
      if (!name) {
        stats.skipped++;
        stats.errors.push(`Fila #${i + 2}: Nombre vacío, omitida`);
        continue;
      }

      const slug = pick(r, "slug") || slugify(name);
      const provinceRaw = pick(r, "provincia", "province", "region", "ubicacion_provincia");
      const destinationRaw = pick(r, "destino", "destination", "polo_turistico", "ciudad");
      const provId = matchProvince(provinceRaw);
      const destId = matchDestination(destinationRaw) || (provId ? destRes.rows.find((d) => d.province_id === provId)?.id : null);

      const description = pick(r, "description", "descripcion", "detalle", "resumen", "about");
      const shortDescription = pick(r, "short_description", "descripcion_corta", "extracto") || (description ? description.slice(0, 180) : null);
      const address = pick(r, "address", "direccion", "ubicacion", "calle");
      const phone = pick(r, "phone", "telefono", "tel", "contacto");
      const email = pick(r, "email", "correo", "correo_electronico");
      const website = pick(r, "website", "web", "sitio_web", "url");
      const imageUrl = pick(r, "image_url", "imagen", "foto", "image");
      const rating = pickNumber(r, "rating", "calificacion", "puntuacion", "stars", "estrellas");
      const latitude = pickNumber(r, "latitude", "latitud", "lat");
      const longitude = pickNumber(r, "longitude", "longitud", "lng", "lon");

      try {
        if (targetType === "hotels") {
          const stars = pickNumber(r, "stars", "estrellas", "categoria_estrellas") || 4;
          const category = pick(r, "category", "categoria", "tipo") || "Resort All-Inclusive";
          const priceRange = pick(r, "price_range", "precio", "rango_precio") || "$$$";
          const amenities = pickArray(r, "amenities", "servicios", "comodidades");

          const res = await client.query(
            `INSERT INTO hotels (id, name, slug, destination_id, category, stars, description, short_description, image_url, address, phone, website, price_range, amenities, latitude, longitude, rating, review_count, is_active, is_featured)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, true, $19)
             ON CONFLICT (slug) DO UPDATE SET
               name = EXCLUDED.name,
               description = COALESCE(EXCLUDED.description, hotels.description),
               address = COALESCE(EXCLUDED.address, hotels.address),
               phone = COALESCE(EXCLUDED.phone, hotels.phone),
               website = COALESCE(EXCLUDED.website, hotels.website),
               rating = COALESCE(EXCLUDED.rating, hotels.rating)
             RETURNING (xmax = 0) AS inserted`,
            [
              idOf("hotels", slug),
              name,
              slug,
              destId,
              category,
              stars,
              description,
              shortDescription,
              imageUrl,
              address,
              phone,
              website,
              priceRange,
              JSON.stringify(amenities),
              latitude,
              longitude,
              rating ?? 4.5,
              pickNumber(r, "review_count", "opiniones") ?? 10,
              pickBool(r, "is_featured", "destacado"),
            ]
          );
          if (res.rows[0]?.inserted) stats.inserted++;
          else stats.updated++;
        } else if (targetType === "restaurants") {
          const cuisineType = pickArray(r, "cuisine_type", "cocina", "tipo_cocina", "gastronomia") || ["Dominicana"];
          const category = pick(r, "category", "categoria") || "Restaurante";
          const priceRange = pick(r, "price_range", "precio", "rango_precio") || "$$";

          const res = await client.query(
            `INSERT INTO restaurants (id, name, slug, destination_id, cuisine_type, category, price_range, description, short_description, image_url, address, phone, latitude, longitude, rating, review_count, is_active, is_featured)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, true, $17)
             ON CONFLICT (slug) DO UPDATE SET
               name = EXCLUDED.name,
               description = COALESCE(EXCLUDED.description, restaurants.description),
               address = COALESCE(EXCLUDED.address, restaurants.address),
               phone = COALESCE(EXCLUDED.phone, restaurants.phone),
               rating = COALESCE(EXCLUDED.rating, restaurants.rating)
             RETURNING (xmax = 0) AS inserted`,
            [
              idOf("restaurants", slug),
              name,
              slug,
              destId,
              JSON.stringify(cuisineType),
              category,
              priceRange,
              description,
              shortDescription,
              imageUrl,
              address,
              phone,
              latitude,
              longitude,
              rating ?? 4.6,
              pickNumber(r, "review_count", "opiniones") ?? 8,
              pickBool(r, "is_featured", "destacado"),
            ]
          );
          if (res.rows[0]?.inserted) stats.inserted++;
          else stats.updated++;
        } else if (targetType === "travel_agencies") {
          const services = pickArray(r, "services", "servicios", "tours_ofrecidos");
          const res = await client.query(
            `INSERT INTO travel_agencies (id, name, slug, description, address, phone, email, website, services, is_verified)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
             ON CONFLICT (slug) DO UPDATE SET
               name = EXCLUDED.name,
               description = COALESCE(EXCLUDED.description, travel_agencies.description),
               phone = COALESCE(EXCLUDED.phone, travel_agencies.phone),
               email = COALESCE(EXCLUDED.email, travel_agencies.email),
               website = COALESCE(EXCLUDED.website, travel_agencies.website)
             RETURNING (xmax = 0) AS inserted`,
            [
              idOf("travel_agencies", slug),
              name,
              slug,
              description || `Agencia de viajes autorizada para excursiones y traslados turísticos en República Dominicana.`,
              address,
              phone,
              email,
              website,
              JSON.stringify(services.length ? services : ["Excursiones", "Traslados", "Tours Guiados"]),
            ]
          );
          if (res.rows[0]?.inserted) stats.inserted++;
          else stats.updated++;
        } else if (targetType === "spas_wellness") {
          const res = await client.query(
            `INSERT INTO spas_wellness (id, name, slug, destination_id, description, address, phone, website, image_url, rating, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
             ON CONFLICT (slug) DO UPDATE SET
               name = EXCLUDED.name,
               description = COALESCE(EXCLUDED.description, spas_wellness.description),
               address = COALESCE(EXCLUDED.address, spas_wellness.address)
             RETURNING (xmax = 0) AS inserted`,
            [
              idOf("spas_wellness", slug),
              name,
              slug,
              destId,
              description || `Centro de spa y bienestar holístico en República Dominicana.`,
              address,
              phone,
              website,
              imageUrl,
              rating ?? 4.8,
            ]
          );
          if (res.rows[0]?.inserted) stats.inserted++;
          else stats.updated++;
        } else if (targetType === "ports_marinas") {
          const portType = pick(r, "port_type", "tipo", "categoria")?.includes("marina") ? "marina" : "port";
          const res = await client.query(
            `INSERT INTO ports_marinas (id, name, slug, destination_id, port_type, description, image_url, latitude, longitude)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (slug) DO UPDATE SET
               name = EXCLUDED.name,
               description = COALESCE(EXCLUDED.description, ports_marinas.description)
             RETURNING (xmax = 0) AS inserted`,
            [
              idOf("ports_marinas", slug),
              name,
              slug,
              destId,
              portType,
              description || `Terminal turística y portuaria en República Dominicana.`,
              imageUrl,
              latitude,
              longitude,
            ]
          );
          if (res.rows[0]?.inserted) stats.inserted++;
          else stats.updated++;
        } else {
          // Default: Directorio General de Establecimientos (RNT)
          const rut = pick(r, "rut");
          const numId = pick(r, "no__de_identificacion", "numero_identificacion", "identificacion", "rnc");
          const subsector = pick(r, "subsector", "sector", "rubro") || "Agencias de viajes y tour operador";
          const actividad = pick(r, "actividad", "tipo_actividad") || subsector;
          const sectorZona = pick(r, "sector_zona_turistica", "sector_zona", "zona", "sector") || address;
          const provincia = provinceRaw || "Distrito Nacional";
          const estatusProceso = pick(r, "estatus_proceso", "proceso") || "Vigente";
          const estatusLicencia = pick(r, "estatus_licencia", "licencia") || "Activa";
          const estatusEstablecimiento = pick(r, "estatus_establecimiento", "estatus") || "Abierto";

          let fechaVenc = pick(r, "fecha_de_vencimiento", "fecha_vencimiento", "vencimiento");
          if (fechaVenc && !/^\d{4}-\d{2}-\d{2}/.test(fechaVenc)) {
            const parsedD = new Date(fechaVenc);
            fechaVenc = !isNaN(parsedD.getTime()) ? parsedD.toISOString().slice(0, 10) : null;
          }

          const recordId = idOf("establecimientos", `${rut || numId || name}:${provincia}`);

          const res = await client.query(
            `INSERT INTO establecimientos (id, slug, subsector, actividad, rut, numero_identificacion, nombre, sector_zona, provincia, estatus_proceso, estatus_licencia, estatus_establecimiento, fecha_vencimiento, telefono, correo, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, true)
             ON CONFLICT (id) DO UPDATE SET
               nombre = EXCLUDED.nombre,
               slug = EXCLUDED.slug,
               subsector = EXCLUDED.subsector,
               actividad = EXCLUDED.actividad,
               rut = COALESCE(EXCLUDED.rut, establecimientos.rut),
               numero_identificacion = COALESCE(EXCLUDED.numero_identificacion, establecimientos.numero_identificacion),
               sector_zona = COALESCE(EXCLUDED.sector_zona, establecimientos.sector_zona),
               provincia = COALESCE(EXCLUDED.provincia, establecimientos.provincia),
               estatus_proceso = COALESCE(EXCLUDED.estatus_proceso, establecimientos.estatus_proceso),
               estatus_licencia = COALESCE(EXCLUDED.estatus_licencia, establecimientos.estatus_licencia),
               estatus_establecimiento = COALESCE(EXCLUDED.estatus_establecimiento, establecimientos.estatus_establecimiento),
               fecha_vencimiento = COALESCE(EXCLUDED.fecha_vencimiento, establecimientos.fecha_vencimiento),
               telefono = COALESCE(EXCLUDED.telefono, establecimientos.telefono),
               correo = COALESCE(EXCLUDED.correo, establecimientos.correo),
               is_active = true
             RETURNING (xmax = 0) AS inserted`,
            [
              recordId,
              slug,
              subsector,
              actividad,
              rut || null,
              numId || null,
              name,
              sectorZona || null,
              provincia || null,
              estatusProceso,
              estatusLicencia,
              estatusEstablecimiento,
              fechaVenc || null,
              phone || null,
              email || null,
            ]
          );
          if (res.rows[0]?.inserted) stats.inserted++;
          else stats.updated++;
        }
      } catch (err) {
        stats.errors.push(`Fila #${i + 2} (${name}): ${(err as Error).message}`);
      }
    }

    if (dryRun) {
      await client.query("ROLLBACK");
      console.log("\n[DRY RUN COMPLETADO] Ningún cambio fue guardado en la base de datos.");
    } else {
      await client.query("COMMIT");
      console.log("\n[IMPORTACIÓN FINALIZADA Y GUARDADA CON ÉXITO]");
    }

    console.log(`
Resumen del proceso:
  - Total procesados: ${stats.total}
  - Nuevos insertados: ${stats.inserted}
  - Actualizados: ${stats.updated}
  - Omitidos: ${stats.skipped}
  - Errores encontrados: ${stats.errors.length}
`);

    if (stats.errors.length > 0) {
      console.log("Detalle de errores/advertencias:");
      stats.errors.slice(0, 20).forEach((e) => console.log(`  - ${e}`));
      if (stats.errors.length > 20) {
        console.log(`  ... y ${stats.errors.length - 20} más.`);
      }
    }
  } catch (fatal) {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error("Error fatal durante la importación:", (fatal as Error).message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
