@echo off
echo ================================================
echo   Backend Deployment - Quick Start
echo ================================================
echo.
echo This will help you deploy backend to Railway
echo.
echo Your frontend is already on Netlify:
echo ✅ https://cleanleaf.netlify.app
echo.
echo After backend deployment, you'll connect them together.
echo.
pause

echo.
echo ================================================
echo   STEP 1: Prepare Your Code
echo ================================================
echo.

echo Checking Git...
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed!
    echo.
    echo Please install Git from: https://git-scm.com/
    echo Then run this script again.
    pause
    exit /b 1
)
echo ✅ Git is installed

echo.
echo Checking if Git repository exists...
git status >nul 2>&1
if errorlevel 1 (
    echo Initializing Git repository...
    git init
    echo ✅ Git repository initialized
) else (
    echo ✅ Git repository found
)

echo.
echo ================================================
echo   STEP 2: Create GitHub Repository
echo ================================================
echo.
echo You need to create a GitHub repository first.
echo.
echo Opening GitHub in your browser...
start https://github.com/new
echo.
echo Instructions:
echo 1. Repository name: portfolio-issue-tracker-backend
echo 2. Make it Private (recommended) or Public
echo 3. DO NOT initialize with README, .gitignore, or license
echo 4. Click "Create repository"
echo.
pause

echo.
echo ================================================
echo   STEP 3: Push Code to GitHub
echo ================================================
echo.
echo Please provide your GitHub username:
set /p github_user="GitHub Username: "

echo.
echo Adding all files to Git...
git add .
echo.
echo Committing changes...
git commit -m "Initial commit for Railway deployment" 2>nul || echo "No changes to commit or already committed"

echo.
echo ================================================
echo   NEXT: Connect to GitHub
echo ================================================
echo.
echo Run these commands in Git Bash or Command Prompt:
echo.
echo git remote add origin https://github.com/%github_user%/portfolio-issue-tracker-backend.git
echo git branch -M main
echo git push -u origin main
echo.
echo Or I can try to do it automatically...
echo.
set /p auto_push="Push to GitHub automatically? (Y/N): "
if /i "%auto_push%"=="Y" (
    echo.
    echo Adding remote...
    git remote remove origin 2>nul
    git remote add origin https://github.com/%github_user%/portfolio-issue-tracker-backend.git
    echo.
    echo Setting branch to main...
    git branch -M main
    echo.
    echo Pushing to GitHub...
    echo (You may need to enter GitHub credentials)
    git push -u origin main
    if errorlevel 1 (
        echo.
        echo ⚠️ Push failed. Please push manually using the commands above.
        pause
    ) else (
        echo.
        echo ✅ Code pushed to GitHub!
    )
) else (
    echo.
    echo Please push manually using the commands shown above.
    pause
)

echo.
echo ================================================
echo   STEP 4: Deploy to Railway
echo ================================================
echo.
echo Opening Railway in your browser...
start https://railway.app
echo.
echo Instructions:
echo 1. Sign in with GitHub (easiest)
echo 2. Click "New Project"
echo 3. Select "Deploy from GitHub repo"
echo 4. Choose: portfolio-issue-tracker-backend
echo 5. Railway will auto-detect Node.js
echo.
pause

echo.
echo ================================================
echo   STEP 5: Configure Railway
echo ================================================
echo.
echo After Railway deploys, configure it:
echo.
echo 1. Click on your service
echo 2. Go to Settings tab
echo 3. Set these values:
echo    - Root Directory: server
echo    - Start Command: npm start
echo    - Build Command: npm install
echo.
pause

echo.
echo ================================================
echo   STEP 6: Add Environment Variables
echo ================================================
echo.
echo In Railway, go to Variables tab and add:
echo.
echo PORT = 5001
echo NODE_ENV = production
echo USE_SUPABASE = true
echo SUPABASE_URL = https://wkkclsbaavdlplcqrsyr.supabase.co
echo SUPABASE_SERVICE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY0MzcyMywiZXhwIjoyMDQ2MjE5NzIzfQ.tL6KYs3_-_zxJ3-RJ0DQm8fEQz3vWmBGhKXCl9_Dw6g
echo.
pause

echo.
echo ================================================
echo   STEP 7: Get Your Backend URL
echo ================================================
echo.
echo In Railway:
echo 1. Go to Settings ^> Networking
echo 2. Click "Generate Domain"
echo 3. Copy the URL (e.g., https://portfolio-issue-tracker-backend-production.up.railway.app)
echo.
echo This is your BACKEND URL!
echo.
pause

echo.
echo ================================================
echo   STEP 8: Update Netlify Frontend
echo ================================================
echo.
echo Now connect your frontend to the backend:
echo.
echo 1. Go to: https://app.netlify.com
echo 2. Select site: cleanleaf
echo 3. Go to Site settings ^> Environment variables
echo 4. Add: REACT_APP_API_URL = https://your-backend-url.up.railway.app/api
echo    (Use your actual Railway URL from Step 7)
echo 5. Click Save
echo 6. Go to Deploys tab
echo 7. Click "Trigger deploy" ^> "Deploy site"
echo.
pause

echo.
echo ================================================
echo   ✅ Deployment Complete!
echo ================================================
echo.
echo Your setup:
echo - Frontend: https://cleanleaf.netlify.app
echo - Backend: https://your-backend-url.up.railway.app/api
echo.
echo Test your backend:
echo Visit: https://your-backend-url.up.railway.app/api/portfolios
echo (Should show JSON data)
echo.
echo Test your frontend:
echo Visit: https://cleanleaf.netlify.app
echo (Should connect to backend)
echo.
pause

