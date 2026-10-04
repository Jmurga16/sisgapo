#!/usr/bin/env bash
set -euo pipefail

TARGET="${DEPLOY_TARGET:-josemurga@164.68.108.97}"
BASE="${DEPLOY_BASE:-/opt/sisgapo}"
RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ -n "$(git -C "$RAIZ" status --porcelain)" ]; then
  echo "SISGAPO tiene cambios sin commit: no se despliega nada." >&2
  exit 1
fi
git -C "$RAIZ" log -1 --format='%h %s'
REVISION="$(git -C "$RAIZ" rev-parse --short HEAD)"

git -C "$RAIZ" -c core.autocrlf=false archive HEAD | ssh "$TARGET" \
  "set -e; rm -rf $BASE/src.new; mkdir -p $BASE/src.new; tar -x -C $BASE/src.new; BASE=$BASE REVISION=$REVISION bash $BASE/src.new/deploy/remoto.sh"
