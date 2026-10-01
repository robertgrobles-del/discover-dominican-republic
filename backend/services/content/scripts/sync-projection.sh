#!/bin/sh
# Proyección de lectura del servicio de contenido: copia esquema y datos de las tablas del catálogo
# desde la base del monolito a la base propia del servicio y compara conteos.
#
# Sin argumentos sólo inspecciona. `--apply` reconstruye el destino por completo (es idempotente).
# El monolito sigue siendo el único escritor: tras cada publicación hay que volver a sincronizar.
# Requiere pg_dump/psql de versión >= a la del servidor de origen.
set -eu

MODE="${1:-inspect}"
case "$MODE" in
  inspect|--apply|--verify) ;;
  --help) echo "Uso: sync-projection.sh [--apply|--verify]"; echo "Requiere CONTENT_SOURCE_DATABASE_URL y CONTENT_DATABASE_URL."; exit 0 ;;
  *) echo "Argumento no reconocido: $MODE" >&2; exit 2 ;;
esac

: "${CONTENT_SOURCE_DATABASE_URL:?CONTENT_SOURCE_DATABASE_URL es obligatoria}"
: "${CONTENT_DATABASE_URL:?CONTENT_DATABASE_URL es obligatoria}"
[ "$CONTENT_SOURCE_DATABASE_URL" != "$CONTENT_DATABASE_URL" ] || { echo "Origen y destino no pueden ser la misma base" >&2; exit 2; }

HERE="$(dirname "$0")"
TABLES="$(grep -v '^#' "$HERE/../content-tables.txt" | tr -d '\r' | grep -v '^$')"
CSV="$(echo "$TABLES" | paste -sd, -)"
count() { psql "$1" -v ON_ERROR_STOP=1 -Atqc "SELECT count(*) FROM public.\"$2\"" 2>/dev/null || echo "-"; }

if [ "$MODE" = "--apply" ]; then
  if [ -n "${CONTENT_SYNC_CONFIRM_DATABASE:-}" ]; then
    TARGET_DB="$(psql "$CONTENT_DATABASE_URL" -Atqc 'SELECT current_database()')"
    [ "$TARGET_DB" = "$CONTENT_SYNC_CONFIRM_DATABASE" ] || { echo "El destino es '$TARGET_DB', no '$CONTENT_SYNC_CONFIRM_DATABASE'" >&2; exit 2; }
  else
    echo "Define CONTENT_SYNC_CONFIRM_DATABASE con el nombre exacto de la base destino: --apply la reconstruye" >&2; exit 2
  fi

  echo "1/4 Reconstruyendo el esquema destino"
  psql "$CONTENT_DATABASE_URL" -v ON_ERROR_STOP=1 -qc "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;"
  pg_dump --schema-only --no-owner --no-privileges "$CONTENT_SOURCE_DATABASE_URL" | psql "$CONTENT_DATABASE_URL" -v ON_ERROR_STOP=1 -q

  echo "2/4 Retirando tablas que no pertenecen al catálogo"
  psql "$CONTENT_DATABASE_URL" -v ON_ERROR_STOP=1 -q -v keep="$CSV" <<'SQL'
SELECT format('DROP TABLE IF EXISTS public.%I CASCADE', tablename)
  FROM pg_tables
 WHERE schemaname = 'public' AND tablename <> ALL (string_to_array(:'keep', ','))
\gexec
SQL

  echo "3/4 Copiando datos"
  DUMP_ARGS=""
  for t in $TABLES; do DUMP_ARGS="$DUMP_ARGS --table=public.$t"; done
  # shellcheck disable=SC2086
  pg_dump --data-only --no-owner $DUMP_ARGS "$CONTENT_SOURCE_DATABASE_URL" \
    | PGOPTIONS="-c session_replication_role=replica" psql "$CONTENT_DATABASE_URL" -v ON_ERROR_STOP=1 -q
  psql "$CONTENT_DATABASE_URL" -v ON_ERROR_STOP=1 -qc "ANALYZE"
  echo "4/4 Verificando"
fi

FAILED=0
printf '%-28s %10s %10s\n' "tabla" "origen" "destino"
for t in $TABLES; do
  S="$(count "$CONTENT_SOURCE_DATABASE_URL" "$t")"
  D="$(count "$CONTENT_DATABASE_URL" "$t")"
  MARK=""
  [ "$S" = "$D" ] && [ "$S" != "-" ] || { MARK=" <- difiere"; FAILED=1; }
  printf '%-28s %10s %10s%s\n' "$t" "$S" "$D" "$MARK"
done

if [ "$MODE" = "inspect" ]; then exit 0; fi
[ "$FAILED" = 0 ] || { echo "La proyección no coincide con el origen" >&2; exit 1; }
echo "Proyección de contenido conciliada"
