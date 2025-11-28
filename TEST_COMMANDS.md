# Task Manager Application - Testing Commands

## 🚀 Quick Start

### 1. Start All Services
```powershell
docker-compose up -d
```

### 2. Check Container Status
```powershell
docker-compose ps
```

Expected output: All services should show "Up" or "healthy" status.

---

## 🔍 View Logs

### View Backend Logs (Live)
```powershell
docker-compose logs -f backend
```
**Press `Ctrl+C` to exit**

### View Frontend Logs (Live)
```powershell
docker-compose logs -f frontend
```

### View All Logs
```powershell
docker-compose logs -f
```

### View Last 50 Lines
```powershell
docker-compose logs --tail=50
```

---

## 🧪 Test Backend API

### 1. Test Health Endpoint
```powershell
curl http://localhost:8000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "environment": "development",
  "version": "1.0.0"
}
```

### 2. Test Root Endpoint
```powershell
curl http://localhost:8000/
```

### 3. Open API Documentation
Open in your browser:
- **Swagger UI**: http://localhost:8000/api/v1/docs
- **ReDoc**: http://localhost:8000/api/v1/redoc

### 4. Test User Registration
```powershell
curl -X POST http://localhost:8000/api/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    \"email\": \"test@example.com\",
    \"password\": \"Test123456!\",
    \"full_name\": \"Test User\"
  }'
```

### 5. Test User Login
```powershell
curl -X POST http://localhost:8000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    \"username\": \"test@example.com\",
    \"password\": \"Test123456!\"
  }'
```

---

## 🎨 Test Frontend

### 1. Open Frontend in Browser
```
http://localhost:5173
```

### 2. Check Frontend is Running
```powershell
curl http://localhost:5173
```

---

## 🔧 Troubleshooting Commands

### Rebuild Backend from Scratch
```powershell
docker-compose down backend
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Rebuild All Services
```powershell
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Stop All Services
```powershell
docker-compose down
```

### Stop and Remove Volumes (Database Reset)
```powershell
docker-compose down -v
```

### View Container Resources
```powershell
docker stats
```

### Inspect Backend Container
```powershell
docker-compose exec backend bash
```

### Inspect Database Container
```powershell
docker-compose exec postgres psql -U taskmanager -d taskmanager_db
```

---

## 📊 Monitoring Services

### Prometheus (Metrics)
```
http://localhost:9090
```

### Grafana (Dashboards)
```
http://localhost:3001
```
- **Username**: admin
- **Password**: admin

---

## 🗄️ Database Commands

### Connect to PostgreSQL Database
```powershell
docker-compose exec postgres psql -U taskmanager -d taskmanager_db
```

### List All Tables
```sql
\dt
```

### View Users Table
```sql
SELECT * FROM users;
```

### Exit Database
```sql
\q
```

---

## 🧹 Cleanup Commands

### Remove Stopped Containers
```powershell
docker-compose rm
```

### Remove All Containers and Networks
```powershell
docker-compose down
```

### Remove Everything Including Volumes
```powershell
docker-compose down -v --rmi all
```

---

## ✅ Full Test Sequence

Run these commands in order to fully test the application:

```powershell
# 1. Start services
docker-compose up -d

# 2. Wait 10 seconds for services to start
Start-Sleep -Seconds 10

# 3. Check status
docker-compose ps

# 4. Test backend health
curl http://localhost:8000/health

# 5. View backend logs
docker-compose logs backend --tail=20

# 6. Open browser to frontend
Start-Process "http://localhost:5173"

# 7. Open API docs
Start-Process "http://localhost:8000/api/v1/docs"
```

---

## 🔥 Quick Fix for Common Issues

### Issue: Backend shows "ModuleNotFoundError"
```powershell
# Delete local venv
Remove-Item -Recurse -Force backend\venv -ErrorAction SilentlyContinue

# Rebuild backend
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Issue: Port Already in Use
```powershell
# Find and kill process on port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Issue: Database Connection Failed
```powershell
# Restart database
docker-compose restart postgres

# Wait for database to be ready
docker-compose logs postgres --tail=20
```

---

## 📱 API Testing with PowerShell

### Complete User Flow Test
```powershell
# 1. Register a new user
$registerResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"user@test.com","password":"Password123!","full_name":"Test User"}'

Write-Host "Registration: $($registerResponse | ConvertTo-Json)"

# 2. Login
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username":"user@test.com","password":"Password123!"}'

$token = $loginResponse.access_token
Write-Host "Token: $token"

# 3. Get current user profile
$headers = @{
  "Authorization" = "Bearer $token"
}

$profile = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/users/me" `
  -Method GET `
  -Headers $headers

Write-Host "Profile: $($profile | ConvertTo-Json)"
```

---

## 🎯 Success Indicators

Your app is working correctly if:

- ✅ `docker-compose ps` shows all services as "Up"
- ✅ `curl http://localhost:8000/health` returns `{"status":"healthy"}`
- ✅ `http://localhost:8000/api/v1/docs` opens in browser
- ✅ `http://localhost:5173` shows the frontend UI
- ✅ Backend logs show no error tracebacks
- ✅ You can register and login via API or frontend

---

## 📖 Additional Resources

- **Backend API**: http://localhost:8000/api/v1/docs
- **Frontend**: http://localhost:5173
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001

For more help, check the logs:
```powershell
docker-compose logs -f
```
