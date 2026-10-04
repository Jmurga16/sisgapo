#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

date '+%F %T'
docker compose --env-file ../../.env --profile sembrar run --rm db-init
