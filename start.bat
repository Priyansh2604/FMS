@echo off
set ROOT=%~dp0

start "AI Service (8000)" powershell -NoExit -NoLogo -Command "cd '%ROOT%ai-service'; & '.\.venv\Scripts\python.exe' -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
start "Node Backend (5000)" powershell -NoExit -NoLogo -Command "cd '%ROOT%backend'; npm run dev"
start "Frontend (3000)" powershell -NoExit -NoLogo -Command "cd '%ROOT%frontend'; npm run dev"

echo.
echo Launched 3 terminals:
echo   AI Service    - http://localhost:8000
echo   Node Backend  - http://localhost:5000
echo   Frontend      - http://localhost:3000
echo.
pause
