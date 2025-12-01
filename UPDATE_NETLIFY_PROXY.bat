@echo off
echo ================================================
echo   Update Netlify Proxy Configuration
echo ================================================
echo.
echo This will update netlify.toml with your Render URL
echo so API requests are proxied for a single URL.
echo.
echo Please provide your Render backend URL:
echo (e.g., https://portfolio-issue-tracker-backend.onrender.com)
echo.
set /p render_url="Render URL: "

if "%render_url%"=="" (
    echo ERROR: Render URL is required!
    pause
    exit /b 1
)

echo.
echo Updating netlify.toml...
echo.

REM Create backup
copy netlify.toml netlify.toml.backup >nul 2>&1

REM Create new netlify.toml with proxy
(
echo [build]
echo   base = "client"
echo   publish = "build"
echo   command = "npm install && npm run build"
echo.
echo [build.environment]
echo   NODE_VERSION = "18"
echo.
echo # Proxy API requests to Render backend ^(for single URL^)
[[redirects]]
echo   from = "/api/*"
echo   to = "%render_url%/api/:splat"
echo   status = 200
echo   force = true
echo.
echo # Redirect all other requests to index.html for React Router
[[redirects]]
echo   from = "/*"
echo   to = "/index.html"
echo   status = 200
) > netlify.toml

echo ✅ Updated netlify.toml with Render URL: %render_url%
echo.
echo Next steps:
echo 1. Commit this change: git add netlify.toml ^&^& git commit -m "Add Render proxy"
echo 2. Push to trigger Netlify redeploy
echo 3. OR manually redeploy in Netlify dashboard
echo.
echo After redeploy, your single URL will be:
echo https://cleanleaf.netlify.app
echo.
echo API calls will automatically proxy to: %render_url%
echo.
pause

