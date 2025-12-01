@echo off
echo ================================================
echo   Backend Server Deployment Helper
echo ================================================
echo.
echo This will help you deploy your backend server.
echo.
echo Choose your deployment platform:
echo.
echo 1. Railway.app (Recommended - Easier)
echo 2. Render.com (Alternative)
echo.
echo ================================================
echo   RECOMMENDED: Railway.app
echo ================================================
echo.
echo Step 1: Open Railway.app
echo https://railway.app/
echo.
echo Step 2: Sign in with GitHub
echo.
echo Step 3: Click "New Project"
echo.
echo Step 4: Select "Deploy from GitHub repo"
echo.
echo Step 5: Select your repository
echo (Create one first if needed: https://github.com/new)
echo.
echo Step 6: Configure:
echo   - Root Directory: server
echo   - Start Command: npm start
echo   - Build Command: npm install
echo.
echo Step 7: Add Environment Variables:
echo   PORT = 5001
echo   NODE_ENV = production
echo   SUPABASE_URL = https://wkkclsbaavdlplcqrsyr.supabase.co
echo   SUPABASE_SERVICE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrY2xzYmFhdmRscGxjcXJzeXIiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzMwNjQzNzIzLCJleHAiOjIwNDYyMTk3MjN9.tL6KYs3_-_zxJ3-RJ0DQm8fEQz3vWmBGhKXCl9_Dw6g
echo   JWT_SECRET = portfolio-issue-tracker-jwt-secret-2024
echo.
echo Step 8: Get your backend URL from Railway
echo (Settings -^> Networking -^> Generate Domain)
echo.
echo Step 9: Update Netlify environment variable:
echo   REACT_APP_API_URL = https://your-backend-url.up.railway.app/api
echo.
echo Step 10: Redeploy frontend on Netlify
echo.
echo ================================================
echo   Detailed Guide: DEPLOY_BACKEND_TO_RAILWAY.md
echo ================================================
echo.
echo Opening guides in browser...
start https://railway.app/
timeout /t 2 >nul
start DEPLOY_BACKEND_TO_RAILWAY.md
echo.
pause
