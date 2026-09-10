FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=http://localhost:8000/api
ARG VITE_CLIENT_ID=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_CLIENT_ID=$VITE_CLIENT_ID
RUN npm run build

FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build/client /usr/share/nginx/html
EXPOSE 80
