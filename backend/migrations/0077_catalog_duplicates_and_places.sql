-- Cierre de la migración del catálogo (2026-10-04): duplicados exactos y fichas sin destino. Idempotente; no
-- hace nada donde las filas no existen.

-- 1. Restaurantes que estaban dos veces: una fila sembrada con datos de demostración y otra cargada desde los
--    archivos del sitio, con la ficha completa y la dirección que usan sus páginas. Se conserva la segunda, que
--    hereda de la primera lo que le falte (teléfono, horario…), y la primera se archiva.
DO $$
DECLARE pair record;
BEGIN
  FOR pair IN SELECT * FROM (VALUES ('la-yola-cap-cana', 'la-yola'), ('jellyfish-punta-cana', 'jellyfish-restaurant')) AS v(keep, retire) LOOP
    UPDATE restaurants k
       SET phone = COALESCE(k.phone, d.phone), opening_hours = COALESCE(k.opening_hours, d.opening_hours),
           address = COALESCE(k.address, d.address), destination_id = COALESCE(k.destination_id, d.destination_id),
           latitude = COALESCE(k.latitude, d.latitude), longitude = COALESCE(k.longitude, d.longitude),
           slug_history = array_append(array_remove(k.slug_history, d.slug), d.slug), updated_at = now()
      FROM restaurants d
     WHERE k.slug = pair.keep AND k.deleted_at IS NULL AND d.slug = pair.retire AND d.deleted_at IS NULL;
    UPDATE restaurants SET deleted_at = now(), status = 'archived', is_active = false, updated_at = now()
     WHERE slug = pair.retire AND deleted_at IS NULL
       AND EXISTS (SELECT 1 FROM restaurants k WHERE k.slug = pair.keep AND k.deleted_at IS NULL);
  END LOOP;
END $$;

-- 2. Fichas que seguían sin destino porque su dirección no lo nombra tal cual.
--    El Pescador está en el malecón de Samaná; Amanera (Playa Grande) y la Laguna Gri-Gri están en Río San Juan,
--    provincia María Trinidad Sánchez.
UPDATE restaurants SET destination_id = (SELECT id FROM destinations WHERE slug = 'samana'), updated_at = now()
 WHERE slug = 'el-pescador-samana' AND destination_id IS NULL AND EXISTS (SELECT 1 FROM destinations WHERE slug = 'samana');
UPDATE hotels SET destination_id = (SELECT id FROM destinations WHERE slug = 'maria-trinidad-sanchez'), updated_at = now()
 WHERE slug = 'amanera-playa-grande' AND destination_id IS NULL AND EXISTS (SELECT 1 FROM destinations WHERE slug = 'maria-trinidad-sanchez');
UPDATE experiences SET destination_id = (SELECT id FROM destinations WHERE slug = 'maria-trinidad-sanchez'), updated_at = now()
 WHERE slug = 'kayak-bioluminiscente' AND destination_id IS NULL AND EXISTS (SELECT 1 FROM destinations WHERE slug = 'maria-trinidad-sanchez');

-- La ficha completa de esas tres filas se armó cuando aún no tenían destino: se actualiza con él.
UPDATE restaurants r SET extras = r.extras || jsonb_build_object('destinationId', d.slug, 'destinationName', d.name, 'province', COALESCE(p.name, d.name), 'provinceId', COALESCE(p.slug, d.slug))
  FROM destinations d LEFT JOIN provinces p ON p.id = d.province_id
 WHERE r.slug = 'el-pescador-samana' AND d.id = r.destination_id AND COALESCE(r.extras->>'destinationId', '') = '' AND r.extras <> '{}'::jsonb;
UPDATE hotels h SET extras = h.extras || jsonb_build_object('destinationId', d.slug, 'destinationName', d.name, 'province', COALESCE(p.name, d.name), 'provinceId', COALESCE(p.slug, d.slug))
  FROM destinations d LEFT JOIN provinces p ON p.id = d.province_id
 WHERE h.slug = 'amanera-playa-grande' AND d.id = h.destination_id AND COALESCE(h.extras->>'destinationId', '') = '' AND h.extras <> '{}'::jsonb;
UPDATE experiences e SET extras = e.extras || jsonb_build_object('destinationId', d.slug, 'destinationName', d.name, 'province', COALESCE(p.name, d.name))
  FROM destinations d LEFT JOIN provinces p ON p.id = d.province_id
 WHERE e.slug = 'kayak-bioluminiscente' AND d.id = e.destination_id AND COALESCE(e.extras->>'destinationId', '') = '' AND e.extras <> '{}'::jsonb;
