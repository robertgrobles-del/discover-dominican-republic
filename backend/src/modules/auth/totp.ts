import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, randomInt } from "node:crypto";

// ---------- TOTP (RFC 6238) con HMAC-SHA1, 6 dígitos y paso de 30 s: compatible con Google Authenticator, Authy, 1Password… ----------
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
export const STEP_SECONDS = 30;
export const DIGITS = 6;

export function base32Encode(buf: Buffer): string {
  let bits = 0, value = 0, out = "";
  for (const byte of buf) {
    value = (value << 8) | byte; bits += 8;
    while (bits >= 5) { out += ALPHABET[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(text: string): Buffer {
  const clean = text.toUpperCase().replace(/[\s=-]/g, "");
  let bits = 0, value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = ALPHABET.indexOf(ch);
    if (idx < 0) throw new Error("Base32 inválido");
    value = (value << 5) | idx; bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(out);
}

export const newTotpSecret = () => randomBytes(20); // 160 bits, el tamaño recomendado para HMAC-SHA1

/** Código HOTP de `counter` (RFC 4226). */
export function hotp(secret: Buffer, counter: number, digits = DIGITS): string {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const h = createHmac("sha1", secret).update(msg).digest();
  const o = h[h.length - 1]! & 0xf;
  const bin = ((h[o]! & 0x7f) << 24) | (h[o + 1]! << 16) | (h[o + 2]! << 8) | h[o + 3]!;
  return String(bin % 10 ** digits).padStart(digits, "0");
}

export const totpStep = (nowMs: number) => Math.floor(nowMs / 1000 / STEP_SECONDS);
export const totp = (secret: Buffer, nowMs = Date.now(), digits = DIGITS) => hotp(secret, totpStep(nowMs), digits);

/** Comparación en tiempo constante de dos cadenas del mismo largo. */
const safeEqual = (a: string, b: string) => a.length === b.length && createHash("sha256").update(a).digest().equals(createHash("sha256").update(b).digest());

/**
 * Devuelve el paso (contador) cuyo código coincide, tolerando `window` pasos de desfase de reloj hacia cada lado, o `null`.
 * El llamador debe rechazar pasos ya usados (protección contra repetición) comparando con el último paso aceptado.
 */
export function verifyTotp(secret: Buffer, code: string, nowMs = Date.now(), window = 1): number | null {
  if (!/^\d{6}$/.test(code)) return null;
  const now = totpStep(nowMs);
  let match: number | null = null;
  for (let s = now - window; s <= now + window; s++) if (safeEqual(hotp(secret, s), code) && match === null) match = s; // recorre todos: tiempo constante
  return match;
}

export function otpauthUri(opts: { secret: Buffer; account: string; issuer: string }): string {
  const label = encodeURIComponent(`${opts.issuer}:${opts.account}`);
  return `otpauth://totp/${label}?secret=${base32Encode(opts.secret)}&issuer=${encodeURIComponent(opts.issuer)}&algorithm=SHA1&digits=${DIGITS}&period=${STEP_SECONDS}`;
}

// ---------- Cifrado del secreto en reposo (AES-256-GCM) ----------
export interface SecretBox { encrypt(plain: Buffer): string; decrypt(token: string): Buffer }

export function createSecretBox(key: Buffer): SecretBox {
  if (key.length !== 32) throw new Error("TOTP_ENCRYPTION_KEY debe ser de 32 bytes (base64)");
  return {
    encrypt(plain) {
      const iv = randomBytes(12);
      const c = createCipheriv("aes-256-gcm", key, iv);
      const ct = Buffer.concat([c.update(plain), c.final()]);
      return `v1.${iv.toString("base64url")}.${c.getAuthTag().toString("base64url")}.${ct.toString("base64url")}`;
    },
    decrypt(token) {
      const [v, iv, tag, ct] = token.split(".");
      if (v !== "v1" || !iv || !tag || !ct) throw new Error("Formato de secreto no reconocido");
      const d = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64url"));
      d.setAuthTag(Buffer.from(tag, "base64url"));
      return Buffer.concat([d.update(Buffer.from(ct, "base64url")), d.final()]);
    },
  };
}

// ---------- Códigos de recuperación ----------
const RECOVERY_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // sin caracteres ambiguos (i, l, o, 0, 1)
export const RECOVERY_CODE_COUNT = 10;
export const normalizeRecovery = (code: string) => code.toLowerCase().replace(/[\s-]/g, "");
export const hashRecovery = (code: string) => createHash("sha256").update(normalizeRecovery(code)).digest("hex");

export function generateRecoveryCodes(count = RECOVERY_CODE_COUNT): string[] {
  return Array.from({ length: count }, () => {
    const chars = Array.from({ length: 10 }, () => RECOVERY_ALPHABET[randomInt(RECOVERY_ALPHABET.length)]).join("");
    return `${chars.slice(0, 5)}-${chars.slice(5)}`;
  });
}
