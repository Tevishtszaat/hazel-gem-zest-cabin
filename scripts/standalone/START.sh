#!/bin/sh
set -eu
cd "$(dirname "$0")"
export PORT="${PORT:-8787}"
export HOST="${HOST:-127.0.0.1}"
export NITRO_PORT="$PORT"
export NITRO_HOST="$HOST"

echo
echo " Axis 2026 Creator Particlewave"
echo " Opening http://${HOST}:${PORT}/"
echo " Close this terminal to stop the workshop."
echo

if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "http://${HOST}:${PORT}/" >/dev/null 2>&1 || true
elif command -v open >/dev/null 2>&1; then
  open "http://${HOST}:${PORT}/" >/dev/null 2>&1 || true
fi

exec ./runtime/node ./server/index.mjs
