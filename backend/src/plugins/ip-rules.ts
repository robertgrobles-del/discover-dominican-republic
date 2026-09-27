import { BlockList, isIP } from "node:net";
import type { FastifyInstance } from "fastify";
import { AppError } from "../lib/errors.js";
import { TtlCache } from "../lib/cache.js";
import type { Db } from "../db/pool.js";

export interface IpRule { id: string; cidr: string; action: "allow" | "deny"; scope: "all" | "admin" }
export type IpVerdict = "ok" | "denied" | "admin_not_allowed";

const family = (ip: string) => (isIP(ip) === 6 ? "ipv6" : "ipv4") as "ipv4" | "ipv6";
/** ::ffff:1.2.3.4 (IPv4 dentro de IPv6, como lo entrega un socket dual) se evalúa como la IPv4. */
export const normalizeIp = (ip: string) => { const m = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(ip); return m ? m[1]! : ip; };

/** ¿La dirección cae dentro del rango (`1.2.3.4`, `10.0.0.0/8`, `2001:db8::/32`)? */
export function ipInCidr(ip: string, cidr: string): boolean {
  const addr = normalizeIp(ip);
  if (!isIP(addr)) return false;
  const [net, bits] = cidr.split("/");
  if (!net || !isIP(net) || family(net) !== family(addr)) return false;
  const list = new BlockList();
  list.addSubnet(net, bits === undefined ? (family(net) === "ipv6" ? 128 : 32) : Number(bits), family(net));
  return list.check(addr, family(addr));
}

/** Evalúa las reglas: `deny` (alcance todo o sólo /admin) bloquea; si existe algún `allow` de /admin, el panel sólo se abre desde esas direcciones. */
export function evaluate(rules: IpRule[], ip: string, admin: boolean): IpVerdict {
  for (const r of rules) if (r.action === "deny" && (r.scope === "all" || admin) && ipInCidr(ip, r.cidr)) return "denied";
  if (admin) {
    const allows = rules.filter((r) => r.action === "allow");
    if (allows.length && !allows.some((r) => ipInCidr(ip, r.cidr))) return "admin_not_allowed";
  }
  return "ok";
}

export class IpRuleService {
  private readonly cache = new TtlCache<IpRule[]>(15_000, 1);
  constructor(private readonly db: Db) {}
  active() {
    return this.cache.wrap("rules", async () => (await this.db.query<IpRule>("SELECT id, cidr::text AS cidr, action, scope FROM ip_rules WHERE expires_at IS NULL OR expires_at > now()")).rows);
  }
  clear() { this.cache.clear(); }
}

/** Aplica las reglas de IP antes de cualquier ruta (salvo las de salud, para que el balanceador no se bloquee). Si la base falla, deja pasar. */
export function registerIpRules(app: FastifyInstance, svc: IpRuleService) {
  app.addHook("onRequest", async (req) => {
    const path = req.url.split("?")[0]!;
    if (path === "/health" || path.endsWith("/health") || path === "/metrics") return;
    let rules: IpRule[];
    try { rules = await svc.active(); } catch { return; }
    if (!rules.length) return;
    const verdict = evaluate(rules, req.ip, /^\/api\/v1\/admin(\/|$)/.test(path));
    if (verdict === "denied") throw new AppError("FORBIDDEN", "Tu dirección IP no tiene acceso", { code: "IP_BLOCKED" });
    if (verdict === "admin_not_allowed") throw new AppError("FORBIDDEN", "El panel sólo está disponible desde direcciones autorizadas", { code: "ADMIN_IP_NOT_ALLOWED" });
  });
}
