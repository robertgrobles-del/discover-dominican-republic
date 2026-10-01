# Build context: backend/ (docker build -f services/weather/Dockerfile .)
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY tsconfig.json ./
COPY services/weather ./services/weather
COPY src/modules/weather ./src/modules/weather
COPY src/lib/errors.ts src/lib/breaker.ts src/lib/fetch-json.ts src/lib/http.ts src/lib/request-context.ts ./src/lib/
COPY src/plugins/errors.ts src/plugins/etag.ts ./src/plugins/
RUN ./node_modules/.bin/tsc -p services/weather/tsconfig.json && npm prune --omit=dev

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist-weather ./dist-weather
# Migrador y SQL versionado: los ejecuta el servicio one-shot `weather-migrate` de Compose.
COPY services/weather/scripts/migrate.mjs ./services/weather/scripts/migrate.mjs
COPY services/weather/migrations ./services/weather/migrations
COPY package.json ./
USER node
EXPOSE 3001
HEALTHCHECK --interval=15s --timeout=3s --retries=5 CMD wget -qO- http://127.0.0.1:3001/health/ready || exit 1
CMD ["node", "dist-weather/services/weather/server.js"]
