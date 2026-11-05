# Auditoría integral — Descubre RD (2026-10-12)

Rama `feature/nueva-arquitectura-optimizada`. Alcance: tipografía y diseño, accesibilidad, SEO/metadata, rendimiento, frontend, arquitectura, backend, seguridad, CI y repositorio. Los datos vienen de los scripts del propio repo (`check:*`, `audit:*`), `tsc`, `eslint`, `npm audit` y revisión manual.

## Resumen

| Área | Estado | Hallazgo principal |
|---|---|---|
| Tipografía | 🔴 | 1.468 usos de texto de 7–11 px (`text-[10px]` ×839, `text-[11px]` ×510, `text-[9px]` ×106) |
| Color/diseño | 🟡 | 12 pares de contraste bajo AA; colores hex fijos en 25 componentes |
| Accesibilidad | 🟡 | 116 labels sin control asociado, 53 elementos clicables sin teclado, 98 `outline-none` |
| SEO/metadata | 🟡 | canonical y OG fijos en `index.html` (SPA): todas las rutas comparten canonical `/` |
| Rendimiento | 🟡 | chunk `index` de 752 KB, `keys` de 544 KB, recharts de 368 KB |
| Calidad TS | 🟡 | 569 `no-explicit-any` (lint con 610 errores) |
| Arquitectura | 🟡 | 107 archivos todavía dependen de Supabase; 249 accesos directos a localStorage |
| Backend | 🟢 | Config validada con Zod y bloqueos en producción; SQL parametrizado; 93 suites de tests |
| Seguridad | 🟡 | `sharp` con CVE alta; CSP con `'unsafe-inline'`; workflow `supply-chain.yml` eliminado (staged) |
| Repo | 🟡 | `.pnpm-store`, `.temp_skills`, `playwright-report`, `test-results` versionados |

Pasan: `tsc` (frontend y backend), sin ciclos de imports (1.038 módulos), paridad i18n (6 idiomas, 1.210 claves), escaneo de secretos en el bundle, `npm audit` del frontend (0 vulnerabilidades), y la puerta que impide compilar producción con mock.

## 1. Tipografía y diseño

- **Texto demasiado pequeño (alta).** Hay 1.468 usos de tamaños de 7–11 px. Debajo de 12 px se pierde legibilidad en móvil y para lectores mayores, que son un público clave en turismo. Conviene crear tokens `text-2xs` (11px) y `text-xs` (12px) en `tailwind.config.ts`, migrar todo lo que está en 7–9 px y dejar 10 px solo para badges.
- Las familias (Plus Jakarta Sans para display, Noto Sans para cuerpo) están bien elegidas. Pero la carga pide **todo el rango variable con itálicas** (`wght 100..900`, `ital`) de ambas fuentes. Basta con cargar los pesos que se usan (unos 400/500/600/700) y quitar las itálicas si no aparecen. Valorar autoalojarlas para no depender de Google Fonts y simplificar la CSP.
- **Colores fuera del sistema.** Hay hex fijos (`#00E5FF`, `#0ea5e9`, `#0f172a`, `#c5a880`…) en 25 `.tsx`, aunque ya existen tokens `brand-*` y `surface-*`. Hay que reemplazarlos por tokens.
- **Contraste** (`npm run check:contrast`): 12 de 75 pares quedan bajo AA, por ejemplo en `.sol-de-playa`, `destructive-foreground/destructive` da 3,7:1 y `border-strong` da 2,4:1. Hay que oscurecer `destructive` y subir `border-strong` a ≥3:1.

## 2. Accesibilidad (WCAG 2.2 AA)

- `jsx-a11y/label-has-associated-control` ×116: los formularios no anuncian sus campos. Hace falta `htmlFor`/`id` o envolver el control.
- `click-events-have-key-events` ×27 y `no-static-element-interactions` ×26: hay `div`/`span` clicables que no responden al teclado. Se deben convertir en `<button>`.
- 98 `outline-none`: verificar que cada uno tenga `focus-visible:ring-*`. Si no lo tiene, el foco no se ve.
- `control-has-associated-label` ×8: botones de icono sin `aria-label`.

## 3. SEO y metadata

