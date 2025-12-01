@echo off
echo ================================================
echo   Simple Deploy - Build and Deploy
echo ================================================
echo.
echo This will:
echo 1. Build your React app
echo 2. Deploy directly to Netlify
echo.
pause

echo.
echo Building application...
cd client
call npm install
call npm run build
cd ..

echo.
echo ✅ Build complete!
echo.
echo Now deploying to Netlify...
echo.

netlify deploy --prod --dir=client/build

if errorlevel 1 (
    echo.
    echo ⚠️ Deploy failed. You may need to:
    echo 1. Install Netlify CLI: npm install -g netlify-cli
    echo 2. Login: netlify login
    echo 3. Link site: netlify link
    echo 4. Then run this script again
    echo.
) else (
    echo.
    echo ✅ Deployment successful!
    echo Your site: https://cleanleaf.netlify.app
    echo.
)

pause

