@echo off
echo ========================================
echo COMPLETE CLEAN RESTART
echo ========================================
echo.

echo [1/5] Stopping any running processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

cd /d "%~dp0client"

echo [2/5] Cleaning React cache...
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"
if exist "build" rmdir /s /q "build"

echo [3/5] Clearing browser cache recommendation...
echo ** IMPORTANT: After this starts, press Ctrl+Shift+Del in browser **
echo ** and clear "Cached images and files" **
echo.

echo [4/5] Starting backend server...
start cmd /k "cd /d \"%~dp0server\" && node index.js"
timeout /t 3 /nobreak >nul

echo [5/5] Starting frontend (will open in browser)...
set BROWSER=chrome
npm start

pause
