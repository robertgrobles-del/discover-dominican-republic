## Documento de Seguridad y Control de Acceso 

Portal Turístico del Gran Santo Domingo 

**Versión:** 1.0 **Estado:** Borrador Inicial **Fecha:** Junio 2026 

## 1. Objetivo 

Definir las políticas de seguridad, autenticación, autorización y protección de datos del Portal Turístico del Gran Santo Domingo, garantizando el acceso controlado a la información y la integridad del sistema. 

## 2. Principios de Seguridad 

- Principio de mínimo privilegio. 

- Validación de todas las entradas. 

- Protección de datos sensibles. 

- Separación clara entre público y administración. 

- Registro de todas las acciones críticas. 

- Prevención de accesos no autorizados. 

## 3. Autenticación 

## Método principal 

- Autenticación basada en JWT (JSON Web Tokens). 

- Expiración de token configurable. 

- Refresh tokens para sesiones prolongadas. 

## Reglas 

- Contraseñas almacenadas con hash bcrypt. 

- Mínimo 8 caracteres. 

- Recomendado: mayúsculas, minúsculas, números y símbolos. 

- Bloqueo temporal tras múltiples intentos fallidos. 

## 4. Autorización (Roles) 

## Super Administrador 

- Acceso total al sistema. 

- Gestión de usuarios y configuración global. 

- Eliminación de cualquier contenido. 

## Administrador 

- Gestión completa de contenido. 

- Publicación y edición. 

- Sin acceso a configuración crítica del sistema. 

## Editor 

- Crear y editar contenido. 

- Enviar contenido a publicación. 

- Sin permisos de eliminación global. 

## Autor 

- Crear contenido propio. 

- Editar solo contenido propio. 

- Sin permisos de publicación directa. 

## Visitante 

- Acceso únicamente a contenido público. 

## 5. Seguridad en API 

- Todas las rutas administrativas requieren autenticación. 

- Validación de roles en cada endpoint protegido. 

- Rate limiting para prevenir abuso. 

- Protección contra ataques de fuerza bruta. 

- Sanitización de entradas para evitar inyección SQL. 

## 6. Seguridad del CMS 

- Sesiones seguras con expiración automática. 

- Logout obligatorio tras inactividad. 

- Protección contra CSRF. 

- Validación en frontend y backend. 

- Confirmación obligatoria para acciones críticas (eliminación/publicación). 

## 7. Protección de Datos 

- No se almacenarán datos sensibles innecesarios. 

- Correos electrónicos protegidos con acceso restringido. 

- Contraseñas nunca visibles en texto plano. 

- Logs sin exposición de información sensible. 

## 8. Auditoría 

El sistema registrará: 

- Creación de contenido. 

- Edición de contenido. 

- Publicación. 

- Eliminación. 

- Inicio de sesión. 

- Fallos de autenticación. 

Cada registro incluirá: 

- Usuario. 

- Fecha y hora. 

- Acción realizada. 

- IP (opcional según configuración). 

## 9. Seguridad de Archivos 

- Solo formatos permitidos: JPG, PNG, WebP, MP4. 

- Tamaño máximo configurable por archivo. 

- Escaneo básico de archivos subidos. 

- Almacenamiento en bucket seguro (S3 o equivalente). 

- URLs firmadas para acceso controlado si es necesario. 

## 10. Seguridad en Frontend 

- Protección contra XSS. 

- Sanitización de contenido dinámico. 

- Uso de HTTPS obligatorio. 

- Evitar exposición de tokens en localStorage sin control. 

- Uso de cookies seguras cuando aplique. 

## 11. Seguridad en Infraestructura 

- Uso obligatorio de HTTPS. 

- Firewall activo en servidor. 

- Puertos limitados. 

- Acceso SSH restringido por llave. 

- Backups automáticos programados. 

- Actualización periódica del sistema operativo. 

## 12. Manejo de Errores 

- No exponer errores internos al usuario final. 

- Logs internos detallados para depuración. 

- Mensajes genéricos en producción. 

- Monitoreo de fallos críticos. 

## 13. Cumplimiento 

El sistema deberá cumplir con: 

- Buenas prácticas OWASP. 

- Protección básica de datos personales. 

- Estándares modernos de autenticación y autorización. 

## Aprobación 

Este documento define el marco de seguridad del Portal Turístico del Gran Santo Domingo y es obligatorio para todas las capas del sistema: frontend, backend, CMS e infraestructura. 

