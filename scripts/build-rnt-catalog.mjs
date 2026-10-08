import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const txtPath = resolve(process.cwd(), "docs/Registro Nacional Turístico.txt");
const outTsPath = resolve(process.cwd(), "src/data/agenciasToursRNT.ts");

const content = readFileSync(txtPath, "utf-8");
const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);

function parseCsvLine(line) {
  const res = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      res.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  res.push(current.trim());
  return res;
}

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanPhone(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1 ${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+1 ${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  return phone.trim();
}

function cleanWhatsapp(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return digits;
  return digits.length >= 10 ? digits : null;
}

export const RNT_CATEGORIAS = [
  "Agencias de viajes y tour operador",
  "Agentes de Viaje",
  "Establecimientos de expendio de alimentos y bebidas",
  "Establecimientos de hospedaje",
  "Establecimientos de masajes",
  "Gift shops",
  "Guías turísticos",
  "Turismo de aventura",
];

function normalizeCategory(rawSubsector, rawActividad, rawNombre) {
  const subLow = (rawSubsector || "").toLowerCase();
  const fullText = `${rawSubsector} ${rawActividad} ${rawNombre}`.toLowerCase();

  // 1. Coincidencias exactas o directas de Subsector
  if (subLow.includes("hospedaje") || subLow.includes("hotel") || subLow.includes("alojamiento") || subLow.includes("cabaña") || subLow.includes("villa") || subLow.includes("resort") || subLow.includes("hostal") || subLow.includes("apartahotel")) {
    return "Establecimientos de hospedaje";
  }
  if (subLow.includes("alimento") || subLow.includes("bebida") || subLow.includes("restauran") || subLow.includes("gastronom") || subLow.includes("bar") || subLow.includes("cafeter") || subLow.includes("comida")) {
    return "Establecimientos de expendio de alimentos y bebidas";
  }
  if (subLow.includes("masaje") || subLow.includes("spa") || subLow.includes("estetica") || subLow.includes("wellness") || subLow.includes("relaj")) {
    return "Establecimientos de masajes";
  }
  if (subLow.includes("gift") || subLow.includes("shop") || subLow.includes("artesani") || subLow.includes("souvenir") || subLow.includes("larimar") || subLow.includes("ambar") || subLow.includes("joyer")) {
    return "Gift shops";
  }
  if (subLow.includes("guia") || subLow.includes("guía")) {
    return "Guías turísticos";
  }
  if (subLow.includes("aventura") || subLow.includes("ecoturismo") || subLow.includes("deporte acuatico") || subLow.includes("buceo") || subLow.includes("diving") || subLow.includes("surf")) {
    return "Turismo de aventura";
  }
  if (subLow.includes("agente") || subLow.includes("asesor independiente")) {
    return "Agentes de Viaje";
  }

  // 2. Clasificación por Actividad y Nombre si el subsector es genérico
  if (fullText.includes(" hotel") || fullText.includes("resort") || fullText.includes("hostal") || fullText.includes("apartahotel") || fullText.includes("posada") || fullText.includes("villas resort") || fullText.includes("lodge") || fullText.includes("glamping") || fullText.includes("motel")) {
    return "Establecimientos de hospedaje";
  }
  if (fullText.includes("restaurante") || fullText.includes("restaurant") || fullText.includes("gourmet") || fullText.includes("comida tipica") || fullText.includes("pizzeria") || fullText.includes("bistro") || fullText.includes("cafeteria") || fullText.includes("grill & bar")) {
    return "Establecimientos de expendio de alimentos y bebidas";
  }
  if (fullText.includes("spa") || fullText.includes("masaje") || fullText.includes("massage") || fullText.includes("hidroterapia") || fullText.includes("wellness center") || fullText.includes("terapia corporal")) {
    return "Establecimientos de masajes";
  }
  if (fullText.includes("gift shop") || fullText.includes("artesania") || fullText.includes("larimar") || fullText.includes("ambar") || fullText.includes("craft market") || fullText.includes("souvenirs") || fullText.includes("tabaco & souvenirs")) {
    return "Gift shops";
  }
  if (fullText.includes("guia turistico") || fullText.includes("guias de turismo") || fullText.includes("asociacion de guias") || fullText.includes("guia oficial") || fullText.includes("guia ecologico")) {
    return "Guías turísticos";
  }
  if (fullText.includes("aventura") || fullText.includes("diving") || fullText.includes("buceo") || fullText.includes("surf") || fullText.includes("kite") || fullText.includes("rafting") || fullText.includes("safari") || fullText.includes("buggy") || fullText.includes("zipline") || fullText.includes("catamaran") || fullText.includes("cañonismo") || fullText.includes("excursion marina") || fullText.includes("kayak") || fullText.includes("parapente")) {
    return "Turismo de aventura";
  }
  if (fullText.includes("agente de viaje") || fullText.includes("asesor de viajes") || fullText.includes("consultor turistico") || fullText.includes("freelance travel")) {
    return "Agentes de Viaje";
  }

  return "Agencias de viajes y tour operador";
}

const items = [];
const seenSlugs = new Set();
const categoryCounts = {};

for (let i = 1; i < lines.length; i++) {
  const cols = parseCsvLine(lines[i]);
  const rawSubsector = cols[0] || "";
  const actividad = cols[1] || "";
  const rut = cols[2] || "";
  const rnc = cols[3] || "";
  const nombre = cols[4] || "";
  const sectorZona = cols[5] || "";
  const provincia = cols[6] || "";
  const estatusProceso = cols[7] || "";
  const estatusLicencia = cols[8] || "";
  const estatusEstablecimiento = cols[9] || "Abierto";
  const fechaVencimiento = cols[10] || null;
  const rawPhone = cols[11] || "";
  const correo = cols[12] || "";

  if (!nombre) continue;

  const subsector = normalizeCategory(rawSubsector, actividad, nombre);
  categoryCounts[subsector] = (categoryCounts[subsector] || 0) + 1;

  let baseSlug = slugify(nombre);
  let slug = baseSlug || `rnt-${i}`;
  let counter = 1;
  while (seenSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  seenSlugs.add(slug);

  const phone = cleanPhone(rawPhone);
  const whatsapp = cleanWhatsapp(rawPhone);

  items.push({
    id: `rnt-${i}`,
    slug,
    nombre,
    subsector,
    actividad: actividad || subsector,
    rut,
    rnc,
    sectorZona,
    provincia,
    estatusProceso,
    estatusLicencia,
    estatusEstablecimiento,
    fechaVencimiento,
    telefono: phone,
    whatsapp,
    correo: correo || null,
    verificado: estatusLicencia === "Activa" || estatusProceso === "Vigente",
  });
}

console.log(`\n========================================`);
console.log(`Total registros procesados: ${items.length}`);
console.log(`========================================`);
for (const [cat, count] of Object.entries(categoryCounts)) {
  console.log(`- ${cat}: ${count}`);
}

// Generar TypeScript
const fileContent = `// Catálogo Oficial del Registro Nacional Turístico (RNT / MITUR - Sectur)
// 8 Categorías Oficiales del MITUR
// Total: ${items.length} Establecimientos, Operadores y Prestadores Turísticos

export const RNT_CATEGORIAS = [
  "Agencias de viajes y tour operador",
  "Agentes de Viaje",
  "Establecimientos de expendio de alimentos y bebidas",
  "Establecimientos de hospedaje",
  "Establecimientos de masajes",
  "Gift shops",
  "Guías turísticos",
  "Turismo de aventura",
] as const;

export type RNTCategoria = typeof RNT_CATEGORIAS[number];

export interface RegistroTuristicoItem {
  id: string;
  slug: string;
  nombre: string;
  subsector: string;
  actividad: string;
  rut: string;
  rnc: string;
  sectorZona: string;
  provincia: string;
  estatusProceso: string;
  estatusLicencia: string;
  estatusEstablecimiento: string;
  fechaVencimiento: string | null;
  telefono: string | null;
  whatsapp: string | null;
  correo: string | null;
  verificado: boolean;
}

export const agenciasToursRNT = (${JSON.stringify(items)}) as unknown as RegistroTuristicoItem[];

export const totalRNT = ${items.length};
`;

writeFileSync(outTsPath, fileContent, "utf-8");
console.log(`\nArchivo TypeScript generado exitosamente en: ${outTsPath}`);
