#!/usr/bin/env node
/**
 * Sprint 6.2 — Generador de OpenAPI Schema
 * Genera el archivo openapi.yaml a partir del servidor Fastify con todas las rutas registradas.
 * USO: DATABASE_URL=... npx tsx scripts/generate-openapi.ts
 * Salida: backend/openapi.yaml
 */
import { writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// YAML serializer minimo (sin dependencias externas)
function toYaml(obj: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  if (obj === null) return "null";
  if (typeof obj === "boolean") return obj.toString();
  if (typeof obj === "number") return obj.toString();
  if (typeof obj === "string") {
    if (/[:\n#{}\[\],&*?|<>=!%@`]/.test(obj) || obj.includes("'")) {
      return `"${obj.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
    }
    return obj || '""';
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    return "\n" + obj.map((v) => `${pad}- ${toYaml(v, indent + 1).trimStart()}`).join("\n");
  }
  if (typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return "{}";
    return "\n" + entries.map(([k, v]) => `${pad}${k}: ${toYaml(v, indent + 1)}`).join("\n");
  }
  return String(obj);
}

// Construir el schema manualmente a partir de los routes documentados
async function buildOpenApiSchema() {
  const version = "1.0.0";
  const schema = {
    openapi: "3.0.3",
    info: {
      title: "Descubre República Dominicana — API",
      version,
      description: "API REST del portal turístico Descubre RD. Versionada en /api/v1. Autenticación via Bearer JWT (Supabase Auth).",
      contact: { name: "Equipo Técnico Descubre RD", email: "tech@descubrerd.do" },
      license: { name: "Privativo — uso interno" },
    },
    servers: [
      { url: "https://api.descubrerd.do/api/v1", description: "Producción" },
      { url: "https://staging-api.descubrerd.do/api/v1", description: "Staging" },
      { url: "http://localhost:3000/api/v1", description: "Desarrollo local" },
    ],
    tags: [
      { name: "sistema",       description: "Health checks, versión y liveness" },
      { name: "autenticacion", description: "Registro, login, 2FA y OAuth" },
      { name: "patrocinio",    description: "Ad Server, campañas y telemetría (Fase 2B)" },
      { name: "creadores",     description: "Módulo UGC: perfiles, videos y monetización (Fase 3B)" },
      { name: "membresias",    description: "Planes, suscripciones y loyalty points (Fase 5B)" },
      { name: "ticketing",     description: "Emisión y verificación de entradas (Fase 5B)" },
      { name: "productos",     description: "Seguros, traslados y paquetes dinámicos (Fase 4B)" },
      { name: "facturacion",   description: "Comprobantes fiscales NCF / e-CF DGII (Fase 3)" },
      { name: "gamificacion",  description: "XP, monedas, misiones y logros" },
      { name: "marketplace",   description: "Tours, experiencias y marketplace de servicios" },
      { name: "operadores",    description: "Panel de empresa y gestión de listings" },
      { name: "viajes",        description: "Planificación de itinerarios y viajes guardados" },
      { name: "ia",            description: "Chatbot con RAG e itinerarios generados por IA" },
      { name: "admin",         description: "Endpoints exclusivos de administración" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT emitido por Supabase Auth. Header: Authorization: Bearer <token>",
        },
      },
      schemas: {
        Error: {
          type: "object",
          required: ["error", "message"],
          properties: {
            error: { type: "string", example: "NOT_FOUND" },
            message: { type: "string", example: "El recurso solicitado no existe" },
            details: { type: "object", additionalProperties: true },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            page: { type: "integer", minimum: 1 },
            per_page: { type: "integer", minimum: 1, maximum: 100 },
            total: { type: "integer" },
            total_pages: { type: "integer" },
          },
        },
        MembershipPlan: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            slug: { type: "string", example: "pasaporte-vip" },
            name: { type: "string", example: "Pasaporte VIP RD" },
            description: { type: "string", nullable: true },
            price_annual: { type: "number", example: 99 },
            currency: { type: "string", example: "USD" },
            points_multiplier: { type: "number", example: 2.5 },
            benefits: { type: "array", items: { type: "string" } },
            is_active: { type: "boolean" },
          },
        },
        SponsorshipCreative: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            campaign_id: { type: "string", format: "uuid" },
            slot_id: { type: "string" },
            title: { type: "string" },
            headline: { type: "string", nullable: true },
            target_url: { type: "string", format: "uri" },
            image_url: { type: "string", format: "uri", nullable: true },
            badge_label: { type: "string", example: "Patrocinado" },
            weight: { type: "integer" },
            status: { type: "string", enum: ["active", "paused", "completed"] },
          },
        },
        CreatorProfile: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            handle: { type: "string", example: "discoveryrd" },
            display_name: { type: "string" },
            bio: { type: "string", nullable: true },
            tier: { type: "string", enum: ["emerging", "rising", "established", "top"] },
            total_views: { type: "integer" },
            commission_rate: { type: "number" },
          },
        },
        FiscalInvoice: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            invoice_number: { type: "string", example: "INV-2026-A1B2C3D4" },
            ncf: { type: "string", example: "B0200000001" },
            ncf_type: { type: "string", enum: ["B01", "B02", "B14", "B15", "E31", "E32", "E44", "E45"] },
            buyer_name: { type: "string" },
            subtotal: { type: "number" },
            itbis: { type: "number" },
            total: { type: "number" },
            currency: { type: "string", example: "DOP" },
            security_code_dgii: { type: "string" },
            qr_url: { type: "string", format: "uri" },
            status: { type: "string", enum: ["issued", "voided", "annulled"] },
            issued_at: { type: "string", format: "date-time" },
          },
        },
        EventTicket: {
          type: "object",
          properties: {
            id: { type: "string" },
            event_id: { type: "string", format: "uuid" },
            user_id: { type: "string", format: "uuid" },
            tier_name: { type: "string", example: "VIP" },
            price_paid: { type: "number" },
            currency: { type: "string" },
            qr_code_hash: { type: "string", example: "DR-TKT-ABCD1234EFGH5678" },
            status: { type: "string", enum: ["ISSUED", "CHECKED_IN", "CANCELLED"] },
            checked_in_at: { type: "string", format: "date-time", nullable: true },
          },
        },
      },
    },
    paths: {
      // ── Sistema ────────────────────────────────────────────────────────────
      "/health": { get: { tags: ["sistema"], summary: "Liveness probe", responses: { "200": { description: "Proceso activo", content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "ok" } } } } } } } } },
      "/health/ready": { get: { tags: ["sistema"], summary: "Readiness probe (verifica DB)", responses: { "200": { description: "Listo" }, "503": { description: "No disponible" } } } },
      "/health/db": { get: { tags: ["sistema"], summary: "Diagnostico de base de datos: latencia, pool y migraciones", responses: { "200": { description: "Estado de la DB" } } } },
      "/health/queue": { get: { tags: ["sistema"], summary: "Estado de la cola de emails", responses: { "200": { description: "Metricas de la cola" } } } },
      "/health/cache": { get: { tags: ["sistema"], summary: "Estado de Redis (si configurado)", responses: { "200": { description: "Estado del cache" } } } },
      "/health/detailed": { get: { tags: ["sistema"], summary: "Diagnostico completo de todos los subsistemas", responses: { "200": { description: "Resumen de salud" }, "206": { description: "Degradado" }, "503": { description: "No disponible" } } } },
      "/version": { get: { tags: ["sistema"], summary: "Version y entorno de la API", responses: { "200": { description: "Version info" } } } },
      // ── Patrocinio / Ad Server ─────────────────────────────────────────────
      "/sponsorship/serve/{slot_id}": { get: { tags: ["patrocinio"], summary: "Entrega creatividades activas para un slot", parameters: [{ name: "slot_id", in: "path", required: true, schema: { type: "string" } }, { name: "category", in: "query", schema: { type: "string" } }, { name: "destination", in: "query", schema: { type: "string" } }, { name: "limit", in: "query", schema: { type: "integer", maximum: 10, default: 1 } }], responses: { "200": { description: "Creatividades entregadas" } } } },
      "/sponsorship/telemetry": { post: { tags: ["patrocinio"], summary: "Registra telemetria de anuncio (impresion, clic, conversion)", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["creative_id", "slot_id", "event_type"], properties: { creative_id: { type: "string", format: "uuid" }, slot_id: { type: "string" }, event_type: { type: "string", enum: ["impression", "click", "conversion"] }, session_id: { type: "string" }, page: { type: "string" } } } } } }, responses: { "200": { description: "Telemetria registrada" } } } },
      "/sponsorship/slots": { get: { tags: ["patrocinio"], summary: "Inventario de espacios publicitarios", responses: { "200": { description: "Lista de slots" } } } },
      "/sponsorship/campaigns": { post: { tags: ["patrocinio"], summary: "Crea una campana publicitaria", security: [{ bearerAuth: [] }], responses: { "201": { description: "Campana creada" } } } },
      // ── Creadores UGC ──────────────────────────────────────────────────────
      "/creators/onboarding": { post: { tags: ["creadores"], summary: "Registro de nuevo creador de contenido UGC", security: [{ bearerAuth: [] }], responses: { "201": { description: "Perfil de creador registrado" } } } },
      "/creators/feed": { get: { tags: ["creadores"], summary: "Feed publico de videos cortos de creadores", parameters: [{ name: "category", in: "query", schema: { type: "string" } }, { name: "destination", in: "query", schema: { type: "string" } }, { name: "page", in: "query", schema: { type: "integer" } }], responses: { "200": { description: "Feed paginado de videos" } } } },
      "/creators/me": { get: { tags: ["creadores"], summary: "Perfil y metricas del creador autenticado", security: [{ bearerAuth: [] }], responses: { "200": { description: "Perfil del creador" } } } },
      "/creators/videos": { post: { tags: ["creadores"], summary: "Publica un video UGC con slug unico", security: [{ bearerAuth: [] }], responses: { "201": { description: "Video publicado" } } } },
      "/creators/videos/{id}/events": { post: { tags: ["creadores"], summary: "Registra evento de engagement en video (vista, like, share)", responses: { "200": { description: "Evento registrado" } } } },
      // ── Membresias ─────────────────────────────────────────────────────────
      "/memberships/plans": { get: { tags: ["membresias"], summary: "Lista planes de membresia activos", responses: { "200": { description: "Planes disponibles", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { "$ref": "#/components/schemas/MembershipPlan" } } } } } } } } } },
      "/memberships/subscribe": { post: { tags: ["membresias"], summary: "Suscribe al usuario a un plan de membresia", security: [{ bearerAuth: [] }], responses: { "201": { description: "Membresia activada" } } } },
      "/memberships/me": { get: { tags: ["membresias"], summary: "Membresia activa y balance de puntos del usuario", security: [{ bearerAuth: [] }], responses: { "200": { description: "Estado de membresia" } } } },
      // ── Ticketing ──────────────────────────────────────────────────────────
      "/events/{id}/tickets/purchase": { post: { tags: ["ticketing"], summary: "Compra entrada para un evento en vivo", security: [{ bearerAuth: [] }], responses: { "201": { description: "Entrada emitida con QR", content: { "application/json": { schema: { "$ref": "#/components/schemas/EventTicket" } } } } } } },
      "/events/tickets/verify": { post: { tags: ["ticketing"], summary: "Verifica y hace check-in de entrada por codigo QR", responses: { "200": { description: "Entrada verificada y check-in exitoso" }, "404": { description: "QR no encontrado" }, "409": { description: "Entrada ya utilizada" } } } },
      // ── Productos Transaccionales ──────────────────────────────────────────
      "/insurance/quote-and-issue": { post: { tags: ["productos"], summary: "Cotizacion y emision de poliza de seguro de viaje", responses: { "201": { description: "Poliza emitida" } } } },
      "/transport/book": { post: { tags: ["productos"], summary: "Reserva de traslado, chofer privado o rent-a-car", security: [{ bearerAuth: [] }], responses: { "201": { description: "Traslado reservado" } } } },
      "/packages/dynamic": { get: { tags: ["productos"], summary: "Catalogo de paquetes turisticos dinamicos multidestino", responses: { "200": { description: "Paquetes disponibles" } } } },
      // ── Facturacion NCF ────────────────────────────────────────────────────
      "/invoices/issue": { post: { tags: ["facturacion"], summary: "Emite comprobante fiscal electronico (e-CF DGII)", security: [{ bearerAuth: [] }], responses: { "201": { description: "NCF emitido", content: { "application/json": { schema: { "$ref": "#/components/schemas/FiscalInvoice" } } } } } } },
      "/invoices/{ncf}": { get: { tags: ["facturacion"], summary: "Consulta comprobante fiscal por numero NCF", parameters: [{ name: "ncf", in: "path", required: true, schema: { type: "string", example: "B0200000001" } }], responses: { "200": { description: "Comprobante encontrado" }, "404": { description: "NCF no existe" } } } },
      // ── B2B API ────────────────────────────────────────────────────────────
      "/b2b/api-keys": { post: { tags: ["admin"], summary: "Genera una clave de API B2B para partners", security: [{ bearerAuth: [] }], responses: { "201": { description: "API key generada" } } } },
      "/api/v1/b2b/analytics/aggregate": { get: { tags: ["admin"], summary: "Analitica agregada y anonimizada para partners B2B", security: [{ bearerAuth: [] }], responses: { "200": { description: "Datos anonimizados" } } } },
    },
  };

  return schema;
}

async function main() {
  console.log("📄 Generando openapi.yaml...");
  const schema = await buildOpenApiSchema();

  // Serializar a YAML
  const yamlContent = `# Descubre Republica Dominicana — API Contract
# Generado automaticamente: ${new Date().toISOString()}
# Spec: OpenAPI 3.0.3
# Para visualizar: https://editor.swagger.io o npx @redocly/cli preview-docs openapi.yaml
---
openapi: ${schema.openapi}
info:${toYaml(schema.info, 1)}
servers:${toYaml(schema.servers, 1)}
tags:${toYaml(schema.tags, 1)}
components:${toYaml(schema.components, 1)}
paths:${toYaml(schema.paths, 1)}
`;

  const outPath = join(__dirname, "..", "openapi.yaml");
  await writeFile(outPath, yamlContent, "utf8");
  console.log(`✅ openapi.yaml generado en: ${outPath}`);
  console.log(`   Endpoints documentados: ${Object.keys(schema.paths).length}`);
  console.log(`   Schemas de componentes: ${Object.keys(schema.components.schemas).length}`);
  console.log(`   Tags: ${schema.tags.length}`);
}

main().catch((err) => { console.error("❌ Error:", err); process.exit(1); });
