# Task Manager Application - Testing Commands (CMD/PowerShell)

## 🚀 Quick Start

### 1. Start All Services
```cmd
docker-compose up -d
```

### 2. Check Container Status
```cmd
docker-compose ps
```

Expected output: All services should show "Up" or "healthy" status.

---

## 🔍 View Logs

### View Backend Logs (Live)
```cmd
docker-compose logs -f backend
```
**Press `Ctrl+C` to exit**

### View Frontend Logs (Live)
```cmd
docker-compose logs -f frontend
```

### View All Logs
```cmd
docker-compose logs -f
```

### View Last 50 Lines
```cmd
docker-compose logs --tail=50
```

---

## 🧪 Test Backend API

### 1. Test Health Endpoint
```cmd
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
```cmd
curl http://localhost:8000/
```

### 3. Open API Documentation in Browser
```cmd
start http://localhost:8000/api/v1/docs
```

Or manually open:
- **Swagger UI**: http://localhost:8000/api/v1/docs
- **ReDoc**: http://localhost:8000/api/v1/redoc

### 4. Test User Registration
```cmd
curl -X POST http://localhost:8000/api/v1/auth/register -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"Test123456!\",\"full_name\":\"Test User\"}"
```

### 5. Test User Login
```cmd
curl -X POST http://localhost:8000/api/v1/auth/login -H "Content-Type: application/json" -d "{\"username\":\"test@example.com\",\"password\":\"Test123456!\"}"
```

---

## 🎨 Test Frontend

### 1. Open Frontend in Browser
```cmd
start http://localhost:5173
```

Or manually open: http://localhost:5173

### 2. Check Frontend is Running
```cmd
curl http://localhost:5173
```

---

## 🔧 Troubleshooting Commands

### Rebuild Backend from Scratch (TESTED - WORKING!)
```cmd
docker-compose down backend
docker-compose build --no-cache backend
docker-compose up -d backend
timeout /t 10 /nobreak
docker-compose ps
docker-compose logs backend --tail=30
curl http://localhost:8000/health
```

### Rebuild All Services
```cmd
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Stop All Services
```cmd
docker-compose down
```

### Stop and Remove Volumes (Database Reset)
```cmd
docker-compose down -v
```

### View Container Resources
```cmd
docker stats
```

### Inspect Backend Container (Linux Shell)
```cmd
docker-compose exec backend bash
```

Inside the container, you can:
```bash
# Check installed packages
pip list

# Check Python version
python --version

# Check if psycopg2 is installed
python -c "import psycopg2; print(psycopg2.__version__)"

# Exit container
exit
```

### Inspect Database Container
```cmd
docker-compose exec postgres psql -U taskmanager -d taskmanager_db
```

---

## 📊 Monitoring Services

### Prometheus (Metrics)
```cmd
start http://localhost:9090
```
Or open: http://localhost:9090

### Grafana (Dashboards)
```cmd
start http://localhost:3001
```
Or open: http://localhost:3001
- **Username**: admin
- **Password**: admin

---

## 🗄️ Database Commands

### Connect to PostgreSQL Database
```cmd
docker-compose exec postgres psql -U taskmanager -d taskmanager_db
```

### Inside PostgreSQL, run:
```sql
-- List all tables
\dt

-- View users table structure
\d users

-- View all users
SELECT * FROM users;

-- View all tasks
SELECT * FROM tasks;

-- View all teams
SELECT * FROM teams;

-- Count users
SELECT COUNT(*) FROM users;

-- Exit database
\q
```

---

## 🧹 Cleanup Commands

### Remove Stopped Containers
```cmd
docker-compose rm
```

### Remove All Containers and Networks
```cmd
docker-compose down
```

### Remove Everything Including Volumes
```cmd
docker-compose down -v --rmi all
```

---

## ✅ Full Test Sequence (CMD)

Run these commands in order to fully test the application:

```cmd
REM 1. Start all services
docker-compose up -d

REM 2. Wait 10 seconds
timeout /t 10 /nobreak

REM 3. Check status
docker-compose ps

REM 4. Test backend health
curl http://localhost:8000/health

REM 5. View backend logs
docker-compose logs backend --tail=20

REM 6. Open frontend in browser
start http://localhost:5173

REM 7. Open API docs in browser
start http://localhost:8000/api/v1/docs
```

---

## 🔥 Quick Fix for Common Issues

