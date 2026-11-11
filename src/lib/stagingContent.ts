// Contenido que el equipo publica desde el panel de staging (Turso, ver api/index.ts → /public/*).
// La landing lo antepone a su contenido local; si la API falla, la landing sigue igual que antes.
import { useQuery } from "@tanstack/react-query";
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
        if (staff) return (await fetchApi<{ data: CmsProvince[] }>("/admin/provinces")).data.find((p) => p.slug === slug) ?? null;
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
