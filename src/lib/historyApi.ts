import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fastifyClient";
import { CATALOG_SOURCE } from "@/lib/catalogSource";
import { getHistoryArticleBySlug, historyArticles, type HistoryArticle } from "@/data/historyArticles";

/**
 * Carga una crónica, personaje o evento histórico desde el backend.
 * Intenta secuencialmente:
 * 1. Colección editorial /articles/:slug (cuando channel es historia)
 * 2. Colección /historical-figures/:slug
 * 3. Colección /historical-events/:slug
 * 4. Fallback a datos locales de src/data/historyArticles.ts
 */
export async function fetchHistoryArticleBySlug(slug: string): Promise<HistoryArticle | null> {
  if (!slug) return null;

  if (CATALOG_SOURCE === "api") {
    // 1. Intentar /articles/:slug
    try {
      const artRes = await fetchApi<{
        data: {
          id: string;
          slug: string;
          title: string;
          excerpt: string | null;
          content: string | null;
          image_url: string | null;
          category: string | null;
          author_name: string | null;
          author_role: string | null;
          author_avatar: string | null;
          read_time_min: number | null;
          extras?: Record<string, any> | null;
        };
      }>(`/articles/${encodeURIComponent(slug)}`);

      if (artRes?.data) {
        const d = artRes.data;
        const extras = d.extras || {};
        return {
          id: d.id,
          slug: d.slug,
          title: d.title,
          subtitle: extras.subtitle || d.author_role || "Crónica Histórica Dominicana",
          category: extras.category || (d.category?.replace("historia-", "") as any) || "biografia",
          era: extras.era || "Independencia",
          period: extras.period || "",
          heroImage: d.image_url || extras.heroImage || "/assets/history.jpg",
          author: {
            name: d.author_name || extras.author?.name || "Comité de Historia Dominicana",
            role: d.author_role || extras.author?.role || "Historiador Oficial MITUR / AGN",
            avatar: d.author_avatar || extras.author?.avatar,
          },
          readTime: d.read_time_min ? `${d.read_time_min} min` : extras.readTime || "7 min",
          summary: d.excerpt || extras.summary || "",
          quote: extras.quote,
          contentSections: extras.contentSections || [
            { heading: "Relato Histórico", content: d.content || d.excerpt || "" },
          ],
          timeline: extras.timeline,
          relatedItems: extras.relatedItems,
          associatedMonumentSlugs: extras.associatedMonumentSlugs,
        };
      }
    } catch {
      // Intentar siguiente recurso
    }

    // 2. Intentar /historical-figures/:slug
    try {
      const figRes = await fetchApi<{
        data: {
          id: string;
          name: string;
          slug: string;
          title: string | null;
          era: string | null;
          category: string | null;
          short_description: string | null;
          description: string | null;
          biography: string | null;
          birth_date: string | null;
          death_date: string | null;
          image_url: string | null;
          quotes?: string[] | null;
          achievements?: Array<{ year?: string; title?: string; description?: string }> | null;
        };
      }>(`/historical-figures/${encodeURIComponent(slug)}`);

      if (figRes?.data) {
        const f = figRes.data;
        const period = f.birth_date && f.death_date
          ? `${f.birth_date.slice(0, 4)} – ${f.death_date.slice(0, 4)}`
          : f.birth_date ? f.birth_date.slice(0, 4) : "";
        return {
          id: f.id,
          slug: f.slug,
          title: f.name,
          subtitle: f.title || "Prócer de la Patria",
          category: "biografia",
          era: (f.era as any) || "Independencia",
          period,
          heroImage: f.image_url || "/assets/history.jpg",
          author: {
            name: "Comité de Historia Dominicana",
            role: "Historiador Oficial MITUR / AGN",
          },
          readTime: "7 min",
          summary: f.short_description || "",
          quote: Array.isArray(f.quotes) && f.quotes.length > 0 ? { text: f.quotes[0], author: f.name } : undefined,
          contentSections: [
            ...(f.biography ? [{ heading: "Biografía y Trayectoria", content: f.biography }] : []),
            ...(f.description ? [{ heading: "Legado Histórico", content: f.description }] : []),
          ],
          timeline: Array.isArray(f.achievements)
            ? f.achievements.map((a) => ({
                yearOrDate: a.year || "Hito",
                title: a.title || "Logro Histórico",
                description: a.description || "",
              }))
            : undefined,
        };
      }
    } catch {
      // Intentar siguiente recurso
    }

    // 3. Intentar /historical-events/:slug
    try {
      const evRes = await fetchApi<{
        data: {
          id: string;
          name: string;
          slug: string;
          era: string | null;
          category: string | null;
          year: number | null;
          short_description: string | null;
          description: string | null;
          significance: string | null;
          image_url: string | null;
        };
      }>(`/historical-events/${encodeURIComponent(slug)}`);

      if (evRes?.data) {
        const ev = evRes.data;
        return {
          id: ev.id,
          slug: ev.slug,
          title: ev.name,
          subtitle: ev.significance || "Gesta y Acontecimiento Histórico",
          category: "evento",
          era: (ev.era as any) || "Independencia",
          period: ev.year ? String(ev.year) : "",
          heroImage: ev.image_url || "/assets/history.jpg",
          author: {
            name: "Comité de Historia Dominicana",
            role: "Historiador Oficial MITUR / AGN",
          },
          readTime: "8 min",
          summary: ev.short_description || "",
          contentSections: [
            ...(ev.description ? [{ heading: "Desarrollo de los Hechos", content: ev.description }] : []),
          ],
        };
      }
    } catch {
      // Caer a fallback local
    }
  }

  // 4. Fallback a datos estáticos
  return getHistoryArticleBySlug(slug) ?? null;
}

