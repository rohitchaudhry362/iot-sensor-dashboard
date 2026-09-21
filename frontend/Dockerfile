# ---- build ----------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json vite.config.ts index.html ./
COPY src ./src
# No backend URL is baked in: the app calls /api and /socket.io on its own origin, and nginx forwards them. That
# keeps one image valid for every environment instead of one build per hostname.
RUN npm run build

# ---- runtime --------------------------------------------------------------
# The unprivileged image runs as the `nginx` user and listens on 8080; the stock image runs its master process as
# root. Nothing here needs a privileged port, so there is no reason to take one.
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
