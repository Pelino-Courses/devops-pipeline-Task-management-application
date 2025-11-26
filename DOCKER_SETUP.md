# Docker Setup Guide

## Overview

This Task Manager application has been fully dockerized with all services containerized and orchestrated using Docker Compose.

## 🐳 Docker Images Created

The following custom Docker images have been built locally:

1. **Backend Image**: `devops-pipeline-task-management-application-backend:latest`
   - Base: Python 3.11-slim
   - Size: ~806MB
   - Framework: FastAPI with Uvicorn
   - Features: Multi-stage build (development & production)

2. **Frontend Image**: `devops-pipeline-task-management-application-frontend:latest`
   - Base: Node 20-alpine (build) + Nginx-alpine (production)
   - Size: ~728MB
   - Framework: React + Vite
   - Features: Multi-stage build with Nginx for production serving

## 📦 Services Running

The docker-compose.yml orchestrates the following services:

| Service | Container Name | Image | Port Mapping | Purpose |
|---------|---------------|-------|--------------|---------|
| **postgres** | task-manager-db | postgres:15-alpine | 5432:5432 | PostgreSQL database |
| **backend** | task-manager-backend | custom backend image | 8000:8000 | FastAPI REST API |
| **frontend** | task-manager-frontend | custom frontend image | 5173:5173 | React UI (dev mode) |
| **redis** | task-manager-redis | redis:7-alpine | 6379:6379 | Caching & sessions |
| **prometheus** | task-manager-prometheus | prom/prometheus:latest | 9090:9090 | Metrics collection |
| **grafana** | task-manager-grafana | grafana/grafana:latest | 3001:3000 | Monitoring dashboards |

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Docker Compose v2.x

### 1. Build the Images
```bash
docker-compose build
```

### 2. Start All Services
```bash
docker-compose up -d
```

### 3. Verify Services are Running
```bash
docker-compose ps
```

All services should show as "Up" status.

## 🌐 Access Points

Once all containers are running, you can access:

- **Frontend (UI)**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **API Redoc**: http://localhost:8000/redoc
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001
  - Default credentials: admin/admin

## 📋 Docker Commands Cheat Sheet

### View Running Containers
```bash
docker-compose ps
```

### View Container Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f backend
```

### Stop All Services
```bash
docker-compose down
```

### Stop and Remove Volumes (Clean Slate)
```bash
docker-compose down -v
```

### Restart a Specific Service
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Rebuild a Specific Service
```bash
docker-compose build backend
docker-compose build frontend
```

### Execute Commands in Running Container
```bash
# Backend container
docker exec -it task-manager-backend /bin/bash

# Frontend container
docker exec -it task-manager-frontend /bin/sh

# Database container
docker exec -it task-manager-db psql -U taskmanager -d taskmanager_db
```

### View Resource Usage
```bash
docker stats
```

### List All Docker Images
```bash
docker images
```

### Remove Unused Images
```bash
docker image prune -a
```

## 🔧 Configuration

### Environment Variables

**Backend** (defined in docker-compose.yml):
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret key
- `ALGORITHM`: JWT algorithm (HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration (30)
- `REFRESH_TOKEN_EXPIRE_DAYS`: Refresh token expiration (7)
- `ENVIRONMENT`: development/production
- `CORS_ORIGINS`: Allowed CORS origins

**Frontend**:
- `VITE_API_BASE_URL`: Backend API URL

### Volumes

Persistent data is stored in Docker volumes:
- `postgres_data`: Database files
- `redis_data`: Redis persistence
- `backend_uploads`: File uploads
- `prometheus_data`: Metrics data
- `grafana_data`: Dashboards and settings

### Network

All services communicate through a custom bridge network: `app-network`

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Docker Compose                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐   ┌──────────────┐   ┌─────────────┐ │
│  │   Frontend   │───│   Backend    │───│  PostgreSQL │ │
│  │  (React/Vite)│   │  (FastAPI)   │   │   Database  │ │
│  │  Port: 5173  │   │  Port: 8000  │   │  Port: 5432 │ │
│  └──────────────┘   └──────────────┘   └─────────────┘ │
│         │                   │                           │
│         │                   │                           │
│         │            ┌──────────────┐                   │
│         │            │    Redis     │                   │
│         │            │ Port: 6379   │                   │
│         │            └──────────────┘                   │
│         │                                               │
│  ┌──────────────┐   ┌──────────────┐                   │
│  │  Prometheus  │   │   Grafana    │                   │
│  │  Port: 9090  │───│  Port: 3001  │                   │
│  └──────────────┘   └──────────────┘                   │
│                                                          │
│              All connected via app-network               │
└─────────────────────────────────────────────────────────┘
```