### Issue: Backend shows "ModuleNotFoundError: No module named 'psycopg2'"
**SOLUTION (TESTED - WORKING!):**
```cmd
REM Stop and remove backend container
docker-compose down backend

REM Delete local venv if it exists
if exist backend\venv rmdir /s /q backend\venv

REM Rebuild backend with no cache
docker-compose build --no-cache backend

REM Start backend
docker-compose up -d backend

REM Wait 10 seconds
timeout /t 10 /nobreak

REM Check status
docker-compose ps

REM Test health
curl http://localhost:8000/health
```

### Issue: Port Already in Use (8000, 5173, 5432, etc.)
```cmd
REM Find process using port 8000
netstat -ano | findstr :8000

REM Kill the process (replace 12345 with actual PID from above)
taskkill /PID 12345 /F
```

### Issue: Database Connection Failed
```cmd
REM Restart database
docker-compose restart postgres

REM Wait for database to be ready
timeout /t 5 /nobreak

REM Check database logs
docker-compose logs postgres --tail=20
```

### Issue: Container shows "unhealthy"
```cmd
REM View health check logs
docker inspect task-manager-backend --format="{{json .State.Health}}"

REM Restart the unhealthy container
docker-compose restart backend

REM Check logs for errors
docker-compose logs backend --tail=30
```

---

## 📱 API Testing Sequence

### Complete User Flow Test
```cmd
REM 1. Register a new user
curl -X POST http://localhost:8000/api/v1/auth/register -H "Content-Type: application/json" -d "{\"email\":\"user@test.com\",\"password\":\"Password123!\",\"full_name\":\"Test User\"}"

REM 2. Login to get token
curl -X POST http://localhost:8000/api/v1/auth/login -H "Content-Type: application/json" -d "{\"username\":\"user@test.com\",\"password\":\"Password123!\"}"

REM Note: Copy the "access_token" from the response above

REM 3. Get current user profile (replace YOUR_TOKEN with actual token)
curl http://localhost:8000/api/v1/users/me -H "Authorization: Bearer YOUR_TOKEN"

REM 4. Create a task (replace YOUR_TOKEN with actual token)
curl -X POST http://localhost:8000/api/v1/tasks -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d "{\"title\":\"My First Task\",\"description\":\"Testing the API\",\"status\":\"todo\",\"priority\":\"medium\"}"

REM 5. List all tasks
curl http://localhost:8000/api/v1/tasks -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 Success Indicators

Your app is working correctly if:

- ✅ `docker-compose ps` shows all services as "Up" or "healthy"
- ✅ `curl http://localhost:8000/health` returns `{"status":"healthy",...}`
- ✅ `http://localhost:8000/api/v1/docs` opens Swagger UI in browser
- ✅ `http://localhost:5173` shows the frontend UI
- ✅ Backend logs show "Application startup complete" with no errors
- ✅ You can register and login via API or frontend
- ✅ Database is accessible and tables are created

---

## 📖 Service URLs

- **Backend API**: http://localhost:8000
- **Backend Health**: http://localhost:8000/health
- **API Documentation (Swagger)**: http://localhost:8000/api/v1/docs
- **API Documentation (ReDoc)**: http://localhost:8000/api/v1/redoc
- **Frontend**: http://localhost:5173
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

---

## 🐛 Debugging Tips

### View Real-Time Container Logs
```cmd
REM All services
docker-compose logs -f

REM Specific service
docker-compose logs -f backend
```

### Check Container Resource Usage
```cmd
docker stats
```

### Inspect Container Configuration
```cmd
docker inspect task-manager-backend
```

### View Environment Variables in Container
```cmd
docker-compose exec backend env
```

### Check Network Connectivity
```cmd
REM From backend to database
docker-compose exec backend ping postgres

REM Check if backend can access database
docker-compose exec backend nc -zv postgres 5432
```

---

## 📝 Notes

- **Comments in CMD**: Use `REM` instead of `#`
- **Waiting**: Use `timeout /t SECONDS /nobreak` instead of `Start-Sleep`
- **Opening Browser**: Use `start URL` instead of `Start-Process`
- **Line Continuation**: Use `^` at end of line in CMD

For PowerShell users, replace:
- `REM` → `#`
- `timeout /t 10 /nobreak` → `Start-Sleep -Seconds 10`
- `start URL` → `Start-Process "URL"`

---

## ✨ Current Status

**All systems operational!** ✅

Your Task Manager application is now running successfully with:
- ✅ Backend API (Python/FastAPI)
- ✅ Frontend (React/Vite)
- ✅ PostgreSQL Database
- ✅ Redis Cache
- ✅ Prometheus Monitoring
- ✅ Grafana Dashboards

**Next Steps:**
1. Open http://localhost:5173 to use the application
2. Open http://localhost:8000/api/v1/docs to explore the API
3. Register a new user and start creating tasks!

For help, check logs: `docker-compose logs -f`
