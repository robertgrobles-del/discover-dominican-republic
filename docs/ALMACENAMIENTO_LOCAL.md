# Inventario y política de almacenamiento en navegador

El acceso al almacenamiento está repartido entre el cliente simulado y componentes de producto. `npm run audit:local-storage` lista cada acceso directo con archivo y línea para que la auditoría se actualice automáticamente en CI. Un acceso descubierto no queda aprobado automáticamente: antes de migrarlo a una abstracción debe tener finalidad y retención asignadas.

| Familia / claves observadas | Finalidad | Datos | Retención propuesta | Borrado |
|---|---|---|---|---|
| `dr_privacy_consent` | Recordar preferencia de privacidad | Preferencia | Hasta que el usuario la cambie o borre datos del sitio | Acción de privacidad / borrar datos del sitio |
| `dr_visitor_id`, `dr_utm_attribution`, `dr_traveler_profile`, `dr_session_id` | Analítica y atribución, sólo con consentimiento | Identificador seudónimo, campaña, intereses | 30 días como máximo; sesión hasta cerrar pestaña | Retirar consentimiento (`clearAnalyticsData`) |
| `theme`, `app-locale`, `gamificacion_tour_completed`, `amber_story_*`, `push_notifications_enabled` | Preferencias y progreso de onboarding local | Preferencias no sensibles | 1 año o hasta cambio explícito | Ajustes / borrar datos del sitio |
| `descubre_rd_*`, `dr_my_tickets`, `dr_event_registrations`, `dr_organizer_events`, `dr_seller_escrow_orders`, `dr_sports_*`, `mockdb:v1:*` | Persistencia temporal de prototipo/demo | Reservas, registros, contenido simulado y catálogo editable | No usar para transacciones reales; purga de demo a 30 días | Reinicio de demo o migración al backend |
| `sorteo_*`, `contest_*`, `ugc_*`, `user_badges_*`, `user_checkins_*`, `user_timeline_*`, `minted_nfts_*`, `nft_txs_*`, `ambassador_*`, `wallet_*`, `affiliate_ref`, `rdpass_balance_usd` | Gamificación, atribución y prototipos de cartera | Actividad y datos vinculados a usuario | 30 días en demo; no guardar secretos, claves privadas, códigos de recuperación ni datos de pago | Logout/cambio de cuenta o purga de demo |
| `rl_*` | Limitador UX local | Identificador derivado (p. ej. correo) y contadores | Hasta que venza la ventana de bloqueo, máximo 24 h | Al completar acción o expirar |
| `exit-intent`, `topbar` y claves promocionales dinámicas | Configuración/estado de widgets | Preferencias y configuración cacheada | 7 días; volver a pedir al CMS después | Expiración o actualización de campaña |
| `dr_favorites_v1`, `descubre_rd_saved_offline_itinerary`, claves dinámicas `ambassador_${id}`, `wallet_address_${id}`, `wallet_connected_${id}` | Favoritos, itinerario y estado demo por usuario | Preferencias/estado de producto | 30 días; nunca incluir credenciales reales | Logout, cambio de usuario o purga |

## Reglas de seguridad y ciclo de vida

- No guardar access/refresh tokens, secretos, contraseñas, CVV, códigos 2FA ni datos de tarjeta en `localStorage` o `sessionStorage`.
- Tratar valores locales como entrada no confiable: validar al parsear JSON y no usarlos como autorización ni fuente de verdad para puntos, premios, compras o reservas.
- Preferir `sessionStorage` para estado transitorio por pestaña y estado en memoria para datos efímeros. Persistencia de negocio requiere API autenticada.
- Al cambiar de cuenta, borrar las claves con sufijo de usuario anterior; al cerrar sesión, purgar los datos de demostración que no sean preferencias anónimas.
- No usar `localStorage.clear()`: eliminar sólo las claves propiedad del portal para no borrar datos de otras funciones del mismo origen.

## Pendiente de completar

Este es un inventario por familias y política objetivo, no una garantía de expiración ya aplicada en cada escritor. La auditoría automática muestra las claves literales/dinámicas y localizaciones exactas; migrar progresivamente los accesos a un helper con TTL y pruebas, y ajustar el inventario cuando se retiren los mocks. Hasta entonces el punto se considera parcial.
