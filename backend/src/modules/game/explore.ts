import type { UserFlagsPort } from "../../contracts/moderation.js";
import { createHash } from "node:crypto";
import type { PoolClient } from "pg";
import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import type { ContentReaderPort } from "../../contracts/content-reader.js";
import { COLLECTIONS, type CollectionDef } from "../../contracts/content-collections.js";
import { contentColumns as cols, hasContentColumn as hasCol } from "../../contracts/content-schema.js";
import type { GameService } from "./service.js";

export const sha = (t: string) => createHash("sha256").update(t.trim()).digest("hex");
const GEO = COLLECTIONS.filter((c) => c.geo && hasCol(c.table, c.geo.lat) && hasCol(c.table, c.geo.lng));
/** Radio de validación por tipo de lugar: un destino es un punto central de una zona grande; una playa o un restaurante, un lugar concreto. */
const RADIUS_M: Record<string, number> = { destination: 3000, park: 1500, mountain: 1500, river: 800, cave: 400, monument: 300 };
const DEFAULT_RADIUS_M = 300;
const MAX_ACCURACY_M = 150;          // una posición con más de 150 m de error no prueba nada
const MAX_SPEED_KMH = 300;           // por encima (avión incluido) entre dos posiciones verificadas es un desplazamiento imposible
const GEO_MEMORY_HOURS = 12;

