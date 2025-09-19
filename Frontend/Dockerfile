# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci
RUN npm install cloudinary
# Copy source code
COPY . .

# Build arguments depuis Railway
ARG VITE_MAPBOX_TOKEN
ARG VITE_API_URL
ARG NODE_ENV=production

# Set environment variables pour le build
ENV VITE_MAPBOX_TOKEN=$VITE_MAPBOX_TOKEN
ENV VITE_API_URL=$VITE_API_URL
ENV NODE_ENV=$NODE_ENV

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Exposer le port que Railway va utiliser
EXPOSE $PORT

# Script de démarrage pour utiliser le port dynamique de Railway
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'envsubst "\$PORT" < /etc/nginx/nginx.conf > /etc/nginx/nginx.conf.tmp' >> /start.sh && \
    echo 'mv /etc/nginx/nginx.conf.tmp /etc/nginx/nginx.conf' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

CMD ["/start.sh"]