export type DataSource = "mock" | "api";

/**
 * Resuelve el origen de datos del frontend a partir de VITE_DATA_SOURCE.
 *
 * Un valor desconocido lanza en lugar de degradar silenciosamente a datos
 * simulados: un despliegue con la variable mal escrita debe fallar de forma
 * visible, no servir el mock como si fuera producción.
 */
export function resolveDataSource(value: string | undefined): DataSource {
  const normalized = (value ?? "").trim().toLowerCase();
  if (normalized === "" || normalized === "mock") return "mock";
  if (normalized === "api") return "api";
  throw new Error(
    `VITE_DATA_SOURCE inválido: "${value}". Valores permitidos: "mock" (por defecto) o "api".`,
  );
}

export const DATA_SOURCE: DataSource = resolveDataSource(import.meta.env.VITE_DATA_SOURCE);

export const IS_MOCK_DATA = DATA_SOURCE === "mock";
