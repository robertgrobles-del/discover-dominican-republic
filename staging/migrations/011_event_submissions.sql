-- Eventos enviados por el público desde «Registrar mi evento»: entran como borrador para revisarlos.
ALTER TABLE events ADD COLUMN submitter_email TEXT;
ALTER TABLE events ADD COLUMN submitter_phone TEXT;
ALTER TABLE events ADD COLUMN ip_hash TEXT;
