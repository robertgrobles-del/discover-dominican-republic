-- Historial inmutable de cambios en planes comerciales y precios (mejora 77 del plan maestro).
-- Cada alta, cambio o baja de un plan deja una fila con el estado anterior y el nuevo. La tabla es de
-- sólo anexado: ni la aplicación ni SQL directo pueden editar o borrar lo ya registrado.
CREATE TABLE IF NOT EXISTS pricing_history (
  id bigserial PRIMARY KEY,
  source_table text NOT NULL,
  record_id text NOT NULL,
  operation text NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values jsonb,
  new_values jsonb,
  changed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pricing_history_record ON pricing_history (source_table, record_id, changed_at DESC);

CREATE OR REPLACE FUNCTION pricing_history_append_only() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'pricing_history es de sólo anexado: % prohibido', TG_OP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pricing_history_append_only ON pricing_history;
CREATE TRIGGER pricing_history_append_only
  BEFORE UPDATE OR DELETE OR TRUNCATE ON pricing_history
  FOR EACH STATEMENT EXECUTE FUNCTION pricing_history_append_only();

-- Registra el cambio sólo si varía algo distinto de `updated_at`.
CREATE OR REPLACE FUNCTION record_pricing_change() RETURNS trigger AS $$
DECLARE
  before jsonb := CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) - 'updated_at' END;
  after jsonb := CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) - 'updated_at' END;
BEGIN
  IF TG_OP = 'UPDATE' AND before = after THEN RETURN NEW; END IF;
  INSERT INTO pricing_history (source_table, record_id, operation, old_values, new_values)
  VALUES (TG_TABLE_NAME, coalesce(after ->> 'id', before ->> 'id'), TG_OP, before, after);
  RETURN coalesce(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS membership_plans_pricing_history ON membership_plans;
CREATE TRIGGER membership_plans_pricing_history
  AFTER INSERT OR UPDATE OR DELETE ON membership_plans
  FOR EACH ROW EXECUTE FUNCTION record_pricing_change();
