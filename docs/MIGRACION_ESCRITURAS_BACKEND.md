# Contrato de transición: escrituras de reservas, checkout y pedidos

**Fecha:** 2026-09-29
**Alcance:** plan A10 #92. Migrar las escrituras del frontend (hoy contra el mock en memoria) a la API
Fastify autoritativa de `backend/`. Este documento es el contrato de transición: qué se escribe hoy,
qué endpoint lo reemplaza, y qué falta para poder conectar cada flujo sin reimplementar nada.

**Regla de cierre de la migración:** mientras el mock siga siendo la fuente de escritura de cualquiera de
estos flujos, el build de producción se mantiene con `VITE_DATA_SOURCE=mock`. Un build `api` falla de
forma cerrada (`src/integrations/supabase/client.ts`) hasta que todos los flujos estén migrados
(plan A3 #21 y A10 #91).

## Reglas generales del contrato

1. El servidor recalcula precios, descuenta stock y decide el estado `pagado`/`pending`; el navegador
   nunca envía ni fija esos valores (AGENTS.md).
2. Todo pago va por la pasarela con `payment_method_token` (Stripe Elements). Queda prohibido capturar
   número de tarjeta, vencimiento o CVC en campos propios del formulario.
3. `POST /bookings` y `POST /orders` exigen el encabezado `Idempotency-Key` (8–100 caracteres, único por
   intento de compra). El frontend debe generarlo con `crypto.randomUUID()` por intento.
4. Ningún flujo puede simular éxito con `setTimeout`. La confirmación se basa en la respuesta de la API
   (o en el sondeo del pedido/reserva hasta que la pasarela/el webhook confirme).
5. Con sesión real se envía `Authorization: Bearer <token>` (hoy `fastifyClient.ts` no tiene transporte de
   token: la auth del mock no produce JWT válido del backend). Invitado = petición sin token; la API lo
   resuelve con `optionalUser` y devuelve `access_token` para dar seguimiento.
6. Las entradas ya se validan con Zod en el servidor; el frontend solo debe enviar el contrato y mostrar
   los errores normalizados.

## Flujos y mapeo

| Flujo | Escritura actual (mock) | Endpoint destino | Existe | Bloqueadores |
| --- | --- | --- | --- | --- |
| Reserva de experiencia | `CheckoutModal.tsx` inserta `reservations` y llama `rpc track_ambassador_sale` | `POST /bookings/quote` + `POST /bookings` | Sí (`operators/routes.ts`) | Tarjeta propia (PCI), `setTimeout`, sin token de pasarela, sin JWT real, mapeo de catálogo |
| Pedido de tienda | `TiendaCheckout` → `createOrder()` inserta `store_orders` y descuenta stock en el cliente | `POST /checkout/quote` + `POST /orders` | Sí (`store/routes.ts`) | Igual que arriba + carrito en el cliente |
| Carrito | `useCart` inserta/actualiza/borra `cart_items` | `POST /cart/items`, `PATCH|DELETE /cart/items/:id`, `DELETE /cart`, `POST /cart/merge` | Sí (`store/routes.ts`) | Sin sesión real; el actor del carrito lo resuelve la API |
| Favoritos | `useFavorites` inserta/borra `favorites` | `PUT|DELETE /me/favorites/:entity_type/:entity_id` | Sí (`me/routes.ts`) | Requiere auth real |
| Ticket de evento gratis | `FreeTicketModal` escribe `dr_my_tickets` en localStorage (no pasa por el mock) | Sin endpoint equivalente | No | Decisión de producto: o se crea endpoint o se declara demo |

### 1. Reserva de experiencia — `src/components/CheckoutModal.tsx`

**Hoy:** tras un `await new Promise(setTimeout, 2000)` inserta una fila en `reservations` (línea ~157) con
`status: "pending"` fijado por el cliente, `total_price` calculado en el cliente, y `notes` que incrustan
donación, seguro y comisión; luego llama `rpc("track_ambassador_sale")` si hay `affiliate_ref`.

**Destino:**
1. `POST /bookings/quote` con `bookingRequest` (línea 48 de `backend/src/modules/operators/routes.ts`):
   `listing_id`, `date`, `adults`, `children`, `infants`, `extras?`, `promo_code?`. Devuelve el precio final
   y los motivos por los que no se puede reservar.
2. `POST /bookings` con `{ request, contact: {name,email,phone?}, notes?, payment_mode, payment_method_token?, locale? }`
   + `Idempotency-Key`. `payment_mode`: `pay_now` | `deposit` | `pay_later`. Responde 201 con la reserva
   (y `access_token` de invitado).
3. Postventa ya existe en la API: `POST /bookings/:id/cancel`, `POST /bookings/:id/change-date`,
   `POST /bookings/:id/pay-balance`, `POST /bookings/:id/messages`, `POST /bookings/:id/review`.

**Faltantes del frontend para conectar:**
- Sustituir los campos de tarjeta propios (`cardNumber`, vencimiento, CVC) por Stripe Elements y enviar
  `payment_method_token`. Es un bloqueador duro: mientras existan esos campos no se conecta la API.
- Eliminar el `setTimeout` de "autorización"; el estado se lee de la respuesta real.
- Donación y seguro hoy son texto en `notes`: deben modelarse como `extras`/cargos del servidor o salir
  del Flujo (el servidor los ignora, no se pueden prometer).
- `item.id`/`item.type` del catálogo mock no equivalen a `listing_id` del backend: requiere tabla de
  correspondencia o migrar el catálogo público a la API (fuera del alcance de A10).
- `affiliate_ref` se envía como `ref_code` dentro del body (el servidor lo resuelve); no hay RPC pública
  equivalente a `track_ambassador_sale`.

### 2. Pedido de tienda — `src/modules/tienda/pages/TiendaCheckout.tsx` → `createOrder()` (`src/modules/tienda/api.ts:103`)

**Hoy:** genera id `ord-…` en el cliente, inserta en `store_orders`, fija `status: "paid"` o `"pending"` según
el método de pago elegido en el navegador, calcula totales en DOP con `DOP_PER_USD = 59.8` y descuenta stock
del cliente.

**Destino:** `POST /checkout/quote` (subtotal, cupón, envío, ITBIS, total DOP/USD) y
`POST /orders` con `{ contact, shipping, coupon_code?, ref_code?, payment_method_token, locale? }` +
`Idempotency-Key`; la API responde 201 `{ order, access_token }` o 200 si fue reintento idempotente.
Seguimiento: `GET /orders/:id?token=…` (invitado) o `GET /me/orders` (autenticado); cancelación y
devolución ya existen (`POST /orders/:id/cancel`, `POST /orders/:id/return-request`).

**Faltantes del frontend para conectar:**
- Stripe Elements + `payment_method_token` (el pago hoy no toca ninguna pasarela).
- Dejar de decidir `status` y stock en el cliente: se muestran los valores que devuelva la API.
- El envío gratis/no gratis (RD$ 2 500 / RD$ 250) debe venir de `/checkout/quote`, no de constantes locales.
- El carrito debe vivir en el servidor (ver flujo 3) antes de crear el pedido; `POST /cart/merge` existe
  para fusionar el carrito de invitado al iniciar sesión.
- Guardar el `access_token` de invitado para poder mostrar `/orders/:id`.

### 3. Carrito — `src/hooks/useCart.tsx`

**Hoy:** CRUD directo sobre `cart_items` del mock (insert/update/delete) y limpieza por usuario. Además
`add_to_cart` emite el evento de analítica añadido en A10 #99.

**Destino:** `POST /cart/items`, `PATCH /cart/items/:id`, `DELETE /cart/items/:id`, `DELETE /cart`,
`POST /cart/merge` (fusiona carrito de invitado tras login) y `PUT /cart/coupon`. La API ya valida stock,
cupones y precios vigentes al cotizar; el frontend solo refleja `GET /cart`.

**Faltantes:** transporte de token (flujo general punto 5) y reemplazar el estado local del carrito por la
respuesta del servidor. Hasta entonces no se puede activar `checkout_enabled` confiando en el carrito.

### 4. Favoritos — `src/hooks/useFavorites.tsx`

**Hoy:** insert/delete sobre `favorites` del mock. **Destino:** `PUT /me/favorites/:entity_type/:entity_id`
y `DELETE` equivalente (requiere `Authorization`). Bloqueado por la auth real; no hay escritura anónima de
favoritos por diseño.

### 5. Ticket de evento gratis — `src/components/events/FreeTicketModal.tsx`

**Hoy:** guarda el ticket en `localStorage.dr_my_tickets` y las inscripciones en
`localStorage.dr_event_registrations`. No pasa por el mock ni por la API: es una demo local.

**Decisión pendiente (producto):** no existe endpoint de entradas gratuitas/inscripciones a eventos en la
API. Opciones: (a) crear endpoints reales con aforo e idempotencia, o (b) declarar la función explícitamente
como demo y no prometer validez fuera del navegador. Mientras no se decida, el flujo no puede considerarse
migrado ni autoritativo.

## Cómo se verifica cada flujo migrado (definición de hecho)

- `npx vitest run` con pruebas del flujo contra un backend de pruebas (la API ya está probada del lado
  backend; falta el lado frontend).
- El precio mostrado coincide con `/checkout/quote` o `/bookings/quote`; `status` y stock provienen del
  servidor; reintentar la misma compra con la misma `Idempotency-Key` no duplica pedidos.
- No queda ningún `setTimeout` de cobro ni campo propio de tarjeta en el flujo.
- `npm run check:data-source` sigue pasando y, al terminar todos los flujos, el valor por defecto de
  `VITE_DATA_SOURCE` puede cambiarse a `api` sin romper el portal.

## Referencias

- `AGENTS.md` (reglas de negocio y seguridad) y `MOCK_MIGRATION_NOTES.md` (por qué existe el mock).
- `backend/src/modules/operators/routes.ts` (reservas), `backend/src/modules/store/routes.ts` (tienda y carrito),
  `backend/src/modules/me/routes.ts` (favoritos), `docs/BACKEND_API_IMPLEMENTADO.md`.
- Analítica de abandono por flujo: A10 #99 (`checkout_start`/`purchase`/`booking_start`/`booking_complete`).
