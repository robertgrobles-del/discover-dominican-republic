import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fastifyClient";

/**
 * Actividades (colección `experiences` del backend) de un destino, agrupables por categoría. Las alimenta el
 * panel de administración: una categoría existe en el sitio en cuanto tiene una actividad publicada en el destino.
 */

export interface DestinationActivity {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  short_description: string | null;
  image_url: string | null;
  price: number | string | null;
  duration: string | null;
  rating: number | string | null;
  difficulty: string | null;
}

export interface ActivityCategory {
  key: string;
  label: string;
  count: number;
  image: string | null;
}

/** Nombres con que se muestran las categorías conocidas; las nuevas salen con su propio texto capitalizado. */
const CATEGORY_LABELS: Record<string, string> = {
  naturaleza: "Naturaleza",
  aventura: "Aventura",
  gastronomia: "Gastronomía",
  lujo: "Lujo",
  cultura: "Cultura",
  deportes: "Deportes",
  playa: "Playa",
  bienestar: "Bienestar",
  nocturna: "Vida nocturna",
  familia: "En familia",
};
/** Variantes que el catálogo ya trae escritas de otra forma y deben contar como la misma categoría. */
const CATEGORY_ALIASES: Record<string, string> = { cultural: "cultura", gastronomica: "gastronomia", deporte: "deportes" };

export function categoryKey(raw: string | null | undefined): string {
  const key = (raw ?? "").trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return CATEGORY_ALIASES[key] ?? key;
}

export function categoryLabel(key: string): string {
  if (CATEGORY_LABELS[key]) return CATEGORY_LABELS[key];
  const text = key.replace(/[-_]+/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Categorías con al menos una actividad, de la que más tiene a la que menos. */
export function groupByCategory(activities: DestinationActivity[]): ActivityCategory[] {
  const groups = new Map<string, ActivityCategory>();
  for (const activity of activities) {
    const key = categoryKey(activity.category);
    if (!key) continue;
    const group = groups.get(key) ?? { key, label: categoryLabel(key), count: 0, image: null };
    group.count += 1;
    group.image ??= activity.image_url;
    groups.set(key, group);
  }
  return [...groups.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "es"));
}

const FIELDS = "id,slug,title,category,short_description,image_url,price,duration,rating,difficulty";

async function loadDestinationActivities(slug: string): Promise<DestinationActivity[]> {
  const destination = await fetchApi<{ data: { id: string } }>(`/destinations/${encodeURIComponent(slug)}?fields=id`);
  const query = new URLSearchParams({ "filter[destination_id]": destination.data.id, per_page: "100", fields: FIELDS });
  return (await fetchApi<{ data: DestinationActivity[] }>(`/experiences?${query}`)).data;
}

export function useDestinationActivities(slug: string | undefined) {
  return useQuery({
    queryKey: ["destination-activities", slug],
    queryFn: () => loadDestinationActivities(slug!),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });
}
