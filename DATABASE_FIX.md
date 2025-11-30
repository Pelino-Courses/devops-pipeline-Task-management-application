# Database Connection Fix

## Problem

Your backend is trying to connect to a database named `"taskmanager"` but your PostgreSQL container creates a database named `"taskmanager_db"`.

The error you're seeing:
```
FATAL: database "taskmanager" does not exist
```

## Root Cause

Your `backend/.env` file contains:
```
DATABASE_URL=sqlite:///./taskmanager.db
```

This is incorrect for Docker. The Docker container needs to use PostgreSQL, not SQLite.

## Solution

### Option 1: Update the .env file (Recommended)

Update `backend/.env` with the correct PostgreSQL connection:

```bash
# Navigate to backend directory
cd backend

# Create/update .env file
echo DATABASE_URL=postgresql://taskmanager:taskmanager_password@postgres:5432/taskmanager_db > .env
echo SECRET_KEY=your-secret-key-change-in-production >> .env
echo ALGORITHM=HS256 >> .env
echo ACCESS_TOKEN_EXPIRE_MINUTES=30 >> .env
echo ENVIRONMENT=development >> .env
```

### Option 2: Delete the .env file

Since Docker Compose already sets these environment variables, you can delete the `.env` file:

```bash
# Delete the problematic .env file
del backend\.env

# Docker Compose will use the environment variables from docker-compose.yml
```

## After Fixing

Restart the backend container:

```bash
# Restart backend
docker-compose restart backend

# Wait 5 seconds
timeout /t 5 /nobreak

# Check backend logs
docker-compose logs backend --tail=20

# Test the health endpoint
curl http://localhost:8000/health
```

## Verify Database

Check that the database exists:

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U taskmanager -d taskmanager_db

# Inside PostgreSQL, list databases
\l

# You should see taskmanager_db

# List tables
\dt

# Exit
\q
```

## Expected Health Response

Once fixed, you should see:
```json
{
  "status": "healthy",
  "environment": "development",
  "version": "1.0.0"
}
```

## Complete Reset (If Still Having Issues)

If the problem persists, do a complete reset:

```bash
# Stop all containers
docker-compose down

# Remove volumes (WARNING: This deletes all data!)
docker-compose down -v

# Rebuild backend
docker-compose build --no-cache backend

# Start everything
docker-compose up -d

# Wait for services to be ready
timeout /t 10 /nobreak

# Check status
docker-compose ps

# Test backend
curl http://localhost:8000/health
```

## Why This Happened

1. Your `backend/.env` file was configured for local development with SQLite
2. Docker Compose uses environment variables from `docker-compose.yml`
3. The `.env` file takes precedence and overrides Docker Compose settings
4. This caused the backend to look for a SQLite database instead of PostgreSQL
5. The error messages are confusing because the backend is trying to connect to PostgreSQL with the wrong database name

## Prevention

To avoid this in the future:

1. **For Local Development** (without Docker):
   ```
   DATABASE_URL=postgresql://taskmanager:taskmanager_password@localhost:5432/taskmanager_db
   ```

2. **For Docker Development**:
   ```
   DATABASE_URL=postgresql://taskmanager:taskmanager_password@postgres:5432/taskmanager_db
   ```
   Note: Use `@postgres:` (container name) not `@localhost:`

3. **Best Practice**: 
   - Keep `backend/.env.example` for reference
   - Don't commit `backend/.env` to Git (already in `.gitignore`)
   - Let Docker Compose handle environment variables in Docker

## Quick Fix Commands

Run these commands in order:

```cmd
REM 1. Fix the .env file
echo DATABASE_URL=postgresql://taskmanager:taskmanager_password@postgres:5432/taskmanager_db > backend\.env

REM 2. Restart backend
docker-compose restart backend

REM 3. Wait a bit
timeout /t 5 /nobreak

REM 4. Check logs
docker-compose logs backend --tail=20

REM 5. Test health
curl http://localhost:8000/health

REM 6. Check database
docker-compose exec postgres psql -U taskmanager -d taskmanager_db -c "\dt"
```

## Success Criteria

✅ No more "database does not exist" errors in logs
✅ Backend health check returns 200 OK
✅ You can access http://localhost:8000/api/v1/docs
✅ You can register and login users

---

**Last Updated**: 2025-11-30
**Status**: Fix Applied
