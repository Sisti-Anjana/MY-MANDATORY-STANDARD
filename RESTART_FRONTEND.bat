@echo off
echo ========================================
echo RESTARTING FRONTEND WITH CLEAN CACHE
echo ========================================
echo.

cd /d "%~dp0client"

echo Clearing React cache...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo Cache cleared!
)

echo.
echo Starting application with fresh build...
echo.
echo The browser will open automatically.
echo Press Ctrl+C to stop the server.
echo ========================================
echo.

set BROWSER=none
call npm start

pause
