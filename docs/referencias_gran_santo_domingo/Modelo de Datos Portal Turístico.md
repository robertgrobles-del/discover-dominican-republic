## Modelo de Datos (ERD + Diccionario de Datos) 

## Portal Turístico del Gran Santo Domingo 

**Versión:** 1.0 

**Estado:** Borrador Inicial **Fecha:** Junio 2026 

## 1. Objetivo 

Definir la estructura lógica de la base de datos del Portal Turístico del Gran Santo Domingo, identificando las entidades principales, sus relaciones y los campos esenciales para garantizar una gestión eficiente del contenido. 

## 2. Entidades Principales 

## Lugar 

Representa cualquier atractivo turístico permanente. 

Campos principales: 

- ID 

- Nombre 

- Slug 

- Descripción corta 

- Descripción completa 

- Historia 

- Dirección 

- Latitud 

- Longitud 

- Municipio 

- Sector 

- Horario 

- Precio de entrada 

- Sitio web 

- Teléfono 

- Correo electrónico 

- Estado (Publicado/Borrador) 

- Fecha de creación 

- Fecha de actualización 

Relaciones: 

- Una categoría principal. 

- Varias categorías secundarias. 

- Muchas imágenes. 

- Muchos artículos relacionados. 

- Muchos eventos. 

- Muchas rutas. 

## Restaurante 

Campos: 

- ID 

- Nombre 

- Slug 

- Descripción 

- Tipo de cocina 

- Rango de precios 

- Dirección 

- Coordenadas 

- Horario 

- Teléfono 

- WhatsApp 

- Sitio web 

- Menú (URL) 

- Estado 

Relaciones: 

- Muchas imágenes. 

- Varias categorías. 

- Un municipio. 

## Hotel 

## Campos: 

- ID 

- Nombre 

- Categoría 

- Dirección 

- Coordenadas 

- Descripción 

- Servicios 

- Check-in 

- Check-out 

- Teléfono 

- Sitio web 

- Estado 

Relaciones: 

- Muchas imágenes. 

- Un municipio. 

## Evento 

Campos: 

- ID 

- Título 

- Slug 

- Descripción 

- Fecha inicio 

- Fecha fin 

- Hora 

- Lugar 

- Organizador 

- Precio 

- Imagen principal 

- Estado 

Relaciones: 

- Un lugar. 

- Muchas categorías. 

- Muchas imágenes. 

## Ruta 

Campos: 

- ID 

- Nombre 

- Slug 

- Descripción 

- Duración estimada 

- Distancia 

- Medio recomendado 

- Dificultad 

- Estado 

Relaciones: 

- Muchos lugares. 

- Muchas imágenes. 

## Artículo 

Campos: 

- ID 

- Título 

- Slug 

- Resumen 

- Contenido 

- Autor 

- Imagen destacada 

- Fecha publicación 

- Estado 

Relaciones: 

- Muchas etiquetas. 

- Muchas categorías. 

- Muchos lugares relacionados. 

## Categoría 

Campos: 

- ID 

- Nombre 

- Slug 

- Tipo 

- Descripción 

Relaciones: 

- Muchos contenidos. 

## Etiqueta 

Campos: 

- ID 

- Nombre 

- Slug 

Relaciones: 

- Muchos artículos. 

- Muchos lugares. 

- Muchos eventos. 

## Imagen 

Campos: 

- ID 

- Archivo 

- Título 

- Texto alternativo 

- Autor 

- Créditos 

- Orden 

Relaciones: 

- Pertenece a un contenido. 

## Usuario 

Campos: 

- ID 

- Nombre 

- Correo 

- Contraseña 

- Rol 

- Estado 

- Último acceso 

Roles iniciales: 

- Super Administrador. 

- Administrador. 

- Editor. 

- Autor. 

## 3. Catálogos 

El sistema utilizará catálogos para mantener la consistencia de la información. 

- Municipios. 

- Sectores. 

- Tipos de cocina. 

- Tipos de hospedaje. 

- Categorías de eventos. 

- Tipos de lugares. 

- Tipos de rutas. 

- Idiomas. 

- Estados de publicación. 

## 4. Relaciones Principales 

- Un municipio contiene muchos lugares, restaurantes y hoteles. 

- Un lugar puede pertenecer a varias categorías. 

- Un artículo puede relacionarse con múltiples lugares. 

- Una ruta incluye varios lugares. 

- Un evento se realiza en un lugar. 

- Una categoría agrupa múltiples contenidos. 

- Una imagen puede asociarse a cualquier tipo de contenido mediante una relación polimórfica. 

## 5. Convenciones 

## Identificadores 

Todas las tablas utilizarán un identificador único (UUID o ID autoincremental, según la arquitectura definida en el TDD). 

## Fechas 

Todas las entidades incluirán: 

- Fecha de creación. 

- Fecha de actualización. 

Cuando aplique: 

- Fecha de publicación. 

- Fecha de eliminación lógica. 

## URLs 

Todo contenido público utilizará un campo **Slug** único para construir URLs amigables. 

## 6. Reglas Generales 

- No se eliminarán registros publicados físicamente; se utilizará eliminación lógica cuando sea necesario. 

- Todas las imágenes deberán contener texto alternativo para accesibilidad y SEO. 

- Los contenidos podrán permanecer como borrador antes de su publicación. 

- Un contenido podrá pertenecer a múltiples categorías y etiquetas. 

- Los usuarios tendrán permisos según su rol. 

## 7. Preparación para Crecimiento 

El modelo está diseñado para incorporar nuevos tipos de contenido sin modificar la estructura principal de la base de datos. Las relaciones mediante categorías, etiquetas e 

imágenes reutilizables permitirán extender el portal con nuevas funcionalidades manteniendo la consistencia del modelo. 

## Aprobación 

Este documento define el modelo lógico inicial de datos del Portal Turístico del Gran Santo Domingo y servirá como base para la elaboración del diagrama ERD, la creación de la base de datos, el desarrollo de la API y la implementación del panel administrativo. 

