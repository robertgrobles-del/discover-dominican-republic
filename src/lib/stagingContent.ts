// Contenido que el equipo publica desde el panel de staging (Turso, ver api/index.ts → /public/*).
// La landing lo antepone a su contenido local; si la API falla, la landing sigue igual que antes.
import { useQuery } from "@tanstack/react-query";
import { beaches as staticBeaches, getBeachBySlug, type Beach } from "@/data/beaches";
import { fetchApi } from "@/lib/fastifyClient";
import { useI18n } from "@/hooks/useI18n";

/** ?lang= para la API pública: el español es el contenido base y no lo lleva. */
const langQuery = (locale: string | undefined) => (locale && locale !== "es" ? `?lang=${encodeURIComponent(locale)}` : "");

export interface PublicProvince {
  id: string; slug: string; name: string; region: string; capital: string | null;
  short_description: string | null; description: string | null; image_url: string | null;
}

export type PostType = "noticia" | "reportaje" | "invitado" | "patrocinado";
export const POST_TYPE_LABEL: Record<PostType, string> = { noticia: "Noticia", reportaje: "Reportaje", invitado: "Post invitado", patrocinado: "Patrocinado" };

export interface PublicNews {
  id: string; slug: string; title: string; excerpt: string | null; body: string | null;
  cover_url: string | null; image_alt: string | null; image_credit: string | null; author: string | null;
  source_url: string | null; featured: number; post_type?: PostType; sponsor?: string | null; published_at: string | null; province_name: string | null;
  category_name: string | null; category_slug: string | null; updated_at?: string;
  seo_title?: string | null; seo_description?: string | null;
}

const load = async <T,>(path: string): Promise<T[]> => {
  try {
    return (await fetchApi<{ data: T[] }>(path)).data ?? [];
  } catch {
    return []; // sin API (desarrollo local sin backend) o caída: se muestra solo el contenido local
  }
};

export const loadPublicNews = (locale?: string) => load<PublicNews>(`/public/news${langQuery(locale)}`);

export function usePublicProvinces() {
  const { locale } = useI18n();
  return useQuery({ queryKey: ["staging-public", "provinces", locale], queryFn: () => load<PublicProvince>(`/public/provinces${langQuery(locale)}`), staleTime: 60_000 });
}

/** Ficha de provincia del panel, tal como la guarda ProvinceEditor (las listas llegan como texto JSON). */
export interface CmsProvince extends PublicProvince {
  image_alt: string | null; hero_images: string | null; gallery: string | null; municipalities: string | null; places: string | null;
  color_primary: string | null; color_accent: string | null; seo_title: string | null; seo_description: string | null; status?: string;
  latitude?: number | null; longitude?: number | null;
  // Componentes editables de la página (016_province_page.sql); las listas y objetos llegan como texto JSON.
  tagline?: string | null; intro?: string | null; population?: number | null; area_km2?: number | null; best_time?: string | null;
  weather_info?: string | null; how_to_get_there?: string | null; highlights?: string | null; typical_dishes?: string | null;
  categories?: string | null; slides?: string | null; about?: string | null; themes?: string | null; traveler_tags?: string | null;
  itinerary?: string | null; airport?: string | null; transport?: string | null; blocks?: string | null; photo_credits?: string | null;
  intro_layout?: string | null; intro_cards?: string | null;
  /** Municipios y destinos publicados (el equipo ve también los borradores). */
  territory?: { municipalities: CmsPlace[]; destinations: CmsPlace[] };
}

export interface CmsPlace {
  id: string; slug: string; name: string; short_description: string | null; highlights: string | null; image_url: string | null;
  is_capital?: number; is_popular?: number; kind?: string; municipality_id?: string | null; province_id?: string; status?: string;
}

/** Lista JSON guardada como texto; vacía si falta o está mal. */
export const jsonList = <T,>(v: string | null | undefined): T[] => {
  try { const x = JSON.parse(v ?? "[]"); return Array.isArray(x) ? x : []; } catch { return []; }
};

/**
 * Provincia de Turso por slug. El equipo (staff) la ve aunque sea borrador, para previsualizarla;
 * el público, solo si está publicada. null si no hay ficha: la página usa entonces sus datos locales.
 */
