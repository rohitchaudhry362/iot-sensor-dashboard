#!/bin/sh
# Brings the database up to date and populates it before the API starts accepting traffic, so a fresh clone has a
# dashboard with history on it rather than an empty one.
#
# Ordering matters and is not interchangeable:
#   1. migrate deploy  - applies committed migrations only, and never generates or resets one (unlike `migrate
#                        dev`), which is what makes it safe to run unattended on every start.
#   2. seed            - idempotent: it skips tables that already have rows, and then backfills the gap between
#                        the end of the sample data and now. Re-running it on an existing volume is a no-op.
#   3. server          - exec, so the Node process replaces this shell as PID 1 and receives SIGTERM directly.
#                        Without exec, `docker compose down` would kill the shell and leave the graceful
#                        shutdown (MQTT, sockets, HTTP, Prisma) unrun.
set -e

echo "[entrypoint] applying database migrations"
npx prisma migrate deploy

echo "[entrypoint] seeding sample data and backfilling to now"
node dist/db/seed.js

echo "[entrypoint] starting the API"
exec node dist/server.js
