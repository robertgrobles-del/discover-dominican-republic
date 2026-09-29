-- Fase 10.38: ajuste de autovacuum para tablas de alta rotación.
-- Los valores por defecto de Postgres (vacuum al 20% de filas muertas, analyze al 10%) son demasiado laxos para tablas que
-- se escriben/borran constantemente: dejan crecer el "bloat" y las estadísticas del planificador se quedan desactualizadas.
-- Sólo cambia parámetros de mantenimiento de la tabla; no toca datos ni bloquea en exclusivo (ALTER TABLE ... SET es rápido).

-- rate_limits: cada request de una ruta limitada hace un UPSERT y se purga cada minuto (purgeRateLimits) — es la tabla con
-- más escrituras/borrados por segundo de todo el sistema.
ALTER TABLE rate_limits SET (
  autovacuum_vacuum_scale_factor = 0.02,
  autovacuum_analyze_scale_factor = 0.02,
  autovacuum_vacuum_cost_delay = 0
);

-- analytics_events: alto volumen de inserciones (hasta 50 eventos por lote) más el purgado periódico del rollup diario.
ALTER TABLE analytics_events SET (
  autovacuum_vacuum_scale_factor = 0.05,
  autovacuum_analyze_scale_factor = 0.05
);

-- sponsorship_events: mismo patrón de inserción alta (impresiones/clics) que analytics_events.
ALTER TABLE sponsorship_events SET (
  autovacuum_vacuum_scale_factor = 0.05,
  autovacuum_analyze_scale_factor = 0.05
);
