@echo off
echo ========================================
echo Portfolio Issue Tracker - Quick Start
echo ========================================
echo.

cd /d "%~dp0client"

echo Checking if node_modules exists...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
) else (
    echo Dependencies already installed!
)

echo.
echo Starting application...
echo.
echo Application will open at: http://localhost:5002
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

call npm start

pause
