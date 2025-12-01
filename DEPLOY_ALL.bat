@echo off
echo ================================================
echo   Portfolio Issue Tracker - Complete Deployment
echo ================================================
echo.
echo This script will help you deploy:
echo - Frontend (React App)
echo - Backend (if needed)
echo - All configurations
echo.
echo Choose your deployment platform:
echo.
echo 1. Netlify (Recommended - Easiest)
echo 2. Vercel (Alternative)
echo 3. Build Only (Test build locally)
echo 4. Exit
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto netlify
if "%choice%"=="2" goto vercel
if "%choice%"=="3" goto build
if "%choice%"=="4" goto end
goto invalid

:netlify
echo.
echo ================================================
echo   Deploying to Netlify
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
echo Step 2: Installing Netlify CLI (if not already installed)...
call npm install -g netlify-cli
echo ✓ Netlify CLI ready

echo.
echo Step 3: Installing dependencies...
cd client
if not exist node_modules (
    echo Installing client dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: npm install failed
        cd ..
        pause
        exit /b 1
    )
) else (
    echo ✓ Dependencies already installed
)
cd ..

echo.
echo Step 4: Building the application...
cd client
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    cd ..
    pause
    exit /b 1
)
echo ✓ Build complete
cd ..

echo.
echo Step 5: Logging into Netlify...
echo (A browser window will open for authentication)
call netlify login
if errorlevel 1 (
    echo ERROR: Netlify login failed
    pause
    exit /b 1
)

echo.
echo Step 6: Deploying to Netlify...
echo.
echo IMPORTANT: If this is your first deployment:
echo - Create & configure a new site? Press Y
echo - Team: Choose your team
echo - Site name: portfolio-issue-tracking (or press Enter for default)
echo - Build command: cd client ^&^& npm install ^&^& npm run build
echo - Directory to deploy: client/build
echo.
pause

call netlify deploy --prod --dir=client/build
if errorlevel 1 (
    echo ERROR: Deployment failed
    pause
    exit /b 1
)

echo.
echo Step 7: Setting environment variables...
call netlify env:set REACT_APP_SUPABASE_URL "https://wkkclsbaavdlplcqrsyr.supabase.co" --context production
call netlify env:set REACT_APP_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTY2MzksImV4cCI6MjA3NzIzMjYzOX0.cz3vhJ-U9riaUjb7JBcf_didvZWRVZryjOgTIxmVmQ8" --context production

echo.
echo Step 8: Redeploying with environment variables...
call netlify deploy --prod --dir=client/build

echo.
echo ================================================
echo   Deployment Complete!
echo ================================================
echo.
call netlify status
echo.
echo Your application is now live!
echo Check the URL above or visit: https://app.netlify.com
echo.
goto end

:vercel
echo.
echo ================================================
echo   Deploying to Vercel
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
echo Step 2: Installing Vercel CLI (if not already installed)...
call npm install -g vercel
echo ✓ Vercel CLI ready

echo.
echo Step 3: Installing dependencies...
cd client
if not exist node_modules (
    echo Installing client dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: npm install failed
        cd ..
        pause
        exit /b 1
    )
) else (
    echo ✓ Dependencies already installed
)
cd ..

echo.
echo Step 4: Logging into Vercel...
echo (A browser window will open for authentication)
call vercel login
if errorlevel 1 (
    echo ERROR: Vercel login failed
    pause
    exit /b 1
)

echo.
echo Step 5: Deploying to Vercel...
echo.
echo IMPORTANT: When prompted:
echo - Set up and deploy? Press Y
echo - Project name: portfolio-issue-tracking
echo - In which directory is your code? Type: client
echo - Want to override settings? Press N
echo.
pause

call vercel --prod
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
echo IMPORTANT: Next Steps:
echo 1. Go to https://vercel.com/dashboard
echo 2. Find your project: portfolio-issue-tracking
echo 3. Go to Settings ^> Environment Variables
echo 4. Add these variables:
echo    - REACT_APP_SUPABASE_URL = https://wkkclsbaavdlplcqrsyr.supabase.co
echo    - REACT_APP_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTY2MzksImV4cCI6MjA3NzIzMjYzOX0.cz3vhJ-U9riaUjb7JBcf_didvZWRVZryjOgTIxmVmQ8
echo 5. Go to Deployments tab and click "Redeploy"
echo.
echo Your app will be live at: https://portfolio-issue-tracking.vercel.app
echo.
goto end

:build
echo.
echo ================================================
echo   Building Application Locally
echo ================================================
echo.

echo Step 1: Installing dependencies...
cd client
if not exist node_modules (
    call npm install
    if errorlevel 1 (
        echo ERROR: npm install failed
        cd ..
        pause
        exit /b 1
    )
) else (
    echo ✓ Dependencies already installed
)

echo.
echo Step 2: Building the application...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ================================================
echo   Build Complete!
echo ================================================
echo.
echo Your build is ready in: client\build
echo.
echo To test locally, you can use:
echo   npx serve -s client\build
echo.
goto end

:invalid
echo.
echo Invalid choice. Please run the script again.
echo.
goto end

:end
echo.
echo ================================================
echo   Deployment Script Complete
echo ================================================
echo.
pause

