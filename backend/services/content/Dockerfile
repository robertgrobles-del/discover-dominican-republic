# syntax=docker/dockerfile:1
# Build context: backend/ (docker build -f services/content/Dockerfile .)
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY tsconfig.json ./
COPY services/content ./services/content
COPY src/contracts ./src/contracts
COPY src/modules/content/reader.ts src/modules/content/reader-rpc.ts src/modules/content/internal-routes.ts ./src/modules/content/
COPY src/lib/errors.ts src/lib/request-context.ts src/lib/db-types.ts ./src/lib/
COPY src/plugins/errors.ts ./src/plugins/
RUN ./node_modules/.bin/tsc -p services/content/tsconfig.json && npm prune --omit=dev

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist-content ./dist-content
COPY package.json ./
USER node
EXPOSE 3002
HEALTHCHECK --interval=15s --timeout=3s --retries=5 CMD wget -qO- http://127.0.0.1:3002/health/ready || exit 1
CMD ["node", "dist-content/services/content/server.js"]
