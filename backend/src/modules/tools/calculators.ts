/**
 * Calculadoras del viajero (docs §5.5): funciones puras, sin acceso a base de datos. Las reglas por defecto están aquí y el equipo puede ajustar
 * sus cifras desde `site_settings` (clave `calculators.<nombre>`) sin tocar código: sólo se aceptan valores numéricos que ya existan en los
 * valores por defecto, así un ajuste mal escrito no puede introducir campos ni tipos inesperados.
 */
const cents = (n: number) => Math.round(n * 100) / 100;

/** Mezcla `override` sobre `defaults` aceptando únicamente hojas numéricas finitas y no negativas que ya existan. */
export function withOverrides<T extends Record<string, unknown>>(defaults: T, override: unknown): T {
  if (!override || typeof override !== "object" || Array.isArray(override)) return defaults;
  const out: Record<string, unknown> = { ...defaults };
  for (const [k, base] of Object.entries(defaults)) {
    const v = (override as Record<string, unknown>)[k];
    if (typeof base === "number") { if (typeof v === "number" && Number.isFinite(v) && v >= 0) out[k] = v; }
    else if (base && typeof base === "object" && !Array.isArray(base)) out[k] = withOverrides(base as Record<string, unknown>, v);
  }
  return out as T;
}

// ---------- Presupuesto ----------
export const BUDGET_DEFAULTS = {
  styles: { mochilero: 0.5, estandar: 1, lujo: 2.5 },
  regions: { general: 1, este: 1, norte: 1, sur: 1, capital: 1 },
  categories: {
    alojamiento: 80, comida: 35, transporte: 25, actividades: 40, vuelos: 350, compras: 20, seguro: 8, comunicacion: 5, propinas: 10,
  },
};
/** Por persona y por día, salvo alojamiento/transporte/propinas (por día, sin importar las personas) y vuelos (por persona, una vez). */
const PER_PERSON = new Set(["comida", "actividades", "compras", "seguro", "comunicacion"]);
export const BUDGET_DEFAULT_INCLUDED = new Set(["alojamiento", "comida", "transporte", "actividades", "vuelos", "seguro", "comunicacion", "propinas"]);

export function budget(cfg: typeof BUDGET_DEFAULTS, i: { days: number; travelers: number; style: keyof typeof BUDGET_DEFAULTS.styles; region?: keyof typeof BUDGET_DEFAULTS.regions; include?: string[]; exclude?: string[] }) {
  const mult = cfg.styles[i.style] * cfg.regions[i.region ?? "general"];
  const active = new Set(i.include ?? [...BUDGET_DEFAULT_INCLUDED]);
  for (const e of i.exclude ?? []) active.delete(e);
  const lines = Object.entries(cfg.categories).map(([id, base]) => {
    let amount = 0;
    if (active.has(id)) amount = id === "vuelos" ? base * mult * i.travelers : PER_PERSON.has(id) ? base * mult * i.days * i.travelers : base * mult * i.days;
    return { category: id, included: active.has(id), amount: cents(amount) };
  });
  const total = cents(lines.reduce((s, l) => s + l.amount, 0));
  return { style: i.style, days: i.days, travelers: i.travelers, lines, total, per_person: cents(total / i.travelers), per_day: cents(total / i.days), currency: "USD" };
}

// ---------- Cuenta de restaurante (ITBIS + propina de ley) ----------
export const TAX_DEFAULTS = { itbis_pct: 18, legal_tip_pct: 10 };
export function restaurantBill(cfg: typeof TAX_DEFAULTS, i: { subtotal: number; tip_pct?: number; regime?: "restaurant" | "retail" }) {
  const itbis = cents((i.subtotal * cfg.itbis_pct) / 100);
  const legal = i.regime === "retail" ? 0 : cents((i.subtotal * cfg.legal_tip_pct) / 100);
  const tip = i.regime === "retail" ? 0 : cents((i.subtotal * (i.tip_pct ?? 0)) / 100);
  return { subtotal: cents(i.subtotal), itbis, legal_tip: legal, voluntary_tip: tip, total: cents(i.subtotal + itbis + legal + tip), currency: "DOP", rates: { itbis_pct: cfg.itbis_pct, legal_tip_pct: i.regime === "retail" ? 0 : cfg.legal_tip_pct } };
}

