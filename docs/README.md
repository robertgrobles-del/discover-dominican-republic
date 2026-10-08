# Documentación de Descubre RD

Índice de `docs/`, revisado el 2026-10-07. Cada documento tiene su resumen y su estado:
**vigente** (describe lo que hay), **en curso** (plan o trabajo abierto), **generado** (no se edita a mano) o
**referencia** (material de apoyo).

## Por dónde empezar

| Si quieres… | Lee |
| :--- | :--- |
| Saber qué funciona hoy y cómo levantarlo | [ESTADO_DEL_PROYECTO.md](ESTADO_DEL_PROYECTO.md) |
| Continuar la conexión del sitio y el panel al backend | [TAREAS_CONEXION_BACKEND_PENDIENTES.md](TAREAS_CONEXION_BACKEND_PENDIENTES.md) |
| Buscar una ruta de la API | [BACKEND_API_IMPLEMENTADO.md](BACKEND_API_IMPLEMENTADO.md) |
| Desplegar | [DESPLIEGUE_VPS.md](DESPLIEGUE_VPS.md) y [BACKEND_OPERACION.md](BACKEND_OPERACION.md) |

## Estado y trabajo en curso

| Documento | Resumen | Estado |
| :--- | :--- | :--- |
| [ESTADO_DEL_PROYECTO.md](ESTADO_DEL_PROYECTO.md) | Fotografía técnica: cifras, qué se comprobó, cómo levantar el entorno y qué falta. | vigente |
| [TAREAS_CONEXION_BACKEND_PENDIENTES.md](TAREAS_CONEXION_BACKEND_PENDIENTES.md) | Lista de trabajo para conectar admin y sitio a la API: reglas, tareas A1–A9 y P1–P8, rutas que faltan (B1–B9), enlaces rotos, cien mejoras del panel y el resumen de las revisiones. | en curso |
| [GUIA_CONEXION_BACKEND_BLOQUES_4_5.md](GUIA_CONEXION_BACKEND_BLOQUES_4_5.md) | Rutas del backend y archivos del frontend para gamificación, social, tienda y recompensas, con las trampas del entorno. | referencia |
| [MIGRACION_ESCRITURAS_BACKEND.md](MIGRACION_ESCRITURAS_BACKEND.md) | Contrato de transición de las escrituras: reservas, checkout, pedidos, carrito y favoritos. | en curso |
| [DEUDA_FRONTEND.md](DEUDA_FRONTEND.md) | Catálogo de deuda técnica del sitio, con evidencia reproducible y orden sugerido. Medido el 2026-09-30. | en curso |

## Planes

| Documento | Resumen | Estado |
| :--- | :--- | :--- |
| [PLAN_DE_ACCION_MEJORAS_OCTUBRE.md](PLAN_DE_ACCION_MEJORAS_OCTUBRE.md) | Mejoras prioritarias para el lanzamiento, con cronograma semanal de octubre. | en curso |
| [PLAN_EJECUCION_ARQUITECTURA_150.md](PLAN_EJECUCION_ARQUITECTURA_150.md) | Registro de las 150 mejoras de arquitectura, una por una, con su estado. | en curso |
| [PLAN_CONTENIDO_GAMIFICACION_MONETIZACION.md](PLAN_CONTENIDO_GAMIFICACION_MONETIZACION.md) | Mejoras de contenido, gamificación, creadores, afiliados y vías de ingreso. | en curso |

Los planes maestros de origen están en la raíz del repositorio: `PLAN_MAESTRO_MEJORAS.md` y
`PLAN_ACCESOS_Y_PANELES_POR_PERFIL.md`.

## Backend

