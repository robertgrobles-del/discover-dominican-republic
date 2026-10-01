# ARCHITECTURE.md — Descubre República Dominicana

> Cómo se conectan el frontend, el backend, la base de datos y los servicios externos.
> Refleja la rama `dev` al 2026-09-26 (commit `8eb7614`). Si cambias la arquitectura, actualiza este archivo y registra la decisión en [`docs/contexto/decisiones.md`](docs/contexto/decisiones.md).
> Documentación técnica detallada: [`docs/BACKEND_API.md`](docs/BACKEND_API.md) · [`docs/BACKEND_OPERACION.md`](docs/BACKEND_OPERACION.md) · [`docs/BACKEND_SEGURIDAD.md`](docs/BACKEND_SEGURIDAD.md) · [`backend/README.md`](backend/README.md)

---

## 1. Vista general

### Hoy (lo que realmente corre)

```
┌──────────────────────────────┐
│  Navegador                   │
│  React SPA (src/)            │
│   └─ "cliente Supabase"      │──► mockDb.json (en memoria, 131 filas)
│      = base simulada         │    cualquier login entra · nada persiste
└──────────────┬───────────────┘
               │ solo el chatbot
               ▼
     Supabase Edge Function chat-turistico ──► Pasarela de IA

  backend/ (API Fastify)  ← existe, probado (480 pruebas), NO conectado
  server/ + mysql/        ← apagado
  cms/ (Strapi)           ← integración revertida
```

### Objetivo (propuesta para validar, `decisiones.md` P1)

```
                     ┌───────────────────────────────────────┐
  Portal web ───────►│  CDN / caché de GET públicos          │
  Panel empresa ────►│  api.<dominio>/api/v1  (HTTPS)        │
  Panel admin ──────►└───────────────────┬───────────────────┘
                                         │ JWT corto + cookie de refresco · límites de tasa
                     ┌───────────────────▼───────────────────┐
                     │  API Fastify (backend/)               │
                     │  auth · content · discover · game ·   │
                     │  operators · payments · store ·       │
                     │  marketplace · media · admin · ai ... │
                     └──┬──────────┬──────────┬──────────┬───┘
                        │          │          │          │
                 ┌──────▼───┐ ┌────▼────┐ ┌───▼─────┐ ┌──▼──────────────┐
                 │PostgreSQL│ │ Redis   │ │ Archivos│ │ Trabajos en BD  │
                 │ 16       │ │(opcional│ │ (S3/R2, │ │ correo, reservas│
                 │ datos,   │ │ límites │ │ URL     │ │ liquidaciones,  │
                 │ búsqueda │ │ de tasa)│ │ firmada)│ │ retención       │
                 └──────────┘ └─────────┘ └─────────┘ └─────────────────┘
                        │
   Servicios externos: Stripe · correo SMTP · Google (OIDC) · IA · datos vivos (tasas, clima, mar)
```

---

## 2. Repositorio

```
/
├─ src/                    Frontend React (SPA)
├─ public/                 Estáticos, banners, sitemap.xml, llms.txt
├─ backend/                API Fastify + PostgreSQL (servicio principal propuesto)
│  ├─ migrations/          0001–0033, SQL versionado (nunca editar una aplicada)
│  ├─ scripts/             migrate · seed-from-mock · gen-baseline · gen-manifest · generate-keys · backup
│  ├─ src/
│  │  ├─ config/env.ts     variables de entorno validadas con Zod
│  │  ├─ db/               pool y migrador con checksums
│  │  ├─ lib/              errores, paginación, i18n
│  │  ├─ plugins/          errores, seguridad (helmet, CORS, rate limit), ETag, OpenAPI, auth
│  │  ├─ modules/          un módulo por dominio (ver §4)
│  │  └─ routes.ts         registro bajo /api/v1
│  └─ test/                34 archivos de integración con PostgreSQL real
├─ supabase/               Migraciones y Edge Functions (legado; ver §6)
├─ server/, mysql/         Express + MySQL (apagado; candidato a eliminar)
├─ cms/                    Strapi (revertido; candidato a eliminar)
├─ landing/                Landing aparte
├─ docs/                   Documentación técnica y de contexto
├─ AGENTS.md · PRD.md · ARCHITECTURE.md · DESIGN_SYSTEM.md
└─ .github/workflows/      backend.yml (falta CI del frontend)
```

