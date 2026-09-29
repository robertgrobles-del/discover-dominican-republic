-- Fase 10.36: función uuidv7() disponible para tablas nuevas.
-- UUIDv7 codifica el timestamp en los primeros 48 bits: a diferencia de gen_random_uuid() (v4, totalmente
-- aleatorio), los valores son ordenables por fecha de creación — los índices B-Tree de las PK no se fragmentan
-- con cada INSERT (v4 inserta en una posición aleatoria del árbol; v7 siempre al final, como un id incremental).
--
-- Deliberadamente NO se tocan las 56 columnas existentes que ya usan gen_random_uuid(): cambiar el DEFAULT de una
-- tabla en uso no reordena las filas ya insertadas (sus ids v4 siguen siendo v4 para siempre), así que sólo tendría
-- sentido como parte de una migración de datos completa — fuera de alcance de este ítem. Esto deja la función lista
-- para que las tablas NUEVAS la usen desde el primer día: `id uuid PRIMARY KEY DEFAULT uuidv7()`.
--
-- Implementación en SQL puro (sin extensión: pgcrypto ya está disponible por gen_random_uuid(), no hace falta nada
-- más). Referencia: RFC 9562 §5.7 (variante y versión) — versión (0111) en el nibble alto del 7º byte, variante
-- (10) en los dos bits altos del 9º byte; el resto (74 bits) es aleatorio.
CREATE OR REPLACE FUNCTION uuidv7() RETURNS uuid AS $$
DECLARE
  unix_ts_ms bytea := substring(int8send(floor(extract(epoch FROM clock_timestamp()) * 1000)::bigint) FROM 3 FOR 6);
  rand_bytes bytea := gen_random_bytes(10);
BEGIN
  -- Byte 6 (0-index): versión 7 en el nibble alto, 4 bits aleatorios en el bajo.
  rand_bytes := set_byte(rand_bytes, 0, (get_byte(rand_bytes, 0) & 15) | 112);
  -- Byte 8: variante RFC en los dos bits altos, 6 bits aleatorios en el resto.
  rand_bytes := set_byte(rand_bytes, 2, (get_byte(rand_bytes, 2) & 63) | 128);
  RETURN encode(unix_ts_ms || rand_bytes, 'hex')::uuid;
END;
$$ LANGUAGE plpgsql VOLATILE;

COMMENT ON FUNCTION uuidv7() IS 'UUIDv7 (RFC 9562): ordenable por tiempo de creación. Úsala como DEFAULT en tablas nuevas; las existentes se quedan en gen_random_uuid() (v4) — ver nota en la migración 0052.';
