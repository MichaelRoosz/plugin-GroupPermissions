#!/usr/bin/env bash
# Sets up the environment (if needed) and runs the Playwright end-to-end tests inside docker.
# Extra arguments are passed to `playwright test`, e.g. `bin/run.sh specs/invite-user.spec.ts`.
set -euo pipefail

cd "$(dirname "$0")/.."

# Start from an empty Matomo by default so screenshots only show data of this run. KEEP_ENV=1 reuses a running instance.
if [ "${KEEP_ENV:-0}" != "1" ]; then
    ./bin/teardown.sh
fi

./bin/setup.sh

# the container runs as root: hand the generated files (screenshots, reports) back to the calling user
docker compose --profile test run --rm -e HOST_UID="$(id -u)" -e HOST_GID="$(id -g)" playwright \
    bash -c '# drop results of earlier runs: e.g. `--reporter=line` replaces the configured html reporter,
             # which would otherwise leave an outdated playwright-report behind (removed in the container: may be root-owned)
             rm -rf playwright-report test-results
             npm ci --no-audit --no-fund --loglevel=error && npx playwright test "$@"; status=$?
             chown -R "$HOST_UID:$HOST_GID" screenshots test-results playwright-report .auth 2>/dev/null
             exit $status' -- "$@"
