-- Plan de 150 mejoras, punto 26: espacio nativo dentro de los resultados del directorio.
-- La creatividad se muestra como una tarjeta más de la lista, siempre con la etiqueta "Patrocinado".
INSERT INTO sponsorship_slots (id, name, slot_type, max_active_creatives, recommended_dimensions)
VALUES ('directory_native', 'Tarjeta nativa en resultados del directorio', 'sponsored_content', 3, '800x500')
ON CONFLICT (id) DO NOTHING;
