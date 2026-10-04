#!/bin/bash
# Crea DB_SISGAPO y ejecuta los scripts corregidos de sisgapo-docs/sql en orden.
# Es reejecutable: los scripts eliminan los objetos antes de crearlos.
set -e

SQLCMD=/opt/mssql-tools18/bin/sqlcmd
SERVIDOR=db

echo "==> Esperando a que $SERVIDOR acepte conexiones..."
for i in $(seq 1 30); do
  if $SQLCMD -S $SERVIDOR -U sa -P "$MSSQL_SA_PASSWORD" -C -Q "SELECT 1" > /dev/null 2>&1; then
    break
  fi
  sleep 2
done

echo "==> Creando la base DB_SISGAPO si no existe"
$SQLCMD -S $SERVIDOR -U sa -P "$MSSQL_SA_PASSWORD" -C -b \
  -Q "IF DB_ID('DB_SISGAPO') IS NULL CREATE DATABASE DB_SISGAPO"

for archivo in /sql/[0-9][0-9]-*.sql; do
  echo "==> $(basename "$archivo")"
  $SQLCMD -S $SERVIDOR -U sa -P "$MSSQL_SA_PASSWORD" -C -d DB_SISGAPO -b -i "$archivo"
done

# Solo en el VPS: la API entra con un login que únicamente ejecuta procedimientos, no con sa.
if [ -n "${SISGAPO_APP_PASSWORD:-}" ]; then
  echo "==> Login sisgapo_app"
  $SQLCMD -S $SERVIDOR -U sa -P "$MSSQL_SA_PASSWORD" -C -b \
    -Q "IF SUSER_ID(N'sisgapo_app') IS NULL CREATE LOGIN sisgapo_app WITH PASSWORD = N'\$(SISGAPO_APP_PASSWORD)'; ELSE ALTER LOGIN sisgapo_app WITH PASSWORD = N'\$(SISGAPO_APP_PASSWORD)';"
  $SQLCMD -S $SERVIDOR -U sa -P "$MSSQL_SA_PASSWORD" -C -d DB_SISGAPO -b \
    -Q "IF USER_ID(N'sisgapo_app') IS NULL CREATE USER sisgapo_app FOR LOGIN sisgapo_app; GRANT EXECUTE ON SCHEMA::dbo TO sisgapo_app;"
fi

echo "==> Base de datos lista."