---

## 3. Frontend (`src/`)

| Aspecto | Tecnología / decisión |
|---|---|
| Framework | React 18 + TypeScript 5 |
| Build | Vite 7 |
| Rutas | React Router 7, ~300 rutas en `App.tsx`, carga diferida por página |
| Estilos | Tailwind CSS 3 + shadcn/ui (Radix) + tokens CSS en `src/index.css` (ver `DESIGN_SYSTEM.md`) |
| Animación | Framer Motion (≈240 archivos lo usan) |
| Estado remoto | TanStack Query 5 |
| Estado global | Contextos: `I18nProvider`, `AuthProvider`, `FavoritesProvider`, `CartProvider` |
| Formularios | react-hook-form + Zod |
| Mapas | Leaflet + react-leaflet |
| Íconos | lucide-react |
| Avisos | sonner |
| Pruebas | Vitest + Testing Library |
| Idiomas | `src/i18n/translations/{es,en,fr,de,it,pt}.ts` + `useI18n` |

**Estructura**
```
src/
├─ App.tsx                 proveedores + rutas
├─ pages/                  ~246 páginas
├─ components/             ~295 componentes (ui/ = shadcn; resto por dominio)
├─ hooks/                  useAuth, useGamification, usePassport, useCart, useFavorites, useI18n…
├─ integrations/supabase/  client.ts (HOY: base simulada) + types.ts
├─ modules/tienda/         tienda oficial (checkout a reemplazar)
├─ data/                   datos estáticos de ejemplo
├─ i18n/                   traducciones
└─ lib/                    utilidades
```

**Deuda conocida**
- `src/integrations/supabase/client.ts` imita la API de Supabase sobre `mockDb.json`. Al conectar la API real, se reemplaza por un cliente tipado generado desde el OpenAPI del backend (§8).
- Carpetas de componentes duplicadas: `gamificacion` / `gamification` / `gamificacion-hub` / `gamificacion-turistica`, `beach` / `playas`, `river` / `rios`, `destination` / `destinations`, `province` / `provinces`, `experience` / `experiences`.
- Datos repartidos entre `src/data/*.ts` y el mock: deben venir de la API.
- El build está roto desde `5fd8083` (ver `producto.md`).

---

## 4. Backend (`backend/`)

| Aspecto | Tecnología / decisión |
|---|---|
| Runtime | Node.js 20+ con TypeScript |
| Framework | Fastify + `fastify-type-provider-zod` |
| Validación | Zod en todas las entradas |
| Base de datos | PostgreSQL 16 con `pgcrypto`, `pg_trgm`, `unaccent`, `btree_gist` |
| Contraseñas | Argon2 |
| Tokens | JWT de acceso corto (15 min) con `kid`, JWKS público y rotación; refresco con rotación y revocación |
| 2FA | TOTP (RFC 6238) con códigos de recuperación; obligatorio para el personal |
| Login social | Google (OIDC con PKCE, state atado por cookie) |
| Seguridad HTTP | helmet, CORS con lista blanca, límites de tasa (memoria, PostgreSQL o Redis) |
| Documentación | OpenAPI (Swagger) en `/docs` cuando `DOCS_ENABLED` |
| Imágenes | sharp: variantes WebP (thumb, medium, large), sin EXIF, orientación aplicada |
| Correo | Cola durable en PostgreSQL con reintentos (outbox) + SMTP |
| Pagos | Stripe PaymentIntents idempotentes, webhook firmado, conciliación y reembolsos |
| Trabajos | Ejecutor programado: expiración de reservas, avisos, liquidaciones, retención |

**Módulos** (`backend/src/modules/`)

