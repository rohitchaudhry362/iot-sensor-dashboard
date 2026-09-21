#!/bin/sh
# Printed by the frontend container just before nginx starts, so plain `docker compose up` ends with a link to
# click rather than a wall of logs to search through. Most terminals turn the URL into a link.
#
# The timing is honest: this container only starts once the backend reports healthy, which it does only after
# migrations, seeding and the backfill have finished - so by the time this prints, the app is ready to use.
#
# DASHBOARD_URL comes from docker-compose.yml, because only compose knows which host port it published; from in
# here the container can only see its own port, 8080. No `set -e`: a failure in a banner must never stop nginx.

cat <<BANNER

============================================================
  HomePulse is ready:  ${DASHBOARD_URL:-http://localhost:3000}

  New here? Register first - the demo ships with sensor
  history already loaded, but no user accounts.
============================================================

BANNER
