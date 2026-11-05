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
  category_name: string | null; category_slug: string | null;
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
