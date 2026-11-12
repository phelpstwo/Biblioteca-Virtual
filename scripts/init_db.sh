#!/usr/bin/env bash
# Aurora Livros — sobe um cluster PostgreSQL local (sem sudo) e popula o banco.
set -euo pipefail

PGBIN="${PGBIN:-/usr/lib/postgresql/18/bin}"
PGDATA="${PGDATA:-$PWD/.pgdata}"
PORT="${DB_PORT:-5433}"
DB_NAME="${DB_NAME:-biblioteca}"
DB_USER="${DB_USER:-postgres}"

if [ ! -d "$PGDATA" ]; then
  echo "Inicializando cluster PostgreSQL em $PGDATA…"
  "$PGBIN/initdb" -D "$PGDATA" -U "$DB_USER" --auth=trust --encoding=UTF8 --locale=C.UTF-8
fi

if ! "$PGBIN/pg_isready" -h 127.0.0.1 -p "$PORT" >/dev/null 2>&1; then
  echo "Subindo PostgreSQL na porta $PORT…"
  "$PGBIN/pg_ctl" -D "$PGDATA" -o "-p $PORT -k /tmp -h 127.0.0.1" -l /tmp/biblioteca-pg.log start
  sleep 1
fi

"$PGBIN/createdb" -h 127.0.0.1 -p "$PORT" -U "$DB_USER" "$DB_NAME" 2>/dev/null || true
"$PGBIN/psql" -h 127.0.0.1 -p "$PORT" -U "$DB_USER" -d "$DB_NAME" -f schema.sql
"$PGBIN/psql" -h 127.0.0.1 -p "$PORT" -U "$DB_USER" -d "$DB_NAME" -f seed.sql

echo "Banco pronto em 127.0.0.1:$PORT ($DB_NAME)"
