import type { ContentReaderPort, GeoPoint, PublicContentCandidate, PublicContentCandidateQuery, PublicContentSearchHit, PublicContentSearchResult, PublicContentSectionItem, PublicMapFeature, PublicMapLayer, PublicNearbyPlace, PublicPlace, PublicProvince, ReverseGeocodeResult } from "../../contracts/content-reader.js";
import type { Pool as Db } from "pg";
import { COLLECTIONS } from "../../contracts/content-collections.js";
import { contentColumns, hasContentColumn } from "../../contracts/content-schema.js";
import { contentVisibility as visibility } from "../../contracts/content-visibility.js";

const Q = (name: string) => `"${name}"`;
const searchLike = (value: string) => `%${value.replace(/[\\%_]/g, "\\$&")}%`;
const haversineSql = (latCol: string, lngCol: string, latParam: string, lngParam: string) =>
  `(2 * 6371000 * asin(sqrt(power(sin(radians((${latCol} - ${latParam}) / 2)), 2) + cos(radians(${latParam})) * cos(radians(${latCol})) * power(sin(radians((${lngCol} - ${lngParam}) / 2)), 2))))`;
const provinces = COLLECTIONS.find((collection) => collection.entityType === "province")!;

/** PostgreSQL adapter for public content reads consumed by game, trips and AI. */
export class PostgresContentReader implements ContentReaderPort {
  constructor(private readonly db: Db) {}

  async getPublicPlace(typeOrPath: string, id: string): Promise<PublicPlace | null> {
    const definition = COLLECTIONS.find((collection) => collection.entityType === typeOrPath || collection.path === typeOrPath);
    if (!definition) return null;
    const table = definition.table;
    const lat = definition.geo && hasContentColumn(table, definition.geo.lat) ? `${Q(definition.geo.lat)}::float8` : "NULL::float8";
    const lng = definition.geo && hasContentColumn(table, definition.geo.lng) ? `${Q(definition.geo.lng)}::float8` : "NULL::float8";
    const provinceId = hasContentColumn(table, "province_id") ? "province_id::text" : "NULL::text";
    const destinationId = hasContentColumn(table, "destination_id") ? "destination_id::text" : "NULL::text";
    const image = hasContentColumn(table, "image_url") ? "image_url::text" : "NULL::text";
    const { rows } = await this.db.query<PublicPlace>(
      `SELECT $2::text AS entity_type, id::text AS id, ${Q(definition.title)}::text AS name,
              ${lat} AS lat, ${lng} AS lng, ${provinceId} AS province_id, ${destinationId} AS destination_id, ${image} AS image
         FROM ${Q(table)} WHERE id = $1 AND ${visibility(definition)}`,
      [id, definition.entityType],
    );
    return rows[0] ?? null;
  }

  async countPublicProvinces(): Promise<number> {
    const { rows } = await this.db.query<{ count: string }>(`SELECT count(*)::text AS count FROM ${Q(provinces.table)} WHERE ${visibility(provinces)}`);
    return Number(rows[0]?.count ?? 0);
  }

  async listPublicProvinces(): Promise<PublicProvince[]> {
    const { rows } = await this.db.query<PublicProvince>(
      `SELECT id::text AS id, name, slug, region FROM ${Q(provinces.table)} WHERE ${visibility(provinces)} ORDER BY name`,
    );
    return rows;
  }

  async getPublicProvince(slugOrId: string): Promise<PublicProvince | null> {
    const { rows } = await this.db.query<PublicProvince>(
      `SELECT id::text AS id, name, slug, region FROM ${Q(provinces.table)} WHERE (slug = $1 OR id::text = $1) AND ${visibility(provinces)}`,
      [slugOrId],
    );
    return rows[0] ?? null;
  }

  async getPublicProvinceById(id: string): Promise<Pick<PublicProvince, "id" | "name"> | null> {
    const { rows } = await this.db.query<Pick<PublicProvince, "id" | "name">>(
      `SELECT id::text AS id, name FROM ${Q(provinces.table)} WHERE id = $1 AND ${visibility(provinces)}`,
      [id],
    );
    return rows[0] ?? null;
  }

  async listProvinceVerificationPoints(provinceId: string): Promise<GeoPoint[]> {
    const definitions = ["destinations", "municipalities"].map((table) => COLLECTIONS.find((collection) => collection.table === table)!);
    const reads = definitions.filter((d) => d.geo && hasContentColumn(d.table, "province_id") && hasContentColumn(d.table, d.geo.lat) && hasContentColumn(d.table, d.geo.lng));
    const points: GeoPoint[] = [];
    for (const definition of reads) {
      const { rows } = await this.db.query<GeoPoint>(
        `SELECT ${Q(definition.geo!.lat)}::float8 AS lat, ${Q(definition.geo!.lng)}::float8 AS lng
           FROM ${Q(definition.table)} WHERE province_id = $1 AND ${visibility(definition)}
             AND ${Q(definition.geo!.lat)} IS NOT NULL AND ${Q(definition.geo!.lng)} IS NOT NULL`,
        [provinceId],
      );
      points.push(...rows);
    }
    return points;
  }