export function distanceM(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6_371_000, rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export interface Proof { lat?: number; lng?: number; accuracy_m?: number; qr_code?: string }
interface Target { lat: number | null; lng: number | null; radius_m: number; qr_hash: string | null }

/** Sello y rutas: la ubicación o el código QR se verifican en el servidor; el cliente sólo aporta la prueba, nunca el resultado. */
export class ExploreService {
  constructor(private readonly db: Db, private readonly game: GameService, private readonly content: ContentReaderPort, private readonly userFlags: UserFlagsPort) {}

  private async tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
    const c = await this.db.connect();
    try { await c.query("BEGIN"); const out = await fn(c); await c.query("COMMIT"); return out; }
    catch (e) { await c.query("ROLLBACK").catch(() => undefined); throw e; }
    finally { c.release(); }
  }

  /** Desplazamiento imposible: dos posiciones verificadas demasiado lejos para el tiempo transcurrido delatan un GPS falseado. */
  private async checkTravel(c: PoolClient, userId: string, now: { lat: number; lng: number }) {
    const last = (await c.query<{ lat: number; lng: number; at: Date }>("SELECT lat, lng, at FROM user_geo_events WHERE user_id = $1 AND at > now() - make_interval(hours => $2) ORDER BY at DESC LIMIT 1", [userId, GEO_MEMORY_HOURS])).rows[0];
    if (!last) return;
    const hours = Math.max((Date.now() - last.at.getTime()) / 3_600_000, 1 / 60);
    if (distanceM(last, now) / 1000 / hours <= MAX_SPEED_KMH) return;
    await this.userFlags.increment(userId, "gps_suspect", c);
    await c.query("COMMIT"); await c.query("BEGIN"); // la bandera se conserva aunque se rechace la acción
    throw new AppError("BUSINESS_RULE", "Esa ubicación no es compatible con tu última posición verificada", { code: "IMPLAUSIBLE_TRAVEL" });
  }

  /** Comprueba la prueba contra el objetivo: un QR válido, o una posición dentro del radio, precisa y físicamente plausible. */
  private async verify(c: PoolClient, userId: string, t: Target, proof: Proof): Promise<"qr" | "gps"> {
    if (proof.qr_code) {
      if (t.qr_hash && sha(proof.qr_code) === t.qr_hash) return "qr";
      throw new AppError("BUSINESS_RULE", "El código QR no es válido para este lugar", { code: "QR_INVALID" });
    }
    if (t.lat === null || t.lng === null) throw new AppError("BUSINESS_RULE", "Este punto no tiene ubicación: se verifica con su código QR", { code: "QR_REQUIRED" });
    if (proof.lat === undefined || proof.lng === undefined) throw new AppError("BUSINESS_RULE", "Envía tu ubicación o escanea el código QR del lugar", { code: "PROOF_REQUIRED" });
    if ((proof.accuracy_m ?? 50) > MAX_ACCURACY_M) throw new AppError("BUSINESS_RULE", `La ubicación es poco precisa (más de ${MAX_ACCURACY_M} m de error); acércate al cielo abierto e inténtalo de nuevo`, { code: "GPS_ACCURACY_LOW" });
    const now = { lat: proof.lat, lng: proof.lng };
    await this.checkTravel(c, userId, now);
    const d = distanceM(t as { lat: number; lng: number }, now);
    if (d > t.radius_m) throw new AppError("BUSINESS_RULE", `Estás a ${Math.round(d)} m; acércate a menos de ${t.radius_m} m del lugar`, { code: "TOO_FAR", distance_m: Math.round(d), radius_m: t.radius_m });
    await c.query("INSERT INTO user_geo_events (user_id, lat, lng, source) VALUES ($1,$2,$3,'gps')", [userId, now.lat, now.lng]);
    return "gps";
  }

  // ---------- Pasaporte ----------
  private async entity(typeOrPath: string, id: string) {
    const d: CollectionDef | undefined = GEO.find((g) => g.entityType === typeOrPath || g.path === typeOrPath);
    if (!d) throw AppError.validation(`Tipo de lugar desconocido: ${typeOrPath}`, { types: GEO.map((g) => g.entityType) });
    const place = await this.content.getPublicPlace(d.entityType, id);
    if (!place) throw AppError.notFound("Lugar");
    return { def: d, ...place } as { def: CollectionDef; entity_type: string; id: string; name: string; lat: number | null; lng: number | null; province_id: string | null; destination_id: string | null; image: string | null };
  }

  async stamp(userId: string, input: { entity_type: string; entity_id: string; notes?: string; rating?: number } & Proof) {
    const e = await this.entity(input.entity_type, input.entity_id);
    const qr = (await this.db.query<{ code_hash: string }>("SELECT code_hash FROM place_qr_codes WHERE entity_type = $1 AND entity_id = $2", [e.def.entityType, e.id])).rows[0];
    return this.tx(async (c) => {
      const method = await this.verify(c, userId, { lat: e.lat, lng: e.lng, radius_m: RADIUS_M[e.def.entityType] ?? DEFAULT_RADIUS_M, qr_hash: qr?.code_hash ?? null }, input);
      let row: { id: string };
      try {
        row = (await c.query<{ id: string }>(
          `INSERT INTO passport_stamps (user_id, stamp_type, stamp_name, stamp_location, stamp_image, verification_method, verification_data, notes, rating, is_verified, ${e.def.entityType === "destination" ? "destination_id" : e.def.entityType === "beach" ? "beach_id" : e.def.entityType === "hotel" ? "hotel_id" : e.def.entityType === "restaurant" ? "restaurant_id" : e.def.entityType === "experience" ? "experience_id" : "destination_id"})
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,$10) RETURNING id`,
          [userId, e.def.entityType, e.name, e.destination_id ?? null, e.image, method, JSON.stringify({ entity_id: e.id }), input.notes ?? null, input.rating ?? null, ["destination", "beach", "hotel", "restaurant", "experience"].includes(e.def.entityType) ? e.id : e.destination_id],
        )).rows[0]!;
      } catch (err) {
        if ((err as { code?: string }).code === "23505") throw new AppError("CONFLICT", "Ya tienes el sello de este lugar", { reason: "ALREADY_STAMPED" });
        throw err;
      }
      const g = await this.game.grant({ userId, action: "passport_stamp", ref: `${e.def.entityType}:${e.id}`, description: `Sello: ${e.name}` }, c);
      await c.query("UPDATE passport_stamps SET xp_earned = $2, coins_earned = $3 WHERE id = $1", [row.id, g.granted.xp, g.granted.coins]);
      let province: { name: string; first_visit: boolean } | null = null;
      const provinceId = e.province_id ?? (e.destination_id ? (await this.content.getPublicPlace("destinations", e.destination_id))?.province_id ?? null : null);
      if (provinceId) {
        const p = await this.content.getPublicProvinceById(provinceId);
        if (p) {
          const ins = await c.query("INSERT INTO province_visits (user_id, province, verification) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING", [userId, p.name, method]);
          if (ins.rowCount) await this.game.grant({ userId, action: "province_visit", ref: e.province_id, description: `Primera visita a ${p.name}` }, c);
          province = { name: p.name, first_visit: !!ins.rowCount };
        }
      }
      return { stamp_id: row.id, place: { type: e.def.entityType, id: e.id, name: e.name }, verified_by: method, granted: g.granted, level_up: g.level_up, denied_reason: g.reason ?? null, province, achievements_unlocked: g.achievements_unlocked };
    });
  }

  async passport(userId: string) {
    const stamps = (await this.db.query("SELECT id, stamp_type AS type, stamp_name AS name, stamp_image AS image, verification_method AS verified_by, visited_at, xp_earned, coins_earned, rating, notes FROM passport_stamps WHERE user_id = $1 ORDER BY visited_at DESC LIMIT 500", [userId])).rows;
    const byType: Record<string, number> = {};
    for (const s of stamps) byType[s.type] = (byType[s.type] ?? 0) + 1;
    const provinces = (await this.db.query("SELECT province, visited_at FROM province_visits WHERE user_id = $1 ORDER BY visited_at", [userId])).rows;
    const total = await this.content.countPublicProvinces();
    return { stamps, totals: { stamps: stamps.length, by_type: byType, provinces_visited: provinces.length, provinces_total: total }, provinces };
  }

  /** Códigos QR de lugares (admin): el código en claro se devuelve una sola vez; sólo se guarda su hash. */
  async createPlaceQr(entityType: string, entityId: string, code: string) {
    const e = await this.entity(entityType, entityId);
    await this.db.query("INSERT INTO place_qr_codes (entity_type, entity_id, code_hash) VALUES ($1,$2,$3) ON CONFLICT (entity_type, entity_id) DO UPDATE SET code_hash = EXCLUDED.code_hash, created_at = now()", [e.def.entityType, e.id, sha(code)]);
    return { entity_type: e.def.entityType, entity_id: e.id, name: e.name };
  }

  // ---------- Provincias ----------
  async provinces(userId: string) {
    const all = await this.content.listPublicProvinces();
    const seen = new Map((await this.db.query<{ province: string; visited_at: Date }>("SELECT province, visited_at FROM province_visits WHERE user_id = $1", [userId])).rows.map((x) => [x.province, x.visited_at]));
    return { provinces: all.map((p) => ({ ...p, visited: seen.has(p.name), visited_at: seen.get(p.name) ?? null })), visited: all.filter((p) => seen.has(p.name)).length, total: all.length };
  }

  /** Visita a una provincia comprobada por ubicación: el punto debe estar a menos de 25 km de un destino o municipio de esa provincia. */
  async visitProvince(userId: string, slugOrId: string, proof: Proof) {
    const p = await this.content.getPublicProvince(slugOrId);
    if (!p) throw AppError.notFound("Provincia");
    if (proof.lat === undefined || proof.lng === undefined) throw new AppError("BUSINESS_RULE", "Envía tu ubicación", { code: "PROOF_REQUIRED" });
    const pts = await this.content.listProvinceVerificationPoints(p.id);
    if (!pts.length) throw new AppError("BUSINESS_RULE", "Esta provincia todavía no tiene puntos de referencia para verificar la visita", { code: "NOT_VERIFIABLE" });
    return this.tx(async (c) => {
      const nearest = Math.min(...pts.map((x) => distanceM(x, { lat: proof.lat!, lng: proof.lng! })));
      await this.checkTravel(c, userId, { lat: proof.lat!, lng: proof.lng! }); // mismo control de viaje imposible que los sellos
      if ((proof.accuracy_m ?? 50) > MAX_ACCURACY_M) throw new AppError("BUSINESS_RULE", "La ubicación es poco precisa", { code: "GPS_ACCURACY_LOW" });
      if (nearest > 25_000) throw new AppError("BUSINESS_RULE", `Estás a ${Math.round(nearest / 1000)} km de un punto de ${p.name}`, { code: "TOO_FAR", distance_m: Math.round(nearest) });
      const ins = await c.query("INSERT INTO province_visits (user_id, province, verification) VALUES ($1,$2,'gps') ON CONFLICT DO NOTHING", [userId, p.name]);
      if (!ins.rowCount) throw new AppError("CONFLICT", "Ya registraste esta provincia", { reason: "ALREADY_VISITED" });
      await c.query("INSERT INTO user_geo_events (user_id, lat, lng, source) VALUES ($1,$2,$3,'gps')", [userId, proof.lat, proof.lng]);
      const g = await this.game.grant({ userId, action: "province_visit", ref: p.id, description: `Primera visita a ${p.name}` }, c);
      const total = (await c.query<{ n: number }>("SELECT count(*)::int AS n FROM province_visits WHERE user_id = $1", [userId])).rows[0]!.n;
      return { success: true, province: p.name, xp_awarded: g.granted.xp, total_provinces: total, level_up: g.level_up };
    });
  }

  // ---------- Rutas gamificadas ----------
  async routes(userId: string | null) {
    const { rows } = await this.db.query(
      `SELECT r.id, r.name, r.slug, r.short_description, r.route_type, r.difficulty, r.duration_days, r.distance_km, r.total_xp_reward, r.total_coin_reward, r.image_url, coalesce(r.min_level, 1) AS min_level, r.is_featured,
              (SELECT count(*)::int FROM route_checkpoints c WHERE c.route_id = r.id) AS checkpoints, p.checkpoints_completed, p.completion_percentage, p.is_completed, p.started_at
         FROM gamified_routes r LEFT JOIN user_route_progress p ON p.route_id = r.id AND p.user_id = $1 WHERE r.is_active ORDER BY r.is_featured DESC, r.name`, [userId],
    );
    return rows.map((r) => ({ ...r, distance_km: r.distance_km === null ? null : Number(r.distance_km), progress: r.started_at ? { started: true, completed: !!r.is_completed, checkpoints_completed: r.checkpoints_completed, percent: r.completion_percentage } : null, checkpoints_completed: undefined, completion_percentage: undefined, is_completed: undefined, started_at: undefined }));
  }

  async route(idOrSlug: string, userId: string | null) {
    const r = (await this.db.query("SELECT id, name, slug, description, short_description, route_type, difficulty, duration_days, distance_km, total_xp_reward, total_coin_reward, image_url, gallery, coalesce(min_level, 1) AS min_level, sequential FROM gamified_routes WHERE is_active AND (id::text = $1 OR slug = $1)", [idOrSlug])).rows[0];
    if (!r) throw AppError.notFound("Ruta");
    const cps = (await this.db.query(
      `SELECT c.id, c.checkpoint_order AS "order", c.checkpoint_name AS name, c.checkpoint_description AS description, c.checkpoint_type AS type, c.latitude::float8 AS lat, c.longitude::float8 AS lng, c.radius_m, c.xp_reward, c.coin_reward,
              c.challenge_task AS task, c.photo_required, c.is_mandatory, (c.qr_hash IS NOT NULL) AS has_qr, (u.id IS NOT NULL) AS completed
         FROM route_checkpoints c LEFT JOIN user_checkpoint_completions u ON u.checkpoint_id = c.id AND u.user_id = $2 WHERE c.route_id = $1 ORDER BY c.checkpoint_order`, [r.id, userId],
    )).rows;
    const progress = userId ? (await this.db.query("SELECT started_at, checkpoints_completed, completion_percentage AS percent, is_completed, total_xp_earned, total_coins_earned FROM user_route_progress WHERE user_id = $1 AND route_id = $2", [userId, r.id])).rows[0] ?? null : null;
    return { ...r, distance_km: r.distance_km === null ? null : Number(r.distance_km), checkpoints: cps, progress };
  }

  async startRoute(userId: string, routeId: string) {
    const r = (await this.db.query<{ id: string; min_level: number }>("SELECT id, coalesce(min_level, 1) AS min_level FROM gamified_routes WHERE id = $1 AND is_active", [routeId])).rows[0];
    if (!r) throw AppError.notFound("Ruta");
    const level = Number((await this.db.query<{ l: number }>("SELECT coalesce((SELECT current_level FROM user_gamification WHERE user_id = $1), 1) AS l", [userId])).rows[0]!.l);
    if (level < r.min_level) throw new AppError("BUSINESS_RULE", `Necesitas el nivel ${r.min_level} para esta ruta`, { code: "LEVEL_TOO_LOW" });
    const total = Number((await this.db.query<{ n: string }>("SELECT count(*) AS n FROM route_checkpoints WHERE route_id = $1", [routeId])).rows[0]!.n);
    if (!total) throw new AppError("BUSINESS_RULE", "La ruta todavía no tiene puntos", { code: "ROUTE_EMPTY" });
    const ins = await this.db.query("INSERT INTO user_route_progress (user_id, route_id, total_checkpoints) VALUES ($1,$2,$3) ON CONFLICT (user_id, route_id) DO NOTHING", [userId, routeId, total]);
    return { started: !!ins.rowCount, already_started: !ins.rowCount };
  }

  async completeCheckpoint(userId: string, routeId: string, checkpointId: string, input: Proof & { photo_media_id?: string }) {
    return this.tx(async (c) => {
      const prog = (await c.query<{ is_completed: boolean }>("SELECT is_completed FROM user_route_progress WHERE user_id = $1 AND route_id = $2 FOR UPDATE", [userId, routeId])).rows[0];
      if (!prog) throw new AppError("BUSINESS_RULE", "Primero inicia la ruta", { code: "NOT_STARTED" });
      const cp = (await c.query<{ id: string; checkpoint_order: number; checkpoint_name: string; latitude: number | null; longitude: number | null; radius_m: number; qr_hash: string | null; xp_reward: number; coin_reward: number; photo_required: boolean; is_mandatory: boolean }>(
        "SELECT id, checkpoint_order, checkpoint_name, latitude::float8, longitude::float8, radius_m, qr_hash, coalesce(xp_reward, 0) AS xp_reward, coalesce(coin_reward, 0) AS coin_reward, photo_required, is_mandatory FROM route_checkpoints WHERE id = $1 AND route_id = $2", [checkpointId, routeId],
      )).rows[0];
      if (!cp) throw AppError.notFound("Punto de la ruta");
      const route = (await c.query<{ sequential: boolean; total_xp_reward: number; total_coin_reward: number; completion_badge_id: string | null; name: string }>("SELECT sequential, coalesce(total_xp_reward, 0) AS total_xp_reward, coalesce(total_coin_reward, 0) AS total_coin_reward, completion_badge_id, name FROM gamified_routes WHERE id = $1", [routeId])).rows[0]!;
      if ((await c.query("SELECT 1 FROM user_checkpoint_completions WHERE user_id = $1 AND checkpoint_id = $2", [userId, checkpointId])).rowCount) throw new AppError("CONFLICT", "Ya completaste este punto", { reason: "ALREADY_COMPLETED" });
      if (route.sequential && cp.is_mandatory) {
        const pending = (await c.query<{ n: number }>("SELECT count(*)::int AS n FROM route_checkpoints k WHERE k.route_id = $1 AND k.is_mandatory AND k.checkpoint_order < $2 AND NOT EXISTS (SELECT 1 FROM user_checkpoint_completions u WHERE u.checkpoint_id = k.id AND u.user_id = $3)", [routeId, cp.checkpoint_order, userId])).rows[0]!.n;
        if (pending) throw new AppError("BUSINESS_RULE", "Completa antes los puntos anteriores de la ruta", { code: "OUT_OF_ORDER", pending });
      }
      let photoUrl: string | null = null;
      if (cp.photo_required) {
        if (!input.photo_media_id) throw new AppError("BUSINESS_RULE", "Este punto pide una foto", { code: "PHOTO_REQUIRED" });
        const m = (await c.query<{ id: string }>("SELECT id FROM media_assets WHERE id = $1 AND owner_id = $2 AND status IN ('ready', 'in_review')", [input.photo_media_id, userId])).rows[0];
        if (!m) throw AppError.validation("La foto no existe o no es tuya");
        photoUrl = `/api/v1/media/files/${m.id}`;
      }
      let method: string = "none";
      if (cp.latitude !== null || cp.qr_hash) method = await this.verify(c, userId, { lat: cp.latitude, lng: cp.longitude, radius_m: cp.radius_m, qr_hash: cp.qr_hash }, input);
      const g = await this.game.grant({ userId, action: "route_checkpoint", ref: checkpointId, xp: cp.xp_reward, coins: cp.coin_reward, description: `Ruta ${route.name}: ${cp.checkpoint_name}` }, c);
      await c.query("INSERT INTO user_checkpoint_completions (user_id, route_id, checkpoint_id, photo_url, verification_data, xp_earned, coins_earned) VALUES ($1,$2,$3,$4,$5,$6,$7)", [userId, routeId, checkpointId, photoUrl, JSON.stringify({ method }), g.granted.xp, g.granted.coins]);
      const stat = (await c.query<{ done: number; total: number; mandatory_left: number }>(
        `SELECT (SELECT count(*)::int FROM user_checkpoint_completions WHERE user_id = $1 AND route_id = $2) AS done, (SELECT count(*)::int FROM route_checkpoints WHERE route_id = $2) AS total,
                (SELECT count(*)::int FROM route_checkpoints k WHERE k.route_id = $2 AND k.is_mandatory AND NOT EXISTS (SELECT 1 FROM user_checkpoint_completions u WHERE u.checkpoint_id = k.id AND u.user_id = $1)) AS mandatory_left`, [userId, routeId],
      )).rows[0]!;
      const finished = stat.mandatory_left === 0 && !prog.is_completed;
      await c.query("UPDATE user_route_progress SET checkpoints_completed = $3, total_checkpoints = $4, completion_percentage = $5, current_checkpoint = $6, total_xp_earned = total_xp_earned + $7, total_coins_earned = total_coins_earned + $8, is_completed = is_completed OR $9, completed_at = CASE WHEN $9 THEN now() ELSE completed_at END, updated_at = now() WHERE user_id = $1 AND route_id = $2",
        [userId, routeId, stat.done, stat.total, Math.floor((stat.done / stat.total) * 100), cp.checkpoint_order, g.granted.xp, g.granted.coins, finished]);
      let completion: { xp: number; coins: number; badge: boolean } | null = null;
      if (finished) {
        const bonus = await this.game.grant({ userId, action: "route_completed", ref: routeId, xp: route.total_xp_reward, coins: route.total_coin_reward, description: `Ruta completada: ${route.name}`, skipLimits: true }, c);
        let badge = false;
        if (route.completion_badge_id) badge = !!(await c.query("INSERT INTO user_achievements (user_id, achievement_id, progress, unlocked_at) VALUES ($1,$2,1,now()) ON CONFLICT (user_id, achievement_id) DO NOTHING", [userId, route.completion_badge_id])).rowCount;
        await c.query("UPDATE user_route_progress SET total_xp_earned = total_xp_earned + $3, total_coins_earned = total_coins_earned + $4 WHERE user_id = $1 AND route_id = $2", [userId, routeId, bonus.granted.xp, bonus.granted.coins]);
        completion = { xp: bonus.granted.xp, coins: bonus.granted.coins, badge };
      }
      return { checkpoint: cp.checkpoint_name, verified_by: method, granted: g.granted, progress: { completed: stat.done, total: stat.total, percent: Math.floor((stat.done / stat.total) * 100) }, route_completed: finished, completion, level_up: g.level_up };
    });
  }
}
