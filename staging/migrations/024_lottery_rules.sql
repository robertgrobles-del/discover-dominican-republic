-- Reglas de cada sorteo: cuántos números premiados salen (number_of_balls, regla fija: el sincronizador rechaza
-- un resultado con más o menos), su rango, y cómo se gana (how_to_play, texto editable en el panel).
-- Comprobado el 2026-11-12 con el histórico de enloteria.com y la prensa dominicana.
ALTER TABLE lottery_draws ADD COLUMN how_to_play TEXT;

UPDATE lottery_draws SET number_of_balls = 3, ball_range_min = 0, ball_range_max = 99,
  how_to_play = 'Salen 3 números del 00 al 99: primer, segundo y tercer premio. Quiniela: aciertas un número y cobras según el premio en que salga (referencia habitual: 60, 8 y 4 veces lo apostado). Palé: aciertas dos de los tres números. Tripleta: aciertas los tres. Los pagos exactos los fija cada lotería o banca.'
  WHERE id IN ('draw-lei-quiniela', 'draw-nac-ganamas', 'draw-nac-noche', 'draw-lot-quiniela', 'draw-rea-quiniela', 'draw-pri-mediodia', 'draw-pri-noche',
               'draw-sue-mediodia', 'draw-sue-tarde', 'draw-king-mediodia', 'draw-king-noche', 'draw-ny-tarde', 'draw-ny-noche', 'draw-fl-dia', 'draw-fl-noche',
               'draw-ang-10am', 'draw-ang-1pm', 'draw-ang-6pm', 'draw-ang-9pm');

UPDATE lottery_draws SET number_of_balls = 6, ball_range_min = 1, ball_range_max = 40,
  how_to_play = 'Eliges 6 números del 1 al 40. Con los 6 ganas el premio mayor acumulado y hay premios menores con 5, 4 y 3 aciertos. Loto Más y Súper Más añaden bolos adicionales que aumentan el premio mayor.'
  WHERE id = 'draw-lei-loto';

UPDATE lottery_draws SET number_of_balls = 20, ball_range_min = 1, ball_range_max = 84,
  how_to_play = 'Eliges hasta 10 números y en el sorteo salen 20. Se gana desde 5 aciertos y el premio mayor (hasta RD$25 millones) es acertar 10 de 10.'
  WHERE id = 'draw-lei-superkino';

UPDATE lottery_draws SET number_of_balls = 6, ball_range_min = 1, ball_range_max = 38,
  how_to_play = 'Eliges 6 números del 1 al 38. Con los 6 ganas el acumulado (se reparte si hay varios ganadores) y hay premios con 5, 4 y 3 aciertos.'
  WHERE id = 'draw-rea-loto';

UPDATE lottery_draws SET number_of_balls = 5, ball_range_min = 0, ball_range_max = 99,
  how_to_play = 'Salen 5 números del 00 al 99. Se gana desde 2 aciertos y el premio crece con 3 y 4 aciertos, según la jugada. Consulta la tabla vigente en Loteka.'
  WHERE id = 'draw-lot-megachances';

UPDATE lottery_draws SET number_of_balls = 5, ball_range_min = 0, ball_range_max = 99,
  how_to_play = 'Salen 5 números del 00 al 99. Consulta las jugadas y los pagos vigentes en la Lotería Nacional.'
  WHERE id = 'draw-nac-juegapega';

UPDATE lottery_draws SET number_of_balls = 3, ball_range_min = 0, ball_range_max = 99,
  how_to_play = 'Salen 3 números del 00 al 99. Consulta las jugadas y los pagos vigentes en LEIDSA.'
  WHERE id = 'draw-lei-pega3';