| Módulo | Qué hace |
|---|---|
| `auth` | Registro, sesiones, verificación, contraseñas, TOTP, OAuth |
| `me` | Perfil, preferencias, favoritos, notificaciones, exportar y eliminar cuenta |
| `content` | API pública genérica de 43 colecciones: listados, filtros, búsqueda, facetas, cercanía, traducciones |
| `discover` | Búsqueda global, mapa GeoJSON, cerca de mí, recomendaciones |
| `live` | Datos vivos: tasas, combustibles, loterías, clima, mar, alertas |
| `tools` | Calculadoras y herramientas del viajero |
| `forms` | Contacto, soporte, leads, newsletter con doble opt-in, alta de establecimientos |
| `community` | RD Social, reseñas, encuestas, concursos |
| `game` | Gamificación con reglas en el servidor, pasaporte con GPS/QR, trivia, ligas, temporadas |
| `trips` | Mi viaje, planificador grupal, diario, e-tickets |
| `operators` | Motor de reservas: tarifas, disponibilidad, depósitos, extras, paquetes, iCal, equipo, mensajes |
| `payments` | Stripe, webhooks, conciliación |
| `store` | Tienda oficial: catálogo, carrito, cotización, cupones, pedidos, devoluciones |
| `marketplace` | Vendedores, catálogo moderado, pedidos multivendedor, liquidaciones |
| `ambassadors` | Programa de embajadores y comisiones |
| `marketing` | Servidor de anuncios, canje de ofertas, campañas de correo |
| `analytics` | Analítica anónima con consentimiento, embudos, NPS, retención de 13 meses |
| `media` | Subida con URL firmada, validación del archivo real, moderación, biblioteca |
| `i18n` | Diccionario de interfaz editable y traducciones de contenido con estados |
| `ai` | Chat, itinerarios validados contra el catálogo, traducción, borradores, cuotas y tope de gasto |
| `admin` | CMS, usuarios, ajustes, redirecciones, auditoría |
| `jobs`, `mailer`, `health`, `config` | Sistema |

**Convenciones de la API**
- Rutas bajo `/api/v1`. Respuesta `{ data, meta?, links? }`; error `{ error: { code, message, details?, request_id } }`.
- Listados: `page`, `per_page` (máx. 100), `q`, `sort`, `filter[campo]`, `lang`.
- Contenido público: solo `status = 'published'`, no eliminado y con `published_at` vencido; `Cache-Control` + ETag.
- SQL siempre parametrizado; columnas de orden y filtro desde listas blancas.
- Una migración aplicada nunca se edita; se agrega una nueva.

---

## 5. Datos

- **Fuente de verdad propuesta:** PostgreSQL del backend (138 tablas en la base de pruebas, 33 migraciones).
- **Contenido vs. transacciones:** el contenido editorial pasa por el flujo del CMS (borrador → revisión → publicado); las transacciones (reservas, pagos, pedidos) no.
- **Traducciones:** tabla `entity_translations` con respaldo al español.
- **Auditoría:** triggers de auditoría en tablas sensibles.
- **Semilla:** `npm run db:seed` carga los datos del mock para desarrollo. En producción, la carga es contenido real.

---

## 6. Supabase (legado)

| Pieza | Estado |
|---|---|
| Proyecto Supabase | Existe; usado por la versión de `main` |
| Migraciones `supabase/migrations` | 49 en `dev`. La de seguridad (20260927) **falla** en esta secuencia; 12 tablas tienen políticas de escritura abiertas |
| Edge Functions | `chat-turistico` (usada por el sitio), `ai-recommendations`, `import-establecimientos`, `admin-entities`, `admin-ai-operations` |

**Recomendación:** si se elige la API Fastify (P1), migrar el chatbot a su módulo `ai` y congelar Supabase. Mientras siga en uso, corregir las políticas abiertas.

---

## 7. Flujos clave

**Inicio de sesión (API)**
```
Formulario → POST /api/v1/auth/login → Argon2 + bloqueo por intentos
  → ¿2FA? → reto TOTP → JWT de acceso (15 min) + refresco en cookie HttpOnly
  → cada petición: Authorization: Bearer <JWT> → roles verificados en el servidor
```

