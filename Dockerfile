# =========================
#  Build Stage
# =========================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy dependency files first (to leverage Docker layer caching)
COPY package*.json yarn.lock* ./

# Install dependencies (include dev deps for TypeScript build)
RUN npm ci

# Copy the rest of the project
COPY . .

# Build TypeScript into JavaScript
RUN npm run build


# =========================
#  Runtime Stage
# =========================
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy only compiled build and necessary package files
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Set production environment
ENV NODE_ENV=production

# Expose API port
EXPOSE 4000

# Start the application
CMD ["node", "dist/server.js"]

# =========================
#  Notes
# =========================
# - Make sure to provide environment variables (e.g., DATABASE_URL, JWT_SECRET)
#   securely in your deployment environment (e.g., Docker secrets, Kubernetes
#   secrets, or cloud provider's env management).
# - Do NOT bake secrets into this image.
