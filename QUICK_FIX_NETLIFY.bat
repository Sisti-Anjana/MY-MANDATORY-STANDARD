@echo off
echo ================================================
echo   Quick Fix: Netlify Build Settings
echo ================================================
echo.
echo The build is failing because Netlify settings
echo don't match the project structure.
echo.
echo Opening Netlify settings...
start https://app.netlify.com/sites/cleanleaf/configuration/deploys
echo.
echo ================================================
echo   Update These Settings:
echo ================================================
echo.
echo 1. Base directory: client
echo 2. Build command: npm install ^&^& npm run build
echo 3. Publish directory: client/build
echo.
echo ================================================
echo   Step-by-Step:
echo ================================================
echo.
echo 1. In Netlify (should be open):
echo    - Go to Site settings (gear icon)
echo    - Click "Build ^& deploy"
echo.
echo 2. In "Build settings" section:
echo    - Base directory: client
echo    - Build command: npm install ^&^& npm run build
echo    - Publish directory: client/build
echo    - Click "Save"
echo.
echo 3. Go to Deploys tab:
echo    - Click "Trigger deploy"
echo    - Select "Deploy site"
echo    - Wait 2-3 minutes
echo.
echo 4. Done! Your single URL will work!
echo.
pause

