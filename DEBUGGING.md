# 🐛 Debugging Guide - Task Manager Application

## Current Status

**Frontend Server**: ❌ NOT RUNNING (ERR_CONNECTION_REFUSED on port 5173)
**Backend Server**: ❓ Unknown (need to verify if running on port 8000)

## Issues Found & Fixes Applied

### ✅ Fixed Issues:
1. **PostCSS Config** - Renamed to `.cjs` extension ✅
2. **CSS Error** - Removed undefined `border-border` class ✅  
3. **CORS Configuration** - Added parser for comma-separated values ✅
4. **API Base URL** - Added logging and fallback ✅
5. **SQLite Support** - Updated database configuration ✅

---

## 🚀 Step-by-Step Restart Guide

### Step 1: Start the Backend Server

Open **Terminal 1** and run:

```bash
cd C:\Users\johns\devops-pipeline-Task-management-application\backend
python -m uvicorn app.main:app --reload
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [XXXX] using StatReload
INFO:     Started server process [XXXX]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**If you see errors**, check:
- ✅ Are all Python dependencies installed?
- ✅ Does the `.env` file exist in the backend folder?

### Step 2: Start the Frontend Server

Open **Terminal 2** (NEW terminal window) and run:

```bash
cd C:\Users\johns\devops-pipeline-Task-management-application\frontend
npm run dev
```

**Expected Output:**
```
VITE v5.4.21  ready in XXXms

➜  Local:   http://localhost:5173/
➜  Network: http://XXX.XXX.XXX.XXX:5173/
```

**If you see PostCSS error:**
- The `postcss.config.cjs` rename should have fixed this
- If not, delete `node_modules` and run `npm install` again

### Step 3: Verify Everything is Running

Check these URLs:

1. **Frontend**: http://localhost:5173
   - Should show login page
   
2. **Backend Health**: http://localhost:8000/health
   - Should return: `{"status":"healthy","environment":"development","version":"1.0.0"}`
   
3. **API Docs**: http://localhost:8000/api/v1/docs
   - Should show Swagger UI with all endpoints

---

## 🧪 Testing Registration & Login

Once both servers are running:

### Test Registration:

1. Go to http://localhost:5173
2. Click "Sign up" or navigate to `/register`
3. Fill in the form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `Test1234` (must have uppercase, lowercase, and number)
4. Click "Create Account"

**Expected Result:** 
- Success toast message
- Redirect to login page

**If it fails, check:**
- Browser Console (F12) for errors
- Backend terminal for errors
- Network tab for the actual API response

### Test Login:

1. On login page, enter:
   - Username: `testuser`
   - Password: `Test1234`
2. Click "Sign In"

**Expected Result:**
- Success toast message
- Redirect to `/dashboard`
- You should see the dashboard with your username

---

## 🔍 Common Issues & Solutions

### Issue 1: "Network Error" or "ERR_CONNECTION_REFUSED"
**Cause:** Backend not running or wrong URL
**Fix:** 
1. Verify backend is running on port 8000
2. Check browser console for the "API Base URL:" log
3. Ensure `.env` file exists in frontend folder with `VITE_API_BASE_URL=http://localhost:8000`

### Issue 2: CORS Error
**Cause:** Backend blocking requests from frontend origin
**Fix:**
1. Check backend `.env` has: `CORS_ORIGINS=http://localhost:5173,http://localhost:3000`
2. Restart backend server

### Issue 3: "404 Not Found" on API calls
**Cause:** API endpoints not matching
**Fix:**
1. Check API docs at http://localhost:8000/api/v1/docs
2. Verify frontend is calling `/api/v1/auth/register` and `/api/v1/auth/login`

### Issue 4: "500 Internal Server Error"
**Cause:** Database or backend configuration issue
**Fix:**
1. Check backend terminal for Python errors
2. Verify `.env` file in backend has `DATABASE_URL=sqlite:///./taskmanager.db`
3. Check if `taskmanager.db` file was created in backend folder

### Issue 5: Frontend shows blank page
**Cause:** JavaScript error preventing React from rendering
**Fix:**
1. Open browser console (F12)
2. Look for red error messages
3. Check if all imports are resolving correctly

---

## 🎯 Quick Verification Commands

Run these to verify everything is set up:

```bash
# Check backend dependencies
cd backend
pip list | findstr "fastapi uvicorn pydantic"

# Check frontend dependencies  
cd frontend
npm list react vite axios

# Check if servers are listening on correct ports
netstat -ano | findstr "5173"  # Frontend
netstat -ano | findstr "8000"   # Backend
```

---

## 📊 Debug Checklist

Before asking for help, verify:

- [ ] Backend server is running without errors
- [ ] Frontend server is running without errors
- [ ] Can access http://localhost:8000/health
- [ ] Can access http://localhost:5173
- [ ] Browser console shows "API Base URL: http://localhost:8000"
- [ ] No CORS errors in console
- [ ] Network tab shows API calls going to correct endpoints

---

## 🎨 What Should Work After Fixing

Once everything is running, you can:

1. ✅ Register new users
2. ✅ Login with credentials
3. ✅ See dashboard with stats
4. ✅ Navigate between pages (Tasks, Profile, etc.)
5. ✅ Toggle dark/light theme
6. ✅ Logout

The UI is fully functional - the backend just needs to be running for auth to work!

---

**Current Next Step:** 
1. Restart the frontend server with `npm run dev`
2. Verify it starts on port 5173 without errors
3. Then test registration/login again
