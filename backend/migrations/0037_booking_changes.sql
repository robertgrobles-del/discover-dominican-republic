-- Cambio de fecha de una reserva (docs §5.8): cuántas veces se movió y la fecha original.
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS date_changes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS original_date date;
