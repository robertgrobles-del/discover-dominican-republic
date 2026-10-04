-- Correcciones de datos del catálogo (2026-10-04). Todas son idempotentes y no hacen nada donde las filas no
-- existen: una base cargada sólo con `db:import-static` ya recibe los valores correctos desde los archivos.

-- 1. Tortuga Bay: el establecimiento estaba dos veces («Tortuga Bay» y «Tortuga Bay Puntacana»). Queda una sola
--    ficha con su nombre oficial; la otra se retira y su dirección antigua queda anotada en el historial.
UPDATE hotels SET deleted_at = now(), status = 'archived', is_active = false, updated_at = now()
 WHERE slug = 'tortuga-bay-puntacana' AND deleted_at IS NULL
   AND EXISTS (SELECT 1 FROM hotels k WHERE k.slug = 'tortuga-bay' AND k.deleted_at IS NULL);

UPDATE hotels
   SET name = 'Tortuga Bay Puntacana Resort & Club',
       extras = CASE WHEN extras ? 'name' THEN jsonb_set(extras, '{name}', '"Tortuga Bay Puntacana Resort & Club"') ELSE extras END,
       slug_history = CASE WHEN slug = 'tortuga-bay' THEN array_append(array_remove(slug_history, 'tortuga-bay-puntacana'), 'tortuga-bay-puntacana') ELSE slug_history END,
       updated_at = now()
 WHERE slug IN ('tortuga-bay', 'tortuga-bay-puntacana') AND deleted_at IS NULL AND name <> 'Tortuga Bay Puntacana Resort & Club';

-- 2. Parque Nacional Los Haitises: la superficie legal del área protegida es 600.82 km² (Ley 202-04); 1,600 km²
--    es la zona cárstica completa, no el parque. Había dos filas: se conserva la de 601 km², que hereda la ficha
--    completa y la dirección de la otra para que el sitio la reconozca, y la de 1,600 km² se retira.
UPDATE protected_areas k
   SET extras = d.extras || jsonb_build_object('superficie', '601 km²')
  FROM protected_areas d
 WHERE k.slug = 'los-haitises' AND k.deleted_at IS NULL AND d.slug = 'parque-nacional-los-haitises' AND d.deleted_at IS NULL AND d.extras <> '{}'::jsonb;

UPDATE protected_areas SET deleted_at = now(), status = 'archived', slug = 'parque-nacional-los-haitises-duplicado', updated_at = now()
 WHERE slug = 'parque-nacional-los-haitises' AND deleted_at IS NULL
   AND EXISTS (SELECT 1 FROM protected_areas k WHERE k.slug = 'los-haitises' AND k.deleted_at IS NULL);

UPDATE protected_areas
   SET slug = 'parque-nacional-los-haitises', slug_history = array_append(array_remove(slug_history, 'los-haitises'), 'los-haitises'), updated_at = now()
 WHERE slug = 'los-haitises' AND deleted_at IS NULL
   AND NOT EXISTS (SELECT 1 FROM protected_areas o WHERE o.slug = 'parque-nacional-los-haitises');

-- Donde sólo existía la fila de 1,600 km², se corrige la cifra.
UPDATE protected_areas
   SET size = '601 km²', extras = CASE WHEN extras ? 'superficie' THEN jsonb_set(extras, '{superficie}', '"601 km²"') ELSE extras END, updated_at = now()
 WHERE slug = 'parque-nacional-los-haitises' AND deleted_at IS NULL AND (size = '1,600 km²' OR extras->>'superficie' = '1,600 km²');

-- 3. Restaurantes sin foto. De Jalao y El Conuco no hay fotografía propia: reciben una imagen de referencia de
--    cocina dominicana, anotada como tal en la ficha (`imageNote`) para sustituirla cuando exista la real.
--    (La de Pat'e Palo sí existe en los archivos del sitio: la rellena `db:import-static`.)
UPDATE restaurants
   SET image_url = v.url,
       extras = extras || jsonb_build_object('imageUrl', v.url, 'imageNote', 'Imagen de referencia de cocina dominicana; pendiente la fotografía del establecimiento.'),
       updated_at = now()
  FROM (VALUES
    ('jalao', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&h=800&fit=crop&q=80'),
    ('el-conuco', 'https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&h=800&fit=crop&q=80')
  ) AS v(slug, url)
 WHERE restaurants.slug = v.slug AND restaurants.image_url IS NULL;
