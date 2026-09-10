# --- Étape 1 : build des assets statiques ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# --- Étape 2 : image finale, Nginx minimal ---
FROM nginx:1.31-alpine

# Correctifs de sécurité Alpine publiés après la construction de l'image de base
# (openssl, libxml2, zlib...) - sans ça, Trivy remonte régulièrement des CVE
# CRITICAL/HIGH sur des paquets OS déjà patchés en amont.
RUN apk upgrade --no-cache

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx tourne déjà en tant qu'utilisateur non-root sur l'image officielle "-alpine" >= 1.25.

# 127.0.0.1 plutôt que "localhost" : sur Alpine, "localhost" résout d'abord en IPv6
# (::1) et Nginx n'écoute qu'en IPv4 ici, ce qui fait échouer le HEALTHCHECK
# ("connection refused") alors que le service répond bien.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/ >/dev/null 2>&1 || exit 1

EXPOSE 8080
