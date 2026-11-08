import { useMemo } from "react";
import { airports } from "@/data/airports";
import { eventosEstaticosCompletos, staticEventos } from "@/data/eventosData";
import { usePublicNewsList, usePublicEstablishments, type PublicNews, type PublicEstablishment } from "@/lib/stagingContent";

export type ContentItemType = "noticia" | "aeropuerto" | "pagina" | "evento" | "negocio";

export interface SiteContentItem {
  id: string;
  title: string;
  url: string;
  type: ContentItemType;
  badge: string;
  description?: string;
  publishedAt?: string;
}

/**
 * Páginas estáticas y guías principales activas en República Dominicana
 */
export const STATIC_SITE_PAGES: SiteContentItem[] = [
  {
    id: "page-home",
    title: "Inicio | Descubre República Dominicana",
    url: "/",
    type: "pagina",
    badge: "Principal",
    description: "Portal oficial de turismo y atractivos de República Dominicana",
  },
  {
    id: "page-negocios",
    title: "Directorio de Empresas y Negocios Turísticos",
    url: "/negocios",
    type: "pagina",
    badge: "Directorio",
    description: "Hoteles, restaurantes, bares, tours y comercios locales verificados",
  },
  {
    id: "page-aeropuertos",
    title: "Aeropuertos y Vuelos en Vivo (Hub FIDS)",
    url: "/aeropuerto",
    type: "pagina",
    badge: "Logística",
    description: "Monitoreo en vivo de vuelos, llegadas y salidas en los 8 aeropuertos internacionales",
  },
  {
    id: "page-eticket",
    title: "E-Ticket Migratorio Oficial (Entrada y Salida)",
    url: "/e-ticket",
    type: "pagina",
    badge: "Oficial",
    description: "Guía paso a paso para completar el formulario digital obligatorio y gratuito de Migración y Aduanas",
  },
  {
    id: "page-requisitos",
    title: "Requisitos de Viaje, Visas y Aduanas",
    url: "/requisitos-viaje",
    type: "pagina",
    badge: "Guía",
    description: "Documentos requeridos por país, pasaportes válidos, exenciones y normativas de equipaje",
  },
  {
    id: "page-eventos",
    title: "Calendario de Eventos y Festivales",
    url: "/eventos",
    type: "pagina",
    badge: "Cultura",
    description: "Carnavales, festivales de jazz, conciertos masivos y actividades culturales del país",
  },
  {
    id: "page-noticias",
    title: "Portal de Noticias de Turismo",
    url: "/noticias",
    type: "pagina",
    badge: "Actualidad",
    description: "Artículos, reportajes y novedades sobre turismo e inversión en RD",
  },
  {
    id: "page-contacto",
    title: "Contacto y Asistencia al Turista",
    url: "/contacto",
    type: "pagina",
    badge: "Soporte",
    description: "Canales oficiales de asistencia, policía turística (POLITUR) y oficinas de MITUR",
  },
  {
    id: "page-anunciate",
    title: "Anúnciate y Alianzas Comerciales",
    url: "/anunciate",
    type: "pagina",
    badge: "Comercial",
    description: "Planes publicitarios y visibilidad para empresas y operadores del sector",
  },
  {
    id: "page-registro-negocio",
    title: "Registro de Negocio Turístico",
    url: "/registra-tu-negocio",
    type: "pagina",
    badge: "Operadores",
    description: "Alta de hoteles, restaurantes, transportistas y guías en el directorio nacional",
  },
  {
    id: "page-privacidad",
    title: "Políticas de Privacidad",
    url: "/privacidad",
    type: "pagina",
    badge: "Legal",
    description: "Tratamiento de datos personales y seguridad del usuario",
  },
  {
    id: "page-terminos",
    title: "Términos y Condiciones de Uso",
    url: "/terminos",
    type: "pagina",
    badge: "Legal",
    description: "Condiciones de navegación y uso de los servicios del portal",
  },
];

