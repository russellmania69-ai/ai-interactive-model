FROM node:20-bullseye-slim AS build
WORKDIR /app

# Refresh OS packages to pull security updates in the build image
RUN apt-get update && apt-get upgrade -y --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline --no-audit --no-fund

# Copy source and build
COPY . .
RUN npm run build

# Use the slim runtime image to reduce footprint and get newer package variants
FROM nginx:1.26.3-alpine AS runtime
# Alpine-based runtime is smaller and avoids many Debian CVEs reported by scanners
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Basic lightweight healthcheck: ensure the built index exists
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD ["/bin/sh", "-c", "[ -s /usr/share/nginx/html/index.html ] || exit 1"]

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
