-- Los skyscrapers van en pareja (izquierda + derecha de una misma sección) y pertenecen a una sola campaña: un banner
-- llena los dos lados, con la misma imagen o con una imagen distinta para la derecha (historia que se complementa).
-- Mientras una pareja tenga campaña vigente no acepta otra en las mismas fechas.

ALTER TABLE ad_banners ADD COLUMN IF NOT EXISTS image_url_right text;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ad_banners_image_url_right_chk') THEN
    ALTER TABLE ad_banners ADD CONSTRAINT ad_banners_image_url_right_chk CHECK (image_url_right IS NULL OR image_url_right ~ '^(https://|/)');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION ad_banners_skyscraper_pair_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.banner_type NOT IN ('skyscraper', 'skyscraper-traditional') OR NEW.section IS NULL
     OR NEW.deleted_at IS NOT NULL OR NOT coalesce(NEW.is_active, true) THEN
    RETURN NEW;
  END IF;
  -- Serializa altas concurrentes sobre la misma pareja.
  PERFORM pg_advisory_xact_lock(hashtext('ad_skyscraper:' || lower(NEW.section)));
  IF EXISTS (
    SELECT 1 FROM ad_banners b
     WHERE b.id <> NEW.id AND b.deleted_at IS NULL AND coalesce(b.is_active, true)
       AND b.banner_type IN ('skyscraper', 'skyscraper-traditional') AND lower(b.section) = lower(NEW.section)
       AND daterange(coalesce(b.start_date, '-infinity'), coalesce(b.end_date, 'infinity'), '[]')
        && daterange(coalesce(NEW.start_date, '-infinity'), coalesce(NEW.end_date, 'infinity'), '[]')
  ) THEN
    RAISE EXCEPTION 'La pareja de skyscrapers "%" ya tiene una campaña en esas fechas', NEW.section
      USING ERRCODE = '23P01', CONSTRAINT = 'ad_banners_skyscraper_pair';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_ad_banners_skyscraper_pair ON ad_banners;
CREATE TRIGGER trg_ad_banners_skyscraper_pair BEFORE INSERT OR UPDATE ON ad_banners
  FOR EACH ROW EXECUTE FUNCTION ad_banners_skyscraper_pair_guard();
