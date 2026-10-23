#!/usr/bin/env bash
set -euo pipefail

IMAGE="${SCHEMA_VERIFY_IMAGE:-dbdiagramr-pg16-vector:local}"
NAME="dbdiagramr-schema-verify"
PORT="${SCHEMA_VERIFY_PORT:-55432}"

if ! docker image inspect "$IMAGE" >/dev/null 2>&1; then
  docker build -f test/schema-verify.Dockerfile -t "$IMAGE" test
fi

docker rm -f "$NAME" >/dev/null 2>&1 || true
docker run -d --name "$NAME" \
  -e POSTGRES_PASSWORD=verify \
  -e POSTGRES_DB=postgres \
  -p "$PORT:5432" \
  "$IMAGE" >/dev/null

cleanup() {
  docker rm -f "$NAME" >/dev/null 2>&1 || true
}
trap cleanup EXIT

for _ in $(seq 1 30); do
  if docker exec "$NAME" pg_isready -U postgres >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

VERIFY_DATABASE_URL="postgres://postgres:verify@127.0.0.1:${PORT}/postgres" \
  npm run schemas:verify
