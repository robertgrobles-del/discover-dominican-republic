// Ficha de provincia del panel (Turso) encima de los datos locales de src/data: lo que se rellena en el panel manda,
// lo vacío sigue saliendo de src/data. Así cada provincia se migra campo a campo sin quedarse en blanco.
import type { Destination } from "@/data/destinations";
import type { IdentityMunicipality, ProvinceBlock, ProvinceIdentity } from "@/data/provinceIdentity";
import type { ProvinceSlide } from "@/components/province/ProvinceHero";
import { jsonList, type CmsProvince } from "@/lib/stagingContent";

type Obj = Record<string, unknown>;
const obj = <T extends Obj>(v: string | null | undefined): T | null => {
  try { const o = JSON.parse(v ?? ""); return o && typeof o === "object" && !Array.isArray(o) ? o as T : null; } catch { return null; }
};
const list = <T,>(v: string | null | undefined): T[] | undefined => { const l = jsonList<T>(v); return l.length ? l : undefined; };
const text = (v: string | null | undefined) => (v && v.trim() ? v : undefined);

export interface CmsMunicipality { id: string; slug: string; name: string; short_description: string | null; highlights: string | null; is_capital?: number; kind?: string }
export interface Itinerary { dia: number; titulo: string; lugar: string; desc: string }
export interface Airport { nombre: string; codigo: string; distancia: string }
export interface Transport { tipo: "avion" | "carro" | "bus" | "barco"; desde: string; duracion: string; descripcion: string; precio?: string }

export function mergeProvince<T extends Destination>(base: T, cms: CmsProvince | null | undefined): T & { capital?: string; population?: number; areaKm2?: number } {
  const b = base as T & { capital?: string; population?: number; areaKm2?: number };
  if (!cms) return b;
  return {
    ...b,
    name: cms.name || b.name,
    description: text(cms.description) ?? b.description,
    shortDescription: text(cms.short_description) ?? b.shortDescription,
    capital: text(cms.capital) ?? b.capital,
    imageUrl: text(cms.image_url) ?? b.imageUrl,
    latitude: cms.latitude ?? b.latitude,
    longitude: cms.longitude ?? b.longitude,
    population: cms.population ?? b.population,
    areaKm2: cms.area_km2 ?? b.areaKm2,
    bestTimeToVisit: text(cms.best_time) ?? b.bestTimeToVisit,
    weatherInfo: text(cms.weather_info) ?? b.weatherInfo,
    howToGetThere: text(cms.how_to_get_there) ?? b.howToGetThere,
    highlights: list<string>(cms.highlights) ?? b.highlights,
    typicalDishes: list<string>(cms.typical_dishes) ?? b.typicalDishes,
    categories: list<Destination["categories"][number]>(cms.categories) ?? b.categories,
    about: { ...b.about, ...(obj<NonNullable<Destination["about"]>>(cms.about) ?? {}) },
  };
}

/**
 * Identidad editorial (lema, intro, slides, temas, municipios, viajero, orden de bloques). Con ficha del panel siempre hay
 * identidad, para que sus bloques puedan salir aunque la provincia no tuviera perfil en src/data.
 */
export function mergeIdentity(local: ProvinceIdentity | undefined, cms: CmsProvince | null | undefined, munis: CmsMunicipality[]): ProvinceIdentity | undefined {
  if (!cms) return local;
  const slides = list<Omit<ProvinceSlide, "id">>(cms.slides)?.map((s, i) => ({ ...s, id: `cms-${i}`, image: s.image || "/placeholder.svg" }));
  const ownMunis: IdentityMunicipality[] | undefined = munis.length ? munis.map((m) => ({
    name: m.name, slug: m.slug, role: m.is_capital ? "Cabecera" : m.kind === "distrito_municipal" ? "Distrito municipal" : undefined,
    identity: m.short_description ?? "", highlights: jsonList<string>(m.highlights),
  })) : undefined;
  return {
    tagline: text(cms.tagline) ?? local?.tagline ?? "",
    intro: text(cms.intro) ?? local?.intro ?? "",
    slides: slides ?? local?.slides ?? [],
    heroStyle: local?.heroStyle,
    municipalities: ownMunis ?? local?.municipalities ?? [],
    themes: list<ProvinceIdentity["themes"][number]>(cms.themes)?.map((t, i) => ({ ...t, id: t.id || `tema-${i}` })) ?? local?.themes ?? [],
    travelerTags: list<ProvinceIdentity["travelerTags"][number]>(cms.traveler_tags) ?? local?.travelerTags ?? [],
    blocks: list<ProvinceBlock>(cms.blocks) ?? local?.blocks ?? [],
    photoCredits: list<string>(cms.photo_credits) ?? local?.photoCredits ?? [],
  };
}

export const cmsItinerary = (cms: CmsProvince | null | undefined) => list<Itinerary>(cms?.itinerary);
export const cmsTransport = (cms: CmsProvince | null | undefined) => list<Transport>(cms?.transport);
export const cmsAirport = (cms: CmsProvince | null | undefined) => { const a = obj<Obj>(cms?.airport) as unknown as Airport | null; return a?.nombre ? a : undefined; };
