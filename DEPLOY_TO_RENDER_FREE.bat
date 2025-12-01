@echo off
echo ================================================
echo   Deploy to Render.com - 100%% FREE Forever!
echo ================================================
echo.
echo Render.com offers:
echo ✅ 100%% FREE forever
echo ✅ No credit card required
echo ✅ 750 hours/month (enough for 24/7)
echo ✅ Automatic HTTPS
echo ✅ Easy deployment
echo.
echo Note: Service sleeps after 15 min inactivity
echo (but wakes automatically on first request)
echo.
pause

echo.
echo Opening Render.com...
start https://render.com
echo.
echo ================================================
echo   Step-by-Step Instructions
echo ================================================
echo.
echo 1. SIGN UP (Free, no credit card):
echo    - Click "Get Started for Free"
echo    - Sign up with GitHub or email
echo.
echo 2. CREATE WEB SERVICE:
echo    - Click "New" ^> "Web Service"
echo    - Choose one:
echo      a) Connect GitHub repository (if you have Git)
echo      b) OR "Public Git repository" (paste GitHub URL)
echo      c) OR "Manual Deploy" (upload code)
echo.
echo 3. CONFIGURE SERVICE:
echo    - Name: portfolio-issue-tracker-backend
echo    - Environment: Node
echo    - Root Directory: server
echo    - Build Command: npm install
echo    - Start Command: npm start
echo.
echo 4. ADD ENVIRONMENT VARIABLES:
echo    Click "Advanced" ^> "Add Environment Variable"
echo    Add these one by one:
echo.
echo    PORT = 10000
echo    NODE_ENV = production
echo    USE_SUPABASE = true
echo    SUPABASE_URL = https://wkkclsbaavdlplcqrsyr.supabase.co
echo    SUPABASE_SERVICE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY0MzcyMywiZXhwIjoyMDQ2MjE5NzIzfQ.tL6KYs3_-_zxJ3-RJ0DQm8fEQz3vWmBGhKXCl9_Dw6g
echo.
echo 5. CREATE SERVICE:
echo    - Click "Create Web Service"
echo    - Wait 2-3 minutes for deployment
echo    - Copy your URL (e.g., https://portfolio-issue-tracker-backend.onrender.com)
echo.
pause

echo.
echo ================================================
echo   After Deployment
echo ================================================
echo.
echo 6. UPDATE NETLIFY:
echo    - Go to: https://app.netlify.com
echo    - Site: cleanleaf
echo    - Settings ^> Environment variables
echo    - Add: REACT_APP_API_URL = https://your-render-url.onrender.com/api
echo    - Save and redeploy
echo.
echo ================================================
echo   ✅ 100%% FREE Deployment!
echo ================================================
echo.
echo Render.com is completely FREE:
echo - No credit card required
echo - Free forever
echo - 750 hours/month (enough for 24/7)
echo - Only sleeps when inactive (wakes automatically)
echo.
echo Your complete FREE setup:
echo - Frontend: https://cleanleaf.netlify.app (FREE)
echo - Backend: https://your-app.onrender.com (FREE)
echo - Database: Supabase (FREE)
echo.
echo Total Cost: $0.00 💰
echo.
pause

