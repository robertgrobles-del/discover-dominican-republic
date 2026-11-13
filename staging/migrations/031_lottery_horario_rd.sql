-- Todos los horarios se muestran en hora de República Dominicana, también los de loterías de otros países.
-- RD no cambia de hora; EE. UU. sí: de noviembre a marzo sus sorteos salen en RD una hora más tarde que en
-- su hora del Este, y en verano a la misma hora. Se escribe la de invierno y se avisa del cambio.
UPDATE lottery_draws SET schedule_description = 'Martes y viernes 12:00 AM, hora de RD (ya de miércoles y sábado). En verano de EE. UU., 11:00 PM' WHERE id = 'draw-us-megamillions';
UPDATE lottery_draws SET schedule_description = 'Lunes, miércoles y sábado 11:59 PM, hora de RD. En verano de EE. UU., 10:59 PM' WHERE id = 'draw-us-powerball';
UPDATE lottery_draws SET schedule_description = 'Todos los días 2:30 PM, hora de RD. En verano de EE. UU., 1:30 PM' WHERE id IN ('draw-fl-pick-2-dia', 'draw-fl-pick-3-dia', 'draw-fl-pick-4-dia', 'draw-fl-pick-5-dia');
UPDATE lottery_draws SET schedule_description = 'Todos los días 10:45 PM, hora de RD. En verano de EE. UU., 9:45 PM' WHERE id IN ('draw-fl-pick-2-noche', 'draw-fl-pick-3-noche', 'draw-fl-pick-4-noche', 'draw-fl-pick-5-noche');
UPDATE lottery_draws SET schedule_description = 'Todos los días 2:05 PM, hora de RD. En verano de EE. UU., 1:05 PM' WHERE id = 'draw-fl-fantasy5-dia';
UPDATE lottery_draws SET schedule_description = 'Todos los días 12:15 AM, hora de RD (ya del día siguiente). En verano de EE. UU., 11:15 PM' WHERE id = 'draw-fl-fantasy5-noche';
UPDATE lottery_draws SET schedule_description = 'Miércoles y sábado 12:15 AM, hora de RD (ya de jueves y domingo). En verano de EE. UU., 11:15 PM' WHERE id = 'draw-fl-lotto';
UPDATE lottery_draws SET schedule_description = 'Martes y viernes 12:15 AM, hora de RD (ya de miércoles y sábado). En verano de EE. UU., 11:15 PM' WHERE id = 'draw-fl-jackpot-triple';