  async findPublicCandidates(query: PublicContentCandidateQuery): Promise<PublicContentCandidate[]> {
    const candidates: PublicContentCandidate[] = [];
    const patterns = query.keywords.map((keyword) => `%${keyword.replace(/[\\%_]/g, "\\$&").toLowerCase()}%`);
    for (const path of query.paths) {
      const definition = COLLECTIONS.find((collection) => collection.path === path);
      if (!definition) continue;
      const table = definition.table, title = Q(definition.title);
      const summary = hasContentColumn(table, "short_description") ? "coalesce(short_description::text, '')" : "''";
      const sponsored = hasContentColumn(table, "is_sponsored") ? "coalesce(is_sponsored, false)" : "false";
      const params: unknown[] = [definition.entityType, query.verifiedIds ?? []];
      const score = patterns.length
        ? (params.push(patterns), `(CASE WHEN lower(f_unaccent(${title}::text || ' ' || ${summary})) LIKE ANY($${params.length}::text[]) THEN 1 ELSE 0 END)`)
        : "0";
      const excluded = query.exclude?.length
        ? (params.push(query.exclude), ` AND id <> ALL($${params.length}::uuid[])`)
        : "";
      const rating = hasContentColumn(table, "rating") ? "rating DESC NULLS LAST," : "";
      // La relevancia va como columna: sin palabras clave es el literal 0, que en ORDER BY sería una posición.
      const { rows } = await this.db.query<PublicContentCandidate & { score: number }>(
        `SELECT id::text AS ref, $1::text AS type,
                ${title}::text AS name, ${summary} AS summary, ${sponsored} AS is_sponsored,
                id = ANY($2::uuid[]) AS is_verified, ${score} AS score
           FROM ${Q(table)}
          WHERE ${visibility(definition)}${excluded}
          ORDER BY is_sponsored DESC, is_verified DESC, score DESC, ${rating} ${title}
          LIMIT ${query.perType}`,
        params,
      );
      candidates.push(...rows.map(({ score: _score, ...row }) => ({
        ...row,
        summary: row.summary ? String(row.summary).slice(0, 140) : null,
        is_verified: !!row.is_verified,
        is_sponsored: !!row.is_sponsored,
      })));
    }
    return candidates;
  }

  async searchPublicContent(paths: string[], query: string, limit: number, titleOnly: boolean): Promise<PublicContentSearchResult> {
    const definitions = paths.flatMap((path) => {
      const definition = COLLECTIONS.find((collection) => collection.path === path);
      return definition && hasContentColumn(definition.table, definition.title) ? [definition] : [];
    });
    if (!definitions.length) return { hits: [], fallbackUsed: false, failedCollections: [] };
    const sqlFor = (definition: (typeof definitions)[number], perCollection: number) => {
      const title = Q(definition.title), table = definition.table;
      const normalizedTitle = `lower(f_unaccent(${title}::text))`;
      const additional = titleOnly ? [] : definition.search.filter((column) => column !== definition.title && hasContentColumn(table, column) && contentColumns(table)[column]?.type === "text").slice(0, 3);
      const match = [`${normalizedTitle} LIKE $2 ESCAPE '\\'`, `similarity(${normalizedTitle}, $1) > 0.3`, ...additional.map((column) => `lower(f_unaccent(${Q(column)}::text)) LIKE $2 ESCAPE '\\'`)].join(" OR ");
      const score = `CASE WHEN ${normalizedTitle} = $1 THEN 1.0 WHEN ${normalizedTitle} LIKE $3 ESCAPE '\\' THEN 0.85 WHEN ${normalizedTitle} LIKE $2 ESCAPE '\\' THEN 0.6 ELSE greatest(similarity(${normalizedTitle}, $1), 0.25) END`;
      return `SELECT '${definition.entityType}'::text AS type, '${definition.path}'::text AS collection, id::text AS id,
                     ${hasContentColumn(table, "slug") ? "slug::text" : "NULL::text"} AS slug, ${title}::text AS title,
                     ${hasContentColumn(table, "short_description") ? "short_description::text" : "NULL::text"} AS subtitle,
                     ${hasContentColumn(table, "image_url") ? "image_url::text" : "NULL::text"} AS image, (${score})::float8 AS score
                FROM ${Q(table)} WHERE ${visibility(definition)} AND (${match})
                ORDER BY score DESC${hasContentColumn(table, "rating") ? ", rating DESC NULLS LAST" : ""}, ${title} LIMIT ${perCollection}`;
    };
    const params = [query, searchLike(query), `${query.replace(/[\\%_]/g, "\\$&")}%`];
    try {
      const { rows } = await this.db.query<PublicContentSearchHit>(definitions.map((definition) => `(${sqlFor(definition, limit)})`).join(" UNION ALL "), params);
      return { hits: rows, fallbackUsed: false, failedCollections: [] };
    } catch {
      const results = await Promise.all(definitions.map(async (definition) => {
        try {
          const { rows } = await this.db.query<PublicContentSearchHit>(sqlFor(definition, limit), params);
          return { rows, failed: false };
        } catch {
          return { rows: [] as PublicContentSearchHit[], failed: true };
        }
      }));
      return {
        hits: results.flatMap((result) => result.rows),
        fallbackUsed: true,
        failedCollections: definitions.filter((_, index) => results[index]!.failed).map((definition) => definition.path),
      };
    }
  }

