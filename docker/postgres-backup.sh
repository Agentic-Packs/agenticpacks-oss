#!/bin/sh
set -eu

PGHOST="${PGHOST:-postgres}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-postgres}"
PGPASSWORD="${PGPASSWORD:-postgrespassword}"
PGDATABASE="${PGDATABASE:-agenticpacks_oss}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"

export PGHOST PGPORT PGUSER PGPASSWORD PGDATABASE

mkdir -p "${BACKUP_DIR}"

STAMP="$(date +%Y%m%d_%H%M%S)"
DEST="${BACKUP_DIR}/${PGDATABASE}_${STAMP}.dump"

pg_dump -Fc -f "${DEST}"
find "${BACKUP_DIR}" -type f -name "*.dump" -mtime "+${BACKUP_RETENTION_DAYS}" -delete

echo "pg_dump complete: ${DEST}"
