# 📋 Plan Maestro de Ejecución: Ecosistema Descubre RD (Fases, Ramas & 100+ Mejoras)

Este plan estructura las **100+ mejoras y pilares de seguridad, frontend, backend y arquitectura de base de datos** organizados por **Fases y Sprints**, aplicando una política de **control de versiones por ramas (Feature Branches)** y **commits fragmentados atómicos por dominio**.

---

## 🌿 Estrategia de Ramas & Git Workflow

De ahora en adelante, **cada etapa se desarrollará en una o varias ramas dedicadas**, evitando commits masivos y garantizando revisiones aisladas:

- **Política de Ramas:**
  - `main`: Rama de producción (borrador de ideas e integración validada).
  - `dev`: Rama principal de desarrollo donde convergen las características probadas.
  - `feature/*`: Funcionalidades nuevas (ej. `feature/seo-dinamico`, `feature/mcp-fastify`, `feature/marketplace-decoupling`).
  - `refactor/*`: Refactorizaciones de código (ej. `refactor/god-objects-src-features`).
  - `security/*`: Tareas de hardening e higiene (ej. `security/git-history-purge`).
  - `infra/*`: CI/CD y gestores de paquetes (ej. `infra/npm-ci-unification`).

- **Regla de Commits Fragmentados:**
  - Prohibidos los commits masivos de más de 500 líneas.
  - Commits atómicos prefijados según convención: `feat:`, `fix:`, `refactor:`, `security:`, `docs:`, `chore:`.
  - Agrupación estricta por dominio (ej: *"feat(store): migraciones DB tienda"*, *"refactor(frontend): desacoplar MarketplaceCatalog"*, *"ci: setup backend workflow"*).

---

## 🧭 Visión General de Fases

```mermaid
gantt
    title Plan Maestro de Implementación - Descubre RD
    dateFormat  YYYY-MM-DD
    section Fases Iniciales (Frontend & MVP)
    Fase 1: Monetización & UX Frontend              :done, f1, 2026-09-01, 10d
    Fase 2: Confianza, MITUR & Contenido             :done, f2, after f1, 10d
    Fase 3: Backend, RLS, NCF & Merchant Dashboard    :done, f3, after f2, 10d
    Fase 4: App Móvil, IA Avanzada & Offline         :done, f4, after f3, 8d
    Fase 5: Monetización Creadores & 21 Modelos      :done, f5, after f4, 10d
    section Fases de Consolidación & Ramas
    Fase 6: SEO Dinámico, MCP, Robots & Git Clean   :active, f6, 2026-09-28, 5d
    Fase 7: Componentización Frontend & God Objects  :f7, after f6, 7d
    Fase 8: Gran Integración (Frontend ↔ Fastify)    :f8, after f7, 10d
    Fase 9: Arquitectura DB Avanzada, Workers & Sec  :f9, after f8, 8d
    Fase 10: 50 Medidas Industriales & CI/CD Hardening:f10, after f9, 10d
```

---

## ⚡ FASE 1: Monetización Rápida, Atributos de Fichas & Experiencia Frontend
- [x] **★ 1. Página `/para-empresas` (`/planes`):** Tabla con Gratis, Premium y Destacado con FAQ fiscal NCF.
- [x] **★ 2. Botón "¿Es tu negocio? Reclama tu ficha":** Modal universal `ClaimBusinessModal`.
- [x] **★ 79. Botón de WhatsApp con mensaje prellenado:** Integración directa con 1 clic en fichas.
- [x] **★ 101–112. Atributos ricos:** Day Pass en hoteles, menús dietéticos en restaurantes, dress code en bares, precios de entradas a museos, cálculo reactivo de estado "Abierto Ahora" (`America/Santo_Domingo`).
- [x] **113–122. Ad Server Frontend:** 8 formatos core de banners con Lazy loading y bloqueo de competidores para fichas Premium.

---

## 🛡️ FASE 2: Confianza, Validación MITUR & Contenido de Alta Conversión
- [x] **★ 23–30. Verificación MITUR / SIGTUR:** Sello "Verificado MITUR", badge para rentas cortas Airbnb, sello con fecha de última verificación y botón "Reportar dato incorrecto".
- [x] **★ 65–78. Directorio de Transportes & Guías:** `/vuelos-aerolineas`, traslados aeropuerto-hotel, guías "Qué hacer en 8 Horas" para cruceristas (Amber Cove, Taino Bay, Port Cabo Rojo, Sans Souci) y multi-idioma (6 idiomas).
- [x] **★ 31–42. SEO Estructurado:** Redirecciones 301 de rutas redundantes, Schema.org (Hotel, Restaurant, TouristAttraction) y archivo `llms.txt`.

