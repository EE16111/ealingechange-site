@echo off
echo ========================================
echo Firebase Login for Travel Time Global
echo ========================================
echo.

REM Set Node.js path
set PATH=C:\Program Files\nodejs;%PATH%

echo Step 1: Logging into Firebase...
call npx firebase-tools login

echo.
echo Step 2: Deploying to Travel Time Global project...
call npx firebase-tools deploy --only hosting --project sys-34584539868966162311959642

echo.
echo ========================================
echo Deployment complete!
echo Dashboard available at: https://sys-34584539868966162311959642.web.app/business-dashboard.html
echo ========================================
pause