## 🔒 Security Features

1. **Multi-stage builds**: Separate development and production stages
2. **Non-root user**: Backend runs as non-root user in production
3. **Health checks**: PostgreSQL, Redis, and Backend have health checks
4. **Network isolation**: Custom Docker network
5. **Environment variables**: Secrets managed via environment variables

## 🧪 Database Management

### Access PostgreSQL Database
```bash
docker exec -it task-manager-db psql -U taskmanager -d taskmanager_db
```

### Backup Database
```bash
docker exec task-manager-db pg_dump -U taskmanager taskmanager_db > backup.sql
```

### Restore Database
```bash
cat backup.sql | docker exec -i task-manager-db psql -U taskmanager -d taskmanager_db
```

## 📊 Monitoring

### Prometheus Metrics
- Backend exposes metrics at: http://localhost:8000/metrics
- Prometheus scrapes these metrics automatically
- View metrics at: http://localhost:9090

### Grafana Dashboards
1. Access Grafana at http://localhost:3001
2. Login with admin/admin
3. Prometheus is pre-configured as a datasource
4. Import custom dashboards from `/monitoring/grafana/dashboards`

## 🐛 Troubleshooting

### Backend Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Common issues:
# - Database not ready: Wait for postgres health check
# - Port already in use: Change port in docker-compose.yml
```

### Frontend Container Issues
```bash
# Check logs
docker-compose logs frontend

# Rebuild if needed
docker-compose build frontend
docker-compose up -d frontend
```

### Database Connection Issues
```bash
# Verify postgres is healthy
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker exec -it task-manager-db pg_isready -U taskmanager
```

### Clear All Data and Start Fresh
```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Rebuild images
docker-compose build

# Start fresh
docker-compose up -d
```

## 📝 Production Deployment

For production deployment:

1. Update the frontend Dockerfile target to `production`:
```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
    target: production  # Change from development
```

2. Update backend to use production stage:
```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile
    target: production  # Explicitly set production stage
```

3. Update environment variables:
   - Change `SECRET_KEY` to a secure random string
   - Update `POSTGRES_PASSWORD`
   - Set `ENVIRONMENT=production`

4. Consider using Docker Swarm or Kubernetes for orchestration

## 🔄 Updates and Maintenance

### Update a Service
```bash
# Pull latest changes
git pull

# Rebuild specific service
docker-compose build backend

# Restart with new image
docker-compose up -d backend
```

### Update All Services
```bash
docker-compose build
docker-compose up -d
```

### View Docker Disk Usage
```bash
docker system df
```

### Clean Up Unused Resources
```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Clean everything
docker system prune -a --volumes
```

## 📖 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## ✅ Verification Checklist

After running `docker-compose up -d`, verify:

- [ ] All 6 containers are running (`docker-compose ps`)
- [ ] Backend is accessible at http://localhost:8000/docs
- [ ] Frontend is accessible at http://localhost:5173
- [ ] PostgreSQL is healthy (`docker-compose ps postgres`)
- [ ] Redis is healthy (`docker-compose ps redis`)
- [ ] No errors in logs (`docker-compose logs`)
- [ ] Can create a test user via the UI
- [ ] Can create a test task via the UI

---

**Created**: 2025-11-26
**Docker Version**: 28.5.2
**Docker Compose Version**: v2.40.3
