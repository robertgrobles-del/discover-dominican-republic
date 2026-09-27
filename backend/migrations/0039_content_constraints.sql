-- El catálogo real de áreas protegidas incluye más categorías que las tres originales (monumentos naturales, refugios, paisajes protegidos).
ALTER TABLE protected_areas DROP CONSTRAINT IF EXISTS protected_areas_category_check;
ALTER TABLE protected_areas ADD CONSTRAINT protected_areas_category_check
  CHECK (category IN ('Parque Nacional', 'Santuario', 'Reserva Científica', 'Monumento Natural', 'Refugio de Vida Silvestre', 'Paisaje Protegido'));
