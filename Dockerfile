FROM node:22.22.0-slim AS build
WORKDIR /app
COPY . ./
RUN npm ci && npm run build-artifact

# production environment
FROM nginxinc/nginx-unprivileged:1.29.3-alpine-slim
COPY --from=build /app/packages/pxweb2/dist /usr/share/nginx/html
COPY nginx/conf.d /etc/nginx/conf.d
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
