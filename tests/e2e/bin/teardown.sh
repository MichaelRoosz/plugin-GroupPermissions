#!/usr/bin/env bash
# Stops and removes all test containers (database is kept in tmpfs, so all data is discarded).
set -euo pipefail
cd "$(dirname "$0")/.."
docker compose --profile test --profile integrations down -v --remove-orphans
