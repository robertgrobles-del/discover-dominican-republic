import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { AppError } from "./errors.js";

/** Convierte una IPv6 en texto (cualquier forma: abreviada, hexadecimal o con IPv4 incrustada) en sus 16 bytes; null si no es válida. */
function ipv6Bytes(ip: string): number[] | null {
  let s = ip.toLowerCase().replace(/%.*$/, "");
  const v4 = s.match(/^(.*:)(\d+\.\d+\.\d+\.\d+)$/);
  if (v4) {
    const o = v4[2]!.split(".").map(Number);
    if (o.some((x) => x > 255)) return null;
    s = `${v4[1]}${((o[0]! << 8) | o[1]!).toString(16)}:${((o[2]! << 8) | o[3]!).toString(16)}`;
  }
  const halves = s.split("::");
  if (halves.length > 2) return null;
  const parse = (h: string) => (h ? h.split(":") : []);
  const head = parse(halves[0]!), tail = halves.length === 2 ? parse(halves[1]!) : [];
  const fill = 8 - head.length - tail.length;
  if (halves.length === 2 ? fill < 1 : fill !== 0) return null;
  const groups = [...head, ...Array(halves.length === 2 ? fill : 0).fill("0"), ...tail];
  if (groups.some((g) => !/^[0-9a-f]{1,4}$/.test(g))) return null;
  return groups.flatMap((g) => { const n = parseInt(g, 16); return [n >> 8, n & 255]; });
}

/** True si la IP es de una red privada, loopback, enlace local o reservada (no debe consultarse desde el servidor). */
export function isPrivateIp(ip: string): boolean {
  if (ip.includes(":")) {
    // Se normaliza a bytes: el analizador de URL escribe ::ffff:127.0.0.1 como ::ffff:7f00:1 y la comparación de texto no lo veía.
    const b = ipv6Bytes(ip);
    if (!b) return true;                                       // lo que no se entiende no se consulta
    const zero = (from: number, to: number) => b.slice(from, to).every((x) => x === 0);
    const v4 = (at: number) => b.slice(at, at + 4).join(".");
    if (zero(0, 15) && (b[15] === 0 || b[15] === 1)) return true;                          // :: y ::1
    if (zero(0, 10) && b[10] === 0xff && b[11] === 0xff) return isPrivateIp(v4(12));       // ::ffff:a.b.c.d (IPv4 mapeada)
    if (zero(0, 12)) return true;                                                          // ::a.b.c.d (IPv4 compatible, obsoleta)
    if (b[0] === 0x00 && b[1] === 0x64 && b[2] === 0xff && b[3] === 0x9b) return true;     // 64:ff9b::/96 y /48 (NAT64): pueden llevar a la red interna
    if (b[0] === 0x20 && b[1] === 0x02) return isPrivateIp(v4(2));                         // 2002::/16 (6to4) lleva una IPv4 dentro
    if (b[0] === 0x20 && b[1] === 0x01 && b[2] === 0x0d && b[3] === 0xb8) return true;     // 2001:db8::/32 (documentación)
    if ((b[0]! & 0xfe) === 0xfc) return true;                                              // fc00::/7 (única local)
    if (b[0] === 0xfe && (b[1]! & 0xc0) === 0x80) return true;                             // fe80::/10 (enlace local)
    if (b[0] === 0xfe && (b[1]! & 0xc0) === 0xc0) return true;                             // fec0::/10 (sitio local, obsoleta)
    if (b[0] === 0xff) return true;                                                        // multidifusión
    return false;
  }
  const o = ip.split(".").map(Number);
  if (o.length !== 4 || o.some((x) => !Number.isInteger(x) || x < 0 || x > 255)) return true;
  const [a, b] = o as [number, number];
  return a === 10 || a === 127 || a === 0 || a >= 224 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127)
    || (a === 192 && b === 0 && o[2] === 0) || (a === 198 && (b === 18 || b === 19));
}

/** Nombres que nunca son públicos, sin necesidad de consultar el DNS. */
function blockedHostname(host: string) {
  const h = host.toLowerCase().replace(/\.$/, "");
  return h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") || h.endsWith(".internal") || (isIP(h) ? isPrivateIp(h) : !h.includes("."));
}

/**
 * Comprobación sin DNS (para guardar URLs que se usarán más tarde): https, sin credenciales y sin hosts privados escritos tal cual.
 * Antes de conectar hay que llamar además a `assertPublicUrl`, que resuelve el nombre.
 */
export function assertPublicUrlSyntax(raw: string, what = "La URL") {
  let u: URL;
  try { u = new URL(raw); } catch { throw AppError.validation(`${what} no es válida`); }
  if (u.protocol !== "https:") throw AppError.validation(`${what} debe usar https`);
  if (u.username || u.password) throw AppError.validation("La URL no puede incluir credenciales");
  if (blockedHostname(u.hostname.replace(/^\[|\]$/g, ""))) throw AppError.validation("Esa dirección no está permitida");
}

/** Evita SSRF: sólo https hacia hosts públicos (se resuelve el DNS y se revisan todas las direcciones). */
export async function assertPublicUrl(raw: string) {
  let u: URL;
  try { u = new URL(raw); } catch { throw AppError.validation("La URL del calendario no es válida"); }
  if (u.protocol !== "https:") throw AppError.validation("El calendario debe usar https");
  if (u.username || u.password) throw AppError.validation("La URL no puede incluir credenciales");
  const host = u.hostname.replace(/^\[|\]$/g, "");
  if (blockedHostname(host)) throw AppError.validation("Esa dirección no está permitida");
  const addrs = isIP(host) ? [host] : (await lookup(host, { all: true }).catch(() => { throw AppError.validation("No se pudo resolver el dominio del calendario"); })).map((a) => a.address);
  if (!addrs.length || addrs.some(isPrivateIp)) throw AppError.validation("Esa dirección no está permitida");
}
