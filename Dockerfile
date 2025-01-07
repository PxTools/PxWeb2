FROM node:20.18.1-slim AS build
WORKDIR /app
COPY . ./
RUN npm ci && npm run build

# production environment
FROM nginxinc/nginx-unprivileged:1.27.3-alpine3.20-slim
COPY --from=build /app/packages/pxweb2/dist /usr/share/nginx/html
COPY nginx/conf.d/default.conf /etc/nginx/conf.d
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
