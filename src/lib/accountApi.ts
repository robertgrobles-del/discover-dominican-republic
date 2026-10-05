import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";

/**
 * Datos de la cuenta en el backend: perfil y reseñas. Lo usan las pantallas cuando la sesión es real
 * (`HAS_BACKEND_SESSION`); con la sesión simulada siguen con el cliente de demostración.
 */

export interface AccountProfile { display_name: string | null; bio: string | null; preferred_language: string | null; travel_interests: string[] | null; avatar_url: string | null }
interface ApiProfile { display_name: string | null; bio: string | null; locale: string; travel_interests: string[]; avatar_url: string | null }

const toProfile = (p: ApiProfile): AccountProfile => ({ display_name: p.display_name, bio: p.bio, preferred_language: p.locale, travel_interests: p.travel_interests ?? [], avatar_url: p.avatar_url });
const LOCALES = ["es", "en", "fr", "de", "pt", "it"];

/** Colecciones del catálogo que admiten reseñas, con el nombre con que se muestran. */
export const REVIEWABLE_COLLECTIONS = {
  hotels: { entityType: "hotel", label: "Alojamiento" },
  restaurants: { entityType: "restaurant", label: "Restaurante" },
  beaches: { entityType: "beach", label: "Playa" },
  bars: { entityType: "bar", label: "Bar" },
  experiences: { entityType: "experience", label: "Experiencia" },
  destinations: { entityType: "destination", label: "Destino" },
} as const;
export type ReviewableCollection = keyof typeof REVIEWABLE_COLLECTIONS;
const labelOf = (collection: string | undefined) => (collection && collection in REVIEWABLE_COLLECTIONS ? REVIEWABLE_COLLECTIONS[collection as ReviewableCollection].label : "Lugar");

interface ApiEntity { name: string; slug: string | null; collection: string }
interface ApiReview { id: string; rating: number; title: string | null; comment: string | null; status?: string; helpful_count?: number; created_at: string; author?: string; entity: ApiEntity | null }

/** Reseña con la forma que ya pintan el perfil y el muro de opiniones. */
export interface AccountReview {
  id: string; title: string; content: string; rating: number; location: string; category: string; created_at: string;
  author_name: string; helpful_count: number; status?: string; url?: string;
}
const toReview = (r: ApiReview): AccountReview => ({
  id: r.id, rating: r.rating, title: r.title ?? (r.entity?.name ? `Mi visita a ${r.entity.name}` : "Reseña"), content: r.comment ?? "",
  location: r.entity?.name ?? "República Dominicana", category: labelOf(r.entity?.collection), created_at: r.created_at,
  author_name: r.author ?? "Tú", helpful_count: r.helpful_count ?? 0, status: r.status,
});

export interface ReviewablePlace { collection: ReviewableCollection; slug: string; name: string; label: string }

/** Mensaje para la persona a partir del error de la API (reseña repetida, texto demasiado corto…). */
export function apiMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpError) {
    const body = error.details as { error?: { message?: string; details?: { issue?: string }[] } } | null;
    return body?.error?.details?.[0]?.issue ?? body?.error?.message ?? fallback;
  }
  return fallback;
}

export const accountApi = {
  async profile(): Promise<AccountProfile> {
    return toProfile((await fetchApi<{ data: ApiProfile }>("/me/profile")).data);
  },
  async saveProfile(profile: AccountProfile): Promise<AccountProfile> {
    const body = {
      display_name: profile.display_name?.trim() || undefined, bio: profile.bio?.trim() || null,
      travel_interests: (profile.travel_interests ?? []).slice(0, 20),
      ...(profile.preferred_language && LOCALES.includes(profile.preferred_language) ? { locale: profile.preferred_language } : {}),
    };
    return toProfile((await fetchApi<{ data: ApiProfile }>("/me/profile", { method: "PATCH", body: JSON.stringify(body) })).data);
  },

  /** Mis reseñas, incluidas las que siguen en revisión. */
  async myReviews(): Promise<AccountReview[]> {
    return (await fetchApi<{ data: ApiReview[] }>("/me/reviews?per_page=50")).data.map(toReview);
  },
  deleteReview(id: string): Promise<unknown> {
    return fetchApi(`/reviews/${id}`, { method: "DELETE" });
  },
  /** Reseñas aprobadas más recientes de todo el portal. */
  async recentReviews(perPage = 30): Promise<AccountReview[]> {
    return (await fetchApi<{ data: ApiReview[] }>(`/reviews/recent?per_page=${perPage}`)).data.map(toReview);
  },
  /** Publica una reseña de un lugar del catálogo. Devuelve si quedó publicada o en revisión. */
  async createReview(place: ReviewablePlace, review: { rating: number; title?: string; comment: string }): Promise<{ status: "approved" | "pending"; message?: string }> {
    const { data: entity } = await fetchApi<{ data: { id: string } }>(`/${place.collection}/${encodeURIComponent(place.slug)}?fields=id`);
    const body = { entity_type: REVIEWABLE_COLLECTIONS[place.collection].entityType, entity_id: entity.id, rating: review.rating, title: review.title?.trim() || undefined, comment: review.comment.trim() };
    return (await fetchApi<{ data: { status: "approved" | "pending"; message?: string } }>("/reviews", { method: "POST", body: JSON.stringify(body) })).data;
  },

  /** Lugares del catálogo que se pueden reseñar, por orden alfabético. Sus datos se cargan al pedirlos. */
  async reviewablePlaces(): Promise<ReviewablePlace[]> {
    const [h, r, b, ba, e, d] = await Promise.all([import("@/data/hotels"), import("@/data/restaurants"), import("@/data/beaches"), import("@/data/bars"), import("@/data/experiences"), import("@/data/destinations")]);
    const of = (collection: ReviewableCollection, items: { slug: string; name: string }[]): ReviewablePlace[] => items.map((item) => ({ collection, slug: item.slug, name: item.name, label: `${item.name} · ${REVIEWABLE_COLLECTIONS[collection].label}` }));
    const all = [...of("hotels", h.hotels), ...of("restaurants", r.restaurants), ...of("beaches", b.beaches), ...of("bars", ba.bars), ...of("experiences", e.experiences), ...of("destinations", d.destinations)];
    // Dos lugares con el mismo nombre y tipo darían la misma etiqueta: se queda el primero.
    return [...new Map(all.map((place) => [place.label, place])).values()].sort((x, y) => x.label.localeCompare(y.label, "es"));
  },
};
