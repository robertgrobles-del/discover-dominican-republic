# Conectar el frontend al backend: bloques 4 y 5

**Fecha:** 2026-10-05 · **Rama:** `feature/nueva-arquitectura-optimizada`

Guía de trabajo para quien continúe la conexión del frontend a la API. Los bloques 1 a 3 están hechos o en
curso (sesión, favoritos, perfil, reseñas, «Mis reservas»). Aquí se describe lo que falta:

- **Bloque 4 — Gamificación y social:** puntos, niveles, logros, misiones, pasaporte, coleccionables, trivias,
  retos de fotos, gremios, clasificación, muro social, comentarios, sorteos y encuestas.
- **Bloque 5 — Tienda y recompensas:** catálogo de la tienda, carrito, pedidos y canje de premios.

El backend ya tiene los módulos y las rutas. El trabajo es del lado del frontend: cada pantalla que hoy habla
con el cliente simulado (`@/integrations/supabase/client`) debe pasar a llamar a la API.

---

## 1. Cómo arrancar el entorno

```bash
cd backend && docker compose up -d postgres      # base en el puerto 5433
cd backend && npm run dev                        # API en http://localhost:3000
npm run dev                                      # sitio en http://localhost:8080
```

El `.env` de la raíz debe tener:

```
VITE_CATALOG_SOURCE=api
VITE_AUTH_SOURCE=api
```

`vite.config.ts` necesita el proxy de `/api` hacia el puerto 3000 (ya está en la copia de trabajo). Sin él las
llamadas devuelven el HTML del sitio y todo cae al respaldo sin avisar.

- **Administrador de desarrollo:** `admin@descubre.local` / `Admin-Descubre-2026!`.
- **Base de pruebas del backend:** `TEST_DATABASE_URL=postgres://postgres:postgres@localhost:5433/descubre_rd_test`.

## 2. El patrón a seguir

Es el mismo de los bloques ya hechos. Tres piezas:

1. **Un cliente tipado por dominio en `src/lib/`.** Ejemplos a copiar: `favoritesApi.ts`, `accountApi.ts`,
   `bookingsApi.ts`. Usa `fetchApi` de `@/lib/fastifyClient` (añade el token y llama por el mismo origen) y
   convierte la respuesta de la API a la forma que la pantalla ya pinta, para tocar la pantalla lo mínimo.
2. **La pantalla o el hook elige el origen con `HAS_BACKEND_SESSION`** (`@/lib/authSource`): con sesión real
   usa el cliente nuevo; si no, deja el camino simulado tal cual.
3. **Los errores se muestran con `apiMessage(err, "texto de respaldo")`** (`@/lib/accountApi`), que saca el
   mensaje que devuelve la API.

```ts
if (HAS_BACKEND_SESSION) {
  try { setItems(await miDominioApi.list()); } catch (err) { toast.error(apiMessage(err, "No se pudo cargar")); }
  return;
}
// …camino simulado sin tocar
```

### Reglas que no admiten excepción

- **El criterio es `HAS_BACKEND_SESSION`, no `IS_MOCK_DATA`.** `useCart.tsx` ya tiene llamadas a la API, pero
  detrás de `!IS_MOCK_DATA`, así que no se ejecutan con la configuración actual. Hay que cambiar esa condición.
- **El servidor decide puntos, precios, existencias y estados.** El navegador nunca los calcula ni los envía.
  En el cliente simulado hay funciones como `award_user_xp` o `redeem_user_prize` que suman puntos desde el
  navegador: en la API no existen con esa forma. Se informa de la **acción** (`POST /gamification/actions`) y
  el servidor decide cuántos puntos da.
- **Nada de éxito simulado.** Si la API falla, se muestra el error. No se cae al cliente simulado ni se anuncia
  una operación que no ocurrió.
- **Leer y escribir el almacenamiento local con el mismo mecanismo.** `src/lib/storage.ts` antepone un prefijo
  a las claves: `getStoredJSON("clave")` no lee lo que se guardó con `localStorage.setItem("clave")`. Ese
  desajuste ya hizo perder los favoritos de invitado al recargar.

## 3. Bloque 4 — Gamificación y social

### Rutas del backend

Todas bajo `/api/v1`. Las de escritura exigen sesión.

