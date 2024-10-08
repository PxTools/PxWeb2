FROM node:20.11.1-slim AS build
WORKDIR /app
COPY . ./
RUN npm install
RUN npx nx reset
RUN npm run build

# production environment
FROM nginxinc/nginx-unprivileged
COPY --from=build /app/dist/apps/pxweb2 /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]