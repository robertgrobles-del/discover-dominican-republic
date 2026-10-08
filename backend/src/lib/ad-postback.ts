import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/** Identificador de clic: 128 bits aleatorios, imposible de adivinar. */
export const newClickId = (): string => randomBytes(16).toString("base64url");

/** Clave de firma del postback de un banner (se muestra una sola vez al crearla o rotarla). */
export const newPostbackSecret = (): string => randomBytes(32).toString("hex");

export interface PostbackFields {
  /** Segundos Unix en que el anunciante firmó el aviso. */
  t: number;
  click_id: string;
  order_id: string;
  /** Importe tal cual lo envió el anunciante (texto), para que ambos lados firmen exactamente la misma cadena. */
  value: string;
  currency: string;
}

/** Cadena que se firma: `t.click_id.order_id.value.currency`. */
export const postbackPayload = (p: PostbackFields): string => `${p.t}.${p.click_id}.${p.order_id}.${p.value}.${p.currency}`;

export const signPostback = (secret: string, p: PostbackFields): string => createHmac("sha256", secret).update(postbackPayload(p)).digest("hex");

/** Comprueba la firma en tiempo constante y rechaza avisos con marca de tiempo fuera de la tolerancia (anti-repetición). */
export function verifyPostback(secret: string, p: PostbackFields, signature: string, nowSeconds = Math.floor(Date.now() / 1000), toleranceSeconds = 300): boolean {
  if (!/^[0-9a-f]{64}$/i.test(signature) || Math.abs(nowSeconds - p.t) > toleranceSeconds) return false;
  const expected = createHmac("sha256", secret).update(postbackPayload(p)).digest();
  const given = Buffer.from(signature, "hex");
  return given.length === expected.length && timingSafeEqual(given, expected);
}
