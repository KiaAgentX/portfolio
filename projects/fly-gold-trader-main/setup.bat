@echo off
rem Fly-Gold-Trader PRO - one-click installer (Windows)
rem   setup.bat          -> install only
rem   setup.bat --run    -> install AND start the server
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo [SETUP] python not found - install Python 3.9+ from python.org
  pause
  exit /b 1
)
python install.py %*
pause
