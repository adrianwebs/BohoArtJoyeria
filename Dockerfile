# Multi-stage Dockerfile for Next.js Standalone
# 1. Base image
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# 2. Dependencies stage
FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci

# 3. Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# 4. Prisma CLI in isolation: the CLI needs its own dependency tree (effect, @prisma/config...), which the
#    Next standalone output does not include. Keep the version in sync with "prisma" in package.json.
FROM base AS prisma-cli
ARG PRISMA_VERSION=6.19.3
WORKDIR /opt/prisma-cli
RUN npm init -y >/dev/null && npm install prisma@${PRISMA_VERSION} --no-audit --no-fund

# 5. Runner stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets and standalone build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh

# Prisma CLI (own node_modules) used by the entrypoint to create the database/tables
COPY --from=prisma-cli /opt/prisma-cli /opt/prisma-cli

# Prisma client + bcryptjs, needed by scripts/seed.mjs at container start
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs
RUN chmod +x ./docker-entrypoint.sh
# Writable upload dir (the compose file mounts a host volume here; the host folder must be writable by uid 1001)
RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public/uploads

USER nextjs

EXPOSE 3000

CMD ["./docker-entrypoint.sh"]
