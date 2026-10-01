import { createHmac, timingSafeEqual } from "node:crypto";

/** Token de baja sin estado: `<correo en base64url>.<HMAC>`. Sirve para enlaces de campañas sin guardar un token por envío. */
export const unsubscribeToken = (secret: string, mail: string) => `${Buffer.from(mail).toString("base64url")}.${createHmac("sha256", secret).update(`unsub:${mail}`).digest("base64url").slice(0, 32)}`;
export function verifyUnsubscribeToken(secret: string, token: string): string | null {
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) return null;
  const mail = Buffer.from(b64, "base64url").toString("utf8");
  const expected = createHmac("sha256", secret).update(`unsub:${mail}`).digest("base64url").slice(0, 32);
  const a = Buffer.from(sig), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b) ? mail : null;
}
