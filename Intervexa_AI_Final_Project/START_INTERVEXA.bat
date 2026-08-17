@echo off
title Intervexa AI
echo.
echo =====================================
echo        INTERVEXA AI PROJECT
echo =====================================
echo.
if not exist node_modules (
  echo Installing required packages...
  call npm install
  if errorlevel 1 (
    echo.
    echo npm install failed. Make sure Node.js is installed.
    pause
    exit /b 1
  )
)
echo.
echo Starting Intervexa AI...
echo Open http://localhost:5000 in your browser.
echo.
call npm start
pause
