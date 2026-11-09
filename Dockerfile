FROM node:26.12.1-slim@sha256:94816674c62774da0d099a947bf4613b9e1972a2733abd0d0cd80e795f8411d0 AS build
WORKDIR /app
COPY . ./
RUN npm ci && npm run build-artifact

# production environment
FROM nginx/nginx-unprivileged:1.31.7-alpine-slim@sha256:9f239061cbd9cc83fa684c653a5e825a0726410364aa3401f9490d7dc8c35e77
COPY --from=build /app/packages/pxweb2/dist /usr/share/nginx/html
COPY nginx/conf.d /etc/nginx/conf.d
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
