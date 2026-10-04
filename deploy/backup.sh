#!/usr/bin/env bash
# Respaldo de la base del entorno indicado. Uso: ./backup.sh <prod|staging>
# Programarlo a diario con cron. Con BACKUP_S3_BUCKET definido, además cifra el volcado y lo sube a un bucket
# externo: un respaldo en el mismo disco no protege de perder el servidor. Si algo falla, avisa al canal del
# equipo (ALERT_WEBHOOK_URL) y termina con error.
# Restaurar:  docker compose -p descubre-<entorno> ... exec -T postgres pg_restore --no-owner --clean --if-exists -U descubre -d descubre_rd < archivo.dump
set -euo pipefail

cd "$(dirname "$0")"
ENVIRONMENT="${1:?Indica el entorno: prod o staging}"
ENV_FILE=".env.$ENVIRONMENT"
[ -f "$ENV_FILE" ] || { echo "Falta $ENV_FILE" >&2; exit 2; }
# shellcheck source=deploy/lib.sh
. ./lib.sh
BACKUP_DIR="$(value BACKUP_DIR)"; BACKUP_DIR="${BACKUP_DIR:-/srv/descubre/backups}/$ENVIRONMENT"
KEEP_DAYS="$(value BACKUP_KEEP_DAYS)"; KEEP_DAYS="${KEEP_DAYS:-14}"

STEP="preparar el respaldo"
trap 'notify "🔴 Respaldo de $ENVIRONMENT fallido al $STEP ($(hostname)). Revisa el servidor: hoy no hay copia nueva."' ERR

mkdir -p "$BACKUP_DIR"
FILE="$BACKUP_DIR/descubre_rd-$(date -u +%Y%m%dT%H%M%SZ).dump"
STEP="volcar la base"
docker compose -p "descubre-$ENVIRONMENT" --env-file "$ENV_FILE" -f docker-compose.vps.yml exec -T postgres pg_dump -U descubre -d descubre_rd --format=custom > "$FILE.partial"
# Un volcado vacío o cortado no debe pasar por bueno.
if [ ! -s "$FILE.partial" ]; then rm -f "$FILE.partial"; echo "El respaldo quedó vacío" >&2; false; fi
mv "$FILE.partial" "$FILE"
echo "Respaldo creado: $FILE"

if [ -n "$(value BACKUP_S3_BUCKET)" ]; then
  STEP="subir la copia externa"
  offsite_upload "$FILE"
else
  echo "Sin copia externa (BACKUP_S3_BUCKET vacío): este respaldo sólo existe en este servidor." >&2
fi

# La rotación local va al final: si la copia de hoy falla, las anteriores siguen ahí.
find "$BACKUP_DIR" -name '*.dump' -mtime "+$KEEP_DAYS" -delete
