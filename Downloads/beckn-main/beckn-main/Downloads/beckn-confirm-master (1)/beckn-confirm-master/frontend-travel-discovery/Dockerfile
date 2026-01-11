# Multi-stage build for Vite React app
FROM node:20-alpine AS base

# Development stage
FROM base AS development
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies). Use `npm ci` when a
# lockfile exists for reproducible installs, otherwise fall back to `npm install`
# (useful for developer checkouts that may not include a lockfile).
RUN if [ -f package-lock.json ]; then npm ci; else npm install --omit=dev --no-audit --no-fund --silent; fi

# Copy source code
COPY . .

# Expose development port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]

# Build stage
FROM base AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies. Prefer `npm ci` if a lockfile exists.
RUN if [ -f package-lock.json ]; then npm ci; else npm install --omit=dev --no-audit --no-fund --silent; fi

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration (if you have custom config)
# COPY nginx.conf /etc/nginx/nginx.conf

# Create nginx config for React SPA
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    error_page 500 502 503 504 /50x.html; \
    location = /50x.html { \
        root /usr/share/nginx/html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]