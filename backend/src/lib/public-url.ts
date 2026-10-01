import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { AppError } from "./errors.js";

/** True si la IP es de una red privada, loopback, enlace local o reservada (no debe consultarse desde el servidor). */
export function isPrivateIp(ip: string): boolean {
  if (ip.includes(":")) {
    const l = ip.toLowerCase();
    if (l === "::1" || l === "::" || l.startsWith("fe80") || l.startsWith("fc") || l.startsWith("fd")) return true;
    const m = l.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    return m ? isPrivateIp(m[1]!) : false;
  }
  const [a, b] = ip.split(".").map(Number) as [number, number];
  return a === 10 || a === 127 || a === 0 || a >= 224 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
}

/** Evita SSRF: sólo https hacia hosts públicos (se resuelve el DNS y se revisan todas las direcciones). */
export async function assertPublicUrl(raw: string) {
  let u: URL;
  try { u = new URL(raw); } catch { throw AppError.validation("La URL del calendario no es válida"); }
  if (u.protocol !== "https:") throw AppError.validation("El calendario debe usar https");
  if (u.username || u.password) throw AppError.validation("La URL no puede incluir credenciales");
  const host = u.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) throw AppError.validation("Esa dirección no está permitida");
  const addrs = isIP(host) ? [host] : (await lookup(host, { all: true }).catch(() => { throw AppError.validation("No se pudo resolver el dominio del calendario"); })).map((a) => a.address);
  if (!addrs.length || addrs.some(isPrivateIp)) throw AppError.validation("Esa dirección no está permitida");
}
