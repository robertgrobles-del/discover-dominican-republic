import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream, openAsBlob, statSync } from "node:fs";
import path from "node:path";
import { signV4 } from "../modules/media/storage-s3.js";

/**
 * Copia de los respaldos fuera del servidor: cifrado y subida a un almacenamiento compatible con S3
 * (AWS S3, Cloudflare R2, DigitalOcean Spaces, Backblaze B2, MinIO, y Google Cloud Storage con sus claves HMAC
 * de interoperabilidad).
 *
 *  - El archivo se cifra antes de salir de la máquina (AES-256, clave derivada de `BACKUP_ENCRYPTION_KEY` con
 *    PBKDF2): quien administra el bucket no puede leer la base. Es el formato de `openssl enc`, el mismo que usa
 *    `deploy/backup.sh`, de modo que se descifra con una herramienta que está en cualquier servidor.
 *  - Junto al archivo se sube su SHA-256, para comprobar al restaurar que llegó entero.
 *  - Las credenciales son propias (`BACKUP_S3_*`), distintas de las de los archivos subidos: lo recomendable es
 *    una clave que sólo pueda escribir en ese bucket, y que la caducidad de las copias la aplique una regla de
 *    ciclo de vida del bucket.
 */

export interface OffsiteConfig { endpoint: string; region: string; bucket: string; accessKey: string; secretKey: string; prefix: string; pathStyle: boolean }

const PBKDF2_ITERATIONS = "200000";
/** Nombre de la variable de entorno con la clave: `openssl` la lee de ahí, así nunca aparece en la lista de procesos. */
export const KEY_ENV = "BACKUP_ENCRYPTION_KEY";

/** Configuración de la copia externa a partir del entorno; `null` si no está configurada. Lanza si está a medias. */
export function offsiteConfigFromEnv(env: NodeJS.ProcessEnv = process.env): OffsiteConfig | null {
  const bucket = env.BACKUP_S3_BUCKET?.trim();
  if (!bucket) return null;
  const missing = ["BACKUP_S3_ACCESS_KEY_ID", "BACKUP_S3_SECRET_ACCESS_KEY", KEY_ENV].filter((name) => !env[name]?.trim());
  if (missing.length) throw new Error(`Copia externa a medio configurar: falta ${missing.join(", ")}`);
  if (env[KEY_ENV]!.trim().length < 24) throw new Error(`${KEY_ENV} debe tener al menos 24 caracteres (genera una con: openssl rand -base64 32)`);
  const region = env.BACKUP_S3_REGION?.trim() || "us-east-1";
  const prefix = (env.BACKUP_S3_PREFIX?.trim() || "backups/").replace(/^\/+/, "").replace(/\/*$/, "/");
  return {
    bucket, region, prefix, accessKey: env.BACKUP_S3_ACCESS_KEY_ID!.trim(), secretKey: env.BACKUP_S3_SECRET_ACCESS_KEY!.trim(),
    endpoint: env.BACKUP_S3_ENDPOINT?.trim() || `https://s3.${region}.amazonaws.com`,
    pathStyle: (env.BACKUP_S3_PATH_STYLE ?? "true").trim().toLowerCase() !== "false",
  };
}

const openssl = (args: string[], env: NodeJS.ProcessEnv) => { execFileSync("openssl", args, { stdio: ["ignore", "ignore", "pipe"], env }); };

/** Cifra `source` en `target` con la clave de `BACKUP_ENCRYPTION_KEY`. */
export function encryptFile(source: string, target: string, env: NodeJS.ProcessEnv = process.env): void {
  openssl(["enc", "-aes-256-cbc", "-pbkdf2", "-iter", PBKDF2_ITERATIONS, "-salt", "-in", source, "-out", target, "-pass", `env:${KEY_ENV}`], env);
}
/** Inversa de `encryptFile`. Con la clave equivocada `openssl` falla y no deja un archivo a medias que parezca bueno. */
export function decryptFile(source: string, target: string, env: NodeJS.ProcessEnv = process.env): void {
  openssl(["enc", "-d", "-aes-256-cbc", "-pbkdf2", "-iter", PBKDF2_ITERATIONS, "-in", source, "-out", target, "-pass", `env:${KEY_ENV}`], env);
}

export function sha256File(file: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    createReadStream(file).on("data", (chunk) => hash.update(chunk)).on("end", () => resolve(hash.digest("hex"))).on("error", reject);
  });
}

const enc = (s: string) => s.split("/").map((part) => encodeURIComponent(part).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)).join("/");

/** Sube un cuerpo a `<prefix><name>` con una petición firmada (SigV4). El cuerpo no se firma: viaja por TLS y se sube su SHA-256 aparte. */
async function put(cfg: OffsiteConfig, name: string, body: Blob | string, send: typeof fetch): Promise<string> {
  const base = new URL(cfg.endpoint);
  const key = `${cfg.prefix}${name}`;
  const host = cfg.pathStyle ? base.host : `${cfg.bucket}.${base.host}`;
  const objectPath = cfg.pathStyle ? `/${cfg.bucket}/${enc(key)}` : `/${enc(key)}`;
  const { headers } = signV4({ method: "PUT", host, path: objectPath, headers: { "content-type": "application/octet-stream" }, payloadHash: "UNSIGNED-PAYLOAD", region: cfg.region, service: "s3", accessKey: cfg.accessKey, secretKey: cfg.secretKey, date: new Date() });
  // Un volcado grande tarda: el tope es amplio, pero existe, para que una subida colgada no bloquee el cron para siempre.
  const res = await send(`${base.protocol}//${host}${objectPath}`, { method: "PUT", headers, body, signal: AbortSignal.timeout(60 * 60_000) });
  if (!res.ok) throw new Error(`El almacenamiento respondió ${res.status} al subir ${key}: ${(await res.text().catch(() => "")).slice(0, 200)}`);
  return key;
}

export interface UploadResult { key: string; bytes: number; sha256: string }

/** Sube un archivo ya cifrado y, a su lado, `<nombre>.sha256` con su huella. */
export async function uploadEncrypted(cfg: OffsiteConfig, file: string, send: typeof fetch = fetch): Promise<UploadResult> {
  const name = path.basename(file);
  const sha256 = await sha256File(file);
  const key = await put(cfg, name, await openAsBlob(file), send);
  await put(cfg, `${name}.sha256`, `${sha256}  ${name}\n`, send);
  return { key, bytes: statSync(file).size, sha256 };
}
