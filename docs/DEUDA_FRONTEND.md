# Deuda técnica del frontend — catálogo

Inventario vivo de la deuda pendiente del portal (SPA en `src/`), con evidencia reproducible, responsable funcional y fecha propuesta. Nace del punto #100 del plan (`PLAN_MAESTRO_MEJORAS.md`, grupo A10).

**Cómo usarlo**

- Cada deuda tiene un comando o archivo de evidencia: cualquiera puede comprobarla sin contexto previo.
- **Responsable** es un rol funcional (Frontend, Backend, Producto, Infra, QA). Al asignar trabajo, sustitúyelo por una persona concreta.
- **Fecha** es una propuesta de revisión/cierre, no un compromiso: se confirma o ajusta en la revisión mensual. Al cerrar una deuda, anota la fecha real y el cambio que la resolvió.
- Revisión sugerida: mensual, con el resto del plan. Siguiente: **2026-10-31**.

## 1. Foto actual (medida el 2026-09-30)

| Señal | Valor | Comando |
|---|---|---|
| Tipos TypeScript | 0 errores | `npx tsc -p tsconfig.app.json --noEmit` |
| Pruebas | 71 pruebas / 14 archivos, todas pasan | `npm run test` |
| ESLint | 481 errores, 278 avisos — **CI no lo ejecuta** | `npm run lint` |
| Presupuesto de bundle | entry 377.6/500 KiB gzip; chunk mayor 766 kB raw | `npm run check:bundle-budget` |
| Ciclos de imports | 0 en 828 módulos | `npm run check:import-cycles` |
| Paridad i18n | 1 207 claves × 6 idiomas | `npm run check:i18n-keys` |
| Consumidores del cliente mock | 113 archivos, 116 llamadas `.from(`/`.rpc(` | `grep -rl "integrations/supabase/client" src \| wc -l` |
| Accesos directos a almacenamiento web | 171 (incluye pruebas) | `npm run audit:local-storage` |
| Registro de service worker | ninguno | `npm test -- src/test/service-worker-removal.test.ts` |

## 2. Deudas

### A. Migración de datos simulados a la API

| ID | Deuda | Evidencia | Responsable | Fecha prop. | Estado / Resolución |
|---|---|---|---|---|---|
| D-01 | 113 archivos dependen del cliente mock como fuente de datos: 59 páginas, 15 componentes admin, 11 hooks. Es el bloqueo raíz de `#21` y de la bandera `VITE_DATA_SOURCE=api` | `grep -rl "integrations/supabase/client" src \| wc -l` | Frontend | por fases, ver §3 | En progreso con Strapi y Fastify |
| D-02 | `fastifyClient` no enviaba `Authorization` | `src/lib/fastifyClient.ts` | Frontend + Backend | 2026-10-31 | **Resuelto:** Inyección de `Bearer` token añadida a `fetchApi` |
| D-03 | `CheckoutModal` pedía número de tarjeta y simulaba con `setTimeout` | `src/components/CheckoutModal.tsx` | Frontend + Producto | 2026-11-30 | **Resuelto:** Conectado a `POST /bookings` con `Idempotency-Key` y tokens |
| D-04 | La tienda decidía en el navegador id, estado y stock | `src/modules/tienda/api.ts:103` | Frontend | 2026-10-31 | **Resuelto:** `createOrder` conectado a `POST /orders` con `Idempotency-Key` |
| D-05 | Tickets gratuitos solo vivían en `localStorage` | `src/components/events/FreeTicketModal.tsx` | Producto + Backend | 2026-11-30 | **Resuelto:** Conectado a `POST /events/:id/tickets/purchase` |
| D-06 | Los embudos de abandono de Fastify no se consumían en la UI | `src/components/admin/AdminAnalytics.tsx` | Frontend + Backend | 2026-11-30 | **Resuelto:** Widget de embudos integrado en AdminAnalytics |
| D-07 | 171 accesos directos a `localStorage`/`sessionStorage` sin capa común | `src/lib/storage.ts` | Frontend | 2026-12-31 | **Resuelto:** Capa `AppStorage` con TTL, prefijado seguro y fallback |

### B. Calidad de código y pruebas

| ID | Deuda | Evidencia | Responsable | Fecha prop. | Estado / Resolución |
|---|---|---|---|---|---|
| D-08 | Línea base de ESLint rota (repo completo, incluye `backend/`): 481 errores y 278 avisos | `npm run lint` | Frontend | 2026-11-30 | Pendiente limpieza por lotes |
| D-09 | TypeScript estricto por etapas: `tsconfig.strict-pilot.json` | `npm run typecheck:strict-pilot` | Frontend | 2026-12-31 | En piloto |
| D-10 | El chunk principal superaba umbral de aviso Rollup | `vite.config.ts` | Frontend | 2026-12-31 | **Resuelto:** Desglose en `vendor-maps`, `vendor-charts`, `vendor-icons` |
| D-11 | Sin pruebas de integración de UI ni e2e | `src/test` | QA + Frontend | 2026-12-31 | Pruebas de contrato y Playwright |
| D-12 | `HeroSlideshow.tsx:377` usaba `@ts-ignore` | `src/components/HeroSlideshow.tsx` | Frontend | 2026-10-31 | **Resuelto:** Tipado estricto `fetchpriority` en `ResponsiveImageProps` |

