-- Base 1 · Contenido. Presentación bajo la portada de la provincia (ProvinceIntroSection).
ALTER TABLE provinces ADD COLUMN intro_layout TEXT;  -- abanico | espejo | mosaico (vacío: según la provincia)
ALTER TABLE provinces ADD COLUMN intro_cards  TEXT;  -- [{ image, title, location, tag }] hasta 3 tarjetas
