@echo off
echo ================================================
echo   Deploy Directly from Folder
echo ================================================
echo.
echo This will build and deploy your frontend
echo directly from the client/build folder.
echo.
pause

echo.
echo Step 1: Building the application...
cd client

if not exist node_modules (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: npm install failed
        cd ..
        pause
        exit /b 1
    )
) else (
    echo Dependencies already installed
)

echo.
echo Building for production...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    cd ..
    pause
    exit /b 1
)

echo.
echo ✅ Build complete!
cd ..

echo.
echo Step 2: Checking Netlify CLI...
netlify --version >nul 2>&1
if errorlevel 1 (
    echo Netlify CLI not found. Installing...
    call npm install -g netlify-cli
    if errorlevel 1 (
        echo ERROR: Failed to install Netlify CLI
        pause
        exit /b 1
    )
    echo ✅ Netlify CLI installed
) else (
    echo ✅ Netlify CLI found
)

echo.
echo Step 3: Logging into Netlify...
echo (Browser will open for authentication)
call netlify login
if errorlevel 1 (
    echo ERROR: Netlify login failed
    pause
    exit /b 1
)

echo.
echo Step 4: Linking to existing site...
echo.
echo IMPORTANT: When prompted, select your site: cleanleaf
echo.
pause

call netlify link
if errorlevel 1 (
    echo.
    echo ⚠️ Link failed. Continuing with deploy...
    echo You may need to specify site manually.
)

echo.
echo Step 5: Deploying to production...
echo.
echo Deploying client/build folder to Netlify...
call netlify deploy --prod --dir=client/build
if errorlevel 1 (
    echo ERROR: Deployment failed
    pause
    exit /b 1
)

echo.
echo ================================================
echo   ✅ Deployment Complete!
echo ================================================
echo.
echo Your site is now live at:
echo https://cleanleaf.netlify.app
echo.
echo The API proxy is configured, so your single URL works!
echo.
pause