| Documento | Resumen | Estado |
| :--- | :--- | :--- |
| [BACKEND_API_IMPLEMENTADO.md](BACKEND_API_IMPLEMENTADO.md) | Las 1 013 operaciones que existen, por grupo, con acceso y descripción. Se regenera con `npm run docs:api` en `backend/`. | generado |
| [BACKEND_API.md](BACKEND_API.md) | Diseño original de la API (septiembre de 2026): arquitectura, convenciones, modelo de datos. A él remiten las notas «docs §» del código. | referencia |
| [CATALOGO_CAPACIDADES.md](CATALOGO_CAPACIDADES.md) | Capacidades por perfil y a qué rutas dan acceso. Se regenera con `npm run docs:capabilities`. | generado |
| [PRECEDENCIA_DE_PERMISOS.md](PRECEDENCIA_DE_PERMISOS.md) | Regla única para decidir si alguien puede hacer algo: las cuatro capas y cómo se combinan. | vigente |
| [FUENTE_DE_VERDAD.md](FUENTE_DE_VERDAD.md) | Qué sistema manda en cada dominio de datos. | vigente |
| [BACKEND_SEGURIDAD.md](BACKEND_SEGURIDAD.md) | Controles de seguridad vigentes, hallazgos corregidos y riesgos residuales. | vigente |
| [BACKEND_OPERACION.md](BACKEND_OPERACION.md) | Lista de salida a producción, respaldos, monitoreo, retención, secretos e incidentes. | vigente |
| [WEBHOOKS.md](WEBHOOKS.md) | Guía para operadores que integran su sistema: eventos, firma y reintentos. | vigente |
| [DATOS_SINTETICOS.md](DATOS_SINTETICOS.md) | Cómo se etiquetan y se limpian los datos de demostración. | vigente |
| [PROVEEDORES_EXTERNOS.md](PROVEEDORES_EXTERNOS.md) | Servicios de terceros que el código puede llamar y qué datos reciben. | vigente |

## Arquitectura y despliegue

| Documento | Resumen | Estado |
| :--- | :--- | :--- |
| [ARQUITECTURA_MICROSERVICIOS.md](ARQUITECTURA_MICROSERVICIOS.md) | Plan para extraer dominios del monolito a servicios (`content` y `weather` ya iniciados). | en curso |
| [DEPENDENCIAS_DATOS_INVENTARIO.md](DEPENDENCIAS_DATOS_INVENTARIO.md) | Qué tablas lee y escribe cada módulo; apoyo para las extracciones. | en curso |
| [DESPLIEGUE_VPS.md](DESPLIEGUE_VPS.md) | Despliegue en un VPS con Compose y Caddy. Validado solo en local. | vigente |

## Frontend

| Documento | Resumen | Estado |
| :--- | :--- | :--- |
| [ARQUITECTURA_FRONTEND.md](ARQUITECTURA_FRONTEND.md) | Capas objetivo y convenciones del sitio. | vigente |
| [DISENO_VISUAL_FRONTEND.md](DISENO_VISUAL_FRONTEND.md) | Tokens visuales implementados y reglas de composición. | vigente |
| [OPERACION_FRONTEND.md](OPERACION_FRONTEND.md) | Despliegue atómico, caché y service worker del sitio. | vigente |
| [SEGURIDAD_SESION_Y_CABECERAS.md](SEGURIDAD_SESION_Y_CABECERAS.md) | Sesión, XSS, CSRF y cabeceras pendientes antes de producción. | vigente |
| [ALMACENAMIENTO_LOCAL.md](ALMACENAMIENTO_LOCAL.md) | Qué guarda el sitio en el navegador y por cuánto tiempo. | vigente |
| [PRIVACIDAD_ANALITICA_MAPAS.md](PRIVACIDAD_ANALITICA_MAPAS.md) | Consentimiento de analítica, proveedores observados y uso de la ubicación. | vigente |
| [ADOPCION_POR_PERFIL.md](ADOPCION_POR_PERFIL.md) | Qué se mide del uso de cada panel, sin datos personales. | vigente |

## Marca

| Documento | Resumen | Estado |
| :--- | :--- | :--- |
| [MANUAL_Y_BRIEF_IDENTIDAD_DESCUBRE_RD.md](MANUAL_Y_BRIEF_IDENTIDAD_DESCUBRE_RD.md) (+ `.pdf`) | Brief para la diseñadora: esencia de la marca, paleta, tipografía y requisitos del logotipo. | vigente |

## Mantenimiento de esta carpeta

- Un documento **generado** no se edita: se cambia el código y se regenera.
- Al cerrar un plan o una lista de tareas, se resume aquí en una línea y se retira el detalle.
- Retirado el 2026-10-08: la carpeta `referencias_gran_santo_domingo/` y el brief de marca antiguo. El archivo del Registro Nacional Turístico ya no se versiona (datos personales; se conectará por API).
- Retirado el 2026-10-07: un duplicado exacto del manual de marca, un `CLAUDE.md` vacío y 11 archivos `.docx`
