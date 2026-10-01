import { currentRequestId } from "./request-context.js";

/**
 * Lee el cuerpo de una respuesta como texto con tope de tamaño: corta y cancela la conexión en cuanto se pasa del
 * límite, para no bajar en memoria una respuesta desbocada de un proveedor externo.
 */
export async function readBodyCapped(res: { body: ReadableStream<Uint8Array> | null; text(): Promise<string> }, maxBytes: number): Promise<string> {
  if (!res.body) return res.text();
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let total = 0;
  let out = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => undefined);
      throw new Error(`La respuesta excede el límite de ${maxBytes} bytes`);
    }
    out += dec.decode(value, { stream: true });
  }
  return out + dec.decode();
}

/** Cabeceras de trazabilidad para llamadas salientes: el request_id de la petición viaja al proveedor externo (fuera de una petición no se añade). */
export function traceHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const requestId = currentRequestId();
  return requestId ? { ...extra, "x-request-id": requestId } : extra;
}
