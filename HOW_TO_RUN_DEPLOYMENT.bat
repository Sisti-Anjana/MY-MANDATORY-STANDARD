@echo off
echo ================================================
echo   HOW TO RUN DEPLOYMENT SCRIPTS
echo ================================================
echo.
echo You can run deployment scripts in 2 ways:
echo.
echo METHOD 1: Double-Click (Easiest)
echo ====================================
echo 1. Open File Explorer
echo 2. Navigate to this folder
echo 3. Find the .bat file you want to run
echo 4. Double-click on it
echo.
echo Available scripts:
echo   - DEPLOY_TO_VERCEL.bat    (Deploy to Vercel)
echo   - DEPLOY_TO_NETLIFY.bat   (Deploy to Netlify)
echo   - BUILD_FOR_PRODUCTION.bat (Build only)
echo.
echo.
echo METHOD 2: Command Prompt
echo ====================================
echo 1. Press Windows + R
echo 2. Type: cmd
echo 3. Press Enter
echo 4. Copy and paste the commands below
echo.
echo For Vercel:
echo   cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\3 Hlsc"
echo   DEPLOY_TO_VERCEL.bat
echo.
echo For Netlify:
echo   cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\3 Hlsc"
echo   DEPLOY_TO_NETLIFY.bat
echo.
echo For Production Build:
echo   cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\3 Hlsc"
echo   BUILD_FOR_PRODUCTION.bat
echo.
echo.
echo ================================================
echo   QUICK DEMO - Deploy to Vercel Now?
echo ================================================
echo.
choice /C YN /M "Do you want to deploy to Vercel now"
if errorlevel 2 goto :end
if errorlevel 1 goto :deploy

:deploy
echo.
echo Starting Vercel deployment...
echo.
call DEPLOY_TO_VERCEL.bat
goto :end

:end
echo.
echo Press any key to exit...
pause > nul
