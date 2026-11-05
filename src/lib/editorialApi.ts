import { loadPublicNews, type PublicNews } from "@/lib/stagingContent";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fastifyClient";
import { CATALOG_SOURCE } from "@/lib/catalogSource";
import type { BlogPost } from "@/data/blogData";

/**
 * Publicaciones del portal (decisión B7): blog de viajes, noticias, prensa, firmas invitadas y crónicas de
 * historia viven en una sola colección del backend (`articles`) y se muestran en una sola sección (`/revista`).
 * Esta capa las lee de la API cuando el catálogo viene del backend; si no, usa los archivos del sitio.
 */

export type EditorialChannelId = "viajes" | "noticias" | "prensa" | "firmas" | "historia";

export interface EditorialChannel { id: EditorialChannelId; label: string; kicker: string; description: string }

export const EDITORIAL_CHANNELS: EditorialChannel[] = [
  { id: "viajes", label: "Blog de viajes", kicker: "Rutas y vivencias", description: "Playas, montañas, sabores y rutas contadas por quienes las recorren." },
  { id: "noticias", label: "Noticias", kicker: "Actualidad", description: "Lo que cambia en el turismo dominicano: aperturas, cifras y avisos." },
  { id: "prensa", label: "Sala de prensa", kicker: "Comunicados", description: "Notas oficiales de instituciones, hoteles y aliados del sector." },
  { id: "firmas", label: "Firmas invitadas", kicker: "Opinión", description: "Chefs, fotógrafos, guías y vecinos escriben sobre su país." },
  { id: "historia", label: "Historia", kicker: "Crónicas", description: "Épocas, personajes y hechos que explican la República Dominicana." },
];

export interface EditorialArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  channel: EditorialChannelId;
  category: string;
  image: string | null;
  publishedAt: string | null;
  readMinutes: number | null;
  authorName: string;
  authorRole: string | null;
  authorAvatar: string | null;
  tags: string[];
  featured: boolean;
  trending: boolean;
  pressPartner: string | null;
  /** Las crónicas de historia tienen su propia ficha; el resto usa la del artículo. */
  href: string;
}

const CHANNEL_BY_CATEGORY: Record<string, EditorialChannelId> = { experiencias: "viajes", noticias: "noticias", prensa: "prensa", invitados: "firmas" };

export function channelOf(category: string | null | undefined): EditorialChannelId {
  const key = (category ?? "").toLowerCase();
  if (key.startsWith("historia")) return "historia";
  return CHANNEL_BY_CATEGORY[key] ?? "viajes";
}

export const channelLabel = (id: EditorialChannelId) => EDITORIAL_CHANNELS.find((c) => c.id === id)?.label ?? id;

/** La base guarda las imágenes empaquetadas como `/assets/archivo.jpg`; esa ruta no existe en el sitio compilado. */
async function imageResolver(): Promise<(url: string | null | undefined) => string | null> {
  const { resolvePackagedAsset } = await import("@/services/catalogBrowser");
  return (url) => {
    if (!url) return null;
    if (!url.startsWith("/assets/")) return url;
    return resolvePackagedAsset(url.slice("/assets/".length)) ?? null;
  };
}

interface ApiArticle {
  id: string; slug: string; title: string; excerpt: string | null; content?: string | null; image_url: string | null; category: string | null;
  tags: string[] | null; author_name: string | null; author_image: string | null; author_role: string | null; author_avatar: string | null;
  is_featured: boolean | null; is_trending: boolean | null; published_at: string | null; read_time_min: number | null;
  reactions_count?: { likes?: number; love?: number; fire?: number } | null;
  press_partner_name: string | null; press_contact_email?: string | null; press_source_url?: string | null; extras?: Partial<BlogPost> | null;
}

const LIST_FIELDS = "id,slug,title,excerpt,image_url,category,tags,author_name,author_image,author_role,author_avatar,is_featured,is_trending,published_at,read_time_min,reactions_count,press_partner_name";

const hrefOf = (channel: EditorialChannelId, slug: string) => (channel === "historia" ? `/historia/${slug}` : `/articulo/${slug}`);

function fromApi(a: ApiArticle, image: (url: string | null | undefined) => string | null): EditorialArticle {
  const channel = channelOf(a.category);
  return {
    id: a.id, slug: a.slug, title: a.title, excerpt: a.excerpt ?? "", channel, category: a.category ?? "", image: image(a.image_url),
    publishedAt: a.published_at, readMinutes: a.read_time_min, authorName: a.author_name ?? "Redacción Descubre RD", authorRole: a.author_role,
    authorAvatar: image(a.author_avatar ?? a.author_image), tags: a.tags ?? [], featured: Boolean(a.is_featured), trending: Boolean(a.is_trending),
    pressPartner: a.press_partner_name, href: hrefOf(channel, a.slug),
  };
}

const minutesOf = (readTime: string | undefined) => { const n = Number.parseInt(readTime ?? "", 10); return Number.isFinite(n) ? n : null; };

function fromStatic(p: BlogPost): EditorialArticle {
  const channel = channelOf(p.category);
  return {
    id: p.id, slug: p.slug, title: p.title, excerpt: p.excerpt, channel, category: p.category, image: p.imageUrl || null, publishedAt: p.publishedAt || null,
    readMinutes: minutesOf(p.readTime), authorName: p.author.name, authorRole: p.author.role || null, authorAvatar: p.author.avatar || null, tags: p.tags,
    featured: Boolean(p.isFeatured), trending: false, pressPartner: p.pressReleaseDetails?.partnerName ?? null, href: hrefOf(channel, p.slug),
  };
}

