#!/usr/bin/env node
/**
 * Genera la migración que carga en sus colecciones los datos que siete páginas traían escritos en el código
 * (cuevas, parques temáticos, museos y monumentos, golf, talleres, clínicas y números de emergencia), para que
 * el panel los muestre y los edite. Cada fila se inserta sólo si no existe ya una con su slug.
 * Uso: node scripts/gen-page-collections-seed.cjs  → backend/migrations/0091_seed_page_collections.sql
 */
const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "backend/migrations/0091_seed_page_collections.sql");

/** Evalúa el literal de `const <name> = …` de una página. Los identificadores (imágenes importadas, iconos) valen null. */
function literal(file, name) {
  const src = fs.readFileSync(path.join(ROOT, "src/pages", file), "utf8");
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let init = null;
  sf.forEachChild((st) => {
    if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) if (d.name.getText() === name && d.initializer) init = d.initializer;
  });
  if (!init) throw new Error(`${file}: no encuentro ${name}`);
  const js = ts.transpile(`(${init.getText(sf)})`, { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020 });
  const scope = new Proxy({}, { has: (_t, k) => k !== "Math" && k !== "JSON" && k !== "Number" && k !== "String", get: () => null });
  // eslint-disable-next-line no-new-func
  return new Function("scope", `with (scope) { return ${js.trim().replace(/;$/, "")}; }`)(scope);
}