| Tema | Rutas |
|---|---|
| Mi estado | `GET /gamification/me`, `GET /gamification/me/transactions`, `GET /gamification/levels`, `GET /gamification/rules` |
| Acciones y rachas | `POST /gamification/actions`, `POST /gamification/check-in`, `POST /gamification/early-bird`, `POST /gamification/streak-bonus`, `POST /gamification/milestones/check` |
| Logros | `GET /gamification/achievements`, `GET /gamification/achievements/me`, `POST /gamification/achievements/:id/unlock` |
| Misiones | `GET /gamification/missions`, `GET /gamification/missions/me`, `POST /gamification/missions/:id/progress` |
| Clasificación y ligas | `GET /gamification/leaderboard`, `GET /gamification/leagues`, `GET /gamification/seasons/current` |
| Provincias | `GET /gamification/provinces`, `POST /gamification/provinces/:slug/visit` |
| Rutas gamificadas | `GET /gamification/routes`, `GET /gamification/routes/:id`, `POST /gamification/routes/:id/start`, `POST /gamification/routes/:id/checkpoints/:cp/complete` |
| Pasaporte | `GET /passport/me`, `POST /passport/stamps`, `POST /gamification/passport/scan-qr` |
| Coleccionables | `GET /collectibles`, `GET /collectibles/me`, `POST /collectibles/:id/claim`, `PATCH`/`DELETE /collectibles/me/:id` |
| Trivia | `GET /trivia/session`, `POST /trivia/session/:id/answer`, `POST /trivia/session/:id/finish`, `GET /trivia/leaderboard` |
| Retos de fotos | `GET /gamification/photo-challenges`, `GET`/`POST /gamification/photo-challenges/:id/submissions`, `POST /gamification/photo-submissions/:id/vote` |
| Gremios | `GET`/`POST /gamification/guilds`, `POST /gamification/guilds/:id/join`, `POST /gamification/guilds/:id/leave` |
| Referidos | `GET /referrals/me`, `POST /referrals/apply` |
| Muro social | `GET /social/feed`, `POST /social/posts`, `DELETE /social/posts/:id`, `PUT`/`DELETE /social/posts/:id/like` |
| Comentarios | `GET`/`POST /social/posts/:id/comments`, `DELETE /social/comments/:id`, `GET /social/me/comment-stats` |
| Reportes y medios | `POST /ugc/reports`, `GET`/`POST /ugc/media` |
| Sorteos y encuestas | `GET /contests`, `GET /contests/:slug`, `POST /contests/:slug/register`, `GET /surveys/:slug`, `POST /surveys/:slug/responses`, `POST /vacation-registrations` |

El contrato exacto de cada una (cuerpo y respuesta) está en `docs/BACKEND_API_IMPLEMENTADO.md` y en el código:
`backend/src/modules/game/` y `backend/src/modules/community/`.

### Archivos del frontend, en el orden recomendado

Empieza por los hooks: muchas pantallas dependen de ellos, y al conectarlos se arreglan varias a la vez.

| Orden | Archivo | Qué usa hoy del cliente simulado | A qué pasa |
|---|---|---|---|
| 1 | `src/hooks/useGamification.tsx` (428 líneas) | `user_gamification`, `gamification_levels`, `gamification_missions`, `user_missions`, `gamification_prizes`, `referral_codes`; `rpc award_user_xp`, `redeem_user_prize` | `/gamification/me`, `/levels`, `/missions`, `/missions/me`, `/prizes`, `/referrals/me`, `POST /gamification/actions`, `POST /gamification/prizes/:id/redeem` |
| 2 | `src/hooks/useActionTracker.tsx` (307) | `rpc award_user_xp`, `perform_daily_checkin`, `perform_early_bird_bonus`, `check_and_award_streak_bonus`, `check_xp_milestones` | `POST /gamification/actions`, `/check-in`, `/early-bird`, `/streak-bonus`, `/milestones/check` |
| 3 | `src/hooks/useAchievementChecker.tsx` | `achievements`, `user_achievements`; cuenta `favorites` y `reviews`; `rpc unlock_user_achievement` | `/gamification/achievements`, `/achievements/me`, `POST …/:id/unlock`. Los conteos ya no hacen falta: el servidor sabe qué se cumplió |
| 4 | `src/hooks/usePassport.tsx` (392) | `gamified_routes`, `route_checkpoints`, `user_route_progress`, `user_checkpoint_completions`, `passport_stamps`, `digital_collectibles`, `user_collectibles` | `/gamification/routes…`, `/passport/me`, `/passport/stamps`, `/collectibles…` |
| 5 | Páginas de logros: `Badges.tsx`, `MisLogros.tsx`, `GamificacionHub.tsx`, `PerfilJugador.tsx`, `ExplorerProfile.tsx` | `achievements`, `user_achievements`, `gamification_transactions`, `profiles`, `explorer_follows` | Las rutas de logros y `/gamification/me/transactions` |
| 6 | `src/pages/GamificacionTuristica.tsx` | `explorer_guilds`, `guild_members`; `rpc get_province_stats`, `record_province_visit` | `/gamification/guilds…`, `/gamification/provinces…` |
| 7 | `src/pages/TriviaTuristica.tsx` | `trivia_questions`, `trivia_sessions`; `rpc award_user_xp` | `/trivia/session…`. Las preguntas y la puntuación las da el servidor |
| 8 | `src/pages/SouvenirsDigitales.tsx` | `digital_collectibles`, `user_collectibles` | `/collectibles…` |
| 9 | `src/components/gamification/`: `PhotoChallenge.tsx`, `SocialFeed.tsx`, `LeagueWidget.tsx` | `user_gamification`, `gamification_transactions`; `rpc vote_photo_submission`, `get_season_leaderboard` | Rutas de retos de fotos, `/gamification/leaderboard`, `/leagues` |
| 10 | `src/pages/FeedSocial.tsx` (374) | `social_posts`, `social_likes`, `social_comments`, `profiles` | `/social/feed`, `/social/posts…` |
| 11 | `src/pages/RDSocial.tsx` (318) y `src/components/comments/CommentSection.tsx` | `post_comments`, `comments`, `ugc_reports`; `rpc post_comment`, `get_my_comment_stats` | `/social/posts/:id/comments`, `/social/me/comment-stats`, `/ugc/reports` |
| 12 | Sorteos y encuestas: `SorteoLectorBanner.tsx`, `ViralSorteoModule.tsx`, `SurveyModule.tsx`, `VacacionesRD.tsx` | `contest_registrations`, `survey_responses`, `vacation_registrations` | `/contests/:slug/register`, `/surveys/:slug/responses`, `/vacation-registrations` |

