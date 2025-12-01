@echo off
echo ================================================
echo   Deploy to Vercel - Single URL for Everything
echo ================================================
echo.
echo This will deploy BOTH frontend and backend to Vercel
echo on a SINGLE URL (e.g., https://your-app.vercel.app)
echo.
echo Frontend: https://your-app.vercel.app
echo Backend API: https://your-app.vercel.app/api
echo.
pause

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
if errorlevel 1 (
    echo ERROR: Failed to install Vercel CLI
    pause
    exit /b 1
)
echo ✓ Vercel CLI ready

echo.
echo Step 3: Installing dependencies...
cd client
if not exist node_modules (
    echo Installing client dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Client npm install failed
        cd ..
        pause
        exit /b 1
    )
) else (
    echo ✓ Client dependencies already installed
)
cd ..

cd server
if not exist node_modules (
    echo Installing server dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Server npm install failed
        cd ..
        pause
        exit /b 1
    )
) else (
    echo ✓ Server dependencies already installed
)
cd ..

echo.
echo Step 4: Building frontend...
cd client
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    cd ..
    pause
    exit /b 1
)
echo ✓ Frontend build complete
cd ..

echo.
echo Step 5: Logging into Vercel...
echo (A browser window will open for authentication)
call vercel login
if errorlevel 1 (
    echo ERROR: Vercel login failed
    pause
    exit /b 1
)

echo.
echo Step 6: Deploying to Vercel...
echo.
echo IMPORTANT: When prompted:
echo - Set up and deploy? Press Y
echo - Project name: portfolio-issue-tracker (or press Enter)
echo - In which directory is your code? Type: . (current directory)
echo - Want to override settings? Press N (vercel.json is already configured)
echo.
pause

call vercel --prod
if errorlevel 1 (
    echo ERROR: Deployment failed
    pause
    exit /b 1
)

echo.
echo Step 7: Setting environment variables...
echo.
echo IMPORTANT: After deployment, you need to set environment variables:
echo.
echo Go to: https://vercel.com/dashboard
echo Select your project
echo Go to Settings ^> Environment Variables
echo.
echo Add these variables:
echo.
echo REACT_APP_SUPABASE_URL = https://wkkclsbaavdlplcqrsyr.supabase.co
echo REACT_APP_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTY2MzksImV4cCI6MjA3NzIzMjYzOX0.cz3vhJ-U9riaUjb7JBcf_didvZWRVZryjOgTIxmVmQ8
echo USE_SUPABASE = true
echo SUPABASE_URL = https://wkkclsbaavdlplcqrsyr.supabase.co
echo SUPABASE_SERVICE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY0MzcyMywiZXhwIjoyMDQ2MjE5NzIzfQ.tL6KYs3_-_zxJ3-RJ0DQm8fEQz3vWmBGhKXCl9_Dw6g
echo NODE_ENV = production
echo.
echo Then go to Deployments tab and click "Redeploy"
echo.
pause

echo.
echo ================================================
echo   Deployment Complete!
echo ================================================
echo.
echo Your application is now live at a SINGLE URL:
echo.
echo Frontend: https://your-app.vercel.app
echo Backend API: https://your-app.vercel.app/api
echo.
echo Check the URL shown above after deployment!
echo.
echo Next steps:
echo 1. Set environment variables in Vercel dashboard
echo 2. Redeploy after adding variables
echo 3. Test your application
echo 4. Share the single URL with your team!
echo.
pause

