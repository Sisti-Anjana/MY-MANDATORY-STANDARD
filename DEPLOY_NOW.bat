@echo off
echo ================================================
echo   Deploy Directly from Folder
echo ================================================
echo.
echo Your build is ready in: client\build
echo.
echo This will deploy directly to Netlify.
echo.
pause

echo.
echo Checking Netlify CLI...
netlify --version >nul 2>&1
if errorlevel 1 (
    echo Installing Netlify CLI...
    call npm install -g netlify-cli
    if errorlevel 1 (
        echo ERROR: Failed to install Netlify CLI
        pause
        exit /b 1
    )
)

echo.
echo Logging into Netlify...
echo (Browser will open for authentication)
call netlify login
if errorlevel 1 (
    echo ERROR: Login failed
    pause
    exit /b 1
)

echo.
echo Linking to your site: cleanleaf
echo When prompted, select: cleanleaf
echo.
pause

call netlify link
if errorlevel 1 (
    echo.
    echo ⚠️ Link failed. You can continue anyway.
    echo.
)

echo.
echo Deploying client/build folder...
call netlify deploy --prod --dir=client/build

if errorlevel 1 (
    echo.
    echo ⚠️ Deploy failed. Try manual method:
    echo 1. Go to: https://app.netlify.com/drop
    echo 2. Drag client\build folder
    echo.
) else (
    echo.
    echo ================================================
    echo   ✅ Deployment Complete!
    echo ================================================
    echo.
    echo Your single URL:
    echo https://cleanleaf.netlify.app
    echo.
    echo Everything works on this ONE URL!
    echo.
)

pause

