@echo off
echo ================================================
echo   AUTHENTICATION SETUP - QUICK START
echo ================================================
echo.
echo This script will help you set up the new authentication system
echo.
echo STEP 1: Database Setup
echo ----------------------
echo 1. Open Supabase Dashboard
echo 2. Go to SQL Editor
echo 3. Copy and paste the contents of: ADD_USERS_TABLE.sql
echo 4. Click RUN
echo.
echo This will create:
echo   - users table
echo   - Default admin account (admin/admin123)
echo   - Default user accounts (user1, user2 / user123)
echo.
pause
echo.
echo STEP 2: Install Dependencies
echo ----------------------------
cd client
echo Installing client dependencies...
call npm install
cd ..
echo.
echo STEP 3: Start the Application
echo ----------------------------
echo.
echo Choose how you want to start:
echo.
echo [1] Start Client Only (Frontend)
echo [2] Start Full Application (Frontend + Backend)
echo [3] Exit
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo Starting Frontend...
    cd client
    start cmd /k "npm start"
    cd ..
) else if "%choice%"=="2" (
    echo.
    echo Starting Full Application...
    start cmd /k "cd client && npm start"
    timeout /t 2 >nul
    start cmd /k "cd server && npm start"
) else (
    echo Exiting...
    exit /b
)

echo.
echo ================================================
echo   SETUP COMPLETE!
echo ================================================
echo.
echo Default Login Credentials:
echo.
echo ADMIN LOGIN:
echo   Username: admin
echo   Password: admin123
echo.
echo USER LOGIN:
echo   Username: user1 or user2
echo   Password: user123
echo.
echo The application should open in your browser.
echo If not, go to: http://localhost:3000
echo.
echo For detailed documentation, see:
echo   AUTHENTICATION_AND_HOURLY_RESET_GUIDE.md
echo.
echo ================================================
pause
