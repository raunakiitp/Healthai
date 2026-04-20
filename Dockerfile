# ─── Stage 1: Build React client ─────────────────────────────────────────────
FROM node:20 AS client-builder

WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# ─── Stage 2: Server runtime ─────────────────────────────────────────────────
FROM node:20 AS server-runtime

WORKDIR /app/server

# Install build tools needed to compile better-sqlite3 native addon from source
# This ensures the binary matches the exact runtime environment
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY server/package*.json ./

# Force rebuild of native addons from source (--build-from-source)
# This ensures better-sqlite3 binary is compiled for THIS exact environment
RUN npm ci --omit=dev --build-from-source

# Copy server source
COPY server/ ./

# Copy built React app from Stage 1
COPY --from=client-builder /app/client/dist /app/client/dist

# Cloud Run injects PORT automatically; default to 8080
ENV PORT=8080
ENV NODE_ENV=production
# SQLite must write to /tmp on Cloud Run (only writable path)
ENV DB_PATH=/tmp/healthai.db

EXPOSE 8080

# Use node directly (faster startup, better crash reporting than npm)
CMD ["node", "app.js"]