/** Hook de React Query para la ficha de historia */
export function useHistoryArticle(slug: string | undefined) {
  return useQuery<HistoryArticle | null>({
    queryKey: ["history-article", CATALOG_SOURCE, slug],
    queryFn: () => (slug ? fetchHistoryArticleBySlug(slug) : null),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });
}

/** Carga el listado de artículos históricos fusionando API con datos base */
export async function fetchAllHistoryArticles(): Promise<HistoryArticle[]> {
  if (CATALOG_SOURCE !== "api") {
    return historyArticles;
  }

  const itemsBySlug = new Map<string, HistoryArticle>();
  // Primero cargamos los estáticos para tener la base completa
  for (const item of historyArticles) {
    itemsBySlug.set(item.slug, item);
  }

  // Luego consultamos artículos de historia en el backend
  try {
    const res = await fetchApi<{
      data: Array<{
        id: string;
        slug: string;
        title: string;
        excerpt: string | null;
        image_url: string | null;
        category: string | null;
        author_name: string | null;
        author_role: string | null;
        read_time_min: number | null;
        extras?: Record<string, any> | null;
      }>;
    }>("/articles?filter[category]=historia&per_page=50");

    if (Array.isArray(res?.data)) {
      for (const a of res.data) {
        const extras = a.extras || {};
        itemsBySlug.set(a.slug, {
          id: a.id,
          slug: a.slug,
          title: a.title,
          subtitle: extras.subtitle || a.author_role || "Crónica Histórica",
          category: extras.category || "biografia",
          era: extras.era || "Independencia",
          period: extras.period || "",
          heroImage: a.image_url || extras.heroImage || "/assets/history.jpg",
          author: {
            name: a.author_name || extras.author?.name || "Comité de Historia Dominicana",
            role: a.author_role || extras.author?.role || "Historiador Oficial MITUR / AGN",
          },
          readTime: a.read_time_min ? `${a.read_time_min} min` : "7 min",
          summary: a.excerpt || extras.summary || "",
          quote: extras.quote,
          contentSections: extras.contentSections || [{ content: a.excerpt || "" }],
          timeline: extras.timeline,
          relatedItems: extras.relatedItems,
          associatedMonumentSlugs: extras.associatedMonumentSlugs,
        });
      }
    }
  } catch {
    // Mantener base local
  }

  return Array.from(itemsBySlug.values());
}

/** Hook de React Query para el índice de historia */
export function useAllHistoryArticles() {
  return useQuery<HistoryArticle[]>({
    queryKey: ["all-history-articles", CATALOG_SOURCE],
    queryFn: fetchAllHistoryArticles,
    staleTime: 5 * 60 * 1000,
  });
}
