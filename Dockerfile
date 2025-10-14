FROM node:22.20.0-slim AS build
WORKDIR /app
COPY . ./
RUN npm ci && npm run build

# production environment
FROM nginxinc/nginx-unprivileged:1.29.2-alpine-slim
COPY --from=build /app/packages/pxweb2/dist /usr/share/nginx/html
COPY nginx/conf.d/default.conf /etc/nginx/conf.d
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
