#!/usr/bin/env bash
# Vigilante de la API. Uso: ./watchdog.sh <prod|staging>   (cron, cada minuto o cada cinco)
#
# El monitoreo de errores vive dentro de la API, así que no puede avisar de lo único que la deja muda: que no
# arranque, que el contenedor esté caído o que el proxy no responda. Este script lo comprueba desde fuera del
# proceso, contra la dirección pública, y avisa al canal del equipo (ALERT_WEBHOOK_URL) cuando cae y cuando
# vuelve. No repite el aviso en cada ejecución: uno al caer, un recordatorio cada 30 minutos y uno al recuperarse.
#
# Corre en el mismo servidor: no detecta que el servidor entero esté apagado o sin red. Para eso hace falta
# además un monitor externo (el de Sentry, UptimeRobot, etc.) apuntando a la misma dirección.
set -uo pipefail

cd "$(dirname "$0")"
ENVIRONMENT="${1:?Indica el entorno: prod o staging}"
ENV_FILE=".env.$ENVIRONMENT"
[ -f "$ENV_FILE" ] || { echo "Falta $ENV_FILE" >&2; exit 2; }
# shellcheck source=deploy/lib.sh
. ./lib.sh

URL="${WATCHDOG_URL:-https://$(value SITE_DOMAIN)/api/v1/health/ready}"
STATE="${WATCHDOG_STATE_DIR:-/var/tmp}/descubre-watchdog-$ENVIRONMENT"
REMIND_SECONDS=1800
NOW="$(date +%s)"

# Tres intentos espaciados: un reinicio de despliegue o un corte de un segundo no es una caída.
ok=1
for _ in 1 2 3; do
  if curl -fsS --max-time 10 -o /dev/null "$URL"; then ok=0; break; fi
  sleep "${WATCHDOG_RETRY_SECONDS:-10}"
done

if [ "$ok" -eq 0 ]; then
  if [ -f "$STATE" ]; then
    since="$(cut -d' ' -f1 "$STATE")"
    rm -f "$STATE"
    notify "🟢 La API de $ENVIRONMENT volvió a responder tras $(( (NOW - since) / 60 )) min ($URL)."
  fi
  exit 0
fi

if [ ! -f "$STATE" ]; then
  echo "$NOW $NOW" > "$STATE"
  notify "🔴 La API de $ENVIRONMENT no responde ($URL). Servidor: $(hostname)."
else
  read -r since last < "$STATE"
  if [ $(( NOW - last )) -ge "$REMIND_SECONDS" ]; then
    echo "$since $NOW" > "$STATE"
    notify "🔴 La API de $ENVIRONMENT sigue sin responder desde hace $(( (NOW - since) / 60 )) min ($URL)."
  fi
fi
exit 1
