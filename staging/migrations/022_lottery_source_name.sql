-- Nombre exacto del sorteo en la fuente (enloteria.com). El sincronizador empareja por este nombre;
-- sin él, por `name`. Se edita en el panel (Loterías) al crear o corregir un sorteo.
ALTER TABLE lottery_draws ADD COLUMN source_name TEXT;

UPDATE lottery_draws SET source_name = 'Leidsa' WHERE id = 'draw-lei-quiniela';
UPDATE lottery_draws SET source_name = 'Nacional Gana Más' WHERE id = 'draw-nac-ganamas';
UPDATE lottery_draws SET source_name = 'Nacional Noche' WHERE id = 'draw-nac-noche';
UPDATE lottery_draws SET source_name = 'Loteka' WHERE id = 'draw-lot-quiniela';
UPDATE lottery_draws SET source_name = 'Real' WHERE id = 'draw-rea-quiniela';
UPDATE lottery_draws SET source_name = 'La Primera' WHERE id = 'draw-pri-mediodia';
UPDATE lottery_draws SET source_name = 'La Primera Noche' WHERE id = 'draw-pri-noche';
UPDATE lottery_draws SET source_name = 'La Suerte' WHERE id = 'draw-sue-mediodia';
UPDATE lottery_draws SET source_name = 'La Suerte 6PM' WHERE id = 'draw-sue-tarde';
UPDATE lottery_draws SET source_name = 'King Lottery Día' WHERE id = 'draw-king-mediodia';
UPDATE lottery_draws SET source_name = 'King Lottery Noche' WHERE id = 'draw-king-noche';
UPDATE lottery_draws SET source_name = 'New York Tarde' WHERE id = 'draw-ny-tarde';
UPDATE lottery_draws SET source_name = 'New York Noche' WHERE id = 'draw-ny-noche';
UPDATE lottery_draws SET source_name = 'Florida Tarde' WHERE id = 'draw-fl-dia';
UPDATE lottery_draws SET source_name = 'Florida Noche' WHERE id = 'draw-fl-noche';
UPDATE lottery_draws SET source_name = 'Anguilla 10AM' WHERE id = 'draw-ang-10am';
UPDATE lottery_draws SET source_name = 'Anguilla 1PM' WHERE id = 'draw-ang-1pm';
UPDATE lottery_draws SET source_name = 'Anguilla 6PM' WHERE id = 'draw-ang-6pm';
UPDATE lottery_draws SET source_name = 'Anguilla 9PM' WHERE id = 'draw-ang-9pm';

-- El antiguo sincronizador guardaba números fijos inventados cuando no conseguía datos, y no se pueden
-- distinguir de los reales: se vacía la tabla. El histórico se recarga desde el panel (Loterías → Sincronizar).
DELETE FROM lottery_results;
