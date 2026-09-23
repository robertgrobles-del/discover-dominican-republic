# Migración a datos mock (frontend sin backend)

**Fecha:** 2026-09-18
**Motivo:** el stack Docker + MySQL + Express fallaba de forma intermitente e independiente del código del frontend (proceso del backend muriéndose solo, contenedor de MySQL necesitando reinicio, `node_modules` corrompiéndose por el sincronizado de OneDrive) y eso bloqueaba la carga completa del portal una y otra vez. Se decidió desacoplar el frontend de esos tres servicios.

## Qué cambió

- `src/integrations/supabase/client.ts` ya no hace `fetch()` a `http://localhost:5000`. Ahora sirve los datos desde `src/integrations/supabase/mockDb.json`, un snapshot de los datos reales que estaban en MySQL (provincias, destinos, hoteles, restaurantes, bares, experiencias, alojamientos tipo Airbnb, logros, niveles de gamificación, etc.), cargado en memoria.
- `select()`, `eq()`, `order()`, `limit()`, relaciones embebidas (`tabla(columnas)` y `alias:tabla(columnas)`) y `insert/update/delete` se re-implementaron en JavaScript puro sobre ese snapshot.
- Login/registro ya no valida contraseña contra una base real: cualquier combinación de email/password "funciona" y crea o reutiliza un perfil mock. Es intencional — el objetivo es que el portal cargue y sea navegable, no un sistema de auth real.
- Las escrituras (favoritos, reseñas, formularios) se aplican en memoria durante la sesión de esa pestaña. **No persisten** entre recargas de página.
- `server/` (Express + MySQL) y el contenedor Docker `descubrerd-mysql` quedan **apagados y sin usarse** por el frontend. El código sigue en el repo por si se quiere retomar una integración real más adelante.

## Qué NO está cubierto por el mock (limitaciones conocidas)

- Cualquier tabla que no tenía datos de siembra reales (eventos, centros comerciales, artículos/blog, trivia, pasaporte digital, etc.) devuelve una lista vacía — la sección correspondiente se ve vacía pero no debería tronar la página.
- Los RPC de gamificación (`award_user_xp`, `perform_daily_checkin`, `post_comment`, etc.) devuelven una respuesta genérica de éxito sin lógica real detrás — no suman XP de verdad ni persisten nada.
- El panel de administrador (`/admin`) sigue apuntando a las mismas tablas mock; las acciones de escritura "funcionan" pero no persisten.

## Páginas o funciones eliminadas/recortadas

**Ninguna.** Se verificaron una por una las 269 rutas estáticas del sitio (`grep` de todas las `<Route path="...">` en `src/App.tsx` sin parámetros) más una muestra de páginas de detalle dinámicas (`/alojamiento/:slug`, `/restaurante/:slug`, `/destino/:slug`, `/provincia/:slug`, `/airbnb/:slug`, `/experiencia/:slug`, `/bar/:slug`, incluyendo slugs inexistentes para probar el caso "no encontrado") con el backend y MySQL completamente apagados. Todas cargaron sin errores de consola, sin excepciones de JavaScript y sin respuestas HTTP fallidas — no fue necesario borrar ninguna página ni funcionalidad para lograrlo.

## Causa del "se queda en blanco pase lo que pase" (2026-09-18, sesión 2)

Se encontró una carpeta `dist/` con una build de producción generada por `vite-plugin-pwa`, incluyendo un Service Worker real (`sw.js`, `workbox-*.js`) con `navigateFallback` y cacheo agresivo (`CacheFirst`) de JS/CSS/imágenes. Un Service Worker, una vez registrado en el navegador para un origen (`localhost:PUERTO`), intercepta todas las peticiones futuras a ese origen y sirve su propia copia en caché — **ignorando por completo lo que el servidor de desarrollo sirva después**. Esto explica por qué ningún arreglo del lado del servidor llegaba a la pantalla del usuario sin importar cuántas veces se reiniciara todo.

**Acciones tomadas:**
- Se eliminó `vite-plugin-pwa` de `vite.config.ts` y de `package.json` — ya no se genera ni registra ningún Service Worker.
- Se borró la carpeta `dist/` (build obsoleta).
- Se agregó un script en `index.html` que desregistra cualquier Service Worker y borra cualquier caché (`caches.delete`) apenas carga la página, para autolimpiar cualquier registro residual.
- Se limpió el CSP en `index.html`, quitando referencias a Supabase y al backend local (`localhost:5000`) que ya no se usan.

**Importante:** si el navegador del usuario ya tenía el Service Worker viejo activo y atascado, es posible que ni siquiera llegue a cargar el nuevo `index.html` con el script de limpieza, porque el propio Service Worker intercepta la petición de red antes de que llegue al servidor. En ese caso hace falta limpiarlo manualmente una vez por navegador/perfil:
1. Abrir la pestaña afectada → F12 (DevTools) → pestaña **Application** → **Service Workers** (menú izquierdo) → clic en **Unregister** en cualquier entrada para `localhost`.
2. En la misma pestaña **Application** → **Storage** → botón **Clear site data**.
3. Recargar la página (F5).
- Alternativa más rápida: abrir la URL en una ventana de Incógnito — ahí nunca hubo Service Worker registrado, así que confirma si esta es la causa.

## Verificación realizada

- 269 rutas estáticas: 0 errores (con Docker y el backend Express apagados).
- Páginas de detalle con slug real e inventado: 0 errores.
- `npx tsc --noEmit -p tsconfig.app.json`: 0 errores.
- Captura de pantalla con scroll real simulado: portada completa con contenido en todas sus secciones (hero, eventos, restaurantes, bares, alojamientos, destinos, centros comerciales, transporte, testimonios, noticias).
