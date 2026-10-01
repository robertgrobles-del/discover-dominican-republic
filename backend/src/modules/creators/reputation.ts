/**
 * Catálogo público de identidad y reputación de creadores (punto 41 del plan).
 *
 * Este archivo es la **fuente publicada de los criterios**: es exactamente lo que ve el creador
 * en `GET /creators/me/identity` y lo que ve el público en `GET /creators/profile/:handle`.
 * Los sellos (`SEALS`) y el puntaje (`reputationScore`) describen reputación visible y no
 * conceden permisos ni capacidades: la autorización del creador sigue viniendo del perfil
 * aprobado y del catálogo de accesos. `reputationScore` es una función pura (sin base de datos)
 * para que los criterios se puedan auditar y probar de forma aislada.
 */

/** Categorías de contenido permitidas en el perfil del creador. */
export const CATEGORIES = [
  "playas", "gastronomia", "aventura", "cultura", "naturaleza", "vida-nocturna",
  "alojamiento", "transporte", "compras", "eventos", "bienestar", "familia",
] as const;
export type CreatorCategory = (typeof CATEGORIES)[number];

/** Idiomas permitidos en el perfil del creador (códigos ISO 639-1). */
export const LANGUAGES = ["es", "en", "fr", "de", "pt", "it"] as const;
export type CreatorLanguage = (typeof LANGUAGES)[number];

/** Nombre legible de cada idioma, tal como se publica en el perfil. */
export const LANGUAGE_LABELS: Record<CreatorLanguage, string> = {
  es: "Español", en: "Inglés", fr: "Francés", de: "Alemán", pt: "Portugués", it: "Italiano",
};

/** Definición publicada de un sello: qué premia y con qué criterio se otorga. */
export interface SealDefinition {
  key: string;
  label: string;
  purpose: string;
  criteria: string;
}

/**
 * Catálogo de sellos. Cada sello se otorga con `CreatorService.awardSeal` y su criterio es
 * público: el creador sabe de antemano qué necesita para conseguirlo.
 */
export const SEALS: readonly SealDefinition[] = [
  {
    key: "audience_verified",
    label: "Audiencia verificada",
    purpose: "Confirma que la audiencia declarada es real y no inflada con compras o bots.",
    criteria: "La plataforma revisa las métricas agregadas de los últimos 90 días y acredita que las vistas y los seguidores provienen de interacción orgánica sostenida.",
  },
  {
    key: "original_content",
    label: "Contenido original",
    purpose: "Distingue la producción propia de la copia o el reencauce de material ajeno.",
    criteria: "Todas las publicaciones del creador son de autoría propia, sin marcas de agua de terceros ni material descargado, y no acumula reclamos por derechos de autor.",
  },
  {
    key: "local_destination",
    label: "Destino local",
    purpose: "Reconoce a quien documenta un destino dominicano con conocimiento de primera mano.",
    criteria: "Al menos cinco publicaciones geolocalizadas en destinos de la República Dominicana verificadas por el equipo editorial, con presencia física comprobable.",
  },
  {
    key: "ugc_compliance",
    label: "Cumplimiento de normas UGC",
    purpose: "Premia el historial limpio frente a las normas de contenido de la comunidad.",
    criteria: "Sin publicaciones retiradas por incumplimiento en los últimos doce meses, sin apelaciones rechazadas y sin sanciones vigentes en la cuenta.",
  },
  {
    key: "campaign_completed",
    label: "Campaña completada",
    purpose: "Acredita experiencia real trabajando con marcas, operadores o destinos.",
    criteria: "Haber completado al menos una campaña pagada o de licenciamiento con todos los entregables aprobados y sin incidencias de facturación.",
  },
  {
    key: "identity_confirmed",
    label: "Identidad confirmada",
    purpose: "Aporta confianza al público sobre quién está detrás del perfil.",
    criteria: "Documento de identidad y canal de contacto verificados por el equipo de creadores, con el perfil público completo (biografía, avatar y enlaces).",
  },
];

export type SealKey = (typeof SEALS)[number]["key"];

/** Busca un sello del catálogo; devuelve `null` si la clave no está publicada. */
export const sealFor = (key: string): SealDefinition | null => SEALS.find((s) => s.key === key) ?? null;

/** Entrada de perfil que alimenta el cálculo de reputación. */
export interface ReputationProfile {
  tier?: string;
  status?: string;
  categories?: string[] | null;
  languages?: string[] | null;
  audience_verified?: boolean;
  audience_metrics?: Record<string, unknown> | null;
  public_profile?: boolean;
  /** Sellos vigentes otorgados al creador (parte de la entrada: el cálculo no consulta la base). */
  sealKeys: string[];
}

