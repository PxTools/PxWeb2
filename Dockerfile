FROM node:24.22.1-slim@sha256:55fb5f5a527ea2c5c4a95f963e48ef90aa38c7b346054fdc8ee9957a2b55d205 AS build
WORKDIR /app
COPY . ./
RUN npm ci && npm run build-artifact

# production environment
FROM nginxinc/nginx-unprivileged:1.31.7-alpine-slim@sha256:52c82c7ad265b75620673ffa0de1d9182a78121e05c5c993b3e076413bc6f69c
COPY --from=build /app/packages/pxweb2/dist /usr/share/nginx/html
COPY nginx/conf.d /etc/nginx/conf.d
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
