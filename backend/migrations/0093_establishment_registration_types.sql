-- ==============================================================================
-- Migración 0093: más tipos de negocio en las solicitudes de alta
-- El formulario de registro sólo admitía siete tipos, así que agencias de viaje, guías,
-- alquiler de vehículos o náutica se registraban como «tour». Se amplía la lista para que
-- cada negocio se registre con su tipo real.
-- ==============================================================================

ALTER TABLE establishment_registrations DROP CONSTRAINT IF EXISTS establishment_registrations_tipo_establecimiento_check;
ALTER TABLE establishment_registrations ADD CONSTRAINT establishment_registrations_tipo_establecimiento_check
  CHECK (tipo_establecimiento IN ('general', 'restaurante', 'bar', 'hotel', 'tour', 'spa', 'tienda',
                                  'airbnb', 'cafe', 'agencia', 'guia', 'transporte', 'nautica', 'salud', 'taller', 'otro'));
