/**
 * CONJUNTO DE DATOS DE DEMOSTRACIÓN — centro de identidad y reputación del creador
 * (Plan de accesos, punto 41) y moderación/apelación de contenido (punto 44).
 *
 * Este archivo existe por una única razón: el entorno de desarrollo corre con
 * `VITE_DATA_SOURCE=mock` (`IS_MOCK_DATA`) y en ese modo los endpoints
 * `GET/PATCH /api/v1/creators/me/identity` y `GET /api/v1/creators/me/appeals` no existen
 * todavía (los implementa el backend en paralelo). Todo lo que hay aquí es **simulado**,
 * está marcado con `demo: true` y la interfaz lo anuncia con un Badge "demo".
 *
 * Regla de oro: con `VITE_DATA_SOURCE=api` este archivo no se usa para pintar nada. La
 * única fuente de verdad es el servidor; si la llamada falla se muestra el error, nunca
 * estos datos.
 */
import type { CreatorIdentityBundle } from "./CreatorsIdentityTab";
import type { CreatorAppealItem } from "./CreatorsAppealsTab";

/** Marca de datos de demostración, exportada para que la interfaz muestre el Badge "demo". */
export const DEMO_CREATOR_DATA = true as const;

/**
 * Opciones de formulario (categorías y idiomas) que se ofrecen al creador. No son datos
 * simulados de backend: son la lista de elección de la interfaz, disponible igual en modo
 * `mock` y en modo `api`.
 */
export const CREATOR_CATEGORY_OPTIONS = [
  "Playas y costas",
  "Hoteles y resorts",
  "Gastronomía",
  "Aventura y ecoturismo",
  "Cultura y patrimonio",
  "Wellness y spa",
  "Vida nocturna",
  "Viajes en familia",
] as const;

export const CREATOR_LANGUAGE_OPTIONS = [
  "Español",
  "Inglés",
  "Francés",
  "Alemán",
  "Italiano",
  "Portugués",
] as const;

/** Respuesta simulada de `GET /creators/me/identity`. */
export const demoCreatorIdentity: CreatorIdentityBundle & { demo: true } = {
  demo: true,
  profile: {
    id: "demo-creator-1",
    display_name: "Camila Reyes",
    handle: "@camila.viaja.rd",
    avatar_url: "https://i.pravatar.cc/160?img=47",
    bio:
      "Creadora de viajes dominicanos. Playas escondidas, hoteles con encanto y gastronomía de " +
      "barrio en Puerto Plata, Samaná y la Zona Colonial.",
  },
  identity: {
    categories: ["Playas y costas", "Hoteles y resorts", "Gastronomía"],
    languages: ["Español", "Inglés"],
    public_profile: true,
    bio:
      "Creadora de viajes dominicanos. Playas escondidas, hoteles con encanto y gastronomía de " +
      "barrio en Puerto Plata, Samaná y la Zona Colonial.",
    audience_verified: true,
    audience_verified_at: "2026-04-18",
    audience_metrics: {
      followers: 48200,
      views: 1_264_300,
      engagement_rate: 6.4,
    },
    reputation_score: 82,
    reputation_breakdown: [
      { key: "audiencia_verificada", label: "Audiencia verificada", points: 30, max_points: 30 },
      { key: "cumplimiento_normas", label: "Cumplimiento de las normas", points: 25, max_points: 30 },
      { key: "consistencia", label: "Consistencia de publicación", points: 17, max_points: 25 },
      { key: "calidad_auditada", label: "Calidad del contenido auditado", points: 10, max_points: 15 },
    ],
  },
  seals: [
    {
      seal_key: "audiencia_verificada",
      awarded_at: "2026-04-18",
      expires_at: "2027-04-18",
      evidence: "Panel de métricas de Instagram y TikTok revisado el 18/04/2026.",
    },
    {
      seal_key: "contenido_original",
      awarded_at: "2026-05-02",
      expires_at: null,
      evidence: "12 piezas propias verificadas sin reutilización de material de terceros.",
    },
  ],
  seal_catalog: [
    {
      key: "audiencia_verificada",
      label: "Audiencia verificada",
      purpose: "Confirma que las métricas de audiencia declaradas son reales y auditables.",
      criteria:
        "Conectar al menos una red social y superar 5.000 seguidores reales con una tasa de " +
        "engagement verificada igual o mayor al 3 % en los últimos 90 días.",
    },
    {
      key: "contenido_original",
      label: "Contenido original",
      purpose: "Reconoce piezas propias y no reutilizadas sobre destinos dominicanos.",
      criteria:
        "Publicar 10 o más piezas originales sobre destinos dominicanos en los últimos 12 meses, " +
        "sin material de terceros sin licencia acreditada.",
    },
    {
      key: "reservas_comprobadas",
      label: "Reservas comprobadas",
      purpose: "Reconoce el contenido que genera reservas verificadas en la plataforma.",
      criteria:
        "Generar al menos 15 reservas confirmadas mediante enlaces propios en los últimos 6 meses.",
    },
    {
      key: "buenas_practicas",
      label: "Buenas prácticas y transparencia",
      purpose: "Reconoce el cumplimiento de las normas de contenido y de publicidad.",
      criteria:
        "No acumular sanciones de moderación vigentes y declarar siempre los patrocinios y las " +
        "colaboraciones pagadas en la propia pieza.",
    },
  ],
};

/**
 * Respuesta simulada de `GET /creators/me/appeals`. Los identificadores de vídeo no tienen por
 * qué existir hoy en "Mis Contenidos": el historial incluye piezas ya archivadas o retiradas.
 */
export const demoCreatorAppeals: CreatorAppealItem[] = [
  {
    id: "appeal-demo-1",
    video_id: "9",
    reason:
      "El patrocinio sí está declarado en los primeros 5 segundos del vídeo; adjunto la marca de tiempo exacta.",
    status: "pending",
    rule_code: "PUBLICIDAD_NO_DECLARADA",
    resolution_note: null,
    resolved_at: null,
    created_at: "2026-06-14T10:20:00.000Z",
  },
  {
    id: "appeal-demo-2",
    video_id: "10",
    reason: "La música cuenta con licencia adquirida; envié la factura al correo de moderación.",
    status: "accepted",
    rule_code: "DERECHOS_DE_AUTOR",
    resolution_note: "Se verificó la licencia y se restauró la publicación.",
    resolved_at: "2026-05-30T15:05:00.000Z",
    created_at: "2026-05-24T09:00:00.000Z",
  },
  {
    id: "appeal-demo-3",
    video_id: "11",
    reason: "Considero que el metraje no muestra menores de edad identificables.",
    status: "rejected",
    rule_code: "IMAGEN_DE_MENORES",
    resolution_note:
      "La revisión confirmó que el rostro de un menor es identificable; la decisión de moderación se mantiene.",
    resolved_at: "2026-06-02T12:30:00.000Z",
    created_at: "2026-05-28T18:45:00.000Z",
  },
];