/**
 * Convierte los 8 aeropuertos unificados a elementos indexables
 */
export const AIRPORT_CONTENT_ITEMS: SiteContentItem[] = airports.map((airport) => ({
  id: `airport-${airport.code.toLowerCase()}`,
  title: `${airport.name} (${airport.code})`,
  url: `/aeropuerto/${airport.slug}`,
  type: "aeropuerto",
  badge: `IATA: ${airport.code}`,
  description: `${airport.city}, ${airport.provinceName} • Operado por ${airport.operator || "Aerodom"}`,
}));

/**
 * Convierte los eventos estáticos a elementos indexables
 */
export const EVENT_CONTENT_ITEMS: SiteContentItem[] = [
  ...eventosEstaticosCompletos.map((ev) => ({
    id: `event-${ev.slug || ev.id}`,
    title: ev.name,
    url: `/evento/${ev.slug || ev.id}`,
    type: "evento" as const,
    badge: ev.event_type || "Festival",
    description: ev.short_description || ev.description.slice(0, 100),
  })),
  ...staticEventos.map((ev) => ({
    id: `event-static-${ev.id}`,
    title: ev.titulo,
    url: `/evento/${ev.id}`,
    type: "evento" as const,
    badge: ev.categoria || "Evento",
    description: `${ev.ubicacion} • ${ev.fecha}`,
  })),
].filter((item, index, self) => index === self.findIndex((t) => t.url === item.url));

/**
 * Hook universal que provee todo el contenido indexado del sitio (noticias, aeropuertos, páginas y eventos).
 */
export function useSiteContentIndex() {
  const { data: news = [], isLoading: isLoadingNews } = usePublicNewsList();
  const { data: establishments = [], isLoading: isLoadingEst } = usePublicEstablishments();

  const newsItems: SiteContentItem[] = useMemo(() => {
    return news.map((n: PublicNews) => ({
      id: `news-${n.slug}`,
      title: n.title,
      url: `/noticias/${n.slug}`,
      type: "noticia" as const,
      badge: n.category_name || "Noticia",
      description: n.excerpt || undefined,
      publishedAt: n.published_at || undefined,
    }));
  }, [news]);

  const establishmentItems: SiteContentItem[] = useMemo(() => {
    return establishments.map((e: PublicEstablishment) => ({
      id: `biz-${e.id}`,
      title: `${e.name}${e.province ? ` (${e.province})` : ""}`,
      url: `/negocios/${e.id}`,
      type: "negocio" as const,
      badge: e.type || "Empresa",
      description: e.description || `${e.type} verificado en ${e.province || "RD"}`,
    }));
  }, [establishments]);

  const allItems: SiteContentItem[] = useMemo(() => {
    return [
      ...STATIC_SITE_PAGES,
      ...AIRPORT_CONTENT_ITEMS,
      ...newsItems,
      ...establishmentItems,
      ...EVENT_CONTENT_ITEMS,
    ];
  }, [newsItems, establishmentItems]);

  return {
    allItems,
    newsItems,
    establishmentItems,
    airportItems: AIRPORT_CONTENT_ITEMS,
    pageItems: STATIC_SITE_PAGES,
    eventItems: EVENT_CONTENT_ITEMS,
    isLoading: isLoadingNews || isLoadingEst,
  };
}

/**
 * Búsqueda insensible a mayúsculas y acentos sobre el contenido indexado.
 */
export function filterContentItems(
  items: SiteContentItem[],
  query: string,
  typeFilter: ContentItemType | "all" = "all"
): SiteContentItem[] {
  const clean = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const q = clean(query);

  return items.filter((item) => {
    if (typeFilter !== "all" && item.type !== typeFilter) return false;
    if (!q) return true;

    const inTitle = clean(item.title).includes(q);
    const inUrl = clean(item.url).includes(q);
    const inDesc = item.description ? clean(item.description).includes(q) : false;
    const inBadge = clean(item.badge).includes(q);

    return inTitle || inUrl || inDesc || inBadge;
  });
}
