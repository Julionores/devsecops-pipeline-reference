# --- Étape 1 : dépendances + build ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# --- Étape 2 : dépendances de production uniquement ---
FROM node:20-alpine AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# --- Étape 3 : image finale, minimale, utilisateur non-root ---
FROM node:20-alpine
WORKDIR /app

# Mise à jour des paquets OS (correctifs de sécurité Alpine publiés après la
# construction de l'image de base) + suppression du CLI npm : jamais utilisé au
# runtime (CMD lance directement "node dist/server.js"), mais scanné par Trivy
# et régulièrement source de CVE via ses propres dépendances embarquées
# (tar, minimatch, sigstore, pacote...). Le retirer réduit la surface de scan
# ET la surface d'attaque réelle (pas de npm/npx exploitable en cas de compromission).
RUN apk upgrade --no-cache \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack

RUN addgroup -S app && adduser -S app -G app

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

USER app
ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3000/api/health | grep -q '"status":"UP"' || exit 1

CMD ["node", "dist/server.js"]
