@echo off
echo ================================================
echo   Quick Redeploy to Netlify
echo ================================================
echo.
echo This will rebuild and redeploy your application
echo with the latest changes.
echo.
pause

echo.
echo Step 1: Building the application...
cd client
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo ✓ Build complete
cd ..

echo.
echo Step 2: Deploying to Netlify...
call netlify deploy --prod
if errorlevel 1 (
    echo ERROR: Deployment failed
    echo Make sure you're logged in: netlify login
    pause
    exit /b 1
)

echo.
echo ================================================
echo   Redeployment Complete!
echo ================================================
echo.
echo Your changes are now live at:
echo https://cleanleaf.netlify.app
echo.
echo New features added:
echo - Refresh Data button
echo - Last updated timestamp
echo - Auto-refresh indicator
echo.
pause