- `index.html` fija `canonical` y `og:url` en `https://descubrerd.com`. Si el título/canonical no se actualiza por ruta en cliente, Google ve todas las páginas como duplicados de la portada. Confirmar que existe un gestor de head por ruta y que el prerender/`postbuild` lo aplica. Si no, es el problema SEO número 1.
- `meta keywords` no aporta nada (Google lo ignora) y puede eliminarse.
- Falta `hreflang` para 6 idiomas, si las rutas por idioma son indexables.

## 4. Rendimiento

- Chunk principal `index` de **752 KB**. Hay que revisar qué entra en el arranque (datos estáticos como `src/data/rivers.ts` de 2.071 líneas, `destinations.ts`, `provinceEnrichment.ts`) y moverlo a import dinámico o a la API.
- `keys-*.js` (544 KB) parece contenido o datos compartidos. Recharts (368 KB) solo debería cargarse en admin o páginas con gráficos.
- `src/integrations/supabase/types.ts` tiene 5.049 líneas. No pesa en runtime, pero indica una dependencia que ya se está retirando.
- Ya existe `check:bundle-budget`. Activarlo en CI con un límite (por ejemplo 250 KB gzip en la entrada).

## 5. Frontend y calidad de código

- ESLint: **610 errores / 295 avisos**. 569 son `any` explícitos, 46 `exhaustive-deps` (riesgo de bugs de estado obsoleto) y 59 `only-export-components` (rompe HMR). Además, el lint global falla porque incluye archivos temporales (`scripts/_crawl.tmp.mjs`). Hay que ignorar `*.tmp.*` en `eslint.config.js`.
- Componentes gigantes: `AdminMockupBanners.tsx` (1.181), `PartnerSponsorTab.tsx` (1.076), `AdminEntityConfigs.ts` (1.198). Partirlos por responsabilidad cuando se toquen.
- 249 accesos directos a `localStorage`/`sessionStorage`: deberían centralizarse según `docs/ALMACENAMIENTO_LOCAL.md`.

## 6. Arquitectura

- Conviven tres fuentes de datos: el mock (`mockDb.json`), Supabase (107 archivos) y el backend Fastify. La puerta `check:data-source` funciona bien. El paso siguiente es reducir el uso de Supabase a cero y borrar `src/integrations/supabase` y `supabase/` cuando termine la conexión al backend.
- Restos en la raíz: `cms/`, `mysql/`, `strapi-schema-manifest.md`, `server/`, `landing/`, `MOCK_MIGRATION_NOTES.md`. Strapi ya se descartó, así que hay que archivar o borrar lo que no se use para que la fuente de verdad (`docs/FUENTE_DE_VERDAD.md`) sea clara.

## 7. Backend

Puntos fuertes:
- `config/env.ts` valida con Zod y **bloquea configuraciones inseguras en producción** (pagos e IA falsos, HTTP en servicios internos, pasarelas sin validar). 2FA para staff por defecto en producción.
- SQL parametrizado. Las interpolaciones de `table-admin.ts` y `approvals.ts` usan solo nombres de tabla o columna de configuración estática y números ya validados con Zod. Sin inyección.
- Logger con `redact` de `authorization` y `cookie`, `bodyLimit` de 1 MB, `trustProxy` configurable, plugin de seguridad y rate limit. 97 migraciones con checksum y 93 suites de tests.

A mejorar:
- `RATE_LIMIT_STORE` es `memory` por defecto. En un VPS con más de un proceso el límite no se comparte. Exigir `postgres`/`redis` en producción, igual que se hace con los pagos.
- `DATABASE_URL` tiene un valor por defecto con credenciales `postgres:postgres`. Que sea obligatorio en producción.
- `DOCS_ENABLED` es `true` por defecto, así que la documentación OpenAPI se expone en producción si no se cambia. Poner `false` en producción.
- `table-admin.ts` hace `SELECT *` y devuelve todas las columnas. Confirmar que ninguna tabla registrada tiene columnas sensibles (hashes, tokens).

## 8. Seguridad

- **`sharp` < 0.35.5 (CVE-2026-96889, alta, librsvg).** Se ataca subiendo un SVG malicioso a media. Arreglo: `cd backend && npm audit fix`. Es lo primero que hay que hacer.
- CSP en `<meta>` con `script-src 'unsafe-inline'`. Esto anula la mayor parte de la protección contra XSS. El único script inline es el de limpieza del service worker, que se puede mover a un archivo `.js` y quitar `'unsafe-inline'`. Conviene también enviar la CSP como cabecera en `dist/_headers` (la de `<meta>` no admite `frame-ancestors` ni `report-uri`).
- La CSP incluye `https://cdn.gpteng.co` (resto de Lovable). Quitarlo.
- `.github/workflows/supply-chain.yml` está **eliminado y en staging**. Si fue intencional, conviene documentarlo; si no, restaurarlo con `git restore --staged --worktree .github/workflows/supply-chain.yml`.
- `dangerouslySetInnerHTML` solo aparece en `ui/chart.tsx` (shadcn, CSS generado). Es aceptable.

