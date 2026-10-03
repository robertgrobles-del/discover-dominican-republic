import { createHmac } from "node:crypto";

/**
 * Firma de un webhook saliente: `t=<segundos>,v1=<hex>` con HMAC-SHA256 de `${t}.${cuerpo}`.
 * Es el mismo esquema que `verifyStripeSignature` comprueba, así que el receptor puede validarla con
 * cualquier verificador de ese formato: recalcular el HMAC, comparar en tiempo constante y rechazar marcas viejas.
 */
export function signWebhook(secret: string, body: string, nowSeconds = Math.floor(Date.now() / 1000)): string {
  return `t=${nowSeconds},v1=${createHmac("sha256", secret).update(`${nowSeconds}.${body}`).digest("hex")}`;
}