---

## 💳 FASE 3: Backend, RLS, NCF & Panel Merchant
- [x] **★ 324–338. RLS al 100% & Security Hardening:** RLS en 18 tablas Supabase, triggers definer para gamificación atómica (200 XP/acción, 1500 XP/día) y whitelist de URLs de auth.
- [x] **★ 3–4, 389. Pasarela & Facturación Fiscal NCF:** Soporte para e-CF DGII (B01, B02, E31, E32), hash SHA-256 y tabla `payment_events` idempotente.
- [x] **★ 13–22. Panel Unificado de Negocios (`/panel-empresa`):** Módulos para hoteles, restaurantes, operadores y guías con métricas de leads (WhatsApp, llamadas, GPS).

---

## 📱 FASE 4: App Móvil, IA Avanzada & Escala Masiva
- [x] **★ 123–132. Chatbot IA RAG & Priorización:** Streaming SSE (`POST /ai/chat`), priorización de negocios verificados/patrocinados e itinerarios exportables a "Mi Viaje".
- [x] **★ 219–226. App Móvil & Offline:** Envoltorio Capacitor, escaneo de QR para sellos de pasaporte digital y paquete offline de emergencia (`GET /content/offline-bundle`).

---

## 💰 FASE 5: Monetización de Creadores + 21 Modelos Backend
- [x] **Fase 1B — Quick Wins:** Marketplace de experiencias, niveles de suscripción de operadores, misiones patrocinadas, sellos auditados y API Keys B2B SHA-256 (`/api/v1/b2b/analytics/aggregate`).
- [x] **Fase 2B — Motor `sponsorship`:** Slots publicitaros unificados, telemetría CPC/CPM y geosegmentación (`POST /sponsorship/telemetry`).
- [x] **Fase 3B — UGC Creadores:** Perfiles, licenciamiento, feed de video y payouts administrativos.
- [x] **Fase 4B — Productos Transaccionales:** Seguros de viaje (`travel_insurance_policies`), traslados privados y paquetes dinámicos multidestino.
- [x] **Fase 5B — Membresías VIP & Eventos:** Pasaporte RD recurrente, ticketing con verificación QR y ledger de puntos atómico.

---

## 🚀 FASE 6: SEO Dinámico, Rescate de Assets, MCP Manifest & Git Clean (En Progreso)
> **Rama de Trabajo:** `feature/seo-mcp-git-clean`

- [ ] **★ 6.1 SEO Dinámico en Backend (Fastify + Postgres):**
  - Eliminar scripts frágiles de `main` que usan Regex sobre `App.tsx`.
  - Crear endpoint `GET /api/v1/sitemap.xml` en Fastify.
  - Consultar en PostgreSQL: `SELECT slug, updated_at FROM monuments`, `SELECT slug FROM destinations`, etc.
  - Generar e inyectar el XML dinámicamente con cabeceras `Content-Type: application/xml`.
- [ ] **★ 6.2 Rescate de Reglas SEO & Rastreadores IA:**
  - Copiar los archivos exactos `public/robots.txt` y `public/llms.txt` desde `main` a la carpeta `public/` de `dev`.
  - Asegurar el bloqueo de rutas administrativas (`/admin`, `/panel-empresa`) y el acceso explícito para rastreadores de IA (**GPTBot**, **ClaudeBot**, **PerplexityBot**).
- [ ] **★ 6.3 Adaptación del Manifiesto MCP (`.lovable/mcp/manifest.json`):**
  - Copiar manifest MCP a `dev`.
  - Conectar los endpoints de las herramientas (`search_destinations`, `search_places`, `add_favorite`) directamente a la API real de Fastify (`/api/v1/...`) para que las IAs consulten la base de datos PostgreSQL real.
- [ ] **★ 6.4 Higiene de Dependencias (Zod 3.23.x Staging):**
  - Descartar cambios caóticos de `package.json` y `bun.lock` provenientes de `main`.
  - Preservar Zod en versión estable `3.23.x` en `dev`.