### Puntos delicados del bloque 4

- **Los favoritos y las reseñas ya dan puntos en el servidor.** No hay que informar de esa acción otra vez
  desde el navegador, o se contaría doble.
- **Las reseñas y lo que se publica pasan por moderación.** Una cuenta con el correo sin verificar queda «en
  revisión». La pantalla debe decirlo, no anunciar que ya está publicado.
- **Los perfiles públicos no llevan el identificador de la cuenta.** Si una pantalla necesita reconocer «lo
  mío», debe usar lo que devuelve la API para eso, no comparar identificadores.

## 4. Bloque 5 — Tienda y recompensas

### Rutas del backend

| Tema | Rutas |
|---|---|
| Catálogo | `GET /store/categories`, `GET /store/products`, `GET /store/products/:slug` |
| Carrito | `GET /cart`, `POST /cart/items`, `PATCH`/`DELETE /cart/items/:id`, `DELETE /cart`, `POST /cart/merge`, `PUT /cart/coupon`, `POST /coupons/validate` |
| Compra | `POST /checkout/quote`, `POST /orders` |
| Mis pedidos | `GET /me/orders`, `GET /orders/:id`, `POST /orders/:id/cancel`, `POST /orders/:id/return-request` |
| Premios | `GET /gamification/prizes`, `POST /gamification/prizes/:id/redeem`, `GET /gamification/redemptions/me`, `GET /gamification/shipments/me` |
| Membresías y entradas | `GET /memberships/plans`, `GET /memberships/me`, `POST /memberships/subscribe`, `POST /events/:id/tickets/purchase` |

Código: `backend/src/modules/store/` y `backend/src/modules/game/`.

### Archivos del frontend

| Orden | Archivo | Estado y qué hacer |
|---|---|---|
| 1 | `src/modules/tienda/api.ts` (155 líneas) | Lee `store_products` y escribe `store_orders` en el cliente simulado, descontando existencias en el navegador. Pasa a `/store/products…`, `/checkout/quote` y `/orders` |
| 2 | `src/hooks/useCart.tsx` (197) | Ya tiene las llamadas a `/cart…`, pero detrás de `!IS_MOCK_DATA`. Cambiar la condición a `HAS_BACKEND_SESSION` y usar `POST /cart/merge` al iniciar sesión para subir el carrito de invitado |
| 3 | `src/modules/tienda/pages/` | Listado, ficha, carrito, checkout y «mis pedidos». Sustituir el cálculo de totales por la cotización del servidor |
| 4 | `src/pages/ClubRecompensas.tsx` y `src/components/rewards/` | Canje de premios: `POST /gamification/prizes/:id/redeem`, y el historial en `/redemptions/me` y `/shipments/me` |

### Puntos delicados del bloque 5

