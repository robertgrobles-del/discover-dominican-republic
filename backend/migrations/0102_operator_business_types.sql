-- Tipos de negocio que ofrece el perfil del operador (agencias de viajes incluidas). «guide» y «transport» faltaban en la
-- restricción, así que elegirlos en el perfil fallaba.
ALTER TABLE partner_profiles DROP CONSTRAINT IF EXISTS partner_profiles_business_type_check;
ALTER TABLE partner_profiles ADD CONSTRAINT partner_profiles_business_type_check CHECK (
  business_type IN ('hotel', 'restaurant', 'bar', 'tour', 'spa', 'shop', 'operador', 'agencia', 'guia', 'tour_operator', 'agency', 'guide', 'transport', 'other')
);
