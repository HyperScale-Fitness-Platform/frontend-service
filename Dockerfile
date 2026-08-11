# Stage 1: Build the React app
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Same-origin by default (shared ALB); override only for local/preview builds
ARG VITE_API_GETWAY_URL
ENV VITE_API_GETWAY_URL=$VITE_API_GETWAY_URL

RUN npm run build

# Stage 2: Serve static assets with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
