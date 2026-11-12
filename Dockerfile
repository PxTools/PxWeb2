FROM ghcr.io/pnpm/pnpm:12@sha256:1228cc16b32505a3e46e9a911c2af766c263928db01f21cd1e8b79c1bdd24431 AS build
WORKDIR /app
COPY . ./
RUN pnpm install --frozen-lockfile && pnpm run build-artifact

# production environment
FROM nginx/nginx-unprivileged:1.31.7-alpine-slim@sha256:9f239061cbd9cc83fa684c653a5e825a0726410364aa3401f9490d7dc8c35e77
COPY --from=build /app/packages/pxweb2/dist /usr/share/nginx/html
COPY nginx/conf.d /etc/nginx/conf.d
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
