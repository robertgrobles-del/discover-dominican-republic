import { createHmac, timingSafeEqual } from "node:crypto";

/** Verifica la firma `Stripe-Signature: t=…,v1=…` (HMAC-SHA256 de `${t}.${cuerpo}`) con tolerancia de reloj y comparación en tiempo constante. */
export function verifyStripeSignature(raw: string, header: string | undefined, secret: string, nowSeconds = Math.floor(Date.now() / 1000), toleranceSeconds = 300): boolean {
  if (!header) return false;
  const parts = header.split(",").map((p) => p.trim().split("=") as [string, string]);
  const t = parts.find(([k]) => k === "t")?.[1];
  const sigs = parts.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!t || !sigs.length || !/^\d+$/.test(t) || Math.abs(nowSeconds - Number(t)) > toleranceSeconds) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${raw}`).digest();
  return sigs.some((s) => { const b = Buffer.from(s, "hex"); return b.length === expected.length && timingSafeEqual(b, expected); });
}
