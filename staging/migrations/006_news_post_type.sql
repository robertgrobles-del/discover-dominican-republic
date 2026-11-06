-- Tipo de publicación: noticia, reportaje, post invitado o patrocinado (con el nombre del patrocinador).
ALTER TABLE news ADD COLUMN post_type TEXT NOT NULL DEFAULT 'noticia';
ALTER TABLE news ADD COLUMN sponsor   TEXT;
