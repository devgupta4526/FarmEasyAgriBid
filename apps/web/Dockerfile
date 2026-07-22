FROM registry.redhat.io/ubi9/nodejs-20-minimal:latest

USER root

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install deps
RUN npm ci && npm cache clean --force

# Copy source
COPY . .

# Build Next.js
RUN npm run build

# Non-root user
RUN useradd -m -u 1001 agribid
RUN chown -R agribid:agribid /app

USER 1001

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["npm", "start"]