- [ ] **★ 6.5 Purga de Seguridad Git & Limpieza de Repositorio:**
  - Purgar el historial completo de Git con `git filter-repo` o `BFG Repo-Cleaner` para eliminar credenciales expuestas en `.env`.
  - Unificar gestor de paquetes eliminando `bun.lock` y `bun.lockb` para asegurar que el CI/CD use estrictamente `npm ci`.
  - Limpiar binarios pesados (`.docx`, `.zip`), moverlos a Google Drive/Notion y referenciarlos por enlace en `README.md`.

---

## 🧩 FASE 7: Componentización Frontend & Desacople de God Objects (Completado)
> **Rama de Trabajo:** `refactor/god-objects-src-features` (fusionada a `dev`)

- [x] **7.1 Desacoplamiento de `Marketplace.tsx` (704 líneas):**
  - Creados componentes modulares en `src/features/marketplace/`:
    - `<MarketplaceCatalog />` (grilla interactiva de productos y servicios).
    - `<VendorProfile />` (información del vendedor / artesano local).
    - `<FilterSidebar />` (filtro por categorías, precios y ubicaciones).
- [x] **7.2 Desacoplamiento de `ForoDestino.tsx` (361 líneas):**
  - Creados componentes modulares en `src/features/forum/`:
    - `<ThreadList />` (lista paginada de hilos de discusión).
    - `<ReplyEditor />` (editor de respuestas con validación Zod).
    - `<ReportModal />` (lógica de moderación de contenido).
- [x] **7.3 Erradicación de Datos Quemados (Hardcoding):**
  - Refactorizados `SuscripcionesSabores.tsx` y `MonorielSantiago.tsx` para dejarlos limpios y listos para props/hooks dinámicos.

---

## 🔗 FASE 8: La Gran Integración (Frontend ↔ Backend Fastify)
> **Rama de Trabajo:** `feature/frontend-fastify-integration`

- [ ] **8.1 Desmantelamiento de `mockDb.json`:** Sustitución completa de datos mock por peticiones vivas al backend de Fastify + PostgreSQL.
- [ ] **8.2 Generación de Tipos Single Source of Truth:**
  - Eliminar interfaces manuales duplicadas en React (ej. `interface Reply`).
  - Compartir esquemas de Zod entre Fastify y React con `@ts-rest/core` o tRPC para sincronización estricta de tipos.
- [ ] **8.3 Gestión de Estado Asíncrono con TanStack Query (React Query):**
  - Eliminar `useEffect` genéricos para fetching.
  - Implementar TanStack Query para gestión de caché, reintentos automáticos, deduplicación de peticiones y skeletons de carga.
- [ ] **8.4 Formularios Avanzados con React Hook Form + Zod:** Validar formularios pesados (reservas, registros de negocios, checkout) en cliente antes del envío.
- [ ] **8.5 Cálculos Críticos Aislados en Backend:**
  - Prohibir cálculo de totales, ITBIS (18%) o comisiones en React.
  - React solo enviará peticiones mutables (`POST /api/v1/cart/items`) y renderizará el `total_price` devuelto por Fastify.

---

## ⚙️ FASE 9: Optimización de Arquitectura, DB & Infraestructura
> **Rama de Trabajo:** `infra/architecture-db-workers`

- [ ] **9.1 Delegación de Telemetría a Queues/Redis:**
  - Migrar escrituras síncronas de `sponsorship_events` y `analytics_events` a colas Redis / ClickHouse para no saturar la DB transaccional.
- [ ] **9.2 Bloqueo Distribuido en Cron Jobs (`system_cron_jobs`):**
  - Implementar Redlock o `pg_advisory_lock` en Fastify para evitar ejecuciones duplicadas en entornos multi-contenedor.
- [ ] **9.3 Verificación de Magic Bytes en Subida de Archivos:**
  - Inspeccionar los primeros bytes de las imágenes subidas a `media_assets` en Fastify para evitar inyección de malware.

---

## 🏢 FASE 10: 50 Medidas de Producción Industrial (Seguridad, UX, DB & DevOps)
> **Ramas por Categoría:** `security/*`, `perf/*`, `db/*`, `devops/*`

