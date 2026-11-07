-- Tipo de lugar del evento (playa, campo de golf, carretera, parque…), elegido del catálogo de recintos o a mano.
ALTER TABLE events ADD COLUMN venue_type TEXT;
