import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { CAPABILITIES, CATALOG_VERSION, ROUTE_CAPABILITIES, SPACES } from "../src/modules/access/catalog.js";

/**
 * Genera `docs/CATALOGO_CAPACIDADES.md` a partir del catálogo real del servidor (Plan de accesos,
 * punto 70). Es la única forma de publicar el catálogo interno: si la documentación se escribe a mano,
 * en dos semanas miente. Con `--check` no escribe nada y falla si el documento está desactualizado,
 * para poder comprobarlo en integración continua.
 *
 * Uso: `npx tsx scripts/gen-capability-doc.ts [--check]`
 */

const OUT = path.resolve(import.meta.dirname, "../../docs/CATALOGO_CAPACIDADES.md");

const sourceLabel: Record<string, string> = {
  publico: "Acceso anónimo",
  rol_global: "Rol global",
  pertenencia_organizacion: "Membresía de organización",
  perfil_de_producto: "Perfil de producto",
  permiso_de_recurso: "Permiso sobre el recurso",
};

const esc = (value: string) => value.replace(/\|/g, "\\|");

function render(): string {
  const lines: string[] = [];
  lines.push("# Catálogo interno de capacidades");
  lines.push("");
  lines.push(`> **Generado automáticamente** desde \`backend/src/modules/access/catalog.ts\` (versión \`${CATALOG_VERSION}\`).`);
  lines.push("> No se edita a mano: ejecuta `npx tsx scripts/gen-capability-doc.ts` desde `backend/`.");
  lines.push("");
  lines.push("Cada capacidad dice **qué permite**, **de dónde sale la autorización**, **quién la asigna**, **si exige segundo factor**");
  lines.push("y **cómo se da de baja**. El frontend consume esta misma información por API (`GET /api/v1/me/context`);");
  lines.push("el servidor vuelve a comprobar el permiso en cada endpoint, así que ocultar un menú nunca es la única defensa.");
  lines.push("");
  lines.push("## Resumen");
  lines.push("");
  lines.push(`- Capacidades declaradas: **${CAPABILITIES.length}**`);
  lines.push(`- Espacios de producto: **${SPACES.length}**`);
  lines.push(`- Reglas ruta → capacidad: **${ROUTE_CAPABILITIES.length}**`);
  lines.push(`- Capacidades con segundo factor obligatorio: **${CAPABILITIES.filter((c) => c.mfa_required).length}**`);
  lines.push("");
  lines.push("## Espacios de producto");
  lines.push("");
  lines.push("| Espacio | Entrada | Autorización | Descripción |");
  lines.push("|---|---|---|---|");
  for (const s of SPACES) {
    lines.push(`| ${esc(s.label)} | \`${s.route}\` | ${sourceLabel[s.source] ?? s.source} | ${esc(s.description)} |`);
  }
  lines.push("");
  lines.push("Una misma cuenta puede tener varios espacios a la vez (viajero, empresa, creador, embajador):");
  lines.push("el contexto activo se conserva durante la sesión y **no** mezcla permisos entre espacios.");
  lines.push("");
  lines.push("## Capacidades");
  lines.push("");
  lines.push("| Capacidad | Panel | Autorización | Roles globales | Roles de organización | MFA |");
  lines.push("|---|---|---|---|---|---|");
  for (const c of CAPABILITIES) {
    lines.push(
      `| \`${c.key}\` | ${c.panel} | ${sourceLabel[c.source] ?? c.source} | ${c.global_roles.join(", ") || "—"} | ${c.org_roles.join(", ") || "—"} | ${c.mfa_required ? "Sí" : "No"} |`,
    );
  }
  lines.push("");
  lines.push("## Ficha de gobierno");
  lines.push("");
  for (const c of CAPABILITIES) {
    lines.push(`### \`${c.key}\` — ${c.label}`);
    lines.push("");
    lines.push(`- **Propósito:** ${c.purpose}`);
    lines.push(`- **Panel:** ${c.panel}`);
    lines.push(`- **Fuente de autorización:** ${sourceLabel[c.source] ?? c.source}`);
    lines.push(`- **Recursos:** ${c.resources.join(", ") || "—"}`);
    lines.push(`- **Dueño funcional:** ${c.owner}`);
    lines.push(`- **Quién la asigna:** ${c.assigned_by}`);
    lines.push(`- **Segundo factor:** ${c.mfa_required ? "obligatorio" : "no requerido"}`);
    lines.push(`- **Baja o revocación:** ${c.revocation}`);
    lines.push("");
  }
  lines.push("## Reglas ruta → capacidad");
  lines.push("");
  lines.push("Se evalúa por **prefijo más específico**: una ruta concreta siempre gana sobre el prefijo general.");
  lines.push("");
  lines.push("| Prefijo de ruta | Capacidad |");
  lines.push("|---|---|");
  for (const r of [...ROUTE_CAPABILITIES].sort((a, b) => b.prefix.length - a.prefix.length)) {
    lines.push(`| \`${r.prefix}\` | \`${r.capability}\` |`);
  }
  lines.push("");
  lines.push("## Cómo se audita");
  lines.push("");
  lines.push("- `GET /api/v1/admin/access/catalog`: catálogo completo con su gobierno (requiere rol `admin`).");
  lines.push("- `GET /api/v1/admin/access/audit`: inventario real de rutas (`app.routeTable`) cruzado con este catálogo:");
  lines.push("  método, recurso, permiso, roles, ámbito de organización, MFA y **fuente de decisión**.");
  lines.push("- `backend/test/access.test.ts`: comprueba que ninguna ruta autenticada queda sin capacidad declarada");
  lines.push("  y que ninguna capacidad administrativa se concede a un rol que no es de personal interno.");
  lines.push("");
  return lines.join("\n");
}

const expected = render();
const check = process.argv.includes("--check");

if (check) {
  let current = "";
  try { current = readFileSync(OUT, "utf8"); } catch { current = ""; }
  if (current.trim() !== expected.trim()) {
    console.error("[docs:capabilities] docs/CATALOGO_CAPACIDADES.md está desactualizado. Ejecuta `npx tsx scripts/gen-capability-doc.ts`.");
    process.exit(1);
  }
  console.log("[docs:capabilities] Documento al día.");
} else {
  writeFileSync(OUT, expected);
  console.log(`[docs:capabilities] Escrito ${path.relative(process.cwd(), OUT)} (${CATALOG_VERSION}).`);
}
