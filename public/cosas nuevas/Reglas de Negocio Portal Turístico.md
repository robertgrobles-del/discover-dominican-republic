# Reglas de Negocio

## Portal Turístico del Gran Santo Domingo

**Versión:** 1.0\
**Estado:** Borrador Inicial\
**Fecha:** Junio 2026

# 1. Objetivo

Definir las reglas que rigen la creación, administración, publicación y
visualización del contenido dentro del Portal Turístico del Gran Santo
Domingo, garantizando consistencia, calidad y una experiencia uniforme
para los usuarios.

# 2. Reglas Generales

-   Todo contenido deberá estar asociado al Gran Santo Domingo.
-   Ningún contenido podrá publicarse sin un título, descripción y
    categoría principal.
-   Todo contenido público deberá contar con un slug único para generar
    una URL amigable.
-   Los registros se crearán inicialmente como **Borrador** y solo serán
    visibles al público cuando su estado sea **Publicado**.
-   La eliminación de contenido será lógica (Soft Delete), permitiendo
    su recuperación.

# 3. Lugares Turísticos

-   Todo lugar deberá pertenecer al menos a una categoría.
-   Cada lugar deberá estar asociado a un municipio.
-   Se recomienda asociar un sector o barrio cuando aplique.
-   Todo lugar deberá tener coordenadas geográficas para su
    visualización en el mapa.
-   Un lugar podrá pertenecer a varias categorías secundarias.
-   Un lugar podrá estar relacionado con rutas, eventos, artículos y
    otros lugares.
-   Un lugar podrá marcarse como **Destacado** para aparecer en la
    página principal.

# 4. Gastronomía

(Restaurantes, Cafeterías, Cafés, Bares y Discotecas)

-   Todo establecimiento deberá indicar su tipo de negocio.
-   Deberá registrar horario de operación.
-   Deberá disponer de al menos una imagen.
-   Podrá indicar rango de precios mediante una escala estandarizada.
-   Podrá registrar enlaces a menú, sitio web y redes sociales.
-   Un establecimiento podrá aparecer en varias rutas temáticas.

# 5. Hospedaje

-   Todo alojamiento deberá indicar su tipo (hotel, hostal, apartahotel
    o boutique).
-   Se permitirá registrar servicios ofrecidos.
-   Cada alojamiento tendrá una categoría propia definida por el
    administrador.
-   Deberá disponer de información de contacto y ubicación.

# 6. Eventos

-   Todo evento tendrá una fecha de inicio.
-   Los eventos podrán tener fecha de finalización cuando duren varios
    días.
-   Todo evento deberá estar vinculado a un lugar.
-   Los eventos finalizados pasarán automáticamente al histórico, pero
    seguirán siendo consultables.
-   Un evento podrá destacarse en la página principal mientras
    permanezca vigente.

# 7. Artículos y Guías

-   Todo artículo deberá pertenecer al menos a una categoría.
-   Todo artículo deberá tener una imagen destacada.
-   Se podrán relacionar lugares, eventos y rutas dentro del contenido.
-   Un artículo podrá programarse para publicación futura.

# 8. Categorías y Etiquetas

-   Una categoría podrá utilizarse en múltiples tipos de contenido.
-   Las etiquetas serán opcionales.
-   No se permitirán categorías duplicadas con el mismo nombre.
-   Las categorías no podrán eliminarse si existen contenidos asociados.

# 9. Imágenes y Multimedia

-   Todo contenido público deberá disponer de una imagen principal.
-   Las imágenes deberán almacenarse optimizadas para web.
-   Cada imagen deberá incluir un texto alternativo (ALT).
-   Se permitirá asociar galerías de imágenes a cualquier contenido.
-   Los videos se almacenarán mediante enlaces externos (YouTube, Vimeo
    u otros servicios compatibles).

# 10. Usuarios y Permisos

## Super Administrador

-   Acceso total al sistema.
-   Configuración general.
-   Gestión de usuarios y roles.

## Administrador

-   Gestión completa del contenido.
-   Publicación y despublicación.

## Editor

-   Crear y editar contenido.
-   Enviar contenido para publicación.

## Autor

-   Crear y actualizar únicamente sus propios contenidos.

Los usuarios solo podrán realizar acciones permitidas por su rol.

# 11. Búsqueda y Navegación

-   El buscador deberá indexar únicamente contenido publicado.
-   Los resultados se ordenarán por relevancia.
-   Los filtros variarán según el tipo de contenido.
-   Cuando una búsqueda no arroje resultados, el sistema mostrará
    contenido relacionado y sugerencias.

# 12. SEO y Publicación

-   Todo contenido deberá generar automáticamente metadatos SEO
    editables.
-   Las URLs serán permanentes una vez publicadas, salvo redirección
    configurada.
-   Los cambios publicados deberán reflejarse inmediatamente en el
    portal.
-   El sistema generará automáticamente el sitemap XML y actualizará el
    índice de contenidos.

# 13. Auditoría

El sistema registrará:

-   Creación de contenido.
-   Modificaciones.
-   Publicaciones.
-   Despublicaciones.
-   Eliminaciones lógicas.
-   Inicio de sesión de usuarios administrativos.

Cada registro incluirá usuario, fecha y acción realizada.

# 14. Criterios de Cumplimiento

Las reglas de negocio deberán implementarse tanto en el backend como en
el panel administrativo para evitar inconsistencias en los datos.
Ninguna operación podrá omitir las validaciones establecidas en este
documento.

# Aprobación

Las reglas descritas constituyen la normativa funcional del Portal
Turístico del Gran Santo Domingo y serán de cumplimiento obligatorio
durante el desarrollo, las pruebas y la operación del sistema.
