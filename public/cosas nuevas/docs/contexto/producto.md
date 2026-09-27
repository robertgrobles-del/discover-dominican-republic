# producto.md — Estado real del producto

> Actualizado: 2026-09-26, rama `dev`, commit `8eb7614`.
> Este documento dice **qué existe de verdad y qué no**. Actualízalo cada vez que un módulo cambie de estado.
> Requisitos y prioridades: [`PRD.md`](../../PRD.md) · Arquitectura: [`ARCHITECTURE.md`](../../ARCHITECTURE.md)

---

## Arquitectura hoy

| Pieza | Carpeta | Estado |
|---|---|---|
| **Frontend** (React 18, TypeScript, Vite, Tailwind, shadcn/ui) | `src/` | ~300 rutas. **No compila** desde el commit `5fd8083` (import de `CommentSection` con la ruta equivocada). |
| **Datos del frontend** | `src/integrations/supabase/client.ts` + `mockDb.json` | **Simulados en el navegador.** 131 filas de ejemplo; cualquier login entra; `has_role` siempre es verdadero; nada persiste. |
| **API** (Fastify, PostgreSQL, Zod, JWT) | `backend/` | 33 migraciones y 480 pruebas que pasan. **No conectada al frontend.** |
| **Supabase** | `supabase/` | Migraciones y Edge Functions. La migración de seguridad falla en la secuencia de `dev`. |
| **Express + MySQL** | `server/`, `mysql/` | Apagado. Candidato a eliminar. |
| **Strapi** | `cms/` | Integración revertida. Candidato a eliminar. |

> **Decisión pendiente:** qué backend es el definitivo (ver `decisiones.md`). La recomendación es la API de `backend/`.

---

## Estados

- 🟢 **Real:** funciona con datos reales y persiste.
- 🔵 **Listo en la API:** implementado y probado en `backend/`; falta conectarlo al frontend.
- 🟡 **Solo interfaz:** existe en pantalla con datos de ejemplo.
- 🔴 **Simulado o roto:** finge funcionar o falla.

---

## Módulos

### Para el viajero
| Módulo | Estado | Notas |
|---|---|---|
| Destinos, provincias, playas, ríos, montañas, parques | 🟡 | Datos de ejemplo del mock |
| Hoteles, Airbnb, restaurantes, bares | 🟡 | Fichas enriquecidas (day pass, precios, dietas, "abierto ahora") |
| Búsqueda global, mapa, "cerca de mí" | 🔵 | |
| Registro, login, 2FA, Google | 🔵 / 🔴 | En el sitio, cualquier contraseña entra |
| Favoritos, perfil, notificaciones | 🔵 | |
| Mi viaje, planificador grupal, e-tickets | 🔵 | |
| Reseñas con moderación | 🔵 / 🟡 | El sitio envía `verified: false` pero no guarda |
| Chatbot | 🟢 | Edge Function `chat-turistico` endurecida |
| Itinerarios con IA validados contra el catálogo | 🔵 | |
| Gamificación: XP, monedas, misiones, trivia, ligas, temporadas | 🔵 / 🟡 | Reglas y topes en la API; en el sitio es de ejemplo |
| Pasaporte con verificación GPS y QR | 🔵 | Radio de 300 m, precisión mínima de 150 m, detección de desplazamientos imposibles |
| Tienda oficial | 🔵 / 🔴 | El checkout del sitio pide la tarjeta en un campo propio y marca el pedido como pagado: **no conectar así** |
| Marketplace de vendedores | 🔵 | Pedidos multivendedor y liquidaciones |
| Traducciones (6 idiomas) | 🟡 | Unas 96 claves duplicadas |

### Para empresas
| Módulo | Estado | Notas |
|---|---|---|
| Página de planes (`/para-empresas`, `/planes`) | 🟡 | Promete cosas que no existen (ver `oferta.md`) |
| "Reclama tu ficha" | 🔴 | Simula el envío con `setTimeout` |
| Formulario de anunciantes (`/partners`) | 🔴 | Simula el envío con `setTimeout` |
| Alta de establecimientos | 🔵 | `POST /establishments/register`, queda pendiente de revisión |
| Leads de marketing | 🔵 | Tabla `marketing_leads` |
| Panel de empresa (`/panel-empresa`) | 🟡 | KPI con datos de ejemplo |
| Motor de reservas de operadores | 🔵 | Disponibilidad, depósitos, extras, temporadas, iCal, equipo y roles |
| Pagos con Stripe | 🔵 | Webhook firmado e idempotente |
| Programa de embajadores y afiliados | 🔵 | |
| Servidor de anuncios | 🔵 / 🟡 | |
| Verificación MITUR (SIGTUR) | 🔴 | No hay integración |
| Facturación con NCF | 🔴 | No existe |

### Administración
| Módulo | Estado |
|---|---|
| CMS con flujo editorial y revisiones | 🔵 |
| Moderación, auditoría, analítica con consentimiento | 🔵 |
| Panel `/admin` | 🟡 (en el mock cualquier usuario es admin) |

---

## Bloqueantes para publicar `dev`

1. Arreglar el build: ruta del import de `CommentSection` y variables `date` y `bottleService` en `BarVipBookingCard`.
2. Traer a `dev` los 17 commits de `main` que faltan (seguridad de julio, pruebas RLS, workflow del sitemap).
3. Corregir la migración de seguridad y cerrar las 12 políticas con `USING (true)`.
4. Decidir el backend y conectar primero login, leads y alta de establecimientos.
5. Reemplazar el checkout por Stripe Elements contra la API.
6. Agregar CI del frontend (tipos, lint, build).

---

## Cómo actualizar este documento

Cuando un módulo cambie de estado, cambia su icono, agrega una nota breve y registra la decisión en `decisiones.md` si la hubo.
