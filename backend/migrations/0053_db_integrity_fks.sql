-- B4.31-34 (Plan Maestro): integridad referencial e invariantes concurrentes del dominio transaccional.
-- Los user_id VARCHAR(64) pasan a uuid con FK real; los abonos de lealtad y las membresías activas
-- ganan índices únicos que cierran las carreras que el código ya previene por convención.

-- Pedidos de tienda: el pedido se conserva (anónimo) si se borra la cuenta.
ALTER TABLE store_orders
  ADD CONSTRAINT fk_store_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Membresías: usuario real, una sola membresía ACTIVE por persona.
ALTER TABLE user_memberships ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE user_memberships
  ADD CONSTRAINT fk_user_memberships_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- El servicio cancela la membresía anterior al suscribir; este índice único parcial hace que la
-- carrera de dos suscripciones simultáneas deje una sola ACTIVE aunque el servicio falle.
WITH ranked AS (
  SELECT id, row_number() OVER (PARTITION BY user_id ORDER BY created_at DESC, id DESC) AS rn
  FROM user_memberships WHERE status = 'ACTIVE'
)
UPDATE user_memberships m SET status = 'CANCELLED', updated_at = now()
FROM ranked r WHERE m.id = r.id AND r.rn > 1;
CREATE UNIQUE INDEX uq_user_memberships_active ON user_memberships (user_id) WHERE status = 'ACTIVE';

-- Ledger de puntos: usuario real con FK; un abono lógico (usuario, motivo, referencia) no se duplica
-- ante reintentos: la fila repetida choca con el índice y el servicio la trata como ya acreditada.
ALTER TABLE loyalty_points_ledger ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE loyalty_points_ledger
  ADD CONSTRAINT fk_loyalty_ledger_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

DELETE FROM loyalty_points_ledger a
  USING loyalty_points_ledger b
 WHERE a.user_id = b.user_id AND a.reason = b.reason AND a.reference_id = b.reference_id
   AND a.reference_id IS NOT NULL AND a.id > b.id;
CREATE UNIQUE INDEX uq_loyalty_ledger_reference
  ON loyalty_points_ledger (user_id, reason, reference_id) WHERE reference_id IS NOT NULL;

-- Entradas de eventos: usuario real con FK. event_id queda libre a propósito: no hay tabla canónica
-- de eventos en vivo todavía (los ids llegan del canal de venta).
ALTER TABLE live_event_tickets ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE live_event_tickets
  ADD CONSTRAINT fk_event_tickets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
