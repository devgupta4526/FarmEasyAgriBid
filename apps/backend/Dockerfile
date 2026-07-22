FROM registry.redhat.io/ubi9/nodejs-20-minimal:latest

USER root

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source
COPY dist/ ./dist/

# Create non-root user
RUN useradd -m -u 1001 agribid

# Set ownership
RUN chown -R agribid:agribid /app

# Switch to non-root
USER 1001

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:4000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "dist/index.js"]
