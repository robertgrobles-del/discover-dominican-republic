import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fastifyClient";

export interface FastifyDestination {
  id: string;
  slug: string;
  name: string;
  description?: string;
  short_description?: string;
  province_id?: string;
  image_url?: string;
  rating?: number;
  is_featured?: boolean;
}

export interface FastifyEstablishment {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  province?: string;
  category?: string;
  image_url?: string;
}

export function useFastifyDestinations(params?: { q?: string; page?: number; per_page?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.q) queryParams.set("q", params.q);
  if (params?.page) queryParams.set("page", String(params.page));
  if (params?.per_page) queryParams.set("per_page", String(params.per_page));

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : "";

  return useQuery({
    queryKey: ["fastify", "destinations", params],
    queryFn: ({ signal }) => fetchApi<{ data: FastifyDestination[]; meta: { total: number } }>(`/content/destinations${queryStr}`, { signal }),
  });
}

export function useFastifyEstablishments(params?: { q?: string; provincia?: string; actividad?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.q) queryParams.set("q", params.q);
  if (params?.provincia) queryParams.set("provincia", params.provincia);
  if (params?.actividad) queryParams.set("actividad", params.actividad);

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : "";

  return useQuery({
    queryKey: ["fastify", "establecimientos", params],
    queryFn: ({ signal }) => fetchApi<{ data: FastifyEstablishment[]; meta: { total: number } }>(`/content/establecimientos${queryStr}`, { signal }),
  });
}
