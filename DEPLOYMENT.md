# SIMBI KE Deployment Guide

## Prerequisites

- Docker & Docker Compose installed
- PostgreSQL 15+
- Redis 7+
- Node.js 18+ (for local development)

## Local Development

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your local database credentials
npm run migrate
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Access at `http://localhost:3000`

---

## Docker Deployment

### Quick Start

```bash
# Build and start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
```

### Database Migration

```bash
# Run migrations
docker-compose exec backend npm run migrate

# Seed test data (optional)
docker-compose exec backend npm run seed
```

### Stopping Services

```bash
# Stop all services
docker-compose down

# Remove volumes (careful!)
docker-compose down -v
```

---

## Production Deployment

### Environment Variables

Create production `.env` files:

**backend/.env**
```
NODE_ENV=production
PORT=5000
DB_HOST=<production-db-host>
DB_USER=<production-db-user>
DB_PASSWORD=<very-secure-password>
JWT_SECRET=<very-secure-jwt-secret>
MPESA_CONSUMER_KEY=<mpesa-production-key>
MPESA_CONSUMER_SECRET=<mpesa-production-secret>
MPESA_ENVIRONMENT=production
```

**frontend/.env**
```
NEXT_PUBLIC_API_URL=https://api.simbi-ke.com
NEXT_PUBLIC_WS_URL=https://api.simbi-ke.com
```

### Deployment to VPS

```bash
# SSH to server
ssh user@your-server.com

# Clone repository
git clone https://github.com/realowinopaul-cpu/simbi-ke.git
cd simbi-ke

# Set environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit .env files with production values

# Deploy with Docker
docker-compose -f docker-compose.yml up -d

# Setup SSL with Let's Encrypt
certbot certonly --standalone -d api.simbi-ke.com -d simbi-ke.com
```

### Nginx Reverse Proxy

```nginx
server {
    listen 443 ssl http2;
    server_name api.simbi-ke.com;

    ssl_certificate /etc/letsencrypt/live/api.simbi-ke.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.simbi-ke.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name simbi-ke.com;

    ssl_certificate /etc/letsencrypt/live/simbi-ke.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/simbi-ke.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Database Backups

```bash
# Backup database
docker-compose exec postgres pg_dump -U postgres simbi_ke > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T postgres psql -U postgres -d simbi_ke
```

---

## Monitoring

```bash
# View logs
docker-compose logs -f

# Monitor resource usage
docker stats

# Health check
curl http://localhost:5000/health
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port
lsof -ti:5000 | xargs kill -9
```

### Database Connection Issues
```bash
# Check database logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
docker-compose exec backend npm run migrate
```

### WebSocket Connection Failed
- Ensure firewall allows port 5000
- Check proxy configuration for WebSocket upgrade headers
- Verify CORS settings in backend

---

## Performance Optimization

1. **Enable Redis caching** for frequently accessed data
2. **Database indexing** on `users.phone_number`, `queue_entries.room_id`
3. **Load balancing** for multiple backend instances
4. **CDN** for frontend static assets
5. **Connection pooling** in database configuration

---

## Security Checklist

- [ ] Change default JWT_SECRET in production
- [ ] Use strong database passwords
- [ ] Enable HTTPS/TLS everywhere
- [ ] Implement rate limiting
- [ ] Enable CORS only for allowed domains
- [ ] Rotate API keys regularly
- [ ] Set up firewall rules
- [ ] Enable database backups
- [ ] Monitor for fraud patterns
- [ ] Log all transactions
