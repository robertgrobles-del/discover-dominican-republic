#!/usr/bin/env bash
# Respaldo de la base del entorno indicado. Uso: ./backup.sh <prod|staging>
# Programarlo a diario con cron y copiar la carpeta fuera del VPS: un respaldo en el mismo disco no protege de perderlo.
# Restaurar:  docker compose -p descubre-<entorno> ... exec -T postgres pg_restore --no-owner --clean --if-exists -U descubre -d descubre_rd < archivo.dump
set -euo pipefail

cd "$(dirname "$0")"
ENVIRONMENT="${1:?Indica el entorno: prod o staging}"
ENV_FILE=".env.$ENVIRONMENT"
[ -f "$ENV_FILE" ] || { echo "Falta $ENV_FILE" >&2; exit 2; }
value() { grep -E "^$1=" "$ENV_FILE" | cut -d= -f2-; }
BACKUP_DIR="$(value BACKUP_DIR)"; BACKUP_DIR="${BACKUP_DIR:-/srv/descubre/backups}/$ENVIRONMENT"
KEEP_DAYS="$(value BACKUP_KEEP_DAYS)"; KEEP_DAYS="${KEEP_DAYS:-14}"

mkdir -p "$BACKUP_DIR"
FILE="$BACKUP_DIR/descubre_rd-$(date -u +%Y%m%dT%H%M%SZ).dump"
docker compose -p "descubre-$ENVIRONMENT" --env-file "$ENV_FILE" -f docker-compose.vps.yml exec -T postgres pg_dump -U descubre -d descubre_rd --format=custom > "$FILE.partial"
# Un volcado vacío o cortado no debe pasar por bueno.
[ -s "$FILE.partial" ] || { rm -f "$FILE.partial"; echo "El respaldo quedó vacío" >&2; exit 1; }
mv "$FILE.partial" "$FILE"
find "$BACKUP_DIR" -name '*.dump' -mtime "+$KEEP_DAYS" -delete
echo "Respaldo creado: $FILE"
