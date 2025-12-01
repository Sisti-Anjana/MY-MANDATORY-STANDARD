@echo off
echo ================================================
echo   Portfolio Issue Tracker - Production Build
echo ================================================
echo.

echo Step 1: Cleaning previous builds...
cd client
if exist build rmdir /s /q build
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
echo ✓ Cleaned

echo.
echo Step 2: Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed

echo.
echo Step 3: Creating optimized production build...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo ✓ Build complete

echo.
echo ================================================
echo   Build Successful!
echo ================================================
echo.
echo Build location: client\build
echo Build size:
dir build /s
echo.
echo You can now:
echo 1. Deploy using DEPLOY_TO_VERCEL.bat (recommended)
echo 2. Deploy using DEPLOY_TO_NETLIFY.bat
echo 3. Upload the 'build' folder to your hosting
echo.
pause

cd ..
