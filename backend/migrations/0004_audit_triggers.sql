-- Auditoría automática (equivalente a los triggers trg_audit_* de MySQL) con una única función genérica.

CREATE OR REPLACE FUNCTION log_admin_activity() RETURNS trigger AS $$
DECLARE
  rid uuid;
BEGIN
  rid := COALESCE((to_jsonb(NEW) ->> 'id'), (to_jsonb(OLD) ->> 'id'))::uuid;
  IF TG_OP = 'INSERT' THEN
    INSERT INTO admin_activity_logs (action_type, entity_name, entity_id, new_data) VALUES ('INSERT', TG_TABLE_NAME, rid, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO admin_activity_logs (action_type, entity_name, entity_id, old_data, new_data) VALUES ('UPDATE', TG_TABLE_NAME, rid, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSE
    INSERT INTO admin_activity_logs (action_type, entity_name, entity_id, old_data) VALUES ('DELETE', TG_TABLE_NAME, rid, to_jsonb(OLD));
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['reservations', 'partner_profiles', 'event_tickets', 'ambassadors'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_audit ON %I', t);
    EXECUTE format('CREATE TRIGGER trg_audit AFTER INSERT OR UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION log_admin_activity()', t);
  END LOOP;
END $$;
