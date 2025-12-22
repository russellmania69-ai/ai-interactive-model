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
FROM golang:1.21-alpine AS server-builder
RUN apk add --no-cache build-base git
WORKDIR /server
COPY docker/static-server/main.go ./
ENV CGO_ENABLED=0
RUN go build -ldflags='-s -w' -o /static-server ./main.go

FROM gcr.io/distroless/static:nonroot
WORKDIR /app
COPY --from=build /app/dist /app/dist
COPY --from=server-builder /static-server /static-server

EXPOSE 8080
USER nonroot
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD ["/static-server","-root","/app/dist","-health-check"]
CMD ["/static-server", "-root", "/app/dist", "-port", "8080"]
