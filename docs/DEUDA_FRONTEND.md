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

| ID | Deuda | Evidencia | Responsable | Fecha prop. | Origen |
|---|---|---|---|---|---|
| D-01 | 113 archivos dependen del cliente mock como fuente de datos: 59 páginas, 15 componentes admin, 11 hooks. Es el bloqueo raíz de `#21` y de la bandera `VITE_DATA_SOURCE=api` | `grep -rl "integrations/supabase/client" src \| wc -l` | Frontend | por fases, ver §3 | #21, #91 |
| D-02 | `fastifyClient` no envía `Authorization`: no puede llamar endpoints autenticados (carrito, pedidos, favoritos, reservas) | `src/lib/fastifyClient.ts` (no hay cabecera Bearer) | Frontend + Backend | 2026-10-31 | #92 |
| D-03 | `CheckoutModal` pide número de tarjeta, caducidad y CVC en campos propios y simula la autorización con `setTimeout(2000)`. Viola la regla de pagos de `AGENTS.md` y bloquea el PCI | `src/components/CheckoutModal.tsx` | Frontend + Producto | 2026-11-30 | #92, `docs/MIGRACION_ESCRITURAS_BACKEND.md` |
| D-04 | La tienda decide en el navegador el id del pedido, su estado, el precio (tipo de cambio fijo 59.8) y el descuento de stock | `src/modules/tienda/api.ts:103` | Frontend | 2026-10-31 | #92 |
| D-05 | Los tickets gratuitos viven solo en `localStorage` (`dr_my_tickets`), sin endpoint que los emita o valide; no son verificables en puerta | `src/components/events/FreeTicketModal.tsx:131` | Producto + Backend | 2026-11-30 | #92 §5 |
| D-06 | Los embudos de abandono y el NPS ya se calculan con datos reales en el backend (`/admin/analytics/funnels/:name`, `/admin/analytics/nps`, `/admin/analytics/search-terms`, export CSV), pero **ningún panel del frontend los consume** y leerlos exige autenticación real (hoy simulada). Los eventos sí se envían a `POST /analytics/events` | `grep -rn "funnels" src` (sin resultados), `backend/src/modules/analytics/routes.ts:148` | Frontend + Backend | 2026-11-30 | #99 |
| D-07 | 171 accesos directos a `localStorage`/`sessionStorage` sin capa común; el inventario está documentado pero no hay validación automática de finalidad ni retención | `npm run audit:local-storage` | Frontend | 2026-12-31 | `docs/ALMACENAMIENTO_LOCAL.md` |

### B. Calidad de código y pruebas

| ID | Deuda | Evidencia | Responsable | Fecha prop. | Origen |
|---|---|---|---|---|---|
| D-08 | Línea base de ESLint rota (repo completo, incluye `backend/`): 481 errores y 278 avisos. 428 son `no-explicit-any` y ~40 correcciones triviales (`no-useless-escape` 21, `prefer-const` 9, `no-unused-expressions` 9). Peores archivos: `src/integrations/supabase/client.ts` (52), `src/lib/security.ts` (20), `src/modules/operadores/api.ts` (13). Por eso el CI solo ejecuta pilotos acotados y no `npm run lint` | `npm run lint` | Frontend | 2026-11-30 | #100 |
| D-09 | TypeScript estricto por etapas: `tsconfig.strict-pilot.json` cubre 10 archivos; el resto del código no está en `strict` | `npm run typecheck:strict-pilot`, `tsconfig.strict-pilot.json` | Frontend | 2026-12-31 | #100 |
| D-10 | El chunk principal supera el umbral de aviso de Rollup (766 kB raw / 195.7 KiB gzip en un archivo) y el presupuesto inicial queda al 76 % | `npm run check:bundle-budget` | Frontend | 2026-12-31 | #100 |
| D-11 | Sin pruebas de integración de UI ni e2e: los flujos críticos (reserva, checkout, carrito) solo tienen cobertura unitaria; las regresiones de flujo se detectarían en producción | `src/test` (14 archivos, 0 e2e) | QA + Frontend | 2026-12-31 | #100 |
| D-12 | `HeroSlideshow.tsx:377` usa `@ts-ignore` en lugar de `@ts-expect-error`; si el error desaparece, el `@ts-ignore` lo oculta en silencio | `npx eslint src/components/HeroSlideshow.tsx` | Frontend | 2026-10-31 | #100 |

### C. Operación y entrega

| ID | Deuda | Evidencia | Responsable | Fecha prop. | Origen |
|---|---|---|---|---|---|
| D-13 | Hosting del frontend sin definir: la CSP del HTML sigue siendo la meta antigua (no sustituye cabeceras HTTP) y `public/_headers` solo lo leen Netlify/Cloudflare Pages | `public/_headers`, `docs/SEGURIDAD_SESION_Y_CABECERAS.md` | Infra | 2026-11-30 | #96, #97 |
| D-14 | Publicación sin automatizar: cada build validado deja el artefacto `frontend-dist-<sha>`, pero subirlo y cambiar el puntero es manual | `.github/workflows/frontend.yml`, `docs/OPERACION_FRONTEND.md` | Infra | 2026-12-31 | #96 |
| D-15 | Script de limpieza del service worker en `index.html`: se puede retirar cuando venza el periodo de gracia (3–6 meses desde su retirada) | `index.html`, `src/test/service-worker-removal.test.ts` | Frontend | 2027-03-31 | #98 |

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
