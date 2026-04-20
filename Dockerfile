# Stage 1: Build the React client
FROM node:20 AS client-builder

WORKDIR /app/client

# Copy package files and install dependencies
COPY client/package*.json ./
RUN npm ci

# Copy client source and build
COPY client/ ./
RUN npm run build

# Stage 2: Build the Node.js backend
FROM node:20-slim AS server-runtime

WORKDIR /app/server

# Copy server package files and install production dependencies
COPY server/package*.json ./
# Use npm ci for clean deterministic install
RUN npm ci --omit=dev

# Copy server source code
COPY server/ ./

# Copy the built React app from the previous stage
COPY --from=client-builder /app/client/dist /app/client/dist

# Setup user for security (optional but recommended)
# We don't use 'USER node' if sqlite needs to write to an existing db file, but 
# since Cloud Run will use ephemeral storage, the container runs as the default user or specified one.

# Environment variables for production
ENV NODE_ENV=production
# Expose the standard port (Cloud Run sets PORT automatically, defaults to 8080)
ENV PORT=8080
EXPOSE 8080

# Start the server
CMD ["npm", "start"]
