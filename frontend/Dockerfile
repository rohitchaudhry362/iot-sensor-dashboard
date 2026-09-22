# ---- build ----------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json vite.config.ts index.html ./
COPY src ./src
# No backend URL is baked in: the app calls /api and /socket.io on its own origin, and the runtime server forwards
# them. That keeps one image valid for every environment instead of one build per hostname.
RUN npm run build

# ---- runtime --------------------------------------------------------------
# `vite preview` serves dist/ and reuses the forwarding rules in vite.config.ts. Demo scope only: Vite does not
# support preview as a production server, and real traffic would get nginx here instead.
FROM node:22-alpine AS runtime
WORKDIR /app
# preview loads vite.config.ts, which imports the React plugin, so the build toolchain comes along.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json vite.config.ts docker-entrypoint.sh ./
# Vite compiles vite.config.ts into this folder on every start; everything else stays read-only to `node`.
RUN mkdir -p node_modules/.vite-temp && chown node:node node_modules/.vite-temp

USER node

EXPOSE 8080
ENTRYPOINT ["./docker-entrypoint.sh"]
