# Estado del proyecto

Fotografía técnica al 2026-10-04, rama `feature/nueva-arquitectura-optimizada`. El detalle por mejora está en [`PLAN_EJECUCION_ARQUITECTURA_150.md`](PLAN_EJECUCION_ARQUITECTURA_150.md); este documento resume qué funciona, qué se comprobó y qué falta.

## En una mirada

| | |
| :--- | :--- |
| Plan de 150 mejoras | 24 implementadas · 113 parciales · 6 pendientes · 6 requieren medición · 1 aplazada |
| Plan de accesos por perfil | 95 de 100 puntos |
| CI | En verde en `frontend` y `backend` (commit `adaf24c`) |
| Backend | 822 pruebas; 74 migraciones; 0 importaciones entre dominios; 41 tablas con lecturas cruzadas; 0 con varios escritores |
| Frontend | Sesión real opcional (`VITE_AUTH_SOURCE=api`); el catálogo y el panel del operador siguen con datos simulados |
| Despliegue | Configurado para VPS; validado sólo en local |

## Qué se comprobó y cómo

| Qué | Cómo se comprobó | Qué no cubre |
| :--- | :--- | :--- |
| Backend | Suite completa en CI sobre una base limpia | Carga real y datos de producción |
| Imágenes Docker (API, `content`, `weather`) | Construidas, escaneadas sin hallazgos altos ni críticos y arrancadas sin root con sistema de archivos de sólo lectura | — |
| Servicios `content` y `weather` | Con la API enrutada a ambos, 12 rutas públicas devolvieron lo mismo que leyendo la base directa | Corte de datos de `weather`; sincronización continua de `content` |
| Pantallas nuevas | Recorrido en navegador (Playwright) con sesión real: administración, panel del operador y Prensa, incluidas las acciones de punta a punta | Sólo las pantallas de esta etapa; no hay pruebas e2e automáticas de ellas en CI |
| Despliegue en VPS | Sintaxis de Compose y Caddy, y la imagen de producción arrancando en local | Proxy con TLS, `deploy.sh`, `backup.sh` y publicación del frontend en un servidor real |

## Cómo levantarlo en local con Docker

```bash
cd backend
docker compose up -d postgres                       # base principal en localhost:5433
DATABASE_URL=postgres://postgres:postgres@localhost:5433/descubre_rd npm run db:migrate
DATABASE_URL=postgres://postgres:postgres@localhost:5433/descubre_rd npm run db:seed
DATABASE_URL=postgres://postgres:postgres@localhost:5433/descubre_rd npm run dev   # API en :3000
```

El frontend con sesión real necesita llamar a la API por su mismo origen (`/api`): la política de seguridad de contenido de `index.html` sólo permite conexiones al propio dominio. Hoy `vite.config.ts` no define ese proxy, así que en desarrollo hay que añadirlo (`server.proxy['/api'] → http://localhost:3000`) y arrancar con `VITE_AUTH_SOURCE=api`, sin `VITE_API_URL`.

Los servicios `content` y `weather` son opcionales; sus pasos están en el README y en [`ARQUITECTURA_MICROSERVICIOS.md`](ARQUITECTURA_MICROSERVICIOS.md).

## Lo construido en esta etapa

- **Operadores:** clics de contacto anónimos y resumen semanal por correo, reporte trimestral de demanda, webhooks salientes firmados, solicitud del Sello Verificado con contrato, y campañas con puja por posiciones patrocinadas.
- **Administración:** panel de indicadores y finanzas con rebote, índice de satisfacción, mapa de calor, conciliación de cobros con comprobantes NCF y liquidaciones, subasta de posiciones y licencias de imágenes.
- **Sitio:** anuncio nativo en el directorio de operadores y banco de imágenes licenciables en Prensa.
- **Creadores:** estancias en hoteles y retos y premios patrocinados (backend; sus pantallas no están confirmadas en git).
- **Plataforma:** despliegue para VPS, auditoría de contraste en CI, respuesta háptica y endurecimiento de las imágenes.

## Decisiones que siguen abiertas

Las reglas siguientes son supuestos documentados en el código y deben validarse:

- **Subasta de posiciones:** semanas completas, primer precio, empate por orden de llegada, cobro manual.
- **Licencias de imágenes:** dos tipos (editorial y comercial), pago por fuera, vigencia de un año.
- **Índice de satisfacción:** las reseñas de visitantes con sello de Pasaporte pesan el doble.
- **Contrato de términos comerciales:** el texto es un borrador sin revisión legal.
- **Alerta de rebote:** 70 % con al menos 50 sesiones.
- **Campañas con creadores:** reglas de la tabla del plan de accesos.

## Lo que falta

- **Sin proveedor o cuenta:** monitoreo de errores (Sentry), Facebook Pixel, notificaciones push por cercanía, pasarelas de pago locales y un servidor SMTP (sin él la API no arranca en producción).
- **Sin alojamiento:** VPS y dominio, staging, y la validación real del despliegue.
- **Trabajo grande:** migrar el catálogo y las escrituras del frontend a la API (`VITE_DATA_SOURCE=api`), renderizado para SEO y modo sin conexión (la PWA sigue aplazada).
- **Manual:** pruebas en teléfonos reales.
- **Accesibilidad:** 12 de 75 pares de color quedan por debajo de AA; corregirlos implica ajustar colores de marca.
