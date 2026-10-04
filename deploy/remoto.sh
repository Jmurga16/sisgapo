#!/usr/bin/env bash
set -euo pipefail
: "${BASE:?}" "${REVISION:?}"

rm -rf "$BASE/src.old"
if [ -d "$BASE/src" ]; then mv "$BASE/src" "$BASE/src.old"; fi
mv "$BASE/src.new" "$BASE/src"
cd "$BASE/src/deploy"

set -a
. "$BASE/.env"
set +a

compose() { docker compose --env-file "$BASE/.env" "$@"; }

# Cada despliegue recarga la base desde sisgapo-docs/sql, igual que el reinicio nocturno:
# los scripts solo saben recrear los objetos, y así los procedimientos nuevos entran siempre.
bash sembrar.sh

compose up -d --build --remove-orphans
docker image prune -f --filter label=com.docker.compose.project=sisgapo-demo >/dev/null
docker builder prune -f --reserved-space 1gb >/dev/null

printf '%s {\n\theader X-Robots-Tag "noindex, nofollow"\n\treverse_proxy sisgapo-web:80\n}\n' \
  "$SITE_HOST" > /opt/edge/sites/sisgapo.caddy
docker exec edge-caddy-1 caddy reload --config /etc/caddy/Caddyfile

# El servidor está en hora de Europa central: las 10:00 son las 03:00 de Lima (04:00 en invierno).
TAREA="0 10 * * * bash $BASE/src/deploy/sembrar.sh >> $BASE/sembrar.log 2>&1"
( crontab -l 2>/dev/null | grep -v "$BASE/src/deploy/sembrar.sh" || true; echo "$TAREA" ) | crontab -

for _ in $(seq 60); do
  if compose exec -T web wget -qO /dev/null http://sisgapo-api:8080/ConfiguracionService 2>/dev/null; then
    echo "Listo: https://$SITE_HOST con la revisión $REVISION"
    exit 0
  fi
  sleep 3
done
echo "La API no responde tras tres minutos: docker compose logs api" >&2
exit 1
