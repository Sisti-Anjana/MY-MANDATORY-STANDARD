@echo off
echo ================================================
echo   Deploy Backend to Render.com
echo ================================================
echo.
echo Your frontend is already on Netlify:
echo ✅ https://cleanleaf.netlify.app
echo.
echo We'll deploy backend to Render and configure
echo Netlify to proxy API requests for a single URL!
echo.
pause

echo.
echo Opening Render.com...
start https://render.com
echo.
echo ================================================
echo   STEP 1: Create Render Account
echo ================================================
echo.
echo 1. Click "Get Started for Free"
echo 2. Sign up with GitHub or email
echo 3. No credit card required!
echo.
pause

echo.
echo ================================================
echo   STEP 2: Create Web Service
echo ================================================
echo.
echo 1. Click "New" ^> "Web Service"
echo 2. Choose one of these options:
echo.
echo    OPTION A: Connect GitHub (if you have Git)
echo    - Click "Connect GitHub"
echo    - Authorize Render
echo    - Select repository (or create new one)
echo.
echo    OPTION B: Public Git Repository
echo    - Select "Public Git repository"
echo    - You'll need to create GitHub repo first
echo.
echo    OPTION C: Manual Deploy (Easiest - No Git!)
echo    - We'll prepare a ZIP file for you
echo.
echo.
set /p deploy_method="Which method? (A/B/C): "

if /i "%deploy_method%"=="C" goto manual_deploy
goto continue

:manual_deploy
echo.
echo ================================================
echo   Preparing Manual Deploy Package
echo ================================================
echo.
echo Creating ZIP file of server folder...
cd server
powershell Compress-Archive -Path * -DestinationPath ..\server-deploy.zip -Force
cd ..
echo.
echo ✅ Created: server-deploy.zip
echo.
echo Instructions for Render:
echo 1. In Render, select "Manual Deploy"
echo 2. Upload: server-deploy.zip
echo 3. Continue with configuration below
echo.
pause
goto continue

:continue
echo.
echo ================================================
echo   STEP 3: Configure Service
echo ================================================
echo.
echo In Render, configure these settings:
echo.
echo Name: portfolio-issue-tracker-backend
echo Environment: Node
echo Region: Choose closest to you
echo Branch: main (or master)
echo Root Directory: server
echo Build Command: npm install
echo Start Command: npm start
echo.
pause

echo.
echo ================================================
echo   STEP 4: Add Environment Variables
echo ================================================
echo.
echo In Render, click "Advanced" ^> "Add Environment Variable"
echo Add these one by one:
echo.
echo PORT = 10000
echo NODE_ENV = production
echo USE_SUPABASE = true
echo SUPABASE_URL = https://wkkclsbaavdlplcqrsyr.supabase.co
echo SUPABASE_SERVICE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY0MzcyMywiZXhwIjoyMDQ2MjE5NzIzfQ.tL6KYs3_-_zxJ3-RJ0DQm8fEQz3vWmBGhKXCl9_Dw6g
echo.
pause

echo.
echo ================================================
echo   STEP 5: Deploy
echo ================================================
echo.
echo 1. Click "Create Web Service"
echo 2. Wait 2-3 minutes for deployment
echo 3. Copy your Render URL
echo    (e.g., https://portfolio-issue-tracker-backend.onrender.com)
echo.
echo ⚠️ IMPORTANT: Copy the URL shown in Render!
echo.
pause

echo.
echo ================================================
echo   STEP 6: Configure Netlify for Single URL
echo ================================================
echo.
echo Now we'll configure Netlify to proxy API requests
echo so everything works on ONE URL!
echo.
echo Opening Netlify dashboard...
start https://app.netlify.com
echo.
echo Instructions:
echo 1. Select site: cleanleaf
echo 2. Go to Site settings ^> Build ^& deploy ^> Post processing
echo 3. We'll update netlify.toml file (next step)
echo.
pause

echo.
echo ================================================
echo   STEP 7: Update netlify.toml
echo ================================================
echo.
echo Please provide your Render backend URL:
echo (e.g., https://portfolio-issue-tracker-backend.onrender.com)
set /p render_url="Render URL: "

echo.
echo Updating netlify.toml to proxy API requests...
echo.
echo This will make API calls go through Netlify
echo so everything appears on ONE URL!
echo.

REM Create backup
copy netlify.toml netlify.toml.backup >nul 2>&1

REM Add proxy redirect to netlify.toml
(
echo [[redirects]]
echo   from = "/api/*"
echo   to = "%render_url%/api/:splat"
echo   status = 200
echo   force = true
) >> netlify.toml

echo ✅ Updated netlify.toml
echo.
echo The file now includes API proxy redirect.
echo.

echo.
echo ================================================
echo   STEP 8: Redeploy Netlify
echo ================================================
echo.
echo 1. Commit and push the updated netlify.toml
echo    OR manually update in Netlify dashboard
echo.
echo 2. In Netlify:
echo    - Go to Deploys tab
echo    - Click "Trigger deploy" ^> "Deploy site"
echo    - Wait 2-3 minutes
echo.
echo 3. After deployment:
echo    - Frontend: https://cleanleaf.netlify.app
echo    - API calls: https://cleanleaf.netlify.app/api/*
echo    - Everything on ONE URL! ✅
echo.
pause

echo.
echo ================================================
echo   ✅ Deployment Complete!
echo ================================================
echo.
echo Your setup:
echo - Frontend: https://cleanleaf.netlify.app
echo - Backend: %render_url%
echo - Combined URL: https://cleanleaf.netlify.app
echo   (API calls automatically proxied)
echo.
echo Test it:
echo - Visit: https://cleanleaf.netlify.app
echo - API calls go to: https://cleanleaf.netlify.app/api/*
echo - Everything works on ONE URL! 🎉
echo.
pause

