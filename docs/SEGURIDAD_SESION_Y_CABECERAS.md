# Sesión y cabeceras de seguridad

## Estado comprobado (actualizado 2026-10-07)

- Con `VITE_AUTH_SOURCE=api` el frontend autentica contra el backend (`/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`): el token de acceso vive sólo en memoria (`src/lib/accessToken.ts`) y se renueva con la cookie de refresco. Sin esa variable sigue el adaptador simulado local, cuya sesión desaparece al recargar. Las claves heredadas `sb-token` y `sb-user` se eliminan al iniciar el adaptador.
- El mock no es un control de acceso: cualquier usuario puede iniciar sesión y las comprobaciones de roles del mock son permisivas. No se deben exponer datos reales ni usarlo como autorización de producción.
- El backend soporta refresh token en cookie `HttpOnly`, `Secure` en producción y `SameSite=Lax`, con la cabecera `X-Refresh-Transport: cookie` para forzar preflight en solicitudes cross-origin. El access token se devuelve en JSON y es visible a JavaScript; el frontend lo guarda sólo en memoria, nunca en `localStorage`.
- La API define CSP de API (`default-src 'none'; frame-ancestors 'none'`) cuando Swagger está desactivado. La página HTML tiene una CSP meta antigua/incompleta: no es un sustituto de cabeceras HTTP y no se considera validada para las integraciones actuales.
- La API envía `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff` y `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`. Geolocalización queda permitida sólo al mismo origen por el reto fotográfico.

## Riesgos y mitigaciones

### XSS

Un XSS ejecutado en el origen puede leer datos accesibles desde JavaScript y realizar acciones como el usuario, incluso si el refresh token es HttpOnly. Mantener dependencias actualizadas, escapar/sanitizar contenido no confiable, evitar HTML crudo, restringir CSP mediante cabecera HTTP y no almacenar access tokens en `localStorage` reduce el impacto. El access token del flujo real debe mantenerse sólo en memoria mientras el frontend siga usando Bearer.

### CSRF

Las cookies se envían automáticamente. `SameSite=Lax`, CORS con allow-list y la cabecera personalizada requerida para refrescar reducen CSRF en el endpoint de refresh. Para operaciones autenticadas por cookie, verificar `Origin`/`Sec-Fetch-Site` o usar token CSRF y no confiar en CORS como único control. La autenticación Bearer no añade el mismo riesgo CSRF, pero aumenta el impacto de XSS.

## Pendiente antes de producción

1. ~~Integrar el frontend con el flujo de sesión en modo cookie~~ (hecho). Falta eliminar el mock permisivo antes de activar datos reales (`VITE_DATA_SOURCE=api`).
2. Identificar el hosting del frontend y configurar allí cabeceras HTTP de staging, primero con `Content-Security-Policy-Report-Only`. Instrumentar reportes, probar rutas principales y terceros (fuentes, imágenes/CMS, mapas, API, Strapi), y luego imponer CSP en producción. No ampliar con comodines sin justificar cada origen. La política debe evitar `'unsafe-eval'`; eliminar scripts inline o usar nonce/hash generado por el servidor.
3. Verificar las cuatro cabeceras con una petición HTTP real al dominio de staging y al de producción; el middleware Fastify sólo demuestra las cabeceras de la API, no las respuestas HTML del hosting.
