-- Ficha de provincia completa (editor del panel). Las listas se guardan como JSON.
-- Aún no se publican: /public/provinces sigue devolviendo solo los campos de antes.
ALTER TABLE provinces ADD COLUMN image_alt       TEXT;
ALTER TABLE provinces ADD COLUMN hero_images     TEXT; -- ["url", …] slider de portada
ALTER TABLE provinces ADD COLUMN color_primary   TEXT; -- #rrggbb identidad visual
ALTER TABLE provinces ADD COLUMN color_accent    TEXT;
ALTER TABLE provinces ADD COLUMN municipalities  TEXT; -- [{ name, description }]
ALTER TABLE provinces ADD COLUMN places          TEXT; -- [{ name, type, description, image, lat, lng }]
ALTER TABLE provinces ADD COLUMN gallery         TEXT; -- [{ url, alt }]
ALTER TABLE provinces ADD COLUMN seo_title       TEXT;
ALTER TABLE provinces ADD COLUMN seo_description TEXT;
ALTER TABLE provinces ADD COLUMN focus_keywords  TEXT;
