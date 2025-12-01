@echo off
echo ================================================
echo   Deploy Backend Using Railway CLI (No Git!)
echo ================================================
echo.
echo This method doesn't require Git!
echo.
pause

echo.
echo Step 1: Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js is installed

echo.
echo Step 2: Installing Railway CLI...
call npm install -g @railway/cli
if errorlevel 1 (
    echo ❌ Failed to install Railway CLI
    pause
    exit /b 1
)
echo ✅ Railway CLI installed

echo.
echo Step 3: Logging into Railway...
echo (A browser window will open for authentication)
call railway login
if errorlevel 1 (
    echo ❌ Railway login failed
    pause
    exit /b 1
)

echo.
echo Step 4: Initializing Railway project...
cd server
call railway init
if errorlevel 1 (
    echo ❌ Railway init failed
    cd ..
    pause
    exit /b 1
)

echo.
echo Step 5: Setting environment variables...
call railway variables set PORT=5001
call railway variables set NODE_ENV=production
call railway variables set USE_SUPABASE=true
call railway variables set SUPABASE_URL=https://wkkclsbaavdlplcqrsyr.supabase.co
call railway variables set SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY0MzcyMywiZXhwIjoyMDQ2MjE5NzIzfQ.tL6KYs3_-_zxJ3-RJ0DQm8fEQz3vWmBGhKXCl9_Dw6g

echo.
echo Step 6: Deploying to Railway...
call railway up
if errorlevel 1 (
    echo ❌ Deployment failed
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo Step 7: Getting your backend URL...
call railway domain
echo.
echo Copy the URL shown above - this is your backend URL!
echo.

echo.
echo ================================================
echo   ✅ Deployment Complete!
echo ================================================
echo.
echo Your backend URL is shown above.
echo.
echo Next: Update Netlify with this URL
echo 1. Go to: https://app.netlify.com
echo 2. Site: cleanleaf
echo 3. Settings ^> Environment Variables
echo 4. Add: REACT_APP_API_URL = your-backend-url/api
echo 5. Redeploy frontend
echo.
pause

