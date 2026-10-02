import { DATA_SOURCE } from "@/lib/dataSource";

export type AuthSource = "mock" | "api";

/**
 * De dónde sale la sesión. Es independiente del origen del catálogo: `VITE_AUTH_SOURCE=api` permite iniciar
 * sesión contra el backend real mientras el contenido sigue saliendo de los datos simulados, que es el modo
 * útil para probar los paneles que ya hablan con la API (consola, estudio de creadores, operadores).
 *
 * Sin la variable, la sesión sigue al catálogo: con `VITE_DATA_SOURCE=api` es real; si no, simulada.
 * Un valor desconocido lanza: un despliegue con la variable mal escrita no debe caer en la sesión de demostración.
 */
export function resolveAuthSource(value: string | undefined, dataSource: "mock" | "api"): AuthSource {
  const normalized = (value ?? "").trim().toLowerCase();
  if (normalized === "") return dataSource;
  if (normalized === "mock" || normalized === "api") {
    // El catálogo real nunca va con sesión simulada: mezclaría datos de producción con una identidad de demostración.
    if (dataSource === "api" && normalized === "mock") throw new Error('VITE_AUTH_SOURCE="mock" no es compatible con VITE_DATA_SOURCE="api".');
    return normalized;
  }
  throw new Error(`VITE_AUTH_SOURCE inválido: "${value}". Valores permitidos: "mock" o "api".`);
}

export const AUTH_SOURCE: AuthSource = resolveAuthSource(import.meta.env.VITE_AUTH_SOURCE, DATA_SOURCE);

/** Hay un backend real detrás de la sesión: los paneles que consumen la API pueden funcionar. */
export const HAS_BACKEND_SESSION = AUTH_SOURCE === "api";
