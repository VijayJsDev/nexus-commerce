# ═══════════════════════════════════════════════════════════════
# Nexus Commerce — Frontend Dockerfile
# Multi-stage build with three targets:
#   - development: hot-reload dev server (used by docker-compose)
#   - builder:     production build step
#   - production:  Nginx serving static files
#
# Usage:
#   Dev:   docker build --target development -t frontend:dev .
#   Prod:  docker build --target production  -t frontend:prod .
# ═══════════════════════════════════════════════════════════════

# ─── Base Image ──────────────────────────────────────────────────
# Use the same Node version as the backend for consistency.
# Alpine variant is significantly smaller (~170MB vs ~900MB).
FROM node:22-alpine AS base

WORKDIR /app

# Copy package files first — Docker layer caching.
# If package.json/package-lock.json haven't changed, npm install
# is skipped on the next build (uses the cached layer).
COPY package*.json ./


# ─── Development Stage ───────────────────────────────────────────
FROM base AS development

# Install ALL dependencies (including devDependencies needed for Vite)
RUN npm install

# Copy source files AFTER install to maximise cache hits.
# In docker-compose, source is volume-mounted — this copy is for
# non-compose dev builds (e.g., running the container standalone).
COPY . .

# Expose the Vite dev server port
EXPOSE 3000

# Start Vite dev server.
# --host 0.0.0.0 makes it accessible from outside the container.
# This is also configured in vite.config.ts (server.host: true).
CMD ["npm", "run", "dev"]


# ─── Builder Stage ───────────────────────────────────────────────
FROM base AS builder

# Install only production + peer deps needed to build
# (devDependencies ARE needed here because Vite/TS are dev deps)
RUN npm install

COPY . .

# Type-check + build the production bundle → /app/dist
RUN npm run build


# ─── Production Stage ────────────────────────────────────────────
# Uses the official Nginx Alpine image — tiny, fast, battle-tested.
FROM nginx:1.27-alpine AS production

# Remove the default Nginx placeholder page
RUN rm -rf /usr/share/nginx/html/*

# Copy our custom Nginx config (SPA routing + gzip + cache headers)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Nginx runs in the foreground (daemon off) so Docker can manage the process
CMD ["nginx", "-g", "daemon off;"]