## 9. Repositorio y CI

- Hay carpetas versionadas que no deberían estarlo: `.pnpm-store/` (base de datos binaria), `.temp_skills/`, `playwright-report/`, `test-results/`. Hay que añadirlas a `.gitignore` y sacarlas con `git rm -r --cached`.
- `backend/loadtest-report.json`, `backend/dist*` y `dist/` en el árbol: comprobar que no estén versionados.
- Los workflows de CI deberían ejecutar `check:contrast`, `check:bundle-budget` y `npm audit --omit=dev` para que estos hallazgos no vuelvan a aparecer.

## Plan priorizado

1. `npm audit fix` en `backend` (sharp).
2. Decidir si se restaura `supply-chain.yml`.
3. Hacer obligatorios en producción `RATE_LIMIT_STORE` compartido y `DATABASE_URL`, y poner `DOCS_ENABLED=false`.
4. Quitar `'unsafe-inline'` y `cdn.gpteng.co` de la CSP; moverla a cabecera.
5. Verificar canonical/título por ruta (SEO).
6. Escala tipográfica: eliminar los tamaños de 7–9 px y tokenizar 10–11 px.
7. Corregir contraste (12 pares) y la accesibilidad de formularios y teclado (≈170 casos).
8. Limpiar el repo (`.pnpm-store`, `.temp_skills`, reportes) y los restos de Strapi y Lovable.
9. Reducir el chunk de entrada y sacar los datos estáticos del bundle.
10. Reducir los `any` progresivamente (empezando por `tsconfig.strict-pilot.json`).

## Estado de las correcciones (2026-10-13)

| # | Hallazgo | Estado |
|---|---|---|
| 1 | `sharp` CVE | ✅ 0.35.5, `npm audit` limpio |
| 2 | `supply-chain.yml` | ✅ Borrado intencional: auditaba `cms/` y `server/`, que también se eliminan |
| 3 | Defaults del backend en producción | ✅ `RATE_LIMIT_STORE=postgres`, rechazo de `postgres:postgres`, `DOCS_ENABLED=false` salvo explícito |
| 4 | CSP | ✅ Sin `'unsafe-inline'` en scripts (limpieza del SW en `/legacy-sw-cleanup.js`), sin `gpteng`; Caddy añade `frame-ancestors`, HSTS y `nosniff` |
| 5 | SEO por ruta | ✅ Ya cubierto: `SEOHead` (canonical, hreflang por `?lang=`) + prerender en `postbuild.mjs`; `keywords` eliminado |
| 6 | Tipografía | ✅ Sin texto < 10px; `text-[10px]`/`text-[11px]` → tokens `text-3xs`/`text-2xs`; pesos de fuente recortados a 300–900 |
| 6b | Hex en clases | ✅ 15 clases → tokens `brand-lagoon`, `brand-night`, `brand-navy*`, `brand-cta*`. Los hex restantes son legítimos (SVG del logo, marcadores Leaflet, jsPDF, HTML embebible, confeti, Recharts) |
| 7 | Contraste | ✅ 0 pares bajo AA |
| 7b | Accesibilidad | ✅ ~190 → 4 (3 subtítulos + 1 falso positivo de shadcn en `ui/pagination.tsx`): labels enlazados (`htmlFor`/`id`), elementos clicables con `role="button"` + teclado (`src/lib/a11y.ts`), enlaces `href="#"` reales, nombres accesibles. **Pendiente:** subtítulos `.vtt` de vídeos de reseñas y banner (requieren contenido) |
| 8 | Repo | ✅ `.pnpm-store`, `.temp_skills`, `playwright-report`, `test-results` fuera del índice. **Pendiente decidir:** `mysql/`, `landing/`, `strapi-schema-manifest.md`, `MOCK_MIGRATION_NOTES.md` (aún referenciados en docs y `backend/scripts/gen-baseline.ts`) |
| 9 | Bundle | ✅ Hallazgo nuevo corregido: `src/data/agenciasToursRNT.ts` (4 MB, 8.224 prestadores con teléfono/WhatsApp/correo) entraba al bundle público por el `import.meta.glob` de `catalogBrowser.ts`; excluido. **Pendiente medir** el chunk de entrada en CI (en esta máquina esbuild falla por bloqueo de `%TEMP%`) |
| 10 | Lint | ✅ Todos los errores no-`any` corregidos (38). **Pendiente:** 569 `any`, casi todos respuestas de API sin tipar (`gamificationApi.ts` 57, `operadores/api.ts` 22…): tiparlas desde `backend/openapi.yaml`, archivo por archivo |
| — | Supabase (107 archivos), `localStorage` (249 accesos), componentes > 1.000 líneas | Pendiente: trabajo de migración en curso (`docs/TAREAS_CONEXION_BACKEND_PENDIENTES.md`) |

