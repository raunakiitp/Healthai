# ─── Stage 1: Build React client ─────────────────────────────────────────────
FROM node:20 AS client-builder

WORKDIR /app/client

# Declare build args for Vite — these get baked into the JS bundle at build time
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_API_BASE_URL=""

# Expose them as env vars so Vite picks them up during `npm run build`
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# ─── Stage 2: Server runtime ─────────────────────────────────────────────────
FROM node:20 AS server-runtime

WORKDIR /app/server

# Install build tools needed to compile better-sqlite3 native addon from source
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY server/package*.json ./

# Force rebuild of native addons from source so binary matches Cloud Run exactly
RUN npm ci --omit=dev --build-from-source

COPY server/ ./

# Copy built React app from Stage 1
COPY --from=client-builder /app/client/dist /app/client/dist

# Cloud Run injects PORT automatically; default to 8080
ENV PORT=8080
ENV NODE_ENV=production
# SQLite must write to /tmp on Cloud Run (only writable path)
ENV DB_PATH=/tmp/healthai.db

EXPOSE 8080

CMD ["node", "app.js"]
