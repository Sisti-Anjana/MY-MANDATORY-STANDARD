@echo off
echo ================================================
echo   Automated Backend Deployment
echo ================================================
echo.
echo Railway CLI is installed and ready!
echo.
echo This script will guide you through deployment.
echo Some steps require browser interaction.
echo.
pause

cd "%~dp0server"

echo.
echo ================================================
echo   STEP 1: Login to Railway
echo ================================================
echo.
echo A browser window will open for authentication.
echo Please complete the login in your browser.
echo.
pause

railway login
if errorlevel 1 (
    echo.
    echo ⚠️ Login failed or cancelled.
    echo Please make sure you have a Railway account at https://railway.app
    echo.
    pause
    cd ..
    exit /b 1
)

echo.
echo ✅ Logged into Railway!
echo.

echo ================================================
echo   STEP 2: Initialize Project
echo ================================================
echo.
echo Creating new Railway project...
echo.
pause

railway init
if errorlevel 1 (
    echo.
    echo ⚠️ Init failed. You may need to create project manually.
    echo Go to: https://railway.app/new
    echo.
    pause
    cd ..
    exit /b 1
)

echo.
echo ✅ Project initialized!
echo.

echo ================================================
echo   STEP 3: Setting Environment Variables
echo ================================================
echo.
echo Setting up environment variables...
echo.

railway variables set PORT=5001
railway variables set NODE_ENV=production
railway variables set USE_SUPABASE=true
railway variables set SUPABASE_URL=https://wkkclsbaavdlplcqrsyr.supabase.co
railway variables set SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY0MzcyMywiZXhwIjoyMDQ2MjE5NzIzfQ.tL6KYs3_-_zxJ3-RJ0DQm8fEQz3vWmBGhKXCl9_Dw6g

echo.
echo ✅ Environment variables set!
echo.

echo ================================================
echo   STEP 4: Deploying to Railway
echo ================================================
echo.
echo This will upload and deploy your backend.
echo It may take 2-3 minutes...
echo.
pause

railway up
if errorlevel 1 (
    echo.
    echo ⚠️ Deployment failed. Check the error above.
    echo.
    pause
    cd ..
    exit /b 1
)

echo.
echo ✅ Deployment complete!
echo.

echo ================================================
echo   STEP 5: Getting Your Backend URL
echo ================================================
echo.
echo Your backend URL:
echo.

railway domain

echo.
echo ⚠️ IMPORTANT: Copy the URL shown above!
echo This is your BACKEND URL.
echo.
pause

cd ..

echo.
echo ================================================
echo   STEP 6: Update Netlify (Manual Step)
echo ================================================
echo.
echo Now update your Netlify frontend:
echo.
echo 1. Go to: https://app.netlify.com
echo 2. Select site: cleanleaf
echo 3. Site settings ^> Environment variables
echo 4. Add: REACT_APP_API_URL = https://your-backend-url/api
echo    (Use the URL from Step 5, add /api at the end)
echo 5. Click Save
echo 6. Deploys tab ^> Trigger deploy ^> Deploy site
echo.
echo Opening Netlify dashboard...
start https://app.netlify.com
echo.
pause

echo.
echo ================================================
echo   ✅ Deployment Complete!
echo ================================================
echo.
echo Your backend is deployed!
echo.
echo Next: Update Netlify with the backend URL (Step 6)
echo Then test: https://cleanleaf.netlify.app
echo.
pause