## Segunda ronda (2026-10-13/14)

**Repo:** se quitaron `landing/` (4 maquetas sin uso, 1,6 MB) y `strapi-schema-manifest.md`. Se conservan `mysql/` (lo usa `npm run db:gen-baseline`, válido hasta el primer despliegue; retirarlo junto con ese script después) y `MOCK_MIGRATION_NOTES.md` (documenta el mock que aún existe).

**APIs tipadas contra el backend (0 `any` en los 8 clientes; 569 → 459 en total).** Al tipar aparecieron contratos inventados que fallaban en ejecución; se corrigieron cliente y pantallas:
- Gamificación/social (13 pantallas): ranking, comentarios, feed, pasaporte, coleccionables, trivia, misiones, premios y check-in leían campos que la API no envía; recompensas fijas inventadas (50 XP, 25 monedas) sustituidas por las reales; el progreso de rutas nunca llegaba a la UI.
- Peticiones rechazadas con 400: sorteo (`full_name`/`email` → `name`/`accept_rules`), vacaciones (faltaban `destination_id` y fechas), foto de reto (URL → subida real con `media_id`, nuevo `src/lib/mediaApi.ts`), visita a provincia (exige ubicación, `currentPosition()` en `geoDistance.ts`), publicación social (`media[]`/`location`).
- Operadores: `/operators/:slug` se leía como si fuera la organización; las reservas de la API no traen `org_id`, por lo que los recordatorios automáticos nunca encontraban ninguna.
- Club de Recompensas: pedía rutas de cuenta sin sesión (401 → aviso de sesión vencida), mostraba vouchers de ejemplo a cuentas reales, inventaba códigos `RD-REWARD-…` y leía los premios propios de un operador como catálogo público.

**Navegador (servidor de desarrollo 8080):** 16 rutas × escritorio/móvil sin errores de consola ni desbordes tras corregir la portada móvil (buscador y párrafo salían de la pantalla). Lighthouse (portada, destinos, gamificación, tienda): accesibilidad 93–98 → **100**, buenas prácticas 100, SEO 100. Rendimiento 27–37 **no es representativo** (código sin minificar); medir con la compilación de CI. El enlace «Saltar al contenido» apuntaba a un id ausente en ~100 páginas: ahora su destino lo pone el `Header`.

**Pruebas:** frontend 193/193. E2E 14/14 (contra 8080; `dist/` local es de septiembre y no se puede recompilar aquí). Backend 889/901: los 11 fallos están en anuncios, búsqueda y migraciones que el otro agente editaba durante la corrida (la migración `0099` apareció a mitad), más un tiempo de espera de claves JWT por carga de la máquina; repetir con el árbol estable.

**Pendiente:** el chip de clima muestra «Ejemplo» (datos simulados; conectar a `/weather`); el escaparate público de operadores usa rutas de miembro (`/org/*`) y no funciona para visitantes; 459 `any` en pantallas y modo demo.

## Límites de esta auditoría

- No se levantó el sitio en navegador: no hay Lighthouse ni capturas visuales (las métricas de rendimiento salen del bundle de `dist/`, que puede estar desactualizado).
- La compilación `VITE_DATA_SOURCE=api` falló por un bloqueo de archivo temporal de esbuild en Windows (`Access is denied`). Es un problema del entorno, no del código, y habría que repetirla en CI.
- No se ejecutaron los tests de backend (requieren la base Docker en el puerto 5433) ni los e2e.
- No se revisó la lógica de negocio módulo por módulo (pagos, reservas, gamificación) en busca de bugs.
