-- Alinea las restricciones del esquema con lo que ya usa el módulo Operadores RD del frontend
-- (etapas 1-8: tipo de negocio 'tour_operator'/'agency', categoría 'paquete').

ALTER TABLE partner_profiles DROP CONSTRAINT IF EXISTS partner_profiles_business_type_check;
ALTER TABLE partner_profiles ADD CONSTRAINT partner_profiles_business_type_check CHECK (
  business_type IN ('hotel', 'restaurant', 'bar', 'tour', 'spa', 'shop', 'operador', 'agencia', 'guia', 'tour_operator', 'agency', 'other')
);

ALTER TABLE operator_listings DROP CONSTRAINT IF EXISTS operator_listings_category_check;
ALTER TABLE operator_listings ADD CONSTRAINT operator_listings_category_check CHECK (
  category IN ('experiencia', 'voluntariado', 'alojamiento', 'transporte', 'paquete')
);
