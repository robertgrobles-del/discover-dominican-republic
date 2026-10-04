# Fuente de verdad por dominio

**Fecha:** 2026-09-30 (plan B10 #91). Declaración oficial de qué sistema manda en cada dominio.
Cuando dos sistemas tienen el mismo dato, manda el que figura aquí; el resto es caché, transición o legado.

## Regla general

- **Estado actual:** `backend/` (Fastify 5 + PostgreSQL 16) es la fuente de verdad de los dominios transaccionales y del contenido editorial. Hoy se despliega como monolito modular.
- **Arquitectura objetivo:** extraer los dominios a microservicios con propiedad de datos independiente detrás de una entrada API/gateway estable. Hasta que una extracción cumpla sus criterios de salida, el módulo de `backend/` sigue siendo autoritativo para ese dominio. El plan está en [`ARQUITECTURA_MICROSERVICIOS.md`](ARQUITECTURA_MICROSERVICIOS.md).
- El frontend nunca decide precios, estados de pago, roles, monedas ni premios: los recalcula el servidor (AGENTS.md).
- `docs/BACKEND_API.md` (generado con `npm run docs:api`) es el contrato público; el CI bloquea su drift (`docs:api -- --check`).

## Dominios

| Dominio | Fuente de verdad | Estado hoy |
| --- | --- | --- |
| Cuentas, sesiones, roles, TOTP/OAuth | `backend/src/modules/auth` | Activo |
| Reservas Operadores RD (cupo, precios, pagos, liquidaciones) | `backend/src/modules/operators` + `payments` (conciliación) | Activo; el frontend consume el mock hasta cerrar la migración (`MIGRACION_ESCRITURAS_BACKEND.md`) |
| Tienda oficial (carrito, pedidos, cupones, stock) | `backend/src/modules/store` + `payments` | Activo; igual que arriba |
| Marketplace de vendedores | `backend/src/modules/marketplace` + `products` | Activo; igual que arriba |
| Gamificación (pasaporte, monedas, ligas, temporadas) | `backend/src/modules/game` | Activo |
| Membresías y facturación | `backend/src/modules/memberships` + `billing` | Activo |
| Correo transaccional y notificaciones | `backend/src/modules/mailer` (cola durable, outbox transaccional) + `notifications` | Activo |
| Analítica, marketing y publicidad | `backend/src/modules/analytics` + `marketing` | Activo |
| Contenido editorial (colecciones CMS, textos, SEO, traducciones) | `backend/src/modules/content` + `admin` (CMS integrado actual) | Activo en el backend; candidato para extracción como servicio de contenido. El frontend lee de aquí el catálogo en cuanto se compila con `VITE_DATA_SOURCE=api` (o `VITE_CATALOG_SOURCE=api`): playas, alojamientos, restaurantes, bares, experiencias, destinos, montañas, ríos, áreas protegidas, parques, recetas, aeropuertos, puertos, estadios, campos de golf, centros comerciales, clínicas, eventos y artículos, en el idioma activo |
| Archivos y medios | `backend/src/modules/media` (almacenamiento propio) | Activo |
| Datos vivos (clima, tasas de cambio) | `backend/src/modules/live` (caché local, proveedor externo sólo origen) | Activo |
| Mi viaje, e-tickets, favoritos | `backend/src/modules/me` + `trips` | Activo; el frontend consume el mock hasta cerrar la migración |

## Sistemas que NO son fuente de verdad

- **`server/` (Express + MySQL): retirado.** Prototipo original sin uso; su propio `server/README.md` declara obsolescencia y prohíbe su uso en despliegue. No se construye ni despliega en ningún pipeline, no tiene credenciales en el repositorio (`.env` ignorado; `db_dump.json` fuera del índice) y no se conecta a la base de producción. Cualquier dato que sólo exista ahí se considera perdido, no autoritativo.
- **`cms/` (Strapi): origen editorial en transición.** El frontend ya no lo consulta: `CatalogService` lee del backend o de los archivos locales. Además, al estar en otro origen, la política de seguridad de contenido del sitio bloqueaba esas peticiones, así que en la práctica siempre se servían los archivos locales. La fuente de verdad editorial es el CMS integrado del backend; los contenidos de Strapi se consideran material de partida, no autoridad. No guarda datos transaccionales.
- **Archivos locales (`src/data`): respaldo.** Todo su contenido editorial está en la base: las fichas del catálogo como filas de su colección, con la ficha completa en `extras` (los campos sin columna propia), y el resto (transporte, itinerarios, náutica, tasas de referencia, textos de páginas…) como documentos en `content_datasets`. Ambos se editan desde el panel de administración («Contenido del sitio») o desde el CMS de cada colección. Al arrancar, el frontend superpone lo que sirve el backend sobre los archivos locales (`src/services/catalogHydration.ts`, `catalogCollections.ts`, `datasetHydration.ts`); cuando un dato existe en ambos, manda el backend. Los archivos siguen viajando en el paquete como respaldo ante una caída y porque las pantallas los importan de forma directa: retirarlos exige pasar esas pantallas a carga asíncrona. Quedan fuera sólo la actividad simulada para demostraciones (panel de un socio, publicaciones de usuarios, creadores y campañas de muestra) y `provinceEnrichment`, que es código y no datos. `npx tsx scripts/check-catalog-parity.ts <api>` comprueba, colección por colección y documento por documento, que lo que sirve el backend coincide con los archivos.
- **Mock del frontend (`src/mocks`): sólo lectura de demo mientras dura la migración de escrituras.** El build `api` falla de forma cerrada (`VITE_DATA_SOURCE`) hasta que todos los flujos estén conectados (`src/integrations/supabase/client.ts`). Reglas de la transición en `docs/MIGRACION_ESCRITURAS_BACKEND.md`.

## Cómo se cambia esta declaración

Cualquier dominio nuevo o movimiento de fuente de verdad se registra aquí en el mismo PR que lo implementa; el CI de cadena de suministro (`supply-chain.yml`) y el de backend vigilarán que ni `cms/` ni `server/` crezcan en responsabilidad.
