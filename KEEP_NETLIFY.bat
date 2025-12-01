@echo off
echo ================================================
echo   Keep Netlify - Deploy Backend Separately
echo ================================================
echo.
echo You already have frontend on Netlify:
echo ✅ https://cleanleaf.netlify.app
echo.
echo We'll keep Netlify and just deploy backend separately.
echo.
echo This is the SIMPLEST option - no need to change anything!
echo.
pause

echo.
echo ================================================
echo   Option: Deploy Backend to Railway
echo ================================================
echo.
echo Your setup will be:
echo - Frontend: https://cleanleaf.netlify.app (already done)
echo - Backend: https://your-backend.railway.app/api (to deploy)
echo.
echo Steps:
echo 1. Deploy backend to Railway
echo 2. Get backend URL
echo 3. Add REACT_APP_API_URL to Netlify
echo 4. Redeploy Netlify frontend
echo 5. Done!
echo.
pause

echo.
echo Opening deployment guide...
echo.
echo To deploy backend, run: DEPLOY_BACKEND_NOW.bat
echo Or follow: DEPLOY_BACKEND_COMPLETE.md
echo.
pause

