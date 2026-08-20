# AURA Finance AI Service

## Windows setup

Install Python 3.11+, Tesseract OCR, and Poppler (Poppler is required for PDFs).
Then run:

```powershell
cd ai-service
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `OPENROUTER_API_KEY` in `.env`.
If Tesseract or Poppler is not on `PATH`, set `TESSERACT_CMD` and `POPPLER_PATH` to
their installation directories in `.env`.

Start the service from the repository root with:

```powershell
cd ai-service
..\ai-service\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Check `http://localhost:8000/health`, then start the Node backend on port 5000.
The frontend's **Scan & Extract Expense** action uses the backend proxy and sends
receipt images or PDFs through OCR, LLM mapping, validation, and Supabase storage.