  async listPublicMapLayers(paths: string[]): Promise<PublicMapLayer[]> {
    const definitions = paths.flatMap((path) => {
      const definition = COLLECTIONS.find((collection) => collection.path === path);
      return definition?.geo && hasContentColumn(definition.table, definition.geo.lat) && hasContentColumn(definition.table, definition.geo.lng) ? [definition] : [];
    });
    return Promise.all(definitions.map(async (definition) => {
      const { rows } = await this.db.query<{ count: number }>(
        `SELECT count(*)::int AS count FROM ${Q(definition.table)} WHERE ${visibility(definition)} AND ${Q(definition.geo!.lat)} IS NOT NULL AND ${Q(definition.geo!.lng)} IS NOT NULL`,
      );
      return { id: definition.path, type: definition.entityType, label: definition.label, group: definition.tag, count: rows[0]!.count };
    }));
  }

  async listPublicMapFeatures(paths: string[], bbox: [number, number, number, number] | undefined, perLayerLimit: number): Promise<PublicMapFeature[]> {
    const features: PublicMapFeature[] = [];
    for (const path of paths) {
      const definition = COLLECTIONS.find((collection) => collection.path === path);
      if (!definition?.geo || !hasContentColumn(definition.table, definition.geo.lat) || !hasContentColumn(definition.table, definition.geo.lng)) continue;
      const table = definition.table, { lat, lng } = definition.geo;
      const params: unknown[] = [], where = [visibility(definition), `${Q(lat)} IS NOT NULL`, `${Q(lng)} IS NOT NULL`];
      if (bbox) {
        params.push(bbox[0], bbox[2], bbox[1], bbox[3]);
        where.push(`${Q(lng)} BETWEEN $1 AND $2`, `${Q(lat)} BETWEEN $3 AND $4`);
      }
      const { rows } = await this.db.query<PublicMapFeature>(
        `SELECT id::text AS id, ${hasContentColumn(table, "slug") ? "slug::text" : "NULL::text"} AS slug,
                ${Q(definition.title)}::text AS name, ${Q(lat)}::float8 AS lat, ${Q(lng)}::float8 AS lng,
                ${hasContentColumn(table, "image_url") ? "image_url::text" : "NULL::text"} AS image,
                ${hasContentColumn(table, "rating") ? "rating::float8" : "NULL::float8"} AS rating
           FROM ${Q(table)} WHERE ${where.join(" AND ")}
          ORDER BY ${hasContentColumn(table, "rating") ? "rating DESC NULLS LAST," : ""} id LIMIT ${perLayerLimit}`,
        params,
      );
      features.push(...rows.map((row) => ({ ...row, collection: definition.path })));
    }
    return features;
  }

