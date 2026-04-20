# ─── Stage 1: Build React client ─────────────────────────────────────────────
FROM node:20 AS client-builder

WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# ─── Stage 2: Build server + install native deps ──────────────────────────────
# Use full node:20 (NOT slim) so native modules like better-sqlite3 have all
# required system libraries (libstdc++, python3, make, g++ for node-gyp, etc.)
FROM node:20 AS server-runtime

WORKDIR /app/server

# Copy package files
COPY server/package*.json ./

# Install production deps — full image has node-gyp tools so better-sqlite3
# native bindings compile/load correctly
RUN npm ci --omit=dev

# Copy server source
COPY server/ ./

# Copy built React app from Stage 1
COPY --from=client-builder /app/client/dist /app/client/dist

# Cloud Run sets PORT automatically; default to 8080
ENV PORT=8080
ENV NODE_ENV=production

# SQLite DB must live in /tmp on Cloud Run (only writable directory)
ENV DB_PATH=/tmp/healthai.db

EXPOSE 8080

CMD ["node", "app.js"]
