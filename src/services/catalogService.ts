/**
 * Catalog Service (Descubre RD)
 * Acceso al catálogo turístico para las pantallas.
 *
 * La fuente de verdad del contenido es el backend (`docs/FUENTE_DE_VERDAD.md`). Con `VITE_CATALOG_SOURCE=api`
 * los datos locales de `src/data` se hidratan al arrancar con lo que sirve el backend (`catalogHydration`), y
 * este servicio espera a esa carga antes de responder. Con `static` devuelve los archivos locales tal cual.
 *
 * No consulta Strapi: no es fuente de verdad y, al estar en otro origen, la política de seguridad de contenido
 * del sitio bloquea esas peticiones.
 */

import { bars as localBars, type Bar } from "@/data/bars";
import { beaches as localBeaches, type Beach } from "@/data/beaches";
import { destinations as localDestinations, type Destination } from "@/data/destinations";
import { experiences as localExperiences, type Experience } from "@/data/experiences";
import { hotels as localHotels, type Hotel } from "@/data/hotels";
import { restaurants as localRestaurants, type Restaurant } from "@/data/restaurants";
import { CATALOG_SOURCE } from "@/lib/catalogSource";
import { fetchApi } from "@/lib/fastifyClient";
import { catalogReady } from "./catalogHydration";

/** Fila de spa tal como la entrega el backend; la página la combina con sus datos locales por slug. */
export interface SpaRow { id: string; slug: string | null; name: string; [column: string]: unknown }

/** Espera a que termine la hidratación (si la hay) y devuelve el arreglo local, ya con los datos del backend. */
async function from<T>(local: T[]): Promise<T[]> {
  await catalogReady();
  return local;
}

type Placed = { destinationId?: string; province?: string; provinceId?: string };
/** Coincide por id o slug del destino, o por provincia (id, slug o nombre). */
function inPlace<T extends Placed>(items: T[], destOrProvId: string, byProvince = true): T[] {
  const wanted = destOrProvId.toLowerCase();
  return items.filter((item) =>
    item.destinationId?.toLowerCase() === wanted ||
    (byProvince && (item.provinceId?.toLowerCase() === wanted || !!item.province?.toLowerCase().includes(wanted))));
}

function bySlug<T extends { slug: string; id: string }>(items: T[], slug: string): T | null {
  const wanted = slug.toLowerCase();
  return items.find((item) => item.slug?.toLowerCase() === wanted || item.id === slug) ?? null;
}

export const CatalogService = {
  // El idioma se conserva en la firma: la hidratación ya pidió el catálogo en el idioma de arranque.
  getBeaches: (_locale = "es"): Promise<Beach[]> => from(localBeaches),
  getRestaurants: (_locale = "es"): Promise<Restaurant[]> => from(localRestaurants),
  getBars: (_locale = "es"): Promise<Bar[]> => from(localBars),
  getDestinations: (_locale = "es"): Promise<Destination[]> => from(localDestinations),
  getHotels: (_locale = "es"): Promise<Hotel[]> => from(localHotels),
  getExperiences: (_locale = "es"): Promise<Experience[]> => from(localExperiences),

  async getHotelsByDestination(destOrProvId: string): Promise<Hotel[]> { return inPlace(await from(localHotels), destOrProvId); },
  async getRestaurantsByDestination(destOrProvId: string): Promise<Restaurant[]> { return inPlace(await from(localRestaurants), destOrProvId); },
  async getBarsByDestination(destOrProvId: string): Promise<Bar[]> { return inPlace(await from(localBars), destOrProvId); },
  /** Las experiencias se filtran sólo por destino, no por provincia. */
  async getExperiencesByDestination(destOrProvId: string): Promise<Experience[]> { return inPlace(await from(localExperiences), destOrProvId, false); },

  async getDestinationBySlug(slug: string, _locale = "es"): Promise<Destination | null> { return bySlug(await from(localDestinations), slug); },
  async getBarBySlug(slug: string, _locale = "es"): Promise<Bar | null> { return bySlug(await from(localBars), slug); },
  async getExperienceBySlug(slug: string, _locale = "es"): Promise<Experience | null> { return bySlug(await from(localExperiences), slug); },
  async getRestaurantBySlug(slug: string, _locale = "es"): Promise<Restaurant | null> { return bySlug(await from(localRestaurants), slug); },
  async getHotelBySlug(slug: string, _locale = "es"): Promise<Hotel | null> { return bySlug(await from(localHotels), slug); },
  async getBeachBySlug(slug: string, _locale = "es"): Promise<Beach | null> { return bySlug(await from(localBeaches), slug); },

  /** Spas y centros de bienestar publicados en el backend. Sin backend no hay ninguno que añadir a los locales. */
  async getSpas(): Promise<SpaRow[]> {
    if (CATALOG_SOURCE !== "api") return [];
    try {
      return (await fetchApi<{ data: SpaRow[] }>("/spas_wellness?per_page=100")).data;
    } catch {
      return [];
    }
  },
};
