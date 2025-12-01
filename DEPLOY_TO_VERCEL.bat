@echo off
echo ================================================
echo   Portfolio Issue Tracker - Vercel Deployment
echo ================================================
echo.

echo Step 1: Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed

echo.
echo Step 2: Installing Vercel CLI...
call npm install -g vercel
if errorlevel 1 (
    echo ERROR: Failed to install Vercel CLI
    pause
    exit /b 1
)
echo ✓ Vercel CLI installed

echo.
echo Step 3: Logging into Vercel...
echo (A browser window will open for authentication)
call vercel login
if errorlevel 1 (
    echo ERROR: Vercel login failed
    pause
    exit /b 1
)

echo.
echo Step 4: Deploying to Vercel...
echo.
echo IMPORTANT: When prompted:
echo - Set up and deploy? Press Y
echo - Project name: portfolio-issue-tracking
echo - In which directory is your code? Type: .\client
echo - Want to override settings? Press N
echo.
pause

call vercel
if errorlevel 1 (
    echo ERROR: Deployment failed
    pause
    exit /b 1
)

echo.
echo ================================================
echo   Deployment Complete!
echo ================================================
echo.
echo Next Steps:
echo 1. Go to https://vercel.com/dashboard
echo 2. Find your project: portfolio-issue-tracking
echo 3. Go to Settings ^> Environment Variables
echo 4. Add these variables:
echo    - REACT_APP_SUPABASE_URL
echo    - REACT_APP_SUPABASE_ANON_KEY
echo 5. Redeploy from the Deployments tab
echo.
echo Your app will be live at: https://portfolio-issue-tracking.vercel.app
echo.
pause
