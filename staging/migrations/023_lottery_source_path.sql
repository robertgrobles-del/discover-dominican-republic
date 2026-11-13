-- Página propia del sorteo en enloteria.com, para los que no salen en la página general de resultados.
ALTER TABLE lottery_draws ADD COLUMN source_path TEXT;

UPDATE lottery_draws SET source_name = 'Loto', source_path = 'resultados-loto' WHERE id = 'draw-lei-loto';
UPDATE lottery_draws SET source_name = 'Super Kino TV', source_path = 'resultados-super-kino-tv', number_of_balls = 20 WHERE id = 'draw-lei-superkino';
UPDATE lottery_draws SET source_name = 'Loto Real', source_path = 'resultados-loto-real', draw_time = '20:00' WHERE id = 'draw-rea-loto';
UPDATE lottery_draws SET source_name = 'MegaChance', source_path = 'resultados-megachance' WHERE id = 'draw-lot-megachances';