const slugify = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const num = (v) => { const m = String(v ?? "").replace(/,/g, "").match(/\d+(\.\d+)?/); return m ? Number(m[0]) : null; };
const lit = (v) => {
  if (v === null || v === undefined || v === "") return "NULL";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "NULL";
  if (typeof v === "boolean") return v ? "true" : "false";
  return `'${String(v).replace(/'/g, "''")}'`;
};
const jsonb = (v) => (v === undefined || v === null ? "NULL" : `${lit(JSON.stringify(v))}::jsonb`);
const textArr = (a) => (Array.isArray(a) && a.length ? `ARRAY[${a.map(lit).join(", ")}]::text[]` : "NULL");
const img = (v) => (typeof v === "string" && /^https?:\/\//.test(v) ? v : null); // las importadas siguen saliendo del código

/** INSERT … SELECT … WHERE NOT EXISTS (mismo slug). `cols` es { columna: expresión SQL ya formateada }. */
function insert(table, cols) {
  const c = { ...cols, status: lit("published"), published_at: "now()" };
  const names = Object.keys(c);
  return `INSERT INTO ${table} (${names.join(", ")})\n  SELECT ${names.map((n) => c[n]).join(", ")}\n  WHERE NOT EXISTS (SELECT 1 FROM ${table} WHERE slug = ${c.slug});`;
}

const out = [];
const section = (title) => out.push(`\n-- ---- ${title} ----`);

section("Cuevas (CuevaDetalle)");
for (const [slug, c] of Object.entries(literal("CuevaDetalle.tsx", "cuevasData"))) {
  out.push(insert("caves", {
    slug: lit(slug), name: lit(c.nombre), cave_type: lit("Cueva"), description: lit(c.descripcionLarga ?? c.descripcion), short_description: lit(c.descripcion),
    address: lit([c.ubicacion, c.provincia].filter(Boolean).join(", ")), phone: lit(c.telefono), email: lit(c.email), website: lit(c.website),
    difficulty: lit(c.dificultad), tour_duration: lit(c.duracion), opening_hours: lit(c.horario), highlights: jsonb(c.atracciones ?? []),
    price_adult: lit(num(c.precio)), latitude: lit(c.coordenadas?.lat), longitude: lit(c.coordenadas?.lng), rating: lit(c.rating),
    image_url: lit(img(c.imagenes?.[0]?.src)), gallery: jsonb((c.imagenes ?? []).map((i) => img(i.src)).filter(Boolean)),
  }));
}

section("Parques temáticos (ParquesTematicos)");
for (const p of literal("ParquesTematicos.tsx", "parquesTematicos")) {
  out.push(insert("theme_parks", {
    slug: lit(p.id), name: lit(p.nombre), park_type: lit(p.tipo), address: lit(p.ubicacion), image_url: lit(img(p.imagen)), description: lit(p.descripcion),
    price_adult: lit(p.precioAdulto), price_child: lit(p.precioNino), rating: lit(p.rating), attractions: jsonb(p.atracciones ?? []),
    opening_hours: lit(p.horario), duration_recommended: lit(p.duracion), extras: jsonb({ reviews: p.reviews ?? 0 }),
  }));
}

section("Museos y monumentos (MuseosMonumentos)");
for (const m of literal("MuseosMonumentos.tsx", "museums")) {
  out.push(insert("monuments", {
    slug: lit(slugify(m.name)), name: lit(m.name), monument_type: lit(`Museo · ${m.category}`), description: lit(m.description), address: lit(m.location),
    image_url: lit(img(m.image)), opening_hours: lit(m.hours), entry_fee: lit(m.price ? `${m.currency ?? "RD$"} ${m.price}` : "Gratis"), rating: lit(m.rating),
    review_count: lit(m.reviews ?? 0), is_featured: lit(!!m.featured), is_active: "true", highlights: textArr(m.highlights),
  }));
}
for (const m of literal("MuseosMonumentos.tsx", "monuments")) {
  out.push(insert("monuments", {
    slug: lit(slugify(m.name)), name: lit(m.name), monument_type: lit(m.type), description: lit(m.description), address: lit(m.location),
    image_url: lit(img(m.image)), year_built: lit(m.year ? String(m.year) : null), architect: lit(m.architect), is_active: "true",
  }));
}

section("Campos de golf (GolfRD)");
for (const g of literal("GolfRD.tsx", "golfCourses")) {
  out.push(insert("golf_courses", {
    slug: lit(g.slug || slugify(g.name)), name: lit(g.name), holes: lit(g.holes), par: lit(g.par), designer: lit(g.designer), description: lit(g.description), image_url: lit(img(g.image)),
    extras: jsonb({ location: g.location, region: g.region, greenFee: g.greenFee, highlights: g.highlights ?? [] }),
  }));
}

section("Talleres artesanales (TalleresArtesanales)");
for (const t of literal("TalleresArtesanales.tsx", "talleres")) {
  const max = String(t.participantes ?? "").match(/(\d+)\D*$/);
  out.push(insert("artisanal_workshops", {
    slug: lit(t.id), name: lit(t.nombre), workshop_type: lit(t.categoria), address: lit(t.ubicacion), duration: lit(t.duracion), price_range: lit(t.precio),
    max_participants: lit(max ? Number(max[1]) : null), description: lit(t.descripcion), image_url: lit(img(t.imagen)), includes: jsonb(t.incluye ?? []),
    rating: lit(t.rating), is_active: "true",
  }));
}

section("Clínicas (ClinicaDetalle)");
{
  const c = literal("ClinicaDetalle.tsx", "clinica");
  out.push(insert("clinics", {
    slug: lit(c.id), name: lit(c.name), clinic_type: lit(c.type), address: lit(c.address), description: lit(c.description), image_url: lit(img(c.image)),
    phone: lit(c.contact?.phone), emergency_phone: lit(c.contact?.emergency), email: lit(c.contact?.email), website: lit(c.contact?.website),
    specialties: jsonb((c.specialties ?? []).map((s) => s.name ?? s)), services: jsonb(c.services ?? []), certifications: jsonb(c.certifications ?? []),
    languages: jsonb(c.languages ?? []), rating: lit(c.rating), review_count: lit(c.reviewCount ?? 0), is_24_hours: "true", is_active: "true",
    extras: jsonb({ location: c.location, treatments: c.treatments, testimonials: c.testimonials, hours: c.hours, nearbyHotels: c.nearbyHotels }),
  }));
}

section("Números de emergencia (ContactosEmergencia)");
for (const e of literal("ContactosEmergencia.tsx", "numerosEmergencia")) {
  out.push(insert("emergency_contacts", { slug: lit(slugify(e.servicio)), institution: lit(e.servicio), phone_number: lit(e.numero), address: lit(e.descripcion) }));
}

const header = `-- ==============================================================================
-- Migración 0091: datos de siete páginas en sus colecciones
-- Cuevas, parques temáticos, museos y monumentos, golf, talleres, clínicas y números de
-- emergencia tenían sus datos escritos en el código de la página. Se cargan en sus tablas
-- (publicados) para que el panel los muestre y los edite; las páginas ya leen la colección.
-- Generada por scripts/gen-page-collections-seed.cjs. Idempotente: no pisa slugs existentes.
-- ==============================================================================`;
fs.writeFileSync(OUT, `${header}\n${out.join("\n")}\n`);
console.log(`${out.filter((l) => l.startsWith("INSERT")).length} filas → ${path.relative(ROOT, OUT)}`);
