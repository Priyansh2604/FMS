$root = "E:\CSE\awt\FMS"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\ai-service'; & '.\.venv\Scripts\python.exe' -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

Write-Host "Launched 3 terminals:" -ForegroundColor Green
Write-Host "  AI Service    - http://localhost:8000" -ForegroundColor Cyan
Write-Host "  Node Backend  - http://localhost:5000" -ForegroundColor Cyan
Write-Host "  Frontend      - http://localhost:3000" -ForegroundColor Cyan
