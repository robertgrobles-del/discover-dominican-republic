-- Cadena de hash encadenada sobre la bitácora de auditoría (B8.76): cada fila nueva firma su contenido
-- (tal cual queda almacenado) junto con el hash de la anterior, así que alterar o borrar una entrada rompe
-- la cadena y el verificador (GET /admin/audit/verify, gauge app_audit_chain_broken en /metrics) lo detecta.
-- La clave HMAC es APP_SECRET, inyectada por el proceso: nunca vive en la base de datos.
-- Las filas históricas (hash IS NULL) quedan fuera; la cadena empieza en la primera entrada escrita tras esta migración.
ALTER TABLE audit_log ADD COLUMN prev_hash text;
ALTER TABLE audit_log ADD COLUMN hash text;

-- Sólo anexado: ninguna fila se puede editar ni borrar (ni truncar la tabla), ni siquiera desde SQL directo.
CREATE FUNCTION audit_log_append_only() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_log es de sólo anexado: % prohibido', TG_OP;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_append_only
  BEFORE UPDATE OR DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION audit_log_append_only();

CREATE TRIGGER audit_log_no_truncate
  BEFORE TRUNCATE ON audit_log
  FOR EACH STATEMENT EXECUTE FUNCTION audit_log_append_only();
