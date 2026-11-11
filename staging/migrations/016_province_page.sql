-- Base 1 · Contenido. Cada componente de la página de provincia se edita en el panel.
-- Los catálogos (monumentos, parques, hoteles, restaurantes, bares) NO van aquí: se cargan solos por provincia.
ALTER TABLE provinces ADD COLUMN tagline          TEXT;    -- lema corto bajo el nombre
ALTER TABLE provinces ADD COLUMN intro            TEXT;    -- bloque «identidad»
ALTER TABLE provinces ADD COLUMN population       INTEGER;
ALTER TABLE provinces ADD COLUMN area_km2         REAL;
ALTER TABLE provinces ADD COLUMN best_time        TEXT;    -- ficha: mejor época
ALTER TABLE provinces ADD COLUMN weather_info     TEXT;    -- ficha: clima
ALTER TABLE provinces ADD COLUMN how_to_get_there TEXT;    -- ficha: resumen de cómo llegar
ALTER TABLE provinces ADD COLUMN highlights       TEXT;    -- ["…"]
ALTER TABLE provinces ADD COLUMN typical_dishes   TEXT;    -- ["…"]
ALTER TABLE provinces ADD COLUMN categories       TEXT;    -- ["playa","montaña",…] actividades
ALTER TABLE provinces ADD COLUMN slides           TEXT;    -- [{ image, tag, title, subtitle, description, ctaText, ctaLink }]
ALTER TABLE provinces ADD COLUMN about            TEXT;    -- { history, geography, artAndCulture, economy, demographics, location }
ALTER TABLE provinces ADD COLUMN themes           TEXT;    -- [{ eyebrow, title, text, facts[], image }]
ALTER TABLE provinces ADD COLUMN traveler_tags    TEXT;    -- [{ label, places[] }]
ALTER TABLE provinces ADD COLUMN itinerary        TEXT;    -- [{ dia, titulo, lugar, desc }]
ALTER TABLE provinces ADD COLUMN airport          TEXT;    -- { nombre, codigo, distancia }
ALTER TABLE provinces ADD COLUMN transport        TEXT;    -- [{ tipo, desde, duracion, descripcion, precio }]
ALTER TABLE provinces ADD COLUMN blocks           TEXT;    -- orden y visibilidad de las secciones de la página
ALTER TABLE provinces ADD COLUMN photo_credits    TEXT;    -- ["Autor (licencia)"]