// ---------- CONFOTUR (Ley 158-01) ----------
export const CONFOTUR_DEFAULTS = { transfer_pct: 3, ipi_pct: 1, isr_pct: 20, assets_pct: 1, max_years: 15 };
export function confotur(cfg: typeof CONFOTUR_DEFAULTS, i: { property_value: number; annual_rental_income?: number; is_company?: boolean; years?: number }) {
  const years = Math.min(i.years ?? cfg.max_years, cfg.max_years);
  const transfer = cents((i.property_value * cfg.transfer_pct) / 100);
  const ipiYear = cents((i.property_value * cfg.ipi_pct) / 100);
  const isrYear = cents(((i.annual_rental_income ?? 0) * cfg.isr_pct) / 100);
  const assetsYear = i.is_company ? cents((i.property_value * cfg.assets_pct) / 100) : 0;
  const yearly = cents(ipiYear + isrYear + assetsYear);
  return {
    years, transfer_tax_savings: transfer, ipi_savings_per_year: ipiYear, isr_savings_per_year: isrYear, assets_tax_savings_per_year: assetsYear,
    savings_per_year: yearly, total_savings: cents(transfer + yearly * years),
    rates: { transfer_pct: cfg.transfer_pct, ipi_pct: cfg.ipi_pct, isr_pct: cfg.isr_pct, assets_pct: cfg.assets_pct },
    disclaimer: "Estimación orientativa; el beneficio real depende de la resolución de CONFOTUR y de la asesoría tributaria.",
  };
}

// ---------- Huella de carbono ----------
export const CARBON_DEFAULTS = { flight_kg_per_km: 0.115, bus_kg_per_km: 0.04, ferry_kg_per_trip: 18, tree_kg_per_year: 22, car: { gasoline: 0.192, diesel: 0.171, hybrid: 0.105, electric: 0.045 } };
export function carbon(cfg: typeof CARBON_DEFAULTS, i: { flight_km_one_way: number; round_trip: boolean; passengers: number; rental_car_km?: number; car_type?: keyof typeof CARBON_DEFAULTS.car; bus_km?: number; ferry_trips?: number }) {
  const flightKm = i.flight_km_one_way * (i.round_trip ? 2 : 1);
  const flight = flightKm * cfg.flight_kg_per_km * i.passengers;
  const car = (i.rental_car_km ?? 0) * cfg.car[i.car_type ?? "gasoline"]; // el vehículo se comparte: no se multiplica por pasajeros
  const bus = (i.bus_km ?? 0) * cfg.bus_kg_per_km * i.passengers;
  const ferry = (i.ferry_trips ?? 0) * cfg.ferry_kg_per_trip * i.passengers;
  const totalKg = flight + car + bus + ferry;
  return {
    flight_km: flightKm, breakdown_kg: { flight: cents(flight), car: cents(car), bus: cents(bus), ferry: cents(ferry) }, total_kg: cents(totalKg), total_tons: Math.round(totalKg) / 1000,
    trees_needed: totalKg > 0 ? Math.max(1, Math.ceil(totalKg / cfg.tree_kg_per_year)) : 0, per_passenger_kg: cents(totalKg / i.passengers),
  };
}

// ---------- Peajes ----------
export interface TollPoint { name: string; cat1Price: number; cat2Price: number; cat3Price: number; cat4Price: number }
export function tolls(points: TollPoint[], category: 1 | 2 | 3 | 4) {
  const key = `cat${category}Price` as const;
  const lines = points.map((t) => ({ name: t.name, price: Number(t[key]) || 0 }));
  return { category, stations: lines.length, lines, total: cents(lines.reduce((s, l) => s + l.price, 0)), currency: "DOP" };
}

