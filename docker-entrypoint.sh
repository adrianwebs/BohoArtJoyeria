#!/bin/sh
# Create the database/tables and seed defaults (both idempotent) before starting the server.
PRISMA="node /opt/prisma-cli/node_modules/prisma/build/index.js"

echo "[entrypoint] Syncing database schema..."
ok=0
for i in 1 2 3 4 5; do
  if $PRISMA db push --schema /app/prisma/schema.prisma --skip-generate; then
    ok=1
    break
  fi
  echo "[entrypoint] db push failed (attempt $i/5), retrying in 5s..."
  sleep 5
done

if [ "$ok" = "1" ]; then
  echo "[entrypoint] Seeding defaults..."
  node scripts/seed.mjs || echo "[entrypoint] WARNING: seed failed."
else
  echo "[entrypoint] ERROR: could not sync the database schema. Check DATABASE_URL / SQL Server. Starting the app anyway."
fi

exec node server.js
