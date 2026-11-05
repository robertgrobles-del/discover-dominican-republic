-- Afiliados en hoteles, tours, rutas y agencias (anuncios de Operadores RD).
--  * El negocio fija en cada anuncio el % de afiliado que paga sobre lo cobrado (vacío = el anuncio no participa).
--  * La reserva guarda el enlace del creador que la trajo y el % vigente al reservar.
--  * Al liquidar, al negocio se le descuenta su comisión más ese %; del %, el creador recibe la parte fijada por Descubre RD
--    (site_settings «creator_affiliate_share_percent») y el resto queda para la plataforma.
ALTER TABLE operator_listings ADD COLUMN IF NOT EXISTS affiliate_commission_percent numeric(5,2)
  CHECK (affiliate_commission_percent IS NULL OR (affiliate_commission_percent > 0 AND affiliate_commission_percent <= 50));
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS affiliate_link_id uuid REFERENCES creator_affiliate_links(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS affiliate_rate numeric(5,2) CHECK (affiliate_rate IS NULL OR (affiliate_rate > 0 AND affiliate_rate <= 50));

INSERT INTO site_settings (key, value, description)
VALUES ('creator_affiliate_share_percent', '70', 'Parte (%) de la comisión de afiliado de un negocio que recibe el creador; el resto es el margen de Descubre RD')
ON CONFLICT (key) DO NOTHING;