/** Métricas agregadas de producción y engagement que alimentan el cálculo. */
export interface ReputationStats {
  published_videos?: number;
  pending_review?: number;
  rejected_videos?: number;
  archived_videos?: number;
  total_views?: number;
  total_likes?: number;
  total_shares?: number;
  total_conversions?: number;
  open_appeals?: number;
  rejected_appeals?: number;
}

/** Un componente del desglose: cuánto aporta, su techo y por qué. */
export interface ReputationComponent {
  key: string;
  label: string;
  points: number;
  max: number;
  detail: string;
}

/** Resultado del cálculo: puntaje 0-100, desglose público y sellos considerados. */
export interface ReputationResult {
  score: number;
  breakdown: ReputationComponent[];
  seal_keys: string[];
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const round2 = (v: number) => Math.round(v * 100) / 100;

/**
 * Calcula la reputación (0-100) de un creador a partir de su identidad y sus métricas.
 * Función pura: sin acceso a base de datos ni efectos secundarios. El desglose se publica
 * junto al puntaje para que el creador entienda de dónde sale cada punto.
 */
export function reputationScore(profile: ReputationProfile, stats: ReputationStats = {}): ReputationResult {
  const categories = (profile.categories ?? []).filter((c) => (CATEGORIES as readonly string[]).includes(c));
  const languages = (profile.languages ?? []).filter((l) => (LANGUAGES as readonly string[]).includes(l));
  const seals = profile.sealKeys ?? [];
  const knownSeals = seals.filter((k) => sealFor(k) !== null);

  // Identidad declarada (15): categorías y idiomas visibles en el perfil.
  const identityPoints = Math.min(categories.length, 3) * 3 + Math.min(languages.length, 3) * 2;
  // Audiencia (15): el sello de audiencia verificada más el volumen real de vistas.
  const audiencePoints = (profile.audience_verified ? 9 : 0) + Math.min((stats.total_views ?? 0) / 10_000, 6);
  // Sellos (25): cinco sellos del catálogo, cinco puntos cada uno.
  const sealPoints = Math.min(knownSeals.length, 5) * 5;
  // Producción (20): publicaciones aprobadas y efectivamente publicadas.
  const productionPoints = Math.min(stats.published_videos ?? 0, 10) * 2;
  // Engagement (15): likes y comparticiones, que pesan más que la vista pasiva.
  const engagementRaw = ((stats.total_likes ?? 0) + (stats.total_shares ?? 0) * 2) / 100;
  const engagementPoints = Math.min(engagementRaw, 15);
  // Cumplimiento (10): se pierde con rechazos, retiros y apelaciones perdidas.
  const compliancePoints = clamp(
    10 - (stats.rejected_videos ?? 0) * 3 - (stats.rejected_appeals ?? 0) * 2 - (stats.open_appeals ?? 0),
    0, 10,
  );

  const breakdown: ReputationComponent[] = [
    { key: "identity", label: "Identidad declarada", points: round2(identityPoints), max: 15, detail: `${categories.length} categoría(s) y ${languages.length} idioma(s) publicados` },
    { key: "audience", label: "Audiencia", points: round2(audiencePoints), max: 15, detail: profile.audience_verified ? `Audiencia verificada con ${stats.total_views ?? 0} vistas acumuladas` : `${stats.total_views ?? 0} vistas acumuladas, audiencia sin verificar` },
    { key: "seals", label: "Sellos otorgados", points: sealPoints, max: 25, detail: knownSeals.length ? `Sellos vigentes: ${knownSeals.join(", ")}` : "Sin sellos otorgados todavía" },
    { key: "production", label: "Producción publicada", points: productionPoints, max: 20, detail: `${stats.published_videos ?? 0} publicación(es) aprobadas` },
    { key: "engagement", label: "Interacción", points: round2(engagementPoints), max: 15, detail: `${stats.total_likes ?? 0} me gusta y ${stats.total_shares ?? 0} comparticiones` },
    { key: "compliance", label: "Cumplimiento", points: round2(compliancePoints), max: 10, detail: `${stats.rejected_videos ?? 0} rechazo(s), ${stats.rejected_appeals ?? 0} apelación(es) rechazada(s), ${stats.open_appeals ?? 0} abierta(s)` },
  ];

  const total = breakdown.reduce((sum, c) => sum + c.points, 0);
  return { score: round2(clamp(total, 0, 100)), breakdown, seal_keys: knownSeals };
}
