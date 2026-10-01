# Inventario de proveedores externos

Mejora 145 del plan maestro. Lista los servicios de terceros que el código del repositorio puede llamar o cargar, qué datos reciben y cómo se activan. Se generó revisando el código el 2026-10-01; al añadir una integración hay que actualizar esta tabla y, si recibe datos personales, la política de privacidad.

| Proveedor | Para qué | Datos que recibe | Se activa con | Estado |
| --- | --- | --- | --- | --- |
| Stripe | Cobros con tarjeta y conciliación por webhook | Importe, moneda, referencia de la reserva o pedido y un token de pago. Nunca número de tarjeta. | `PAYMENT_PROVIDER=stripe` | Implementado |
| Azul | Cobros con tarjeta (República Dominicana) | Importe, referencia y token de DataVault | `PAYMENT_PROVIDER=azul` | Preliminar, sin validar en sandbox |
| CardNET | Cobros con tarjeta (República Dominicana) | Importe, referencia y token de un solo uso | `PAYMENT_PROVIDER=cardnet` | Preliminar, sin validar en sandbox |
| OpenWeather | Clima actual y pronóstico | Coordenadas de ciudades fijas; ningún dato de usuarios | `WEATHER_PROVIDER=openweather` | Implementado |
| open.er-api.com | Tasas de cambio | Ningún dato de usuarios | `FX_PROVIDER=open_er_api` | Implementado |
| Anthropic | Asistente turístico, itinerarios y redacción | El texto que escribe la persona y fichas públicas del catálogo | `AI_PROVIDER=anthropic` | Implementado; apagado por omisión en producción |
| Google (OAuth) | Inicio de sesión con cuenta de Google | Recibimos correo, nombre y foto; Google sabe que la persona entró al portal | `OAUTH_GOOGLE_CLIENT_ID` | Implementado |
| Servidor SMTP | Envío de correo transaccional y campañas | Correo del destinatario y contenido del mensaje | Variables `SMTP_*` | Implementado; el proveedor concreto está por elegir |
| Almacenamiento S3 compatible | Imágenes subidas | Los archivos; sin metadatos EXIF (se eliminan al procesar) | `MEDIA_STORAGE=s3` | Implementado; por omisión se usa disco local |
| Servicio Web Push del navegador | Notificaciones push | Carga cifrada de la notificación | `VAPID_PUBLIC_KEY` | Implementado |
| Google Fonts | Tipografías del sitio | Dirección IP y navegador de quien visita | Siempre (`index.html`) | Implementado; se puede autoalojar para no enviar la IP |
| OpenStreetMap (teselas, vía Leaflet) | Mapas interactivos | Dirección IP y zona del mapa que se mira | Al abrir un mapa | Implementado |

## Lo que no hay

- Sin Sentry ni otro servicio de monitoreo de errores: los fallos se registran en la propia API.
- Sin píxeles de publicidad (Facebook Pixel, Google Ads) ni analítica de terceros: la analítica es propia y respeta `Do-Not-Track` y `Sec-GPC`.
- Sin CDN configurado todavía.
