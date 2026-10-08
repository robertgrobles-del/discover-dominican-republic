import { safeReturnTo } from "@/lib/session";

/**
 * Resuelve la ruta inicial recomendada según los roles o capacidades del usuario.
 * - Admin, Editor, Moderador -> /admin
 * - Partner / Empresa -> /operadores/panel
 * - Creador / Embajador -> /creadores
 * - Viajero / Usuario común -> /perfil
 */
export function resolveUserHome(roles: string[] = [], spaces: string[] = []): string {
  const normalized = (roles || []).map((r) => String(r).toLowerCase().trim());
  const normalizedSpaces = (spaces || []).map((s) => String(s).toLowerCase().trim());

  // 1. Personal administrativo y staff
  if (normalized.some((r) => ["admin", "editor", "moderator"].includes(r)) || normalizedSpaces.includes("admin")) {
    return "/admin";
  }

  // 2. Operadores y empresas turísticas
  if (normalized.includes("partner") || normalizedSpaces.includes("empresa")) {
    return "/operadores/panel";
  }

  // 3. Creadores y embajadores
  if (
    normalized.includes("creator") ||
    normalized.includes("ambassador") ||
    normalizedSpaces.includes("creador") ||
    normalizedSpaces.includes("embajador")
  ) {
    return "/creadores";
  }

  // 4. Viajero regular
  return "/perfil";
}

/**
 * Determina el destino final al autenticarse.
 * Si el usuario intentó acceder a una página restringida (ej: `?returnTo=/admin`),
 * se le devuelve a esa misma página. De lo contrario, se calcula por su rol.
 */
export function resolvePostLoginDestination(
  returnToParam?: string | null,
  roles: string[] = [],
  spaces: string[] = []
): string {
  if (returnToParam && returnToParam.trim()) {
    const safe = safeReturnTo(returnToParam, "");
    if (safe && safe !== "/login") {
      return safe;
    }
  }
  return resolveUserHome(roles, spaces);
}
