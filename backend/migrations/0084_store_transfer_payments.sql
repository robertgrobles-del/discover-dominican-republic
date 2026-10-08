-- Pedidos de la tienda pagados por depósito o transferencia bancaria (decisión B9): el pedido se crea sin cobro
-- en línea, reserva el stock durante un plazo y un administrador confirma el pago cuando ve el depósito.

ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'card';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'store_orders_payment_method_chk') THEN
    ALTER TABLE store_orders ADD CONSTRAINT store_orders_payment_method_chk CHECK (payment_method IN ('card', 'transfer'));
  END IF;
END $$;

-- Hasta cuándo se guarda el stock de un pedido por transferencia sin confirmar. Nulo en los pedidos con tarjeta.
ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS transfer_expires_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_store_orders_transfer_pending ON store_orders (transfer_expires_at)
  WHERE payment_method = 'transfer' AND status = 'pending';