- **`POST /orders` exige la cabecera `Idempotency-Key`** (8 a 100 caracteres, única por intento de compra).
  Se genera con `crypto.randomUUID()` una vez por intento, no por reintento de red.
- **El total sale de `POST /checkout/quote`.** No se suma en el navegador ni se envía en el pedido.
- **El cobro.** El contrato del proyecto prohíbe capturar número de tarjeta, vencimiento o CVC en campos
  propios: el pago va con `payment_method_token` de la pasarela. Las pasarelas locales (Azul, Cardnet) no están
  contratadas, y en desarrollo el backend usa `PAYMENT_PROVIDER=fake`. Antes de exponer «pagar ahora» hay que
  preguntar al dueño del proyecto cómo quiere el cobro mientras no haya pasarela. Esa decisión está abierta.
- **El contrato de transición de las escrituras** (reservas, checkout, pedidos, carrito) está en
  `docs/MIGRACION_ESCRITURAS_BACKEND.md`. Léelo antes de tocar la compra.

## 5. Cómo comprobar cada pieza

1. **Tipos:** `npx tsc --noEmit -p tsconfig.app.json`.
2. **Pruebas:** `npx vitest run` en la raíz; `npx vitest run test/<archivo>` en `backend/` si tocas el backend.
3. **En el navegador, contra `http://localhost:8080`:** registra una cuenta nueva, haz la acción y mira en la
   pestaña de red que salga la llamada esperada a `/api/v1/…` con respuesta 2xx. Recarga y comprueba que el
   dato sigue ahí: eso distingue lo guardado en el servidor de lo que sólo vive en el navegador.
4. **Con la sesión cerrada** la pantalla debe seguir funcionando o pedir iniciar sesión, nunca romperse.

## 6. Trampas del entorno

- **No levantes un segundo servidor de Vite con la misma caché que el del puerto 8080.** Lo deja respondiendo
  «504 Outdated Request» a todo y el sitio se queda en blanco. Prueba contra el propio `localhost:8080`.
- **La API debe estar corriendo con el código actual.** `npm run dev` recarga sola; un proceso antiguo sin
  recarga responde 400 o 404 a las rutas nuevas y el sitio cae al respaldo sin avisar.
- **Los servicios `weather` y `content` reutilizan archivos de `backend/src`** y sus imágenes Docker copian una
  lista cerrada de archivos. Si tocas `backend/src/plugins/errors.ts` u otro archivo compartido, no le añadas
  importaciones nuevas y comprueba con `npm run weather:build` y `npm run content:build`.
- **`npm run build` falla en esta máquina** con «Access is denied» (bloqueo del sistema). La compilación se
  valida en el CI.
- **Si añades una ruta pública de escritura en el backend**, hay que declararla en `PUBLIC_MUTATIONS` de
  `backend/test/security.test.ts`, y regenerar la documentación con `npm run docs:api`.
- **El control previo al commit rechaza los `any`.** Varias pantallas antiguas los tienen por el cliente
  simulado; al tocarlas hay que tiparlas o dejar una excepción documentada al principio del archivo.

## 7. Archivos con trabajo sin confirmar

Estos archivos de los bloques 4 y 5 tienen cambios locales que aún no están en git. Antes de editarlos,
revisa qué hay con `git diff` para no pisarlo:

- `src/hooks/useGamification.tsx`
- `src/hooks/useCart.tsx`
- `src/modules/tienda/api.ts`
- `src/pages/GamificacionTuristica.tsx`
- `src/pages/ClubRecompensas.tsx`
- `src/components/gamification/LeaderboardTab.tsx`
- `src/components/rewards/PartnerSponsorTab.tsx`

## 8. Qué no entra en estos bloques

- **Crear una reserva** desde la ficha de un servicio (`src/modules/operadores/pages/OperadorServicio.tsx`) y
  el **panel del operador** (`src/modules/operadores/api.ts`): son el resto del bloque 3.
- **Los paneles de administración** que cuentan filas del cliente simulado (`AdminAnalytics.tsx`,
  `AdminDashboard.tsx`, `GamificationStats.tsx`, `AdminUsuarios.tsx`): el backend tiene rutas `/admin/…`
  equivalentes, pero es un trabajo aparte.
- **Las páginas de contenido** que aún leen tablas del cliente simulado (`AguasTermales`, `AvistamientoAves`,
  `HistoriaRD`, `Loteria`, `PreciosCombustible`…): con `VITE_CATALOG_SOURCE=api` varias de esas tablas ya se
  rellenan desde el backend al arrancar; las demás son colecciones de contenido, no de estos bloques.