### 🔒 1. Seguridad y Autenticación
- [ ] **1. Content Security Policy (CSP):** Cabeceras estrictas en Fastify para evitar XSS.
- [ ] **2. Sanitización Zod + Fastify:** Validación estricta de `body`, `query` y `params` antes de consultas SQL.
- [ ] **3. Ocultar Header Server:** Eliminar `X-Powered-By` y `Server: Fastify`.
- [ ] **4. Cookies HttpOnly & Secure:** JWT y refresh tokens inalcanzables desde `document.cookie`.
- [ ] **5. Auditoría de Dependencias Bloqueante:** GitHub Actions falla si `npm audit` reporta nivel alto/crítico.
- [ ] **6. Escáner de Malware para Uploads:** Integración de ClamAV / validación de firmas antes de guardar en `media_assets`.
- [ ] **7. Rate Limiting Específico:** Máximo 5 intentos/hora en rutas de login y reset (`/api/v1/auth/reset`).
- [ ] **8. Rotación Forzada de Sesiones:** Invalidar todos los `family_id` al cambiar clave o activar 2FA.
- [ ] **9. Doble Factor (2FA) para Admin:** Requerir TOTP a roles `admin` y `moderator`.
- [ ] **10. Validar URLs de Redirección OAuth:** Whitelist cerrada para evitar Open Redirect.

### 🎨 2. Arquitectura Frontend (React, Vite & UX)
- [ ] **11. Code Splitting / Lazy Loading:** `React.lazy()` en rutas pesadas (`<Marketplace/>`, `<ForoDestino/>`).
- [ ] **12. Error Boundaries:** Componente `<ErrorBoundary>` para aislar fallas en secciones críticas.
- [ ] **13. Virtualización de Listas:** `react-window` o `react-virtuoso` en feed del Foro y Marketplace.
- [ ] **14. Pre-carga de Fuentes (`<link rel="preload">`):** Evitar parpadeo FOUC en `index.html`.
- [ ] **15. Sincronización Optimista:** Actualizar likes en UI al instante y revertir si el servidor responde error.
- [ ] **16. Accesibilidad (a11y) Automatizada:** Linting obligatorio con `eslint-plugin-jsx-a11y`.
- [ ] **17. Imágenes Responsivas (`<picture>`):** WebP/AVIF adaptativos según resolución.
- [ ] **18. Eliminación de Lodash Global:** Importación modular (`import debounce from 'lodash/debounce'`).
- [ ] **19. Migas de Pan (Breadcrumbs) con Schema.org:** JSON-LD dinámico (Inicio > Destinos > Santiago > Monorriel).
- [ ] **20. Skeleton Loaders:** Reemplazar spinners genéricos con componentes Skeleton de Shadcn.

### ⚡ 3. Arquitectura Backend (Fastify & Escalabilidad)
- [ ] **21. Paginación por Cursores (Keyset Pagination):** Reemplazar `OFFSET` por `last_id` y `created_at`.
- [ ] **22. Compresión de Respuestas:** `@fastify/compress` (Brotli/Gzip) para JSONs masivos.
- [ ] **23. Trazabilidad con Request ID:** UUID único por petición para trazabilidad en logs.
- [ ] **24. Graceful Shutdown:** Captura de `SIGINT`/`SIGTERM` para cerrar pool de Postgres limpiamente.
- [ ] **25. Timeouts en Peticiones Externas:** Timeout de 3000ms en APIs de clima o divisas con fallbacks cacheados.
- [ ] **26. Healthchecks Inteligentes:** Endpoint `/health` verifica conectividad activa con Postgres y Redis.
- [ ] **27. Generación de OpenAPI Automática:** `@fastify/swagger` desde esquemas Zod.
- [ ] **28. Manejo Centralizado de Errores:** Global Error Handler mapeando violaciones de constraints DB a respuestas HTTP estándar.
- [ ] **29. Caché ETag para Contenido Estático:** Cabeceras ETag en provicinias y catálogos estáticos.
- [ ] **30. WebSockets / SSE para Notificaciones:** Notificaciones en tiempo real para operadores al recibir reservas.

