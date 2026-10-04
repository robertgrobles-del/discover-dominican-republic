import { buildApp } from "./app.js";
import { loadEnv } from "./config/env.js";

const env = loadEnv();
const app = await buildApp({ env });

const shutdown = async (signal: string) => {
  app.log.info({ signal }, "Cerrando servidor");
  await app.close();
  process.exit(0);
};
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

// Un error que nadie atrapó deja el proceso en un estado desconocido: se reporta, se avisa al equipo y se
// termina, para que el orquestador (Docker, `restart: unless-stopped`) levante uno limpio. El tope de tiempo
// evita que un monitoreo caído retenga el cierre.
let dying = false;
const die = (err: unknown, source: string) => {
  if (dying) return;
  dying = true;
  app.log.fatal({ err }, `Error fatal (${source})`);
  const timeout = new Promise((resolve) => setTimeout(resolve, 4000).unref());
  void Promise.race([app.errorReporter?.capture(err, { source, level: "fatal" }), timeout]).finally(() => process.exit(1));
};
process.on("uncaughtException", (err) => die(err, "excepción no capturada"));
process.on("unhandledRejection", (reason) => die(reason, "promesa rechazada sin capturar"));

try {
  await app.listen({ host: env.HOST, port: env.PORT });
} catch (err) {
  die(err, "arranque");
}
