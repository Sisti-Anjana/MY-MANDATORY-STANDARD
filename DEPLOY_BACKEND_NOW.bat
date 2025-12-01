@echo off
echo ================================================
echo   Backend Deployment to Railway
echo ================================================
echo.
echo This will help you deploy the backend server to Railway
echo.
echo Prerequisites:
echo 1. GitHub account (free)
echo 2. Railway account (free at https://railway.app)
echo.
pause

echo.
echo Step 1: Checking if Git is installed...
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed!
    echo Please install Git from https://git-scm.com/
    pause
    exit /b 1
)
echo ✓ Git is installed

echo.
echo Step 2: Checking if you're in a Git repository...
git status >nul 2>&1
if errorlevel 1 (
    echo Initializing Git repository...
    git init
    git add .
    git commit -m "Initial commit for deployment"
    echo ✓ Git repository initialized
) else (
    echo ✓ Already in a Git repository
)

echo.
echo ================================================
echo   MANUAL STEPS REQUIRED
echo ================================================
echo.
echo Follow these steps to complete deployment:
echo.
echo 1. Create GitHub Repository:
echo    - Go to https://github.com/new
echo    - Name: portfolio-issue-tracker-backend
echo    - Make it Private (or Public)
echo    - Click "Create repository"
echo.
echo 2. Push code to GitHub:
echo    - Copy the commands shown on GitHub
echo    - Or use these commands:
echo.
echo    git remote add origin https://github.com/YOUR_USERNAME/portfolio-issue-tracker-backend.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. Deploy to Railway:
echo    - Go to https://railway.app
echo    - Sign in with GitHub
echo    - Click "New Project"
echo    - Select "Deploy from GitHub repo"
echo    - Choose: portfolio-issue-tracker-backend
echo.
echo 4. Configure Railway:
echo    - Click on your service
echo    - Go to Settings tab
echo    - Set Root Directory: server
echo    - Set Start Command: npm start
echo    - Set Build Command: npm install
echo.
echo 5. Add Environment Variables in Railway:
echo    - Go to Variables tab
echo    - Add these variables:
echo.
echo    PORT = 5001
echo    NODE_ENV = production
echo    USE_SUPABASE = true
echo    SUPABASE_URL = https://wkkclsbaavdlplcqrsyr.supabase.co
echo    SUPABASE_SERVICE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY0MzcyMywiZXhwIjoyMDQ2MjE5NzIzfQ.tL6KYs3_-_zxJ3-RJ0DQm8fEQz3vWmBGhKXCl9_Dw6g
echo.
echo 6. Get Your Backend URL:
echo    - Go to Settings ^> Networking
echo    - Click "Generate Domain"
echo    - Copy the URL (e.g., https://portfolio-issue-tracker-backend-production.up.railway.app)
echo.
echo 7. Update Frontend:
echo    - Go to Netlify: https://app.netlify.com
echo    - Select site: cleanleaf
echo    - Go to Site settings ^> Environment variables
echo    - Add: REACT_APP_API_URL = https://your-backend-url.up.railway.app/api
echo    - Redeploy the site
echo.
echo ================================================
echo   ALTERNATIVE: Quick Deploy Script
echo ================================================
echo.
echo If you prefer, I can create a script that automates
echo the GitHub push. Would you like to continue?
echo.
set /p continue="Continue with automated GitHub setup? (Y/N): "
if /i "%continue%"=="Y" goto github_setup
goto end

:github_setup
echo.
echo Please provide your GitHub username:
set /p github_user="GitHub Username: "
echo.
echo Please provide your repository name (or press Enter for default):
set /p repo_name="Repository Name (default: portfolio-issue-tracker-backend): "
if "%repo_name%"=="" set repo_name=portfolio-issue-tracker-backend

echo.
echo Adding all files to Git...
git add .
echo.
echo Committing changes...
git commit -m "Prepare for Railway deployment" || echo "No changes to commit"
echo.
echo ================================================
echo   NEXT STEPS:
echo ================================================
echo.
echo 1. Create repository on GitHub:
echo    https://github.com/new
echo    Name: %repo_name%
echo.
echo 2. Then run these commands:
echo    git remote add origin https://github.com/%github_user%/%repo_name%.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. Then follow steps 3-7 from above
echo.
goto end

:end
echo.
echo ================================================
echo   Deployment Guide Complete
echo ================================================
echo.
echo For detailed instructions, see: DEPLOY_BACKEND_COMPLETE.md
echo.
pause

