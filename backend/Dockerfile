# syntax=docker/dockerfile:1
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
# Caché de npm entre builds (BuildKit): sólo reinstala lo que cambió en package-lock.json en vez de bajar todo de nuevo.
RUN --mount=type=cache,target=/root/.npm npm ci
COPY tsconfig*.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine
# En ejecución sólo hace falta `node`: npm, npx, corepack y yarn se quitan porque no se usan y cargan
# con sus propias dependencias vulnerables, que el escaneo de la imagen marcaría como nuestras.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /opt/yarn-*
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
COPY migrations ./migrations
# Las imágenes subidas se guardan en MEDIA_DIR: móntalo como volumen persistente (o usa almacenamiento S3).
RUN mkdir -p /app/storage/media && chown -R node:node /app/storage
VOLUME /app/storage/media
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --retries=5 CMD wget -qO- http://127.0.0.1:3000/health || exit 1
CMD ["node", "dist/server.js"]
