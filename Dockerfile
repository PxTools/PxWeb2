FROM node:24.22.1-slim@sha256:55fb5f5a527ea2c5c4a95f963e48ef90aa38c7b346054fdc8ee9957a2b55d205 AS build
WORKDIR /app
COPY . ./
RUN npm ci && npm run build-artifact

# production environment
FROM nginx/nginx-unprivileged:1.31.7-alpine-slim@sha256:e4e4a614c327f2e2c364f3731890805e2fc8d1fe216bdf0836956dbb80db5e01
COPY --from=build /app/packages/pxweb2/dist /usr/share/nginx/html
COPY nginx/conf.d /etc/nginx/conf.d
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
