# ---- build ----------------------------------------------------------------
FROM node:22-alpine AS build
# Prisma's query engine is linked against OpenSSL; Alpine does not ship it by default.
RUN apk add --no-cache openssl
WORKDIR /app

# Dependencies are installed from the lockfile alone, before the source is copied, so this layer is only rebuilt
# when the lockfile changes rather than on every edit to a handler.
COPY package.json package-lock.json ./
RUN npm ci

# The client is generated from the schema, so the schema has to arrive before `generate` and before the build:
# the compiled code imports the generated types.
COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- runtime --------------------------------------------------------------
FROM node:22-alpine AS runtime
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production

# Production dependencies only: no tsx, no typescript, no @types. `prisma` itself is a runtime dependency here
# rather than a dev one, because this container runs its own migrations at start-up.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# The generated client lives inside node_modules and is not reproducible from the lockfile, so it is copied from
# the build stage rather than generated again.
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/dist ./dist
COPY prisma ./prisma
COPY docker-entrypoint.sh ./

# `node` is an unprivileged user that the base image already provides.
USER node

EXPOSE 4000
ENTRYPOINT ["./docker-entrypoint.sh"]