function fromPublicNews(n: PublicNews, featured: boolean): EditorialArticle {
  return {
    id: n.id, slug: n.slug, title: n.title, excerpt: n.excerpt ?? "", channel: "noticias", category: n.category_name ?? "Noticias", image: n.cover_url,
    publishedAt: n.published_at, readMinutes: n.body ? Math.max(1, Math.round(n.body.split(/\s+/).length / 200)) : null, authorName: n.author || "Redacción Descubre RD", authorRole: null, authorAvatar: null,
    tags: n.province_name ? [n.province_name] : [], featured, trending: false, pressPartner: null, href: hrefOf("noticias", n.slug),
  };
}

async function loadArticles(): Promise<EditorialArticle[]> {
  if (CATALOG_SOURCE !== "api") {
    // Staging: las noticias publicadas desde el panel (Turso) van primero; luego, las locales.
    const [{ blogPosts }, published] = await Promise.all([import("@/data/blogData"), loadPublicNews()]);
    // La que se marque como destacada ocupa la portada; si no hay ninguna, la más reciente del panel.
    const anyFeatured = published.some((n) => n.featured);
    return [...published.map((n, i) => fromPublicNews(n, anyFeatured ? Boolean(n.featured) : i === 0)), ...blogPosts.map(fromStatic)];
  }
  const image = await imageResolver();
  const query = new URLSearchParams({ per_page: "100", sort: "-published_at", fields: LIST_FIELDS });
  const res = await fetchApi<{ data: ApiArticle[] }>(`/articles?${query}`);
  return res.data.map((a) => fromApi(a, image));
}

/** Todas las publicaciones, de la más reciente a la más antigua. */
export function useEditorialArticles() {
  return useQuery({ queryKey: ["editorial-articles", CATALOG_SOURCE], queryFn: loadArticles, staleTime: 5 * 60 * 1000 });
}

/**
 * Un artículo con la forma que pinta la ficha (`BlogPost`). El backend guarda en `extras` las partes propias de
 * esa ficha (secciones, patrocinio, datos del comunicado); las columnas mandan sobre lo que haya ahí.
 */
async function loadArticle(slug: string): Promise<BlogPost | null> {
  if (CATALOG_SOURCE !== "api") {
    const { getBlogPostBySlug } = await import("@/data/blogData");
    return getBlogPostBySlug(slug) ?? null;
  }
  const image = await imageResolver();
  let a: ApiArticle;
  try {
    a = (await fetchApi<{ data: ApiArticle }>(`/articles/${encodeURIComponent(slug)}`)).data;
  } catch (error) {
    if ((error as { status?: number }).status === 404) return null;
    throw error;
  }
  const extras = a.extras ?? {};
  const category = (a.category ?? extras.category ?? "experiencias") as BlogPost["category"];
  return {
    ...extras,
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt ?? extras.excerpt ?? "",
    content: a.content ?? extras.content ?? "",
    category,
    categoryLabel: extras.categoryLabel ?? channelLabel(channelOf(category)),
    tags: a.tags ?? extras.tags ?? [],
    imageUrl: image(a.image_url) ?? extras.imageUrl ?? "",
    publishedAt: a.published_at ? formatEditorialDate(a.published_at) : extras.publishedAt ?? "",
    readTime: a.read_time_min ? `${a.read_time_min} min` : extras.readTime ?? "",
    author: {
      name: a.author_name ?? extras.author?.name ?? "Redacción Descubre RD",
      role: a.author_role ?? extras.author?.role ?? "",
      avatar: image(a.author_avatar ?? a.author_image) ?? extras.author?.avatar ?? "",
      verified: extras.author?.verified ?? false,
      company: extras.author?.company,
    },
    isFeatured: Boolean(a.is_featured),
    reactions_count: a.reactions_count ?? extras.reactions_count ?? { likes: 0, love: 0, fire: 0 },
    pressReleaseDetails: a.press_partner_name
      ? { partnerName: a.press_partner_name, contactEmail: a.press_contact_email ?? "", officialSourceUrl: a.press_source_url ?? undefined }
      : extras.pressReleaseDetails,
  };
}

export async function reactToEditorialArticle(slugOrId: string, reaction: "likes" | "love" | "fire" = "likes", delta: 1 | -1 = 1): Promise<{ likes: number; love?: number; fire?: number }> {
  const res = await fetchApi<{ data: { reactions_count: { likes: number; love: number; fire: number } } }>(`/articles/${encodeURIComponent(slugOrId)}/react`, {
    method: "POST",
    body: JSON.stringify({ reaction, delta }),
  });
  return res.data.reactions_count;
}

export function useEditorialArticle(slug: string | undefined) {
  return useQuery({ queryKey: ["editorial-article", CATALOG_SOURCE, slug], queryFn: () => loadArticle(slug!), enabled: Boolean(slug), staleTime: 5 * 60 * 1000 });
}

/** Propuesta de artículo o comunicado: llega al equipo por el formulario de contacto del backend. */
export async function sendEditorialProposal(input: { kind: "invitado" | "prensa"; name: string; email: string; organization?: string; title: string; body: string; link?: string }): Promise<void> {
  const lines = [input.body.trim(), input.organization ? `Organización: ${input.organization}` : "", input.link ? `Enlace: ${input.link}` : ""].filter(Boolean);
  await fetchApi("/contact", {
    method: "POST",
    body: JSON.stringify({
      name: input.name.trim(),
      email: input.email.trim(),
      category: input.kind === "prensa" ? "press" : "creators",
      subject: `${input.kind === "prensa" ? "Comunicado de prensa" : "Propuesta de artículo"}: ${input.title.trim()}`.slice(0, 150),
      message: lines.join("\n\n"),
    }),
  });
}

export function formatEditorialDate(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric" });
}
