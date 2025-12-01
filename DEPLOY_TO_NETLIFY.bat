@echo off
echo ================================================
echo   Portfolio Issue Tracker - Netlify Deployment
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
echo Step 2: Installing Netlify CLI...
call npm install -g netlify-cli
if errorlevel 1 (
    echo ERROR: Failed to install Netlify CLI
    pause
    exit /b 1
)
echo ✓ Netlify CLI installed

echo.
echo Step 3: Building the application...
cd client
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo ✓ Build complete
cd ..

echo.
echo Step 4: Logging into Netlify...
echo (A browser window will open for authentication)
call netlify login
if errorlevel 1 (
    echo ERROR: Netlify login failed
    pause
    exit /b 1
)

echo.
echo Step 5: Initializing Netlify site...
echo When prompted:
echo - Create & configure a new site? Press Y
echo - Team: Choose your team
echo - Site name: portfolio-issue-tracking (or press Enter for default)
echo - Build command: cd client ^&^& npm install ^&^& npm run build
echo - Directory to deploy: client/build
echo - Netlify functions folder: (press Enter to skip)
echo.
pause

call netlify init

echo.
echo Step 6: Setting environment variables...
call netlify env:set REACT_APP_SUPABASE_URL "https://wkkclsbaavdlplcqrsyr.supabase.co"
call netlify env:set REACT_APP_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTY2MzksImV4cCI6MjA3NzIzMjYzOX0.cz3vhJ-U9riaUjb7JBcf_didvZWRVZryjOgTIxmVmQ8"

echo.
echo Step 7: Deploying to production...
call netlify deploy --prod

echo.
echo ================================================
echo   Deployment Complete!
echo ================================================
echo.
echo ================================================
echo   YOUR APPLICATION IS NOW LIVE!
echo ================================================
echo.
echo Your single application link:
echo.
netlify status
echo.
echo OR check your Netlify dashboard for the live URL:
echo https://app.netlify.com
echo.
echo ================================================
echo   IMPORTANT: ONE LINK FOR EVERYTHING
echo ================================================
echo.
echo This single URL gives you access to:
echo - User Login Page
echo - Admin Login Page  
echo - Dashboard & Log Issues
echo - Issue Details
echo - Performance Analytics
echo - Admin Panel
echo - Coverage Matrix
echo - All features and functionality
echo.
echo The entire application is accessible from this one link!
echo.
echo Next steps:
echo 1. Copy the URL shown above
echo 2. Share it with your team
echo 3. Bookmark it for easy access
echo 4. Test all features to ensure everything works
echo.
pause
