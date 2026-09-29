#!/bin/sh
# Apply the Prisma schema and seed defaults (idempotent) before starting the server.
echo "[entrypoint] Syncing database schema..."
node node_modules/prisma/build/index.js db push --skip-generate || echo "[entrypoint] WARNING: prisma db push failed; check DATABASE_URL / SQL Server availability."
echo "[entrypoint] Seeding defaults..."
node scripts/seed.mjs || echo "[entrypoint] WARNING: seed failed."
exec node server.js
