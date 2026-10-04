#!/usr/bin/env bash
# Funciones comunes de los scripts de operación (backup.sh, watchdog.sh). Se incluye con `source`; espera
# ENV_FILE con la ruta del archivo de variables del entorno.

# Valor de una variable del archivo de entorno (vacío si no está).
value() { grep -E "^$1=" "$ENV_FILE" 2>/dev/null | head -n1 | cut -d= -f2- || true; }

# Texto seguro para ir dentro de una cadena JSON.
json_escape() { printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' | tr '\n' ' '; }

# Aviso al canal del equipo (ALERT_WEBHOOK_URL: webhook entrante de Slack o Discord). Sin webhook no hace nada,
# y un aviso que no sale nunca hace fallar al script que lo envía.
notify() {
  local url text
  url="$(value ALERT_WEBHOOK_URL)"
  [ -n "$url" ] || return 0
  text="$(json_escape "$1")"
  case "$url" in
    *discord.com/*|*discordapp.com/*) body="{\"content\":\"$text\"}" ;;
    *) body="{\"text\":\"$text\"}" ;;
  esac
  curl -fsS --max-time 10 -H 'Content-Type: application/json' -d "$body" "$url" >/dev/null 2>&1 || true
}

# Cifra un archivo y lo sube, con su huella SHA-256, a un almacenamiento compatible con S3 (AWS S3, R2, Spaces,
# B2, MinIO, o Google Cloud Storage con claves HMAC). Mismo formato que `npm run db:backup -- --upload`.
#   offsite_upload <archivo>
# Variables del entorno: BACKUP_S3_BUCKET, BACKUP_S3_ACCESS_KEY_ID, BACKUP_S3_SECRET_ACCESS_KEY,
# BACKUP_ENCRYPTION_KEY y, opcionales, BACKUP_S3_ENDPOINT, BACKUP_S3_REGION, BACKUP_S3_PREFIX.
# Descifrar: BACKUP_ENCRYPTION_KEY=… openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -in x.dump.enc -out x.dump -pass env:BACKUP_ENCRYPTION_KEY
offsite_upload() {
  local file="$1" bucket access secret region endpoint prefix name encrypted url
  bucket="$(value BACKUP_S3_BUCKET)"
  access="$(value BACKUP_S3_ACCESS_KEY_ID)"; secret="$(value BACKUP_S3_SECRET_ACCESS_KEY)"
  BACKUP_ENCRYPTION_KEY="$(value BACKUP_ENCRYPTION_KEY)"
  if [ -z "$access" ] || [ -z "$secret" ] || [ "${#BACKUP_ENCRYPTION_KEY}" -lt 24 ]; then
    echo "Copia externa a medio configurar: hacen falta BACKUP_S3_ACCESS_KEY_ID, BACKUP_S3_SECRET_ACCESS_KEY y BACKUP_ENCRYPTION_KEY (24 caracteres o más)" >&2
    return 1
  fi
  region="$(value BACKUP_S3_REGION)"; region="${region:-us-east-1}"
  endpoint="$(value BACKUP_S3_ENDPOINT)"; endpoint="${endpoint:-https://s3.$region.amazonaws.com}"; endpoint="${endpoint%/}"
  prefix="$(value BACKUP_S3_PREFIX)"; prefix="${prefix:-backups/}"; prefix="${prefix#/}"; prefix="${prefix%/}/"
  name="$(basename "$file").enc"
  encrypted="$file.enc"
  url="$endpoint/$bucket/$prefix$name"

  # La clave viaja por el entorno del proceso, no por sus argumentos: no aparece en `ps`.
  export BACKUP_ENCRYPTION_KEY
  openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt -in "$file" -out "$encrypted" -pass env:BACKUP_ENCRYPTION_KEY || { rm -f "$encrypted"; return 1; }
  sha256sum "$encrypted" | sed "s|  .*|  $name|" > "$encrypted.sha256"
  local ok=0
  # Las credenciales van por un archivo de configuración de curl con permisos cerrados, tampoco por argumentos.
  local cfg; cfg="$(mktemp)"; chmod 600 "$cfg"
  printf 'user = "%s:%s"\naws-sigv4 = "aws:amz:%s:s3"\n' "$access" "$secret" "$region" > "$cfg"
  curl -fsS --config "$cfg" --max-time 3600 -H 'Content-Type: application/octet-stream' -T "$encrypted" "$url" >/dev/null \
    && curl -fsS --config "$cfg" --max-time 60 -H 'Content-Type: text/plain' -T "$encrypted.sha256" "$url.sha256" >/dev/null \
    || ok=1
  rm -f "$cfg" "$encrypted" "$encrypted.sha256"
  unset BACKUP_ENCRYPTION_KEY
  [ "$ok" -eq 0 ] || { echo "No se pudo subir la copia a $bucket/$prefix$name" >&2; return 1; }
  echo "Copia externa cifrada: $bucket/$prefix$name"
}
