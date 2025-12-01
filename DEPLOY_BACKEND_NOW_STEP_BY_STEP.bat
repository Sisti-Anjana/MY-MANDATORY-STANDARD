@echo off
echo ================================================
echo   Backend Deployment - Step by Step
echo ================================================
echo.
echo We'll deploy using Railway CLI (no Git needed!)
echo.
pause

echo.
echo ================================================
echo   STEP 1: Login to Railway
echo ================================================
echo.
echo A browser window will open for authentication.
echo Please login with your Railway account.
echo.
echo If you don't have a Railway account:
echo 1. Go to: https://railway.app
echo 2. Sign up with GitHub (free)
echo 3. Then run this script again
echo.
pause

cd server
echo.
echo Logging into Railway...
railway login
if errorlevel 1 (
    echo.
    echo ⚠️ Login failed or cancelled.
    echo Please make sure you have a Railway account.
    echo.
    pause
    cd ..
    exit /b 1
)
echo.
echo ✅ Logged into Railway!
cd ..

echo.
echo ================================================
echo   STEP 2: Initialize Railway Project
echo ================================================
echo.
pause

cd server
echo.
echo Initializing Railway project...
railway init
if errorlevel 1 (
    echo.
    echo ⚠️ Init failed. You may need to create a project in Railway dashboard first.
    echo.
    pause
    cd ..
    exit /b 1
)
echo.
echo ✅ Project initialized!
cd ..

echo.
echo ================================================
echo   STEP 3: Set Environment Variables
echo ================================================
echo.
pause

cd server
echo.
echo Setting environment variables...
railway variables set PORT=5001
railway variables set NODE_ENV=production
railway variables set USE_SUPABASE=true
railway variables set SUPABASE_URL=https://wkkclsbaavdlplcqrsyr.supabase.co
railway variables set SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY0MzcyMywiZXhwIjoyMDQ2MjE5NzIzfQ.tL6KYs3_-_zxJ3-RJ0DQm8fEQz3vWmBGhKXCl9_Dw6g
echo.
echo ✅ Environment variables set!
cd ..

echo.
echo ================================================
echo   STEP 4: Deploy to Railway
echo ================================================
echo.
pause

cd server
echo.
echo Deploying to Railway...
echo This may take a few minutes...
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
cd ..

echo.
echo ================================================
echo   STEP 5: Get Your Backend URL
echo ================================================
echo.
pause

cd server
echo.
echo Getting your backend URL...
railway domain
echo.
echo ⚠️ IMPORTANT: Copy the URL shown above!
echo This is your BACKEND URL.
echo.
cd ..

echo.
echo ================================================
echo   STEP 6: Update Netlify Frontend
echo ================================================
echo.
echo Now you need to connect your frontend to the backend:
echo.
echo 1. Go to: https://app.netlify.com
echo 2. Select site: cleanleaf
echo 3. Go to Site settings ^> Environment variables
echo 4. Add: REACT_APP_API_URL = https://your-backend-url/api
echo    (Use the URL from Step 5, add /api at the end)
echo 5. Click Save
echo 6. Go to Deploys tab
echo 7. Click "Trigger deploy" ^> "Deploy site"
echo.
pause

echo.
echo ================================================
echo   ✅ Deployment Process Complete!
echo ================================================
echo.
echo Your backend should now be deployed!
echo.
echo Next steps:
echo 1. Copy the backend URL from Step 5
echo 2. Update Netlify with that URL (Step 6)
echo 3. Test your application at: https://cleanleaf.netlify.app
echo.
pause

