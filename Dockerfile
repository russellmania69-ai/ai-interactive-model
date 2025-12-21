FROM node:18-bullseye-slim AS build
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline --no-audit --no-fund

# Copy source and build
COPY . .
RUN npm run build

FROM nginx:stable-slim AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Basic healthcheck for container orchestrators
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
