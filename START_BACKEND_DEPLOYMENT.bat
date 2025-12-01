@echo off
cls
color 0A
echo ================================================================
echo        BACKEND DEPLOYMENT HELPER
echo ================================================================
echo.
echo This script will open all the necessary pages for deployment
echo.
echo You need to have:
echo   [x] Your code ready
echo   [x] A GitHub account
echo   [x] 10 minutes of time
echo.
echo ================================================================
echo.
pause
echo.
echo Opening necessary pages...
echo.

echo [1/5] Opening GitHub (to create repository)...
start https://github.com/new
timeout /t 2 >nul

echo [2/5] Opening Railway.app (for backend deployment)...
start https://railway.app/
timeout /t 2 >nul

echo [3/5] Opening Netlify (to update environment variables)...
start https://app.netlify.com/sites/portfolio-issue-tracker-hlsc/configuration/env
timeout /t 2 >nul

echo [4/5] Opening the deployment guide...
start DEPLOY_BACKEND_COMPLETE_GUIDE.md
timeout /t 2 >nul

echo [5/5] Opening your project folder...
start "" "%CD%\server"
timeout /t 1 >nul

echo.
echo ================================================================
echo   ALL PAGES OPENED!
echo ================================================================
echo.
echo Now follow the guide in DEPLOY_BACKEND_COMPLETE_GUIDE.md
echo.
echo Quick Steps Summary:
echo   1. Create GitHub repo (page is open)
echo   2. Upload your code to GitHub
echo   3. Deploy on Railway.app (page is open)
echo   4. Get your API URL from Railway
echo   5. Update Netlify environment variable (page is open)
echo   6. Redeploy your frontend
echo.
echo ================================================================
echo.
echo Your frontend is already deployed at:
echo https://portfolio-issue-tracker-hlsc.netlify.app
echo.
echo After backend deployment, it will be at:
echo https://[your-app].up.railway.app
echo.
echo ================================================================
pause
