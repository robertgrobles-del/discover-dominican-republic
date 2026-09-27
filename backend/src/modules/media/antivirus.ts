import net from "node:net";
import { AppError } from "../../lib/errors.js";

export interface ScanResult { clean: boolean; signature?: string }
export interface Scanner { readonly name: "none" | "clamd"; scan(data: Buffer): Promise<ScanResult> }

class NoScanner implements Scanner {
  readonly name = "none" as const;
  async scan(): Promise<ScanResult> { return { clean: true }; }
}

const CHUNK = 64 * 1024;

/**
 * Antivirus ClamAV por el protocolo de `clamd` (comando INSTREAM sobre TCP): el archivo se envía en bloques con su longitud y el
 * demonio responde `stream: OK`, `stream: <firma> FOUND` o `... ERROR`. Un error o un tiempo agotado NO se toma como limpio: lanza,
 * y quien llama decide (por defecto, el archivo queda sin aprobar y se puede reintentar).
 */
export class ClamdScanner implements Scanner {
  readonly name = "clamd" as const;
  constructor(private readonly host: string, private readonly port: number, private readonly timeoutMs = 20_000) {}

  scan(data: Buffer): Promise<ScanResult> {
    return new Promise((resolve, reject) => {
      const sock = net.createConnection({ host: this.host, port: this.port });
      let out = "";
      const fail = (msg: string) => { sock.destroy(); reject(new AppError("SERVICE_UNAVAILABLE", "El análisis de archivos no está disponible; intenta de nuevo en unos minutos", { code: "SCAN_UNAVAILABLE", reason: msg })); };
      sock.setTimeout(this.timeoutMs, () => fail("tiempo agotado"));
      sock.on("error", (e) => fail(e.message));
      sock.on("data", (c) => { out += c.toString("latin1"); });
      sock.on("end", () => {
        const text = out.replace(/\0/g, "").trim();
        if (/ FOUND$/.test(text)) return resolve({ clean: false, signature: text.replace(/^stream:\s*/, "").replace(/\s*FOUND$/, "") });
        if (/ OK$/.test(text) || text === "OK") return resolve({ clean: true });
        fail(`respuesta inesperada: ${text.slice(0, 80)}`);
      });
      sock.on("connect", () => {
        sock.write("zINSTREAM\0");
        for (let i = 0; i < data.length; i += CHUNK) {
          const part = data.subarray(i, i + CHUNK);
          const len = Buffer.alloc(4);
          len.writeUInt32BE(part.length);
          sock.write(len);
          sock.write(part);
        }
        sock.write(Buffer.alloc(4));          // bloque de longitud 0: fin del flujo
      });
    });
  }
}

export function createScanner(env: { AV_PROVIDER?: string; CLAMAV_HOST?: string; CLAMAV_PORT?: number }): Scanner {
  return env.AV_PROVIDER === "clamd" ? new ClamdScanner(env.CLAMAV_HOST ?? "127.0.0.1", env.CLAMAV_PORT ?? 3310) : new NoScanner();
}
