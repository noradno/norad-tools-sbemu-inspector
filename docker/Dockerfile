# Frontend build stage
FROM node:current AS frontend-build
WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./
RUN npm ci --include=optional

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# Backend build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend-build
WORKDIR /src

# Copy backend project files
COPY backend/SBEmuInspector.Api/SBEmuInspector.Api.csproj SBEmuInspector.Api/
RUN dotnet restore SBEmuInspector.Api/SBEmuInspector.Api.csproj

# Copy backend source
COPY backend/ ./

# Build and publish
WORKDIR /src/SBEmuInspector.Api
RUN dotnet publish -c Release -o /app/publish

# Final runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS runtime
WORKDIR /app

# Install nginx and supervisor
RUN apk add --no-cache nginx supervisor && \
    mkdir -p /var/log/supervisor /run/nginx /var/cache/nginx /var/log/nginx && \
    touch /run/nginx.pid && \
    ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log

# Copy backend application
COPY --from=backend-build /app/publish ./backend/

# Copy frontend build
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Copy configuration files
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create non-root user and fix permissions
RUN adduser -D -g '' appuser && \
    chown -R appuser:appuser /app && \
    chown -R appuser:appuser /var/log/supervisor && \
    chown -R appuser:appuser /var/cache/nginx && \
    chown -R appuser:appuser /var/log/nginx && \
    chmod -R 755 /var/log/nginx

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q --spider http://localhost:8080/health || exit 1

# Start services via supervisor (as root for process management)
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]