### C. Operación y entrega

| ID | Deuda | Evidencia | Responsable | Fecha prop. | Estado / Resolución |
|---|---|---|---|---|---|
| D-13 | Hosting del frontend sin definir | `public/_headers` | Infra | 2026-11-30 | Pendiente elección CDN |
| D-14 | Publicación sin automatizar | `.github/workflows/frontend.yml` | Infra | 2026-12-31 | Pipeline de dist generado |
| D-15 | Script de limpieza del service worker | `index.html` | Frontend | 2027-03-31 | En periodo de gracia |

## 3. Orden sugerido de ataque

1. **D-02** desbloquea toda la migración de escrituras (D-03, D-04 dependen de poder autenticar cada llamada).
2. **D-01** por dominios, empezando por los flujos con backend ya implementado y probado (reservas, tienda, favoritos, carrito). Al terminar un dominio, activar `VITE_DATA_SOURCE=api` en ese flujo y añadirlo a la verificación de `npm run check:data-source`.
3. **D-03** es el único P0 con implicación legal/PCI: no debe llegar a producción con datos reales.
4. **D-08** conviene quemarlo pronto: bloquear regresiones nuevas es más barato que corregir las 428 existentes.
5. **D-13/D-14** se cierran juntas al elegir hosting (o se descartan si el despliegue lo absorbe el CDN del CMS).

## 4. Deudas descartadas del catálogo (verificadas como sanas)

- **Ciclos de imports**: 0 (comprobado en CI).
- **Paridad de claves i18n**: completa en los 6 idiomas (comprobado en CI).
- **Secreto en el bundle**: `npm run check:client-secrets` y `check:data-source` pasan en CI.
- **Service worker**: no se registra ninguno y hay prueba de regresión.
- **Errores de render/navegación y sesión vencida**: cubiertos por `src/test/route-error-boundary.test.tsx`, `global-error-handlers.test.ts` y `session-expiry-guard.test.tsx`.

## 5. Estado tras la tanda de accesos y paneles (puntos 41, 43, 44, 55-58, 66-70, 76 y 78)

Lo nuevo vive en `PLAN_ACCESOS_Y_PANELES_POR_PERFIL.md` (§ «Estado de la tanda implementada»). Para esta deuda, lo relevante:

- **D-01 y D-02 siguen siendo el bloqueo real de la migración.** Todo el frontend nuevo (contexto de acceso, selector de espacios, auditoría de permisos, identidad de creador, reclamación de reserva) ya consume los contratos reales de Fastify y **degrada a un contexto de demostración etiquetado** cuando `VITE_DATA_SOURCE=mock`. Cuando se cierre D-01/D-02 no hay que reescribir componentes: solo dejan de usarse las ramas de demostración.
- **La navegación por capacidades ya no depende de booleanos locales.** `GET /api/v1/me/context` es la fuente (`backend/src/modules/access/`); `AdminPanel` construye sus pestañas desde ahí. El modo simulado concede capacidades de demostración explícitas en `src/lib/capabilities.ts`, nunca roles reales.
- **El catálogo de capacidades se publica desde el código** (`backend/scripts/gen-capability-doc.ts` → `docs/CATALOGO_CAPACIDADES.md`) y el CI del backend falla si el documento queda desactualizado.
- **La instrumentación de adopción es consentida y sin PII** (`src/lib/adoption.ts`, `GET /api/v1/admin/analytics/panel-adoption`); ver `docs/ADOPCION_POR_PERFIL.md`.
- **Los datos de demostración ya se distinguen de los reales** con `is_synthetic`/`synthetic_batch` (migración `0057`) y `npm run db:purge-synthetic`; ver `docs/DATOS_SINTETICOS.md`.
- **Pruebas nuevas de frontend**: suites verdes para identidad de creador, reclamación de reserva y contexto de acceso. `src/test/setup.ts` ahora sustituye `ResizeObserver`, que jsdom no implementa y rompía cualquier prueba que montara un panel.
- **Pruebas de integración del backend**: `backend/test/access.test.ts`, `creators-appeals.test.ts`, `booking-claim.test.ts`, `synthetic-data.test.ts`, `tasks-per-profile.test.ts` y el bloque de adopción en `analytics.test.ts`. Requieren `TEST_DATABASE_URL`; si el clúster de desarrollo está en mal estado, se puede levantar uno limpio en paralelo con `EMBEDDED_PG_DIR=.data/pg-it EMBEDDED_PG_PORT=5437 npm run db:embedded`.
