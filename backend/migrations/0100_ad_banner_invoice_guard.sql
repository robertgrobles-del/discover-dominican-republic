-- Un banner ya facturado no se borra (la factura dejaría de verse en la ficha de su cliente): se desactiva.
CREATE OR REPLACE FUNCTION ad_banners_keep_invoiced() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM fiscal_invoices WHERE reference_type = 'advertising' AND split_part(reference_id, ':', 1) = OLD.id::text) THEN
    RAISE EXCEPTION 'Este banner ya tiene facturas: desactívalo en lugar de borrarlo'
      USING ERRCODE = '23503', CONSTRAINT = 'ad_banners_invoiced';
  END IF;
  RETURN OLD;
END $$;
DROP TRIGGER IF EXISTS trg_ad_banners_keep_invoiced ON ad_banners;
CREATE TRIGGER trg_ad_banners_keep_invoiced BEFORE DELETE ON ad_banners FOR EACH ROW EXECUTE FUNCTION ad_banners_keep_invoiced();
