@echo off
echo ================================================
echo   Create Server ZIP for Manual Deploy
echo ================================================
echo.
echo This will create a ZIP file of your server folder
echo that you can upload to Render for manual deployment.
echo.
pause

echo.
echo Creating ZIP file...
cd server

REM Remove node_modules if it exists (not needed for deployment)
if exist node_modules (
    echo Removing node_modules (not needed for deployment)...
    rmdir /s /q node_modules 2>nul
)

REM Remove database.sqlite if it exists (not needed)
if exist database.sqlite (
    echo Removing local database file...
    del database.sqlite 2>nul
)

cd ..

echo.
echo Zipping server folder...
powershell Compress-Archive -Path "server\*" -DestinationPath "server-deploy.zip" -Force

if exist server-deploy.zip (
    echo.
    echo ✅ Created: server-deploy.zip
    echo.
    echo File location: %CD%\server-deploy.zip
    echo.
    echo Next steps:
    echo 1. Go to Render dashboard
    echo 2. Create Web Service
    echo 3. Choose "Manual Deploy" or "Upload ZIP"
    echo 4. Upload: server-deploy.zip
    echo 5. Continue with configuration
    echo.
) else (
    echo.
    echo ❌ Failed to create ZIP file
    echo.
)

pause

