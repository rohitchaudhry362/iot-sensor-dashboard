#!/bin/sh
# Prints the ready banner, then serves the built app. This container starts only once the backend is healthy, so
# the app really is ready. DASHBOARD_URL comes from compose, which alone knows the published host port.

cat <<BANNER

============================================================
  HomePulse is ready:  ${DASHBOARD_URL:-http://localhost:3000}

  New here? Register first - the demo ships with sensor
  history already loaded, but no user accounts.
============================================================

BANNER

# exec, so Vite is PID 1 and receives SIGTERM. --logLevel warn hides Vite's URL list, which shows the container's
# port 8080 rather than the host port the browser uses.
exec node_modules/.bin/vite preview --host 0.0.0.0 --port 8080 --strictPort --logLevel warn --clearScreen false
