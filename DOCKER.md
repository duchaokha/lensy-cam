# Docker Deployment Guide

## Quick Start with Docker Compose

### Prerequisites
- Docker installed (version 20.10+)
- Docker Compose installed (version 2.0+)

### 1. Build and Start the Application

```bash
# Build and start in detached mode
docker-compose up -d --build

# Or build separately
docker-compose build
docker-compose up -d
```

The application will be available at: **http://localhost:8899**

### 2. View Logs

```bash
# View all logs
docker-compose logs -f

# View last 100 lines
docker-compose logs --tail=100 -f
```

### 3. Stop the Application

```bash
# Stop containers
docker-compose down

# Stop and remove volumes (WARNING: deletes database)
docker-compose down -v
```

---

## Configuration

### Environment Variables

Create a `.env` file in the project root or edit `docker-compose.yml`:

```bash
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=8899
NODE_ENV=production
```

### Port Configuration

To change the port, edit `docker-compose.yml`:

```yaml
ports:
  - "8080:8899"  # Access on http://localhost:8080
```

---

## Database Persistence

The SQLite database is persisted using Docker volumes:

```yaml
volumes:
  - ./data:/app/data
  - ./rental.db:/app/rental.db
```

Your data is stored in:
- `./rental.db` - Main database file
- `./data/` - Additional data directory

**Backup your database:**
```bash
cp rental.db rental.db.backup
```

---

## Production Deployment

### Security Checklist

1. **Change JWT Secret**
   ```bash
   # Generate a secure secret
   openssl rand -base64 32
   ```
   Update in `docker-compose.yml` or `.env`

2. **Change Default Password**
   - Login with `admin` / `admin123`
   - Change password immediately

3. **Use HTTPS**
   - Set up a reverse proxy (nginx, Traefik, Caddy)
   - Use SSL certificates (Let's Encrypt)

### Reverse Proxy Example (nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:8899;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Docker Commands Reference

### Container Management

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose stop

# Restart containers
docker-compose restart

# Remove containers
docker-compose down

# View running containers
docker-compose ps

# Execute commands in container
docker-compose exec lensy-cam sh
```

### Image Management

```bash
# Rebuild image
docker-compose build --no-cache

# Pull latest base images
docker-compose pull

# Remove unused images
docker image prune -a
```

### Logs and Debugging

```bash
# Follow logs
docker-compose logs -f lensy-cam

# View last 50 lines
docker-compose logs --tail=50 lensy-cam

# Check container health
docker-compose ps
docker inspect lensy-cam-app
```

---

## Updating the Application

```bash
# 1. Pull latest code
git pull origin main

# 2. Rebuild and restart
docker-compose down
docker-compose up -d --build

# 3. Verify it's running
docker-compose ps
docker-compose logs -f
```

---

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs lensy-cam

# Check if port is in use
lsof -ti:8899

# Remove and recreate
docker-compose down
docker-compose up -d
```

### Database issues

```bash
# Access container shell
docker-compose exec lensy-cam sh

# Check database file
ls -la /app/rental.db

# Reset database (WARNING: deletes all data)
docker-compose down
rm rental.db
docker-compose up -d
```

### Permission issues

```bash
# Fix ownership
sudo chown -R $USER:$USER rental.db data/

# Or run with user permissions
docker-compose run --user $(id -u):$(id -g) lensy-cam
```

---

## Multi-Container Setup (Advanced)

For production with separate database:

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8899:8899"
    depends_on:
      - db
    environment:
      - DATABASE_PATH=/app/data/rental.db
    volumes:
      - app-data:/app/data

  db-backup:
    image: alpine:latest
    volumes:
      - app-data:/data
      - ./backups:/backups
    command: sh -c "while true; do cp /data/rental.db /backups/rental-$$(date +%Y%m%d-%H%M%S).db; sleep 86400; done"

volumes:
  app-data:
```

---

## Resource Limits

Add to `docker-compose.yml` for production:

```yaml
services:
  lensy-cam:
    # ... other config
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

---

## Monitoring

### Health Check

The application includes a health endpoint:

```bash
curl http://localhost:8899/api/health
```

### Container Stats

```bash
# Real-time stats
docker stats lensy-cam-app

# Check health status
docker inspect --format='{{.State.Health.Status}}' lensy-cam-app
```

---

## Default Login

- **Username:** `admin`
- **Password:** `admin123`

**⚠️ IMPORTANT: Change the default password after first login!**

---

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- View container status: `docker-compose ps`
- Access shell: `docker-compose exec lensy-cam sh`

Built with ❤️ for camera rental businesses.
