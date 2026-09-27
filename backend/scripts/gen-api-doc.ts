// Genera docs/BACKEND_API_IMPLEMENTADO.md a partir de lo que el servidor realmente registra (OpenAPI), para que la referencia
// nunca se desvíe del código.
//   npm run docs:api            (escribe el archivo)
//   npm run docs:api -- --check (falla si el archivo está desactualizado; para CI)
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { buildApp } from "../src/app.js";
import { loadEnv } from "../src/config/env.js";

const OUT = fileURLToPath(new URL("../../docs/BACKEND_API_IMPLEMENTADO.md", import.meta.url));
const check = process.argv.includes("--check");

const app = await buildApp({ env: loadEnv({ NODE_ENV: "development", DATABASE_URL: "postgres://postgres:postgres@localhost:1/none", JOBS_ENABLED: "false", MAIL_WORKER_ENABLED: "false", LOG_LEVEL: "silent", DOCS_ENABLED: "true" } as never) });
await app.ready();
type Op = { tags?: string[]; summary?: string; security?: Record<string, unknown>[]; deprecated?: boolean };
const spec = app.swagger() as { paths: Record<string, Record<string, Op>>; info: { version: string } };
const METHODS = ["get", "post", "put", "patch", "delete"];
const rows: { tag: string; method: string; path: string; access: string; summary: string }[] = [];
for (const [path, item] of Object.entries(spec.paths)) {
  for (const m of METHODS) {
    const op = item[m];
    if (!op) continue;
    const bearer = (op.security ?? []).some((s) => "bearerAuth" in s), optional = (op.security ?? []).some((s) => Object.keys(s).length === 0);
    const staff = /^\/api\/v1\/admin\//.test(path);
    const access = staff ? "Personal / admin" : bearer && optional ? "Opcional (sesión)" : bearer ? "Sesión" : /^\/api\/v1\/org\//.test(path) ? "Sesión + rol de organización" : "Público";
    rows.push({ tag: op.tags?.[0] ?? "otros", method: m.toUpperCase(), path: path.replace(/^\/api\/v1/, "").replace(/\{(\w+)\}/g, "{$1}"), access, summary: (op.summary ?? "").replace(/\|/g, "\\|").replace(/\s+/g, " ").trim() });
  }
}
const order = ["salud", "config", "auth", "perfil", "contenido", "búsqueda", "admin"];
const groups = new Map<string, typeof rows>();
for (const r of rows) groups.set(r.tag, [...(groups.get(r.tag) ?? []), r]);
const tags = [...groups.keys()].sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99) || a.localeCompare(b, "es"));
const methodOrder = (m: string) => METHODS.indexOf(m.toLowerCase());

let md = `# API implementada (backend/)

> Generado automáticamente por \`npm run docs:api\` a partir de las rutas que el servidor registra. **No se edita a mano**: si una ruta cambia, se regenera (CI verifica con \`npm run docs:api -- --check\`).
> \`docs/BACKEND_API.md\` es el diseño original; donde difiera, esta lista describe lo que existe. Detalle de cada módulo, reglas y ejemplos: \`backend/README.md\`. Contrato completo (esquemas de entrada y salida): \`/docs\` (Swagger) del servidor.

Versión ${spec.info.version} · ${rows.length} operaciones en ${tags.length} grupos.

Convenciones: todas las rutas cuelgan de \`/api/v1\`. Errores con la forma \`{ error: { code, message, details, request_id } }\`. **Sesión** = \`Authorization: Bearer <jwt>\`; **Opcional** = funciona sin sesión y, con ella, personaliza.

## Diferencias deliberadas respecto al diseño original
| Diseño (\`BACKEND_API.md\`) | Implementado | Motivo |
|---|---|---|
| \`GET /tickets/verify?code=\` | \`POST /tickets/verify\` | Marca el ticket como usado: un GET no debe modificar datos. |
| Invitar al viaje por correo/enlace | Invitación por enlace con token (\`POST /me/trips/{id}/members\`, \`POST /trips/join\`) | No revela quién tiene cuenta. |
| \`GET /notifications/stream\` con \`Authorization\` | Además acepta un \`ticket\` de 60 s (\`POST /notifications/stream-ticket\`) | Un \`EventSource\` del navegador no puede enviar encabezados. |
| Pago de comisiones con \`ambassadors/track-sale\` desde el navegador | La comisión se calcula en el servidor sobre el pedido cobrado; no hay endpoint público | El cliente nunca informa cifras. |
| Estados de reporte \`open → reviewing → resolved\` | \`pendiente → revisado / ignorado\` | Es el esquema original de \`ugc_reports\`. |
| \`PATCH /admin/users/{id}/role\` | \`PUT /admin/users/{id}/roles\` (reemplaza el conjunto) | Un usuario puede tener varios roles. |
| Cambio de fecha de reserva con re-cotización libre | El total nunca baja; si sube, la diferencia queda como saldo; 2 cambios y 48 h para el viajero | Sin mover dinero en la pasarela en pleno cambio. |

## Pendiente (no implementado)
Antivirus y almacenamiento S3 de medios · vuelos · Azul/CardNET y 3-D Secure de Stripe · adaptadores de webhook de correo por proveedor (SES, SendGrid) · WhatsApp/Instagram Direct · datos vivos LIDOM.

`;
for (const t of tags) {
  const list = groups.get(t)!.sort((a, b) => a.path.localeCompare(b.path) || methodOrder(a.method) - methodOrder(b.method));
  md += `## ${t}\n\n| Método | Ruta | Acceso | Descripción |\n|---|---|---|---|\n${list.map((r) => `| ${r.method} | \`${r.path}\` | ${r.access} | ${r.summary} |`).join("\n")}\n\n`;
}
md = md.replace(/\s+$/, "\n");

await app.close();
if (check) {
  const cur = existsSync(OUT) ? readFileSync(OUT, "utf8").replace(/\r\n/g, "\n") : "";
  if (cur !== md) { console.error("docs/BACKEND_API_IMPLEMENTADO.md está desactualizado: ejecuta `npm run docs:api` y súbelo."); process.exit(1); }
  console.log(`API documentada al día (${rows.length} operaciones).`);
} else {
  writeFileSync(OUT, md);
  console.log(`docs/BACKEND_API_IMPLEMENTADO.md: ${rows.length} operaciones en ${tags.length} grupos.`);
}