export function useCmsProvince(slug: string | undefined, staff: boolean) {
  const { locale } = useI18n();
  return useQuery({
    queryKey: ["staging-public", "province", slug, staff, locale],
    enabled: Boolean(slug),
    staleTime: 60_000,
    queryFn: async (): Promise<CmsProvince | null> => {
      try {
        if (staff) {
          const p = (await fetchApi<{ data: CmsProvince[] }>("/admin/provinces")).data.find((x) => x.slug === slug);
          if (!p) return null;
          const [m, d] = await Promise.all(["municipalities", "destinations"].map((r) => fetchApi<{ data: CmsPlace[] }>(`/admin/${r}`).then((x) => x.data.filter((y) => y.province_id === p.id))));
          return { ...p, territory: { municipalities: m, destinations: d } };
        }
        return (await fetchApi<{ data: CmsProvince }>(`/public/provinces/${encodeURIComponent(slug!)}${langQuery(locale)}`)).data;
      } catch { return null; }
    },
  });
}

export function usePublicNewsList() {
  const { locale } = useI18n();
  return useQuery({ queryKey: ["staging-public", "news", locale], queryFn: () => loadPublicNews(locale), staleTime: 60_000 });
}

/** Una noticia publicada; null si no existe (o la API no responde). */
export function usePublicNews(slug: string | undefined) {
  const { locale } = useI18n();
  return useQuery({
    queryKey: ["staging-public", "news", slug, locale],
    enabled: Boolean(slug),
    staleTime: 60_000,
    queryFn: async () => {
      try { return (await fetchApi<{ data: PublicNews }>(`/public/news/${encodeURIComponent(slug!)}${langQuery(locale)}`)).data; }
      catch { return null; }
    },
  });
}

/** Mismas reglas que el servidor (newsTitle/newsDescription en api/index.ts) para que no cambien al hidratar. */
export const newsSeoTitle = (n: PublicNews) => `${n.seo_title || n.title} | Descubre RD`;
export const newsSeoDescription = (n: PublicNews) => (n.seo_description || n.excerpt || n.title).slice(0, 160);
export const readMinutes = (md: string | null) => (md ? Math.max(1, Math.round(md.split(/\s+/).length / 200)) : null);
export const formatNewsDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric" }) : "";

export interface PublicEstablishment {
  id: string;
  type: string;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string | null;
  province: string | null;
  website: string | null;
  photo_url: string | null;
  description: string | null;
  schedule: string | null;
  details: string | null;
  files: string | null;
  created_at: string;
}

export function usePublicEstablishments() {
  return useQuery({
    queryKey: ["staging-public", "establishments"],
    queryFn: () => load<PublicEstablishment>("/public/establishments"),
    staleTime: 60_000,
  });
}

export function usePublicEstablishment(id: string | undefined) {
  return useQuery({
    queryKey: ["staging-public", "establishment", id],
    enabled: Boolean(id),
    staleTime: 60_000,
    queryFn: async () => {
      try {
        return (await fetchApi<{ data: PublicEstablishment }>(`/public/establishments/${encodeURIComponent(id!)}`)).data;
      } catch {
        return null;
      }
    },
  });
}

export interface CmsBeachRow {
  id: string;
  slug: string;
  name: string;
  province_id?: string | null;
  municipality_id?: string | null;
  destination_id?: string | null;
  province_name?: string | null;
  province_slug?: string | null;
  municipality_name?: string | null;
  destination_name?: string | null;
  beach_type?: string | null;
  short_description?: string | null;
  description?: string | null;
  image_url?: string | null;
  image_alt?: string | null;
  gallery?: unknown;
  activities?: unknown;
  amenities?: unknown;
  water_color?: string | null;
  sand_type?: string | null;
  wave_intensity?: string | null;
  crowd_level?: string | null;
  access_type?: string | null;
  parking_available?: number | boolean | null;
  lifeguard_on_duty?: number | boolean | null;
  how_to_get_there?: string | null;
  best_time_to_visit?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  rating?: number | null;
  is_popular?: number | boolean | null;
  is_featured?: number | boolean | null;
  seo_title?: string | null;
  seo_description?: string | null;
}

export type PublicBeach = Beach & {
  imageAlt?: string;
  seoTitle?: string;
  seoDescription?: string;
  municipalityName?: string;
};

