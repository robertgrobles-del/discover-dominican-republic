## **API Specification** 

## **Portal Turístico del Gran Santo Domingo** 

**Versión:** 1.0 

**Estado:** Borrador Inicial **Fecha:** Junio 2026 

## **1. Objetivo** 

Definir los servicios REST que utilizarán el portal público y el panel administrativo para consultar, crear, actualizar y administrar la información del Portal Turístico del Gran Santo Domingo. 

La API seguirá principios REST, utilizará JSON como formato de intercambio de datos y contará con versionado para garantizar compatibilidad futura. 

## **2. Estándares** 

## **Base URL** 

https://api.tudominio.com/v1 

## **Formato de respuesta** 

{ "success": true, "message": "Consulta realizada correctamente.", "data": {} } 

## **Formato de error** 

{ 

"success": false, "message": "Recurso no encontrado.", "errors": [] } 

## **Autenticación** 

- JWT Bearer Token para el panel administrativo. 

- Endpoints públicos sin autenticación cuando corresponda. 

## **3. Endpoints Públicos** 

## **Lugares** 

- GET /lugares 

- GET /lugares/{slug} 

- GET /lugares/destacados 

## **Gastronomía** 

- GET /restaurantes 

- GET /restaurantes/{slug} 

- GET /cafeterias 

- GET /cafes 

- GET /bares 

- GET /discotecas 

## **Hospedaje** 

- GET /hoteles 

- GET /hoteles/{slug} 

## **Eventos** 

- GET /eventos 

- GET /eventos/{slug} 

- GET /eventos/proximos 

- GET /eventos/hoy 

## **Rutas** 

- GET /rutas 

- GET /rutas/{slug} 

## **Blog** 

- GET /articulos 

- GET /articulos/{slug} 

## **Categorías** 

- GET /categorias 

## **Etiquetas** 

- GET /etiquetas 

## **Búsqueda** 

- GET /buscar 

Parámetros soportados: 

- texto 

- categoría 

- municipio 

- sector 

- tipo 

- fecha 

## **Contacto** 

- POST /contacto 

## **4. Endpoints Administrativos** 

Todos requieren autenticación. 

## **Autenticación** 

- POST /auth/login 

- POST /auth/logout 

- POST /auth/refresh 

- GET /auth/me 

## **Usuarios** 

- GET /usuarios 

- POST /usuarios 

- PUT /usuarios/{id} 

- DELETE /usuarios/{id} 

## **Lugares** 

- POST /lugares 

- PUT /lugares/{id} 

- DELETE /lugares/{id} 

## **Restaurantes** 

- POST /restaurantes 

- PUT /restaurantes/{id} 

- DELETE /restaurantes/{id} 

## **Hoteles** 

- POST /hoteles 

- PUT /hoteles/{id} 

- DELETE /hoteles/{id} 

## **Eventos** 

- POST /eventos 

- PUT /eventos/{id} 

- DELETE /eventos/{id} 

## **Rutas** 

- POST /rutas 

- PUT /rutas/{id} 

- DELETE /rutas/{id} 

## **Blog** 

- POST /articulos 

- PUT /articulos/{id} 

- DELETE /articulos/{id} 

## **Multimedia** 

- POST /media 

- DELETE /media/{id} 

## **Categorías** 

- POST /categorias 

- PUT /categorias/{id} 

- DELETE /categorias/{id} 

## **Configuración** 

- GET /configuracion 

- PUT /configuracion 

## **5. Parámetros Comunes** 

Los listados deberán soportar: 

- paginación 

- ordenamiento 

- búsqueda 

- filtros 

- cantidad por página 

Ejemplo: 

GET /lugares?page=1&limit=20&sort=nombre 

## **6. Códigos HTTP** 

## **Código Descripción** 

- 200 Consulta exitosa 

- 201 Registro creado 

- 204 Eliminación exitosa 

- 400 Solicitud incorrecta 

- 401 No autenticado 

- 403 Sin permisos 

- 404 No encontrado 

- 409 Conflicto 

- 422 Error de validación 

- 500 Error interno 

## **7. Versionado** 

La API utilizará versionado mediante URL. 

Ejemplo: 

/api/v1/ /api/v2/ 

Las nuevas versiones mantendrán compatibilidad con las anteriores durante un período definido antes de su descontinuación. 

## **8. Reglas de Diseño** 

- Todas las respuestas estarán en formato JSON. 

- Los endpoints utilizarán nombres en plural. 

- Se emplearán métodos HTTP según su propósito (GET, POST, PUT, DELETE). 

- Los recursos se identificarán mediante id para operaciones internas y slug para consultas públicas. 

- Las validaciones se realizarán en el backend antes de procesar cualquier solicitud. 

- La documentación interactiva se generará automáticamente mediante OpenAPI/Swagger. 

## **9. Criterios de Calidad** 

La API deberá: 

- Mantener tiempos de respuesta inferiores a 500 ms en consultas habituales. 

- Soportar paginación y filtrado en todos los listados. 

- Registrar errores y eventos para auditoría. 

- Proteger los endpoints administrativos mediante autenticación y autorización por roles. 

- Ser fácilmente extensible para incorporar nuevas entidades sin romper la compatibilidad existente. 

## **Aprobación** 

Esta especificación constituye el contrato oficial entre el frontend, el panel administrativo y el backend del Portal Turístico del Gran Santo Domingo. Cualquier cambio en los endpoints o en el formato de las respuestas deberá actualizar este documento antes de su implementación. 

