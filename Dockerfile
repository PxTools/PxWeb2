FROM node:22.16.0-slim AS build
WORKDIR /app
COPY . ./
RUN npm ci && npm run build

# production environment
FROM nginxinc/nginx-unprivileged:1.27.5-alpine-slim
COPY --from=build /app/packages/pxweb2/dist /usr/share/nginx/html
COPY nginx/conf.d/default.conf /etc/nginx/conf.d
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
