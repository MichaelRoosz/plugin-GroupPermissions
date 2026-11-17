#!/usr/bin/env bash
# Regenerates the Marketplace screenshots in the plugin's screenshots/ directory (file name = caption) on a fresh
# Matomo with the demo data of bin/start.sh. KEEP_ENV=1 reuses a running instance with demo data.
set -euo pipefail

cd "$(dirname "$0")/.."

if [ "${KEEP_ENV:-0}" != "1" ]; then
    ./bin/teardown.sh
fi
./bin/start.sh

rm -rf marketplace-screenshots
docker compose --profile test run --rm -e HOST_UID="$(id -u)" -e HOST_GID="$(id -g)" playwright \
    bash -c 'npm ci --no-audit --no-fund --loglevel=error \
             && npx playwright test -c playwright.screenshots.config.ts "$@"; status=$?
             chown -R "$HOST_UID:$HOST_GID" marketplace-screenshots test-results-screenshots .auth 2>/dev/null
             exit $status' -- "$@"

cp marketplace-screenshots/*.png ../../screenshots/
rm -rf marketplace-screenshots
echo "==> Updated $(cd ../../screenshots && pwd)"
