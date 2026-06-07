# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy admin package and install deps with npm
COPY apps/admin/package.json ./
RUN npm install

# Copy source code
COPY apps/admin/src ./src
COPY apps/admin/index.html ./
COPY apps/admin/tsconfig.json ./
COPY apps/admin/tsconfig.node.json ./
COPY apps/admin/vite.config.ts ./

# Build
RUN npx vite build

# Stage 2: Serve with Nginx
FROM nginx:1.25-alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
