/** Base del API Fastify. Módulo hoja compartido por el transporte y la telemetría (evita ciclos de importación). */
export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";
