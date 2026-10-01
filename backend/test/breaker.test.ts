import { describe, expect, it } from "vitest";
import { CircuitBreaker } from "../src/lib/breaker.js";
import { readBodyCapped } from "../src/lib/http.js";

const chunk = (s: string) => new TextEncoder().encode(s);
const streamOf = (...parts: string[]) => new ReadableStream<Uint8Array>({ start(c) { for (const p of parts) c.enqueue(chunk(p)); c.close(); } });

describe("CircuitBreaker", () => {
  it("falla rápido sin llamar al proveedor tras el umbral de fallos consecutivos", async () => {
    let t = 0;
    const br = new CircuitBreaker(3, 60_000, () => t);
    let calls = 0;
    const fail = async () => { calls++; throw new Error("proveedor caído"); };
    for (let i = 0; i < 3; i++) await expect(br.execute(fail)).rejects.toThrow("proveedor caído");
    expect(calls).toBe(3);
    await expect(br.execute(fail)).rejects.toThrow(/circuito abierto/i);
    expect(calls).toBe(3); // con el circuito abierto ni siquiera se intenta
  });

  it("un éxito resetea el conteo: alternar fallo y éxito no abre el circuito", async () => {
    const br = new CircuitBreaker(3, 60_000);
    for (let i = 0; i < 5; i++) {
      await expect(br.execute(async () => { throw new Error("x"); })).rejects.toThrow("x");
      await expect(br.execute(async () => "ok")).resolves.toBe("ok");
    }
    await expect(br.execute(async () => "ok")).resolves.toBe("ok");
  });

  it("vencido el enfriamiento deja pasar una prueba: si funciona se cierra y si falla vuelve a abrir", async () => {
    let t = 0;
    const br = new CircuitBreaker(2, 60_000, () => t);
    const fail = async () => { throw new Error("proveedor caído"); };
    for (let i = 0; i < 2; i++) await expect(br.execute(fail)).rejects.toThrow();
    t = 61_000; // medio abierto: se permite una prueba
    await expect(br.execute(fail)).rejects.toThrow("proveedor caído");
    t = 100_000; // el fallo de la prueba volvió a abrir el circuito (hasta 121_000)
    await expect(br.execute(async () => "ok")).rejects.toThrow(/circuito abierto/i);
    t = 183_000;
    await expect(br.execute(async () => "ok")).resolves.toBe("ok"); // la prueba funciona: circuito cerrado
    await expect(br.execute(fail)).rejects.toThrow(); // un fallo suelto no abre con umbral 2
    await expect(br.execute(async () => "ok")).resolves.toBe("ok");
  });
});

describe("readBodyCapped", () => {
  it("lee el cuerpo completo cuando cabe en el tope", async () => {
    await expect(readBodyCapped({ body: streamOf("Hola, ", "mundo"), text: async () => "" }, 100)).resolves.toBe("Hola, mundo");
  });

  it("corta y cancela la conexión en cuanto se pasa del tope", async () => {
    let cancelled = false;
    const body = new ReadableStream<Uint8Array>({
      start(c) { c.enqueue(chunk("x".repeat(60))); c.enqueue(chunk("x".repeat(60))); }, // sin close: si estuviera cerrado, cancel() no llegará al origen
      cancel() { cancelled = true; },
    });
    await expect(readBodyCapped({ body, text: async () => "" }, 100)).rejects.toThrow(/límite/);
    expect(cancelled).toBe(true);
  });

  it("sin stream disponible cae al texto plano", async () => {
    await expect(readBodyCapped({ body: null, text: async () => "texto" }, 100)).resolves.toBe("texto");
  });
});