### 🗄️ 4. Base de Datos & SQL (PostgreSQL Avanzado)
- [ ] **31. Vistas Materializadas para Reportes:** `MATERIALIZED VIEW` para analíticas del Admin refrescadas por cron.
- [ ] **32. Índices Compuestos:** Índices `(user_id, status)` en `store_orders` y `bookings`.
- [ ] **33. Índices GIN sobre JSONB:** Índices GIN en campos `features` y `meta` JSONB.
- [ ] **34. Purgado de Registros Huérfanos:** Cron job borrando tokens expirados y carritos abandonados de >30 días.
- [ ] **35. Connection Pooling con PgBouncer:** Orquestación de PgBouncer en Docker para alto tráfico.
- [ ] **36. UUIDv7 (Ordenables):** Adopción de UUIDv7 para reducir fragmentación de índices B-Tree.
- [ ] **37. Particionado de Tablas:** Particionar `analytics_events` y `sponsorship_events` por mes.
- [ ] **38. Autovacuum Tuning:** Parámetros agresivos de vacuum para tablas de alta rotación (`rate_limits`).
- [ ] **39. Diccionarios Full-Text en Español:** Configuración de `tsvector` en español para `pg_trgm`.
- [ ] **40. Bloqueo por Fila (Row-Level Lock):** `SELECT ... FOR UPDATE` en `operator_rooms` para evitar overbooking.

### 💰 5. Negocio, Monetización e Integraciones
- [ ] **41. Desglose Fiscal ITBIS (18%):** Separación explícita de ITBIS en carritos y órdenes.
- [ ] **42. Manejo de Monedas Múltiples:** Conversión dinámica USD/DOP con tasas del día (`exchange_rates`).
- [ ] **43. Guest Checkout con Enlace Mágico:** Compras sin cuenta obligatoria vinculadas a correo con enlace de rastreo.
- [ ] **44. Webhooks Seguros con Signature:** Verificación de firma criptográfica en webhooks de Stripe/Azul.
- [ ] **45. Idempotencia de Pagos:** Cabecera `Idempotency-Key` en cobros para evitar cobros dobles.
- [ ] **46. Correos Transaccionales Responsivos:** Plantillas MJML / React Email para comprobantes.
- [ ] **47. Manejo de Soft-Bounces de Correo:** Pausa temporal de envíos a dominios con errores 4xx.
- [ ] **48. SEO Local (LocalBusiness Schema):** Microdatos estructurados por establecimiento para Google Maps.
- [ ] **49. Re-habilitación Controlada de PWA:** Workbox con estrategia `NetworkFirst` para HTML/datos y `CacheFirst` para assets.
- [ ] **50. Página de Estatus Pública:** Portal independiente para monitoreo de salud de servicios.

### 🛠️ 6. DX, Testing & DevOps
- [ ] **51. Convención de Commits (Conventional Commits):** Husky + `commitlint` forzando prefijos estándar.
- [ ] **52. Pre-commit Hooks con `lint-staged`:** Formateo con Prettier y linting con ESLint pre-commit.
- [ ] **53. Plantilla de Pull Request (`.github/pull_request_template.md`):** Checklist obligatorio para revisiones.
- [ ] **54. Data Seeders Realistas con Faker.js:** Generación de cientos de registros para pruebas de paginación.
- [ ] **55. Caché Multicapa en Docker:** Optimización con `--mount=type=cache,target=/root/.npm`.
- [ ] **56. Actualizaciones Automáticas:** Integración de Dependabot / Renovate.
- [ ] **57. Entornos de Staging Efímeros:** URL de preview por Pull Request.
- [ ] **58. Colección Postman/Bruno Versionada:** Documentación viva de la API en el repositorio.
- [ ] **59. Tests End-to-End (Playwright):** Pruebas E2E de Happy Paths (Registro, Checkout, Reserva).
- [ ] **60. Cobertura de Código (Codecov):** Meta mínima del 75% de cobertura requerida para PRs.

---

## 📈 Protocolo de Actualización del README.md
Cada vez que una rama o sprint de este plan sea completado y fusionado a `dev` / `main`:
1. Se marcará la casilla correspondiente `- [x]` en este documento.
2. Se actualizará la sección correspondiente en [README.md](file:///c:/Users/Ro.Guzman/OneDrive%20-%20sectur.gov.do/Escritorio/Sitios%20web/Desarrollo/Descubre%20RD/README.md) reflejando las nuevas rutas, componentes y capacidades activas en el repositorio.
