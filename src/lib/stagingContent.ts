// Contenido que el equipo publica desde el panel de staging (Turso, ver api/index.ts → /public/*).
// La landing lo antepone a su contenido local; si la API falla, la landing sigue igual que antes.
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fastifyClient";

export interface PublicProvince {
  id: string; slug: string; name: string; region: string; capital: string | null;
  short_description: string | null; description: string | null; image_url: string | null;
}

export interface PublicNews {
  id: string; slug: string; title: string; excerpt: string | null; body: string | null;
  cover_url: string | null; image_alt: string | null; image_credit: string | null; author: string | null;
  source_url: string | null; featured: number; published_at: string | null; province_name: string | null;
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

export const loadPublicNews = () => load<PublicNews>("/public/news");

export function usePublicProvinces() {
  return useQuery({ queryKey: ["staging-public", "provinces"], queryFn: () => load<PublicProvince>("/public/provinces"), staleTime: 60_000 });
}

export function usePublicNewsList() {
  return useQuery({ queryKey: ["staging-public", "news"], queryFn: loadPublicNews, staleTime: 60_000 });
}

/** Una noticia publicada; null si no existe (o la API no responde). */
export function usePublicNews(slug: string | undefined) {
  return useQuery({
    queryKey: ["staging-public", "news", slug],
    enabled: Boolean(slug),
    staleTime: 60_000,
    queryFn: async () => {
      try { return (await fetchApi<{ data: PublicNews }>(`/public/news/${encodeURIComponent(slug!)}`)).data; }
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