**Contacto de un viajero con un negocio**
```
Clic en WhatsApp de la ficha → evento de analítica (con consentimiento)
  → se abre WhatsApp con mensaje prellenado → cuenta como "contacto" (metricas.md)
  → aparece en el panel de la empresa
```

**Alta de un establecimiento**
```
Formulario → POST /api/v1/establishments/register (honeypot, límite 5/hora)
  → estado "pendiente" → bandeja del admin → aprobación → ficha publicada → correo al negocio
```

**Pago de un plan o pedido**
```
Checkout con Stripe Elements → PaymentIntent (idempotente) → pago
  → webhook firmado → el servidor marca "pagado" y activa el plan o pedido
  (el navegador nunca decide el precio ni el estado)
```

**Sello del pasaporte**
```
Posición GPS o QR → servidor valida radio (300 m), precisión (≤150 m) y velocidad (≤300 km/h)
  → sello + XP y monedas según reglas y topes diarios
```

---

## 8. Plan de conexión del frontend a la API

1. Generar un cliente tipado desde el OpenAPI del backend.
2. Poner detrás de un interruptor de función el uso del mock frente a la API real.
3. Conectar en este orden: **auth → forms (leads, alta, reclamos) → content → discover → me → game → operators → payments → store**.
4. Retirar `mockDb.json` y el cliente simulado cuando el último módulo esté conectado.
5. Retirar `server/`, `mysql/` y `cms/` si no se usan.

---

## 9. Entornos y despliegue

| Entorno | Cómo |
|---|---|
| Local | `backend/docker-compose.yml`: PostgreSQL :5433, Redis :6380, Mailpit :8025. Alternativa sin Docker: PostgreSQL embebido en :5434 (`npm run db:embedded`) |
| Pruebas | `npm test` en `backend/` contra PostgreSQL real (`TEST_DATABASE_URL`) |
| Producción | `backend/Dockerfile`; lista de salida en `docs/BACKEND_OPERACION.md` |

**Variables de entorno principales (backend):** `DATABASE_URL`, `CORS_ORIGINS`, `PUBLIC_BASE_URL`, `WEB_BASE_URL`, `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY`, `JWT_ACCESS_TTL_SECONDS`, `REFRESH_TTL_DAYS`, `RATE_LIMIT_STORE`, `MAIL_TRANSPORT`, `MAIL_FROM`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `OAUTH_GOOGLE_*`, `APP_SECRET`, `FEATURE_CHECKOUT`, `FEATURE_AI_CHAT`, `FEATURE_OPERATORS`, `FEATURE_STORE`. La lista completa y comentada está en `backend/.env.example`.

**Frontend:** usa `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` para el cliente público de Supabase; `VITE_API_URL` y `VITE_STRAPI_URL` son URLs de servicios. **Nunca** poner secretos en variables `VITE_`: todas quedan visibles en el navegador.

---

## 10. CI/CD

| Hoy | Falta |
|---|---|
| `backend.yml`: pruebas del backend | CI del frontend: tipos, lint, pruebas y build en cada push |
| — | Pruebas RLS de Supabase (quedaron en `main`) |
| — | Protección de ramas `main` y `dev` con revisión obligatoria |
| — | Despliegue automático a un entorno de pruebas |

---

## 11. Decisiones de arquitectura pendientes

| # | Decisión | Recomendación |
|---|---|---|
| P1 | Backend definitivo | API Fastify |
| AR-1 | Renderizado para SEO (prerender, SSR o seguir como SPA) | Prerender de páginas públicas como primer paso |
| AR-2 | Almacenamiento de archivos (S3, R2 u otro) | Uno compatible con S3 y URL firmadas |
| AR-3 | Hosting de API y base de datos | Definir con presupuesto y región cercana a los usuarios |
| AR-4 | Pasarela local (Azul, CardNet) además de Stripe | Evaluar para cobros en pesos |
