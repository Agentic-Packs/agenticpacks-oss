#!/bin/sh
set -eu

apk add --no-cache postgresql-client tzdata

{
  echo "PGHOST=${PGHOST:-postgres}"
  echo "PGPORT=${PGPORT:-5432}"
  echo "PGUSER=${PGUSER:-postgres}"
  echo "PGPASSWORD=${PGPASSWORD:-postgrespassword}"
  echo "PGDATABASE=${PGDATABASE:-ai_starter_community}"
  echo "BACKUP_RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}"
  echo "TZ=${TZ:-UTC}"
} > /etc/postgres-backup.env

printf '%s\n' \
  'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin' \
  '0 2 * * * . /etc/postgres-backup.env; /bin/sh /usr/local/bin/postgres-backup.sh >> /backups/backup.log 2>&1' \
  > /etc/crontabs/root

. /etc/postgres-backup.env
/bin/sh /usr/local/bin/postgres-backup.sh
exec crond -f -l 8
