@echo off
echo ================================================
echo   Switch to Railway - Easier Free Tier
echo ================================================
echo.
echo If Render's free tier is hard to find,
echo Railway has an easier free tier setup!
echo.
echo Railway Free Tier:
echo ✅ $5 credit/month (free)
echo ✅ Usually enough for development
echo ✅ Easier to find free option
echo ✅ No credit card initially
echo.
set /p switch="Switch to Railway instead? (Y/N): "

if /i not "%switch%"=="Y" (
    echo.
    echo Continuing with Render...
    echo Look for the FREE option ($0/month) not $7!
    pause
    exit /b 0
)

echo.
echo Opening Railway...
start https://railway.app
echo.
echo Railway free tier is easier to find:
echo - Just sign up (free)
echo - Deploy (uses free credit)
echo - No plan selection needed initially
echo.
echo Continue with Railway deployment using:
echo - RUN_DEPLOYMENT.bat (if you have Git)
echo - Or follow Railway's web interface
echo.
pause

