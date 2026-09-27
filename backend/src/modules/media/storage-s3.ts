import { createHash, createHmac } from "node:crypto";
import type { MediaStorage } from "./routes.js";

const sha256 = (d: string | Buffer) => createHash("sha256").update(d).digest("hex");
const hmac = (key: string | Buffer, d: string) => createHmac("sha256", key).update(d).digest();
/** Codificación de URI de AWS: todo salvo A-Z a-z 0-9 - _ . ~ (y `/` en las rutas). */
const enc = (s: string, keepSlash = false) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`).replace(/%2F/g, keepSlash ? "/" : "%2F");

export interface SignInput {
  method: string; host: string; path: string; query?: Record<string, string>; headers?: Record<string, string>;
  payloadHash: string; region: string; service: string; accessKey: string; secretKey: string; date: Date;
}
/** Firma AWS Signature Version 4 (encabezado `Authorization`). Devuelve los encabezados a enviar, incluidos `x-amz-date` y `x-amz-content-sha256`. */
export function signV4(i: SignInput): { headers: Record<string, string>; signature: string; canonicalRequest: string } {
  const amzDate = i.date.toISOString().replace(/[:-]|\.\d{3}/g, "");       // 20130524T000000Z
  const day = amzDate.slice(0, 8);
  const headers: Record<string, string> = { ...(i.headers ?? {}), host: i.host, "x-amz-content-sha256": i.payloadHash, "x-amz-date": amzDate };
  const names = Object.keys(headers).map((h) => h.toLowerCase()).sort();
  const lower = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v.trim().replace(/\s+/g, " ")]));
  const canonicalQuery = Object.entries(i.query ?? {}).map(([k, v]) => [enc(k), enc(v)] as const).sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : 1)).map(([k, v]) => `${k}=${v}`).join("&");
  const canonicalRequest = [i.method, i.path, canonicalQuery, names.map((n) => `${n}:${lower[n]}\n`).join(""), names.join(";"), i.payloadHash].join("\n");
  const scope = `${day}/${i.region}/${i.service}/aws4_request`;
  const toSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256(canonicalRequest)].join("\n");
  const key = hmac(hmac(hmac(hmac(`AWS4${i.secretKey}`, day), i.region), i.service), "aws4_request");
  const signature = createHmac("sha256", key).update(toSign).digest("hex");
  headers.authorization = `AWS4-HMAC-SHA256 Credential=${i.accessKey}/${scope}, SignedHeaders=${names.join(";")}, Signature=${signature}`;
  return { headers, signature, canonicalRequest };
}

export interface S3Config { endpoint: string; region: string; bucket: string; accessKey: string; secretKey: string; prefix?: string; pathStyle?: boolean }

/**
 * Almacenamiento compatible con S3 (AWS S3, MinIO, Cloudflare R2, DigitalOcean Spaces…) sin SDK: peticiones firmadas con SigV4 sobre `fetch`.
 * Con varios servidores es lo que permite que todos vean los mismos archivos. Las claves siguen la misma restricción que el disco local.
 */
export class S3Storage implements MediaStorage {
  private readonly base: URL;
  constructor(private readonly cfg: S3Config, private readonly now: () => Date = () => new Date()) {
    this.base = new URL(cfg.endpoint);
  }
  private key(key: string) {
    if (!/^[0-9a-f-]{36}(-(thumb|medium|large))?$/.test(key)) throw new Error("Clave de almacenamiento inválida");
    return `${this.cfg.prefix ?? ""}${key}`;
  }
  private target(objectKey: string) {
    const pathStyle = this.cfg.pathStyle ?? true;
    const host = pathStyle ? this.base.host : `${this.cfg.bucket}.${this.base.host}`;
    const path = pathStyle ? `/${this.cfg.bucket}/${enc(objectKey, true)}` : `/${enc(objectKey, true)}`;
    return { host, path, url: `${this.base.protocol}//${host}${path}` };
  }
  private async call(method: "PUT" | "GET" | "DELETE", key: string, body?: Buffer, extra: Record<string, string> = {}) {
    const t = this.target(this.key(key));
    const payloadHash = sha256(body ?? "");
    const { headers } = signV4({ method, host: t.host, path: t.path, headers: extra, payloadHash, region: this.cfg.region, service: "s3", accessKey: this.cfg.accessKey, secretKey: this.cfg.secretKey, date: this.now() });
    return fetch(t.url, { method, headers, body: body as unknown as Uint8Array | undefined, signal: AbortSignal.timeout(30_000) });
  }

  async put(key: string, data: Buffer) {
    const res = await this.call("PUT", key, data, { "content-type": "application/octet-stream" });
    if (!res.ok) throw new Error(`S3 PUT ${res.status}`);
  }
  async get(key: string) {
    const res = await this.call("GET", key);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`S3 GET ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  }
  async delete(key: string) {
    const res = await this.call("DELETE", key);
    if (!res.ok && res.status !== 404) throw new Error(`S3 DELETE ${res.status}`);
  }
}
