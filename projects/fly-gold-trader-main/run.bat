@echo off
cd /d "%~dp0"
if not exist .venv ( echo [RUN] not installed yet - run setup.bat first & pause & exit /b 1 )
.venv\Scripts\python.exe src/server.py
pause