// ---------- Lista de empaque ----------
export type Climate = "tropical" | "calor" | "fresco" | "lluvioso";
export type Activity = "playa" | "senderismo" | "ciudad" | "noche" | "aventura" | "negocios";
interface PackItem { id: string; name: string; quantity: number; essential: boolean }
export function packingList(i: { days: number; climate: Climate; activities: Activity[]; with_kids?: boolean; travelers?: number }) {
  const has = (a: Activity) => i.activities.includes(a);
  const wet = i.climate === "lluvioso", warm = i.climate === "tropical" || i.climate === "calor", cool = i.climate === "fresco";
  const item = (id: string, name: string, quantity = 1, essential = false): PackItem => ({ id, name, quantity, essential });
  const clothes: PackItem[] = [
    item("camisetas", "Camisetas o blusas", Math.min(10, Math.ceil(i.days * 0.8))), item("ropa-interior", "Ropa interior", Math.min(10, i.days + 1), true), item("medias", "Pares de medias", Math.min(8, i.days)),
    item("pantalones", "Pantalones o shorts", Math.min(5, Math.ceil(i.days / 2))), item("calzado", "Calzado cómodo", 1, true), item("sandalias", "Sandalias", 1),
  ];
  if (has("playa") || warm) clothes.push(item("traje-bano", "Traje de baño", has("playa") ? 2 : 1), item("gorra", "Gorra o sombrero", 1));
  if (has("senderismo") || has("aventura")) clothes.push(item("botas", "Botas o tenis de montaña", 1, true), item("ropa-secado-rapido", "Ropa de secado rápido", Math.min(4, Math.ceil(i.days / 2))));
  if (has("noche") || has("negocios")) clothes.push(item("ropa-formal", "Ropa formal o elegante", has("negocios") ? Math.min(5, Math.ceil(i.days / 2)) : 1));
  if (cool) clothes.push(item("chaqueta", "Chaqueta o suéter", 1, true));
  if (wet) clothes.push(item("impermeable", "Impermeable o paraguas", 1, true));
  const hygiene: PackItem[] = [item("cepillo", "Cepillo y pasta dental", 1, true), item("desodorante", "Desodorante", 1), item("shampoo", "Champú y jabón de viaje", 1)];
  if (warm || has("playa")) hygiene.push(item("protector-solar", "Protector solar (FPS 30+)", i.days > 7 ? 2 : 1, true), item("after-sun", "Loción o gel para después del sol", 1));
  if (has("senderismo") || has("aventura") || i.climate === "tropical") hygiene.push(item("repelente", "Repelente de insectos", 1, true));
  const tech: PackItem[] = [item("cargador", "Cargador del teléfono", 1, true), item("power-bank", "Batería portátil", 1), item("adaptador", "Adaptador de enchufe (tipo A/B, 110 V)", 1)];
  if (has("playa") || has("aventura")) tech.push(item("funda-agua", "Funda impermeable para el teléfono", 1), item("camara", "Cámara (opcional)", 1));
  const health: PackItem[] = [item("botiquin", "Botiquín básico", 1, true), item("medicinas", "Medicinas personales con receta", 1, true), item("mascarillas", "Toallitas desinfectantes", 1)];
  if (has("senderismo") || has("aventura")) health.push(item("curitas", "Curitas y vendas", 1), item("hidratacion", "Sales de rehidratación", 2));
  const docs: PackItem[] = [item("pasaporte", "Pasaporte (válido 6+ meses)", 1, true), item("eticket", "E-Ticket o formulario de entrada", 1, true), item("reservas", "Confirmaciones de reservas", 1, true), item("seguro", "Seguro de viaje", 1, true), item("tarjetas", "Tarjetas de crédito/débito", 1, true), item("efectivo", "Efectivo en pesos dominicanos", 1)];
  if (has("aventura") || has("ciudad")) docs.push(item("licencia", "Licencia de conducir", 1));
  const categories: { id: string; name: string; items: PackItem[] }[] = [
    { id: "documentos", name: "Documentos", items: docs }, { id: "ropa", name: "Ropa y calzado", items: clothes }, { id: "higiene", name: "Higiene y protección", items: hygiene },
    { id: "tecnologia", name: "Tecnología", items: tech }, { id: "salud", name: "Salud", items: health },
  ];
  if (has("senderismo") || has("aventura")) categories.push({ id: "aventura", name: "Aventura", items: [item("mochila", "Mochila de día", 1, true), item("botella", "Botella reutilizable", 1, true), item("linterna", "Linterna frontal", 1), item("snacks", "Snacks energéticos", Math.min(6, i.days))] });
  if (i.with_kids) categories.push({ id: "ninos", name: "Con niños", items: [item("pañales", "Pañales o ropa de repuesto", Math.min(20, i.days * 4)), item("juguetes", "Juguetes y entretenimiento", 2), item("snacks-ninos", "Meriendas", Math.min(10, i.days * 2)), item("protector-ninos", "Protector solar infantil", 1, true), item("medicina-ninos", "Medicinas pediátricas", 1, true)] });
  const travelers = i.travelers ?? 1;
  return { days: i.days, climate: i.climate, categories, total_items: categories.reduce((s, c) => s + c.items.length, 0), essentials: categories.reduce((s, c) => s + c.items.filter((x) => x.essential).length, 0), note: travelers > 1 ? "Cantidades por persona." : undefined };
}
