# ─────────────────────────────────────────
# Stage 1: Build
# ─────────────────────────────────────────
FROM node:18-alpine AS builder

# Install OpenSSL (required by Prisma on Alpine)
RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Generate Prisma client (linux-musl target for Alpine)
RUN npx prisma generate

# Copy source & compile TypeScript
COPY . .
RUN npm run build

# ─────────────────────────────────────────
# Stage 2: Production runtime
# ─────────────────────────────────────────
FROM node:18-alpine AS runner

# Install OpenSSL (required by Prisma at runtime)
RUN apk add --no-cache openssl

WORKDIR /app

# Install only production deps
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev && npx prisma generate

# Copy compiled dist from builder
COPY --from=builder /app/dist ./dist

# Expose API port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "dist/server.js"]
