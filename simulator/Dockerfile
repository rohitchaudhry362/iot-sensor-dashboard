# ---- build ----------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- runtime --------------------------------------------------------------
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
USER node

# No exec-form shell wrapper: node is PID 1 and gets SIGTERM directly, which is what lets the simulator publish
# its retained `offline` presence message before it goes. A clean MQTT disconnect makes the broker discard the
# will, so that last publish is the only thing that tells the dashboard the devices stopped on purpose.
CMD ["node", "dist/index.js"]
