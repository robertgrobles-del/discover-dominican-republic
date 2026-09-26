# Arquitectura de Datos y Esquemas para Strapi Headless CMS (Descubre RD)

## 📌 Configuración Base de Localización (i18n)
En Strapi v5, el plugin `@strapi/plugin-i18n` debe estar habilitado con los siguientes locales:
- `es` (Español - Predeterminado)
- `en` (English)
- `fr` (Français)
- `de` (Deutsch)
- `it` (Italiano)
- `pt` (Português)

---

## 🗂️ 1. Colección: `Destino` (`api::destino.destino`)
- **singularName**: `destino`
- **pluralName**: `destinos`
- **Campos:**
  - `nombre` (String, i18n: true, requerido)
  - `slug` (UID basado en `nombre`, requerido)
  - `region` (Enumeration: `norte`, `sur`, `este`, `santo-domingo`, `cibao-central`, `noroccidental`, `suroeste`, `nordeste`)
  - `descripcionCorta` (Text, i18n: true)
  - `descripcionLarga` (Rich Text / Blocks, i18n: true)
  - `imagenHero` (Media - single image)
  - `galeria` (Media - multiple images)
  - `coordenadas` (JSON: `{ lat: number, lng: number }`)
  - `mejorEpoca` (String, i18n: true)
  - `temperaturaPromedio` (String)
  - `rating` (Decimal)
  - `popularidad` (Integer)
  - `playas` (Relation: Many-to-Many con `Playa`)
  - `hoteles` (Relation: One-to-Many con `Alojamiento`)
  - `atracciones` (Relation: One-to-Many con `Atraccion`)

---

## 🏖️ 2. Colección: `Playa` (`api::playa.playa`)
- **singularName**: `playa`
- **pluralName**: `playas`
- **Campos:**
  - `nombre` (String, i18n: true, requerido)
  - `slug` (UID basado en `nombre`)
  - `descripcion` (Text, i18n: true)
  - `destino` (Relation: Many-to-One con `Destino`)
  - `tipoArena` (Enumeration: `blanca`, `dorada`, `negra`, `grano-fino`)
  - `nivelOleaje` (Enumeration: `tranquilo`, `moderado`, `fuerte`, `surf`)
  - `servicios` (JSON / Component: `restaurantes`, `sombrillas`, `bano`, `parqueo`, `seguridadPolitur`)
  - `imagenPrincipal` (Media - single)
  - `galeria` (Media - multiple)
  - `coordenadas` (JSON: `{ lat, lng }`)

---

## 🏨 3. Colección: `Alojamiento` (`api::alojamiento.alojamiento`)
- **singularName**: `alojamiento`
- **pluralName**: `alojamientos`
- **Campos:**
  - `nombre` (String, requerido)
  - `slug` (UID)
  - `categoria` (Enumeration: `resort-all-inclusive`, `hotel-boutique`, `eco-lodge`, `villa-lujo`, `apartahotel`, `glamping`, `hostal`)
  - `estrellas` (Integer: 1 a 5)
  - `rangoPrecio` (Enumeration: `economico`, `moderado`, `premium`, `lujo`)
  - `precioDesdeUSD` (Decimal)
  - `descripcion` (Text, i18n: true)
  - `amenidades` (JSON array: `piscina`, `spa`, `wifi`, `playa-privada`, `todo-incluido`, `golf`)
  - `enlaceReserva` (String)
  - `destino` (Relation: Many-to-One con `Destino`)
  - `imagenes` (Media - multiple)

---

## 🧭 4. Colección: `Experiencia` (`api::experiencia.experiencia`)
- **singularName**: `experiencia`
- **pluralName**: `experiencias`
- **Campos:**
  - `titulo` (String, i18n: true, requerido)
  - `slug` (UID)
  - `categoria` (Enumeration: `aventura`, `naturaleza`, `cultura`, `acuatico`, `gastronomia`, `bienestar`)
  - `duracionHoras` (Decimal)
  - `precioUSD` (Decimal)
  - `incluye` (JSON / Component, i18n: true)
  - `guiaCertificado` (Boolean)
  - `operadorTuristico` (String)
  - `destino` (Relation: Many-to-One con `Destino`)

---

## ✈️ 5. Colección: `Aeropuerto` (`api::aeropuerto.aeropuerto`)
- **singularName**: `aeropuerto`
- **pluralName**: `aeropuertos`
- **Campos:**
  - `nombre` (String, requerido)
  - `codigoIATA` (String, ej. `SDQ`, `PUJ`, `POP`)
  - `slug` (UID)
  - `tipo` (Enumeration: `internacional`, `domestico`)
  - `ciudad` (String)
  - `descripcion` (Text, i18n: true)
  - `aerolineas` (JSON array)
  - `servicios` (JSON array, i18n: true)
  - `transporte` (JSON array, i18n: true)
  - `imagenUrl` (Media / String)
