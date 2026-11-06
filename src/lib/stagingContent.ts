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
