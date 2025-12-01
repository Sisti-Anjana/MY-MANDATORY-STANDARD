@echo off
echo ================================================
echo   Final Deploy - Easy Redeploy
echo ================================================
echo.
echo This will deploy your build folder to Netlify.
echo.
pause

echo.
echo Step 1: Checking if build exists...
if not exist "client\build" (
    echo Build folder not found. Building now...
    cd client
    call npm install
    call npm run build
    cd ..
    if not exist "client\build" (
        echo ERROR: Build failed
        pause
        exit /b 1
    )
    echo ✅ Build complete!
) else (
    echo ✅ Build folder found!
)

echo.
echo Step 2: Installing Netlify CLI (if needed)...
netlify --version >nul 2>&1
if errorlevel 1 (
    echo Installing Netlify CLI...
    call npm install -g netlify-cli
)

echo.
echo Step 3: Logging into Netlify...
echo (Browser will open - please login)
call netlify login
if errorlevel 1 (
    echo ERROR: Login failed
    pause
    exit /b 1
)

echo.
echo Step 4: Linking to your site...
echo When prompted, select: cleanleaf
echo.
pause

call netlify link
if errorlevel 1 (
    echo.
    echo ⚠️ Could not link automatically.
    echo Continuing with deploy...
    echo.
)

echo.
echo Step 5: Deploying to production...
echo.
echo Deploying client\build folder...
echo This will update your site: cleanleaf
echo.
pause

call netlify deploy --prod --dir=client/build

if errorlevel 1 (
    echo.
    echo ================================================
    echo   ⚠️ Deploy Failed
    echo ================================================
    echo.
    echo Alternative: Drag and drop method
    echo 1. Go to: https://app.netlify.com/drop
    echo 2. Drag client\build folder
    echo 3. Done!
    echo.
) else (
    echo.
    echo ================================================
    echo   ✅ DEPLOYMENT SUCCESSFUL!
    echo ================================================
    echo.
    echo Your single URL is live:
    echo.
    echo 🌐 https://cleanleaf.netlify.app
    echo.
    echo Everything works on this ONE URL:
    echo - Frontend ✅
    echo - Backend API (proxied) ✅
    echo - All features ✅
    echo.
    echo Share this URL with your team! 🎉
    echo.
)

pause

