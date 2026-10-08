# Estado del proyecto

Fotografía técnica al 2026-10-08, rama `feature/nueva-arquitectura-optimizada`. Resume qué funciona, qué se
comprobó y qué falta. El índice de toda la documentación está en [`README.md`](README.md).

## En una mirada

| | |
| :--- | :--- |
| Backend | 1 031 operaciones en 47 grupos; 85 migraciones; `tsc` sin errores; suite completa 838 de 841 y prueba de seguridad 26 de 26 (2026-10-08) |
| Frontend | 316 rutas, 258 páginas; `tsc` sin errores (2026-10-07) |
| Sesión | Real contra el backend con `VITE_AUTH_SOURCE=api` |
| Catálogo público | Se lee del backend con `VITE_CATALOG_SOURCE=api` |
| Escrituras del sitio | En migración: `VITE_DATA_SOURCE=api` sigue bloqueado hasta cerrar las tareas de [`TAREAS_CONEXION_BACKEND_PENDIENTES.md`](TAREAS_CONEXION_BACKEND_PENDIENTES.md) |
| Panel admin | CRUD del catálogo, usuarios, dashboard, analítica, operadores, auditoría, IA, envíos y reservas ya hablan con la API |
| Despliegue | Configurado para VPS; validado sólo en local |
| Plan de 150 mejoras (al 2026-10-04) | 24 implementadas · 113 parciales · 6 pendientes · 6 requieren medición · 1 aplazada |
| Plan de accesos por perfil (al 2026-10-04) | 95 de 100 puntos |

La suite completa del backend (822 pruebas al 2026-10-04) y el CI no se volvieron a correr en esta fotografía.

## Cómo levantarlo en local

```bash
docker compose -f backend/docker-compose.yml up -d   # Postgres :5433, Redis, PgBouncer, Mailpit
cd backend
npm run db:migrate                                   # aplica las migraciones pendientes
npm run db:seed                                      # catálogo + admin de desarrollo
npm run dev                                          # API en :3000
cd .. && npm run dev                                 # sitio en :8080 (reenvía /api a :3000)
```

- Administrador de desarrollo: `admin@descubre.local` / `Admin-Descubre-2026!` (sólo fuera de producción).
- `.env` del sitio: `VITE_AUTH_SOURCE=api`, `VITE_DATA_SOURCE=mock`, `VITE_CATALOG_SOURCE=api`.
- Las claves JWT son efímeras en desarrollo: al reiniciar la API hay que volver a iniciar sesión.
- Si `db:migrate` dice que una migración «cambió», suele ser el fin de línea (CRLF): el archivo debe estar en LF.
- Tras añadir columnas al catálogo: `npm run db:gen-manifest`, o la API no arranca.
- Los servicios `content` y `weather` son opcionales: ver [`ARQUITECTURA_MICROSERVICIOS.md`](ARQUITECTURA_MICROSERVICIOS.md).

## Qué se comprobó y cómo

| Qué | Cómo se comprobó | Qué no cubre |
| :--- | :--- | :--- |
| Backend | Suite completa en CI sobre una base limpia (2026-10-04) | Carga real y datos de producción |
| Imágenes Docker (API, `content`, `weather`) | Construidas, escaneadas y arrancadas sin root con sistema de archivos de sólo lectura | — |
| Panel admin conectado | Contratos contrastados con la API local y llamadas directas a cada ruta (2026-10-07) | Recorrido en navegador de cada pantalla |
| Carrito | Invitado con `x-cart-token`, variantes y fusión al iniciar sesión, contra la API local | Flujo completo de compra |
| Despliegue en VPS | Sintaxis de Compose y Caddy, y la imagen de producción arrancando en local | TLS, `deploy.sh`, `backup.sh` y publicación en un servidor real |

## Lo construido en la última etapa (octubre de 2026)

- **Admin contra el backend:** CRUD genérico con traducciones, consola de usuarios (roles, suspensión, XP),
  dashboard, analítica, NPS, operadores, rutas gamificadas, importaciones, auditoría, generador de IA, envíos de
  premios y listado de todas las reservas (`GET /admin/bookings`).
- **Panel admin:** navegación por barra lateral con buscador y grupos; acceso sólo según capacidades.
- **Panel de operadores:** menú por grupos, cajón lateral en móvil y aviso de mensajes sin leer.
- **Sitio:** actividades por categoría en cada destino (`/destino/:slug/actividades`), página de avistamiento de
  ballenas, `/mi-viaje` exige sesión y redirección por rol tras iniciar sesión.
- **Publicaciones unificadas:** `articles` cubre magazine, noticias, prensa y blogs (migración 0081).

## Lo que falta

- **Conexión al backend:** gamificación, social, tienda y recompensas del sitio público, y las rutas B2–B9. Ver
  [`TAREAS_CONEXION_BACKEND_PENDIENTES.md`](TAREAS_CONEXION_BACKEND_PENDIENTES.md).
- **Decisiones del dueño:** pasarela de cobro, entradas gratuitas a eventos y destino del blog.
- **Sin proveedor o cuenta:** monitoreo de errores, notificaciones push, pasarelas locales (Cardnet/Azul) y SMTP.
- **Sin alojamiento:** VPS y dominio definitivo, staging y despliegue en un servidor real.
- **Manual:** pruebas en dispositivos móviles reales con operadores locales.
