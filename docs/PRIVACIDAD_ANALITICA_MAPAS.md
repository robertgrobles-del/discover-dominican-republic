# Privacidad, analitica y mapas

## Analitica opcional

- La analitica requiere la eleccion `accepted`; la eleccion `essential_only` elimina los identificadores antiguos del navegador y bloquea futuras mediciones.
- `DNT: 1`, `Sec-GPC: 1`, Global Privacy Control o Do Not Track del navegador prevalecen sobre un consentimiento guardado.
- Los eventos de pagina del frontend se envian a `POST /api/v1/analytics/events`. El servidor quita campos sensibles, acota propiedades, omite rutas privadas, no guarda IP y no conserva query strings.
- El identificador de sesion es aleatorio, temporal en memoria y no esta ligado a una cuenta. Ya no se usa el identificador persistente de visitante ni se guardan UTMs, referrers completos o perfiles de interes.
- Las acciones de gamificacion que escriben a `analytics_events` solo lo hacen con analitica permitida; no incluyen `user_id` y sus metadatos se limpian antes de insertarse.
- Eventos crudos se agregan y eliminan al cumplir 13 meses (`analytics.rollup`). La tabla `analytics_daily` conserva estadisticas agregadas.
- Retirar consentimiento detiene nuevas mediciones y limpia preferencias/identificadores locales. Los eventos anonimos ya recibidos siguen la ventana de retencion; no hay borrado inmediato por sesion.

## Proveedores externos observados

| Proveedor | Uso | Cuando se contacta | Datos tecnicos expuestos |
| --- | --- | --- | --- |
| Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`) | Tipografias | Carga de la pagina, sin depender del consentimiento de analitica | IP, agente de usuario y solicitud de fuentes |
| Unsplash (`images.unsplash.com`) | Fotos remotas | Al cargar imagenes de contenido | IP, agente de usuario y URL solicitada |
| OpenStreetMap tiles | Mosaicos cartograficos | Al acercar el mapa interactivo a la pantalla o abrir vistas con mapas | IP; se elimina el encabezado `Referer` en las capas auditadas |
| Google Maps | Enlace de indicaciones/busqueda | Solo cuando la persona activa el enlace | IP y la consulta de ubicacion enviada a Google |

Google Fonts y Unsplash siguen siendo solicitudes externas inmediatas por razones visuales y de contenido. Para eliminarlas se necesita autoalojar fuentes e imagenes o aprobar otro proveedor; este cambio no se hizo a ciegas porque altera los assets y la presentacion del portal.

## Mapas y ubicacion

- Leaflet usa solo la plantilla fija `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`; no se integra un SDK de Google Maps ni se expone una clave de mapas.
- Los mosaicos incluyen atribucion, `referrerPolicy="no-referrer"` y se solicitan cuando el mapa se acerca al viewport.
- Las vistas que necesitan proximidad del dispositivo solo solicitan geolocalizacion tras una accion explicita. Si el permiso falla, no se sustituye por coordenadas ficticias.
- El mapa interactivo informa antes de cargar que OpenStreetMap recibe la IP de conexion. No solicita la ubicacion del dispositivo.

## Revisiones pendientes de despliegue

- Confirmar en produccion que `PUBLIC_APP_URL` corresponde al host canonico y que CSP permite solo los dominios de mapa/imagen realmente servidos.
- Evaluar self-hosting de Google Fonts y de imagenes remotas para reducir solicitudes de terceros.
- La eleccion de privacidad es editable desde el enlace **Configuracion de privacidad** del pie de pagina.
