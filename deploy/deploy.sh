#!/usr/bin/env bash
# Despliegue en el VPS. Uso:
#   ./deploy.sh <prod|staging> api                      Reconstruye la API, migra y la reinicia
#   ./deploy.sh <prod|staging> site <carpeta-dist>      Publica una versión del frontend de forma atómica
#   ./deploy.sh <prod|staging> rollback-site [versión]  Vuelve a la versión anterior (o a la indicada)
#   ./deploy.sh <prod|staging> status
#
# Sin validar todavía en un servidor real. Requiere Docker con el plugin compose y el archivo .env.<entorno>.
set -euo pipefail

cd "$(dirname "$0")"
ENVIRONMENT="${1:?Indica el entorno: prod o staging}"
ACTION="${2:?Indica la acción: api, site, rollback-site o status}"
case "$ENVIRONMENT" in prod|staging) ;; *) echo "Entorno desconocido: $ENVIRONMENT" >&2; exit 2 ;; esac

ENV_FILE=".env.$ENVIRONMENT"
[ -f "$ENV_FILE" ] || { echo "Falta $ENV_FILE (parte de .env.example)" >&2; exit 2; }
compose() { docker compose -p "descubre-$ENVIRONMENT" --env-file "$ENV_FILE" -f docker-compose.vps.yml "$@"; }
SITE_ROOT="$(grep -E '^SITE_ROOT=' "$ENV_FILE" | cut -d= -f2-)"; SITE_ROOT="${SITE_ROOT:-/srv/descubre/site}"
KEEP_RELEASES=5

case "$ACTION" in
  api)
    # Respaldo antes de migrar: una migración no se deshace sola.
    if compose ps --status running postgres | grep -q postgres; then ./backup.sh "$ENVIRONMENT"; fi
    compose build api
    # `migrate` corre primero; si falla, `api` no se reemplaza y sigue sirviendo la versión anterior.
    compose up -d --no-deps --wait postgres
    compose run --rm migrate
    # --wait devuelve error si la API nueva no pasa su comprobación de salud.
    compose up -d --no-deps --wait api
    compose up -d --wait proxy
    echo "API desplegada en $ENVIRONMENT."
    ;;
  site)
    DIST="${3:?Indica la carpeta con el build del frontend}"
    [ -f "$DIST/index.html" ] || { echo "$DIST no contiene index.html" >&2; exit 2; }
    RELEASE="$(date -u +%Y%m%d%H%M%S)"
    mkdir -p "$SITE_ROOT/releases/$RELEASE"
    cp -a "$DIST/." "$SITE_ROOT/releases/$RELEASE/"
    # Cambio atómico: se crea el enlace aparte y se renombra encima del actual.
    ln -sfn "releases/$RELEASE" "$SITE_ROOT/current.new"
    mv -Tf "$SITE_ROOT/current.new" "$SITE_ROOT/current"
    # Se conservan las últimas versiones para poder volver atrás.
    ls -1d "$SITE_ROOT"/releases/* | sort | head -n "-$KEEP_RELEASES" | xargs -r rm -rf
    echo "Sitio publicado: versión $RELEASE."
    ;;
  rollback-site)
    CURRENT="$(basename "$(readlink "$SITE_ROOT/current")")"
    TARGET="${3:-$(ls -1 "$SITE_ROOT/releases" | sort | grep -B1 -x "$CURRENT" | head -n1)}"
    [ -n "$TARGET" ] && [ "$TARGET" != "$CURRENT" ] && [ -d "$SITE_ROOT/releases/$TARGET" ] || { echo "No hay una versión anterior a $CURRENT" >&2; exit 1; }
    ln -sfn "releases/$TARGET" "$SITE_ROOT/current.new"
    mv -Tf "$SITE_ROOT/current.new" "$SITE_ROOT/current"
    echo "Sitio devuelto a la versión $TARGET (estaba en $CURRENT)."
    ;;
  status)
    compose ps
    echo "Versión del sitio: $(readlink "$SITE_ROOT/current" 2>/dev/null || echo 'sin publicar')"
    ;;
  *) echo "Acción desconocida: $ACTION" >&2; exit 2 ;;
esac
