FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production --silent

# Copy source code
COPY src/ ./src/

# Expose port
EXPOSE 7005

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:7005/health || exit 1

# Start the application
CMD ["npm", "start"]
