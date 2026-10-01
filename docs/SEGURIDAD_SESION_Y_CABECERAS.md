# Sesión y cabeceras de seguridad

## Estado comprobado

- El cliente Supabase actual está sustituido por un adaptador simulado local; no autentica contra el backend. La sesión simulada vive sólo en memoria y desaparece al recargar. Las claves heredadas `sb-token` y `sb-user` se eliminan al iniciar el adaptador.
- El mock no es un control de acceso: cualquier usuario puede iniciar sesión y las comprobaciones de roles del mock son permisivas. No se deben exponer datos reales ni usarlo como autorización de producción.
- El backend soporta refresh token en cookie `HttpOnly`, `Secure` en producción y `SameSite=Lax`, con la cabecera `X-Refresh-Transport: cookie` para forzar preflight en solicitudes cross-origin. El access token aún se devuelve en JSON; por tanto es visible a JavaScript. El frontend todavía no consume este flujo.
- La API define CSP de API (`default-src 'none'; frame-ancestors 'none'`) cuando Swagger está desactivado. La página HTML tiene una CSP meta antigua/incompleta: no es un sustituto de cabeceras HTTP y no se considera validada para las integraciones actuales.
- La API envía `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff` y `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`. Geolocalización queda permitida sólo al mismo origen por el reto fotográfico.

## Riesgos y mitigaciones

### XSS

Un XSS ejecutado en el origen puede leer datos accesibles desde JavaScript y realizar acciones como el usuario, incluso si el refresh token es HttpOnly. Mantener dependencias actualizadas, escapar/sanitizar contenido no confiable, evitar HTML crudo, restringir CSP mediante cabecera HTTP y no almacenar access tokens en `localStorage` reduce el impacto. El access token del flujo real debe mantenerse sólo en memoria mientras el frontend siga usando Bearer.

### CSRF

Las cookies se envían automáticamente. `SameSite=Lax`, CORS con allow-list y la cabecera personalizada requerida para refrescar reducen CSRF en el endpoint de refresh. Para operaciones autenticadas por cookie, verificar `Origin`/`Sec-Fetch-Site` o usar token CSRF y no confiar en CORS como único control. La autenticación Bearer no añade el mismo riesgo CSRF, pero aumenta el impacto de XSS.

## Pendiente antes de producción

1. Integrar el frontend con `/auth/login`, `/auth/refresh`, `/auth/logout` y `/auth/me` en modo cookie; guardar el access token sólo en memoria. Completar flujo 2FA/registro/reset y gestionar expiración/rotación. Eliminar el mock permisivo antes de activar datos reales.
2. Identificar el hosting del frontend y configurar allí cabeceras HTTP de staging, primero con `Content-Security-Policy-Report-Only`. Instrumentar reportes, probar rutas principales y terceros (fuentes, imágenes/CMS, mapas, API, Strapi), y luego imponer CSP en producción. No ampliar con comodines sin justificar cada origen. La política debe evitar `'unsafe-eval'`; eliminar scripts inline o usar nonce/hash generado por el servidor.
3. Verificar las cuatro cabeceras con una petición HTTP real al dominio de staging y al de producción; el middleware Fastify sólo demuestra las cabeceras de la API, no las respuestas HTML del hosting.