function parseJsonArray(v: unknown): unknown[] {
  if (Array.isArray(v)) return v;
  if (typeof v === "string" && v.trim()) {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function normalizeStringList(v: unknown, fallback: string[] = []): string[] {
  const arr = parseJsonArray(v).map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean);
  return arr.length > 0 ? arr : fallback;
}

function normalizeGalleryUrls(v: unknown, fallback: string[] = []): string[] {
  const arr = parseJsonArray(v)
    .map((item) => (typeof item === "string" ? item : item && typeof item === "object" ? String((item as { url?: unknown }).url ?? "") : ""))
    .map((u) => u.trim())
    .filter(Boolean);
  return arr.length > 0 ? arr : fallback;
}

/** Combina una fila publicada del CMS sobre los datos locales por si algún campo viene vacío. */
export function normalizeCmsBeach(row: CmsBeachRow, fallback?: Beach): PublicBeach {
  const fb = fallback ?? getBeachBySlug(row.slug);
  return {
    id: row.id || fb?.id || row.slug,
    slug: row.slug || fb?.slug || row.id,
    name: row.name || fb?.name || "",
    province: row.province_name || fb?.province || "",
    provinceId: row.province_id ?? fb?.provinceId ?? "",
    provinceSlug: row.province_slug ?? fb?.provinceSlug ?? row.province_id ?? "",
    municipalityId: row.municipality_id ?? fb?.municipalityId,
    municipalityName: row.municipality_name ?? undefined,
    destinationId: row.destination_id ?? fb?.destinationId,
    destinationName: row.destination_name ?? fb?.destinationName,
    beachType: (row.beach_type as Beach["beachType"]) || fb?.beachType || "arena-blanca",
    shortDescription: row.short_description || fb?.shortDescription || "",
    description: row.description || fb?.description || "",
    imageUrl: row.image_url || fb?.imageUrl || "",
    imageAlt: row.image_alt || fb?.name || row.name,
    gallery: normalizeGalleryUrls(row.gallery, fb?.gallery ?? []),
    activities: normalizeStringList(row.activities, fb?.activities ?? []),
    amenities: normalizeStringList(row.amenities, fb?.amenities ?? []),
    rating: row.rating != null ? Number(row.rating) : (fb?.rating ?? 0),
    waterColor: row.water_color || fb?.waterColor || "",
    sandType: row.sand_type || fb?.sandType || "",
    waveIntensity: (row.wave_intensity as Beach["waveIntensity"]) || fb?.waveIntensity || "calma",
    crowdLevel: (row.crowd_level as Beach["crowdLevel"]) || fb?.crowdLevel || "media",
    accessType: (row.access_type as Beach["accessType"]) || fb?.accessType || "publico",
    parkingAvailable: row.parking_available != null ? Boolean(row.parking_available) : (fb?.parkingAvailable ?? false),
    lifeguardOnDuty: row.lifeguard_on_duty != null ? Boolean(row.lifeguard_on_duty) : (fb?.lifeguardOnDuty ?? false),
    latitude: row.latitude != null ? Number(row.latitude) : (fb?.latitude ?? 18.7357),
    longitude: row.longitude != null ? Number(row.longitude) : (fb?.longitude ?? -70.1627),
    howToGetThere: row.how_to_get_there || fb?.howToGetThere,
    bestTimeToVisit: row.best_time_to_visit || fb?.bestTimeToVisit,
    isPopular: row.is_popular != null ? Boolean(row.is_popular) : (fb?.isPopular ?? false),
    isFeatured: row.is_featured != null ? Boolean(row.is_featured) : (fb?.isFeatured ?? false),
    seoTitle: row.seo_title || undefined,
    seoDescription: row.seo_description || undefined,
  };
}

export function usePublicBeaches() {
  return useQuery<PublicBeach[]>({
    queryKey: ["staging-public", "beaches"],
    staleTime: 60_000,
    initialData: staticBeaches,
    queryFn: async () => {
      try {
        const res = await fetchApi<{ data: CmsBeachRow[] }>("/public/beaches");
        const bySlug = new Map(staticBeaches.map((b) => [b.slug, b]));
        return res.data.map((row) => normalizeCmsBeach(row, bySlug.get(row.slug)));
      } catch {
        return staticBeaches;
      }
    },
  });
}

export function useCmsBeach(slug: string | undefined) {
  const staticBeach = slug ? getBeachBySlug(slug) : undefined;
  return useQuery<PublicBeach | null>({
    queryKey: ["staging-public", "beach", slug],
    enabled: Boolean(slug),
    staleTime: 60_000,
    queryFn: async () => {
      try {
        const row = (await fetchApi<{ data: CmsBeachRow }>(`/public/beaches/${encodeURIComponent(slug!)}`)).data;
        return normalizeCmsBeach(row, staticBeach);
      } catch {
        return staticBeach ?? null;
      }
    },
  });
}
