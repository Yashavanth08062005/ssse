# BAP Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# If a package-lock.json exists use `npm ci` for clean installs, otherwise
# fall back to `npm install --omit=dev` so image builds don't fail when lockfile
# isn't present (common in developer checkouts).
RUN if [ -f package-lock.json ]; then npm ci --only=production; else npm install --omit=dev --no-audit --no-fund --silent; fi

# Copy source code
COPY src/ ./src/

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start the application
CMD ["npm", "start"]