  async findNearbyPublicPlaces(paths: string[], lat: number, lng: number, radius: number, perCollectionLimit: number): Promise<PublicNearbyPlace[]> {
    const definitions = paths.flatMap((path) => {
      const definition = COLLECTIONS.find((collection) => collection.path === path);
      return definition?.geo && hasContentColumn(definition.table, definition.geo.lat) && hasContentColumn(definition.table, definition.geo.lng) ? [definition] : [];
    });
    const results = await Promise.all(definitions.map(async (definition) => {
      const table = definition.table, latColumn = Q(definition.geo!.lat), lngColumn = Q(definition.geo!.lng);
      const distance = haversineSql(latColumn, lngColumn, "$1", "$2");
      const { rows } = await this.db.query<Omit<PublicNearbyPlace, "type" | "collection" | "distance_m"> & { distance_m: number }>(
        `SELECT id::text AS id, ${hasContentColumn(table, "slug") ? "slug::text" : "NULL::text"} AS slug,
                ${Q(definition.title)}::text AS name, ${hasContentColumn(table, "image_url") ? "image_url::text" : "NULL::text"} AS image,
                ${hasContentColumn(table, "rating") ? "rating::float8" : "NULL::float8"} AS rating, ${distance} AS distance_m
           FROM ${Q(table)} WHERE ${visibility(definition)} AND ${latColumn} IS NOT NULL AND ${lngColumn} IS NOT NULL
             AND ${distance} <= $3 ORDER BY distance_m LIMIT ${perCollectionLimit}`,
        [lat, lng, radius],
      );
      return rows.map((row) => ({ ...row, type: definition.entityType, collection: definition.path, distance_m: Math.round(Number(row.distance_m)) }));
    }));
    return results.flat().sort((a, b) => a.distance_m - b.distance_m).slice(0, perCollectionLimit);
  }

  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
    const nearest = async (path: "municipalities" | "destinations") => {
      const definition = COLLECTIONS.find((collection) => collection.path === path)!;
      const table = Q(definition.table), provinceTable = Q(provinces.table);
      const latitude = Q(definition.geo!.lat), longitude = Q(definition.geo!.lng);
      const distance = haversineSql(`t.${latitude}`, `t.${longitude}`, "$1", "$2");
      const { rows } = await this.db.query<{ id: string; name: string; slug: string | null; province_id: string | null; province_name: string | null; province_slug: string | null; distance_m: number }>(
        `SELECT t.id::text AS id, t.${Q(definition.title)}::text AS name,
                ${hasContentColumn(definition.table, "slug") ? "t.slug::text" : "NULL::text"} AS slug,
                t.province_id::text AS province_id, p.name AS province_name, p.slug AS province_slug, ${distance} AS distance_m
           FROM ${table} t LEFT JOIN ${provinceTable} p ON p.id = t.province_id
          WHERE t.status = 'published' AND t.deleted_at IS NULL AND t.${latitude} IS NOT NULL AND t.${longitude} IS NOT NULL
          ORDER BY distance_m LIMIT 1`,
        [lat, lng],
      );
      return rows[0] ?? null;
    };
    const [municipality, destination] = await Promise.all([nearest("municipalities"), nearest("destinations")]);
    const close = <T extends { distance_m: number }>(place: T | null): T | null => (place && place.distance_m <= 60_000 ? place : null);
    const nearbyMunicipality = close(municipality), nearbyDestination = close(destination);
    const provinceSource = [nearbyMunicipality, nearbyDestination].filter(Boolean).sort((a, b) => a!.distance_m - b!.distance_m)[0] ?? null;
    return {
      province: provinceSource?.province_id ? { id: provinceSource.province_id, name: provinceSource.province_name, slug: provinceSource.province_slug } : null,
      municipality: nearbyMunicipality ? { id: nearbyMunicipality.id, name: nearbyMunicipality.name, slug: nearbyMunicipality.slug, distance_m: Math.round(Number(nearbyMunicipality.distance_m)) } : null,
      destination: nearbyDestination ? { id: nearbyDestination.id, name: nearbyDestination.name, slug: nearbyDestination.slug, distance_m: Math.round(Number(nearbyDestination.distance_m)) } : null,
    };
  }

  async listPublicSectionItems(path: string, limit: number, options: { excludeIds?: string[]; upcomingFrom?: string } = {}): Promise<PublicContentSectionItem[]> {
    const definition = COLLECTIONS.find((collection) => collection.path === path);
    if (!definition) return [];
    const table = definition.table, params: unknown[] = [], where = [visibility(definition)];
    if (options.excludeIds?.length) {
      params.push(options.excludeIds);
      where.push(`id <> ALL($${params.length}::uuid[])`);
    }
    if (options.upcomingFrom) {
      params.push(options.upcomingFrom);
      where.push(`coalesce(end_date, start_date) >= $${params.length}::date`);
    }
    const order = options.upcomingFrom
      ? "start_date ASC"
      : `${hasContentColumn(table, "is_featured") ? "is_featured DESC NULLS LAST," : ""} ${hasContentColumn(table, "rating") ? "rating DESC NULLS LAST," : ""} ${Q(definition.title)}`;
    const { rows } = await this.db.query<PublicContentSectionItem>(
      `SELECT id::text AS id, ${hasContentColumn(table, "slug") ? "slug::text" : "NULL::text"} AS slug,
              ${Q(definition.title)}::text AS title, ${hasContentColumn(table, "short_description") ? "short_description::text" : "NULL::text"} AS subtitle,
              ${hasContentColumn(table, "image_url") ? "image_url::text" : "NULL::text"} AS image,
              ${hasContentColumn(table, "rating") ? "rating::float8" : "NULL::float8"} AS rating
         FROM ${Q(table)} WHERE ${where.join(" AND ")} ORDER BY ${order} LIMIT ${limit}`,
      params,
    );
    return rows;
  }
}
