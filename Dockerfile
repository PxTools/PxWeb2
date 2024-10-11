FROM node:20.18.0-slim AS build
WORKDIR /app
COPY . ./
RUN npm ci
RUN npx nx reset
RUN npm run build

# production environment
FROM nginxinc/nginx-unprivileged:1.27-alpine3.20
COPY --from=build /app/dist/apps/pxweb2 /usr/share/nginx/html
COPY nginx/conf.d/default.conf /etc/nginx/conf.d
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
