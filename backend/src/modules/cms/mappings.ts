// Correspondencia entre los tipos de contenido de Strapi (cms/src/api/*, nombres en español) y las tablas de esta API.
// Para conectar un tipo nuevo basta añadir una entrada aquí (y, si hace falta, su colección en content/collections.ts).

export type FieldKind =
  | "text"      // texto plano
  | "richtext"  // Markdown (Strapi 5 "richtext") o bloques JSON, se guarda como texto
  | "number"
  | "bool"
  | "json"      // se guarda tal cual en jsonb
  | "media"     // un archivo → URL
  | "medias"    // varios archivos → arreglo de URL
  | "list";     // arreglo o mapa {clave: true} → arreglo de claves (jsonb)

export interface FieldMap {
  /** Atributo en Strapi */
  from: string;
  /** Columna en esta base */
  to: string;
  kind: FieldKind;
  /** Localizado en Strapi: el idioma base va a la columna, los demás a `entity_translations` */
  localized?: boolean;
}

export interface RelationMap {
  /** Atributo de relación en Strapi (muchos a uno) */
  from: string;
  /** Columna con la clave foránea */
  column: string;
  /** Modelo de Strapi al que apunta */
  model: string;
}

export interface Mapping {
  /** singularName en Strapi (el `model` de los webhooks) */
  model: string;
  /** pluralName: ruta REST (`/api/destinos`) */
  plural: string;
  table: string;
  /** Con "Draft & Publish" sólo cuentan los eventos publish/unpublish/delete; sin él, create/update publican directamente */
  draftAndPublish: boolean;
  fields: FieldMap[];
  relations?: RelationMap[];
  /** Columna derivada: primera imagen de la galería si no hay imagen principal, etc. */
  fallbackImage?: { column: string; gallery: string };
}

const common = (mapping: Mapping): Mapping => mapping;

export const MAPPINGS: Mapping[] = [
  common({
    model: "destino", plural: "destinos", table: "destinations", draftAndPublish: true,
    fields: [
      { from: "nombre", to: "name", kind: "text", localized: true },
      { from: "slug", to: "slug", kind: "text" },
      { from: "region", to: "region", kind: "text" },
      { from: "descripcionCorta", to: "short_description", kind: "text", localized: true },
      { from: "descripcionLarga", to: "description", kind: "richtext", localized: true },
      { from: "mejorEpoca", to: "best_time_to_visit", kind: "text", localized: true },
      { from: "temperaturaPromedio", to: "average_temperature", kind: "text" },
      { from: "rating", to: "rating", kind: "number" },
      { from: "latitud", to: "latitude", kind: "number" },
      { from: "longitud", to: "longitude", kind: "number" },
      { from: "imagenHero", to: "image_url", kind: "media" },
      { from: "galeria", to: "gallery", kind: "medias" },
    ],
    fallbackImage: { column: "image_url", gallery: "gallery" },
  }),
  common({
    model: "playa", plural: "playas", table: "beaches", draftAndPublish: true,
    fields: [
      { from: "nombre", to: "name", kind: "text", localized: true },
      { from: "slug", to: "slug", kind: "text" },
      { from: "descripcion", to: "description", kind: "text", localized: true },
      { from: "tipoArena", to: "sand_type", kind: "text" },
      { from: "nivelOleaje", to: "wave_intensity", kind: "text" },
      { from: "servicios", to: "amenities", kind: "list" },
      { from: "latitud", to: "latitude", kind: "number" },
      { from: "longitud", to: "longitude", kind: "number" },
      { from: "imagenPrincipal", to: "image_url", kind: "media" },
      { from: "galeria", to: "gallery", kind: "medias" },
    ],
    relations: [{ from: "destino", column: "destination_id", model: "destino" }],
    fallbackImage: { column: "image_url", gallery: "gallery" },
  }),
  common({
    model: "alojamiento", plural: "alojamientos", table: "hotels", draftAndPublish: true,
    fields: [
      { from: "nombre", to: "name", kind: "text" },
      { from: "slug", to: "slug", kind: "text" },
      { from: "categoria", to: "category", kind: "text" },
      { from: "estrellas", to: "stars", kind: "number" },
      { from: "rangoPrecio", to: "price_range", kind: "text" },
      { from: "precioDesdeUSD", to: "price_from_usd", kind: "number" },
      { from: "descripcion", to: "description", kind: "text", localized: true },
      { from: "amenidades", to: "amenities", kind: "list" },
      { from: "enlaceReserva", to: "booking_url", kind: "text" },
      { from: "imagenes", to: "gallery", kind: "medias" },
    ],
    relations: [{ from: "destino", column: "destination_id", model: "destino" }],
    fallbackImage: { column: "image_url", gallery: "gallery" },
  }),
  // Definidos en strapi-schema-manifest.md; se activan solos en cuanto el tipo exista en el CMS.
  common({
    model: "experiencia", plural: "experiencias", table: "experiences", draftAndPublish: true,
    fields: [
      { from: "titulo", to: "title", kind: "text", localized: true },
      { from: "slug", to: "slug", kind: "text" },
      { from: "categoria", to: "category", kind: "text" },
      { from: "duracionHoras", to: "duration", kind: "text" },
      { from: "precioUSD", to: "price", kind: "number" },
      { from: "incluye", to: "included", kind: "list", localized: true },
      { from: "descripcion", to: "description", kind: "text", localized: true },
      { from: "imagenes", to: "gallery", kind: "medias" },
    ],
    relations: [{ from: "destino", column: "destination_id", model: "destino" }],
    fallbackImage: { column: "image_url", gallery: "gallery" },
  }),
  common({
    model: "aeropuerto", plural: "aeropuertos", table: "airports", draftAndPublish: true,
    fields: [
      { from: "nombre", to: "name", kind: "text" },
      { from: "slug", to: "slug", kind: "text" },
      { from: "codigoIATA", to: "iata_code", kind: "text" },
      { from: "tipo", to: "airport_type", kind: "text" },
      { from: "ciudad", to: "city", kind: "text" },
      { from: "descripcion", to: "description", kind: "text", localized: true },
      { from: "aerolineas", to: "airlines", kind: "list" },
      { from: "servicios", to: "services", kind: "list", localized: true },
      { from: "transporte", to: "transport", kind: "list", localized: true },
      { from: "imagenUrl", to: "image_url", kind: "media" },
    ],
  }),
];

export const MAPPING_BY_MODEL = new Map(MAPPINGS.map((m) => [m.model, m]));
export const MAPPING_BY_UID = new Map(MAPPINGS.map((m) => [`api::${m.model}.${m.model}`, m]));
