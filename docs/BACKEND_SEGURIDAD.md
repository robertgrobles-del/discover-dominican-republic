# Backend — controles de seguridad, hallazgos y riesgos residuales

Resultado de la revisión del backend completo (antes de salida a producción). Los controles marcados con **[prueba]** están verificados por pruebas automáticas que corren en cada cambio (`backend/test/security.test.ts` y las de cada módulo).

## 1. Controles vigentes

**Autenticación y sesiones**
- Contraseñas con argon2id y política de complejidad; bloqueo de cuenta por intentos fallidos; respuestas idénticas exista o no la cuenta (sin enumeración) y comparación a tiempo constante.
- JWT RS256 de 15 min con rotación de claves (`JWT_PREVIOUS_PUBLIC_KEYS`); refresco con rotación y **detección de reutilización** (si se repite un token viejo se cierra toda la familia); modo cookie HttpOnly/SameSite o cuerpo para móviles.
- Un token de acceso **deja de servir en cuanto su sesión se revoca** (cierre de sesión, suspensión, cambio de roles o contraseña, reinicio de 2FA); caché de 5 s. **[prueba]**
- 2FA TOTP con secreto cifrado (AES-GCM), códigos de recuperación de un solo uso y reinicio por admin auditado; obligatorio para personal (`REQUIRE_2FA_FOR_STAFF`).
- Google OIDC con PKCE, `state` atado por cookie y protección contra pre-secuestro de cuentas.

**Autorización**
- Toda ruta `/admin/*`, `/org/*`, `/me/*` y de soporte **exige sesión, verificado sobre el inventario real de rutas**: una ruta nueva sin autenticación rompe la prueba y obliga a justificarla. Las mutaciones públicas están en una lista blanca explícita. **[prueba]**
- La autenticación se ejecuta en `onRequest`, **antes de leer el cuerpo y de validarlo**: un anónimo no obtiene mensajes de validación ni gasta memoria en cuerpos grandes. Barrido de todas las rutas protegidas: 401 sin sesión, 403 con una cuenta sin rol/organización. **[prueba]**
- Roles de organización (propietario, admin, recepción, guía) con alcance por servicio; jerarquía en la gestión del equipo; nadie cambia sus propios roles ni suspende a otro admin; no se puede quitar al último admin.
- Objetos ajenos responden 404 (no se distingue "no existe" de "no es tuyo"). Los invitados acceden a reservas y pedidos con un token de un solo dato (sólo se guarda su hash).

**Entrada y salida de datos**
- Todas las consultas van parametrizadas; los identificadores dinámicos (tablas, columnas, orden) salen de listas blancas (manifest y registro de colecciones), nunca del cliente. Pruebas de inyección en búsqueda, orden y filtros. **[prueba]**
- Esquemas estrictos (zod): campos desconocidos rechazados, sin asignación masiva (no se pueden fijar roles ni verificaciones). **[prueba]**
- Cuerpos limitados a 1 MB (413 antes de procesar); JSON roto → 400 sin trazas. Ninguna ruta responde 500 ante entradas basura (barrido de todas las rutas). **[prueba]**
- CSV exportados neutralizan fórmulas; los enlaces externos (calendarios iCal, imágenes por URL) sólo aceptan https y rechazan redes privadas y loopback (defensa SSRF), con tope de tamaño y de tiempo. **[prueba]**
- Redirecciones de anuncios sólo a https o rutas propias.

**Dinero**
- La pasarela nunca recibe ni guarda datos de tarjeta (tokens del proveedor). Cobros con `Idempotency-Key`; sin sobreventa ni sobreasignación (bloqueo transaccional; pruebas con concurrencia); reembolsos idempotentes; conciliación por webhook firmado (HMAC, tolerancia de reloj, comparación a tiempo constante, eventos procesados una sola vez), incluidos cobros huérfanos. **[prueba]**
- Importes en centavos enteros; el servidor recalcula siempre precios, cupos, descuentos y comisiones.

**Infraestructura**
- Cabeceras de seguridad (helmet), CORS con lista blanca (nunca `*`; en producción sólo https), límites de tasa globales y por ruta con almacén compartido, `X-Request-Id`, registro con datos sensibles ocultos. **[prueba]**
- **IP del cliente**: `TRUST_PROXY` (por defecto ninguno). Antes se confiaba en cualquier `X-Forwarded-For`, lo que permitía falsear la IP y evadir los límites; ahora sólo se acepta desde proxies configurados. **[prueba]**
- Configuración de producción validada al arrancar (falla cerrado). **[prueba]** `npm audit` sin vulnerabilidades en dependencias de producción; el CI lo repite y escanea secretos con gitleaks.
- Imágenes: se valida el archivo real (bytes, dimensiones), nunca SVG, servidas con `nosniff` y CSP `sandbox`; las claves de almacenamiento no admiten rutas relativas. **[prueba]**

## 2. Hallazgos de esta revisión (corregidos)

| # | Severidad | Hallazgo | Corrección |
|---|---|---|---|
| 1 | Alta | `trustProxy: true` aceptaba cualquier `X-Forwarded-For`: se podía evadir el límite de tasa y falsear la IP en registros | `TRUST_PROXY` configurable; por defecto desactivado |
| 2 | Media | La validación de entrada corría antes de la autenticación: un anónimo veía los mensajes de validación de rutas administrativas | La autenticación pasó a `onRequest` (todas las rutas) |
| 3 | Media | Un token de acceso seguía sirviendo tras suspender la cuenta o cerrar sesión | Comprobación de sesión viva con caché de 5 s |
| 4 | Media | `GET /operators/{slug}/listings/{listing}` respondía 500 (columnas ambiguas); lo encontró el barrido de rutas | Columnas calificadas + prueba de regresión |
| 5 | Baja | Producción podía arrancar con `CORS_ORIGINS` con `*`/http o con credenciales de desarrollo | El arranque lo rechaza |
| 6 | Baja | No había retención de sesiones, tokens ni correos viejos | Trabajo `maintenance.purge` |
| 7 | Baja | Sin métricas ni alertas | `/metrics` protegido + guía de alertas |

## 3. Decisiones y riesgos residuales

- **Sin RLS de PostgreSQL**: la API usa un solo rol de base de datos y aplica la autorización en la aplicación (más simple de probar y de auditar por ruta; la prueba de inventario reduce el riesgo de olvidar un `preHandler`). Si en el futuro otros servicios consultan la base directamente, conviene añadir RLS o roles de sólo lectura.
- **Impersonación de usuarios y reglas de IP** (docs §5.17) no se implementaron: no hay riesgo asociado, pero tampoco la capacidad.
- **Antivirus y variantes de imagen**: no hay escaneo de malware ni reencode de imágenes; mitigado por la validación de formato, el bloqueo de SVG y las cabeceras de servido. Recomendable un servicio de escaneo antes de abrir subidas de UGC a gran escala.
- **3-D Secure** no soportado en Stripe (los cobros que lo exigen se rechazan); requiere flujo de cliente.
- **Redis** (límite de tasa) no está probado en CI (la prueba se omite sin Redis); usar PostgreSQL como almacén compartido hasta probarlo.
- **Pruebas de carga y pentest externo**: pendientes; la prueba de barrido cubre robustez ante entradas basura, no rendimiento bajo carga.
- **Correos de otros idiomas** (fr/de/pt/it) no existen: caen a español o inglés.
- La **caché de 5 s** de sesiones significa que una revocación puede tardar hasta 5 s en verse en una instancia distinta de la que la ejecutó.
