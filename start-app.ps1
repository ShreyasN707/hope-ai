# Hope AI Pet Assistant - Startup Script
# This script starts all services for the application

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Hope - AI Pet Assistant                  " -ForegroundColor Green
Write-Host "  Starting all services...                 " -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB is running
Write-Host "[1/5] Checking MongoDB..." -ForegroundColor Yellow
$mongoRunning = Get-Process mongod -ErrorAction SilentlyContinue
if (!$mongoRunning) {
    Write-Host "  ❌ MongoDB is not running!" -ForegroundColor Red
    Write-Host "  Please start MongoDB first:" -ForegroundColor Yellow
    Write-Host "  - Install MongoDB: https://www.mongodb.com/try/download/community" -ForegroundColor White
    Write-Host "  - Or run: docker run -d -p 27017:27017 --name mongodb mongo:latest" -ForegroundColor White
    Write-Host ""
    exit 1
}
Write-Host "  ✅ MongoDB is running" -ForegroundColor Green
Write-Host ""

# Check if Ollama is running
Write-Host "[2/5] Checking Ollama (Local LLM)..." -ForegroundColor Yellow
try {
    $ollamaCheck = Invoke-WebRequest -Uri "http://localhost:11434/api/version" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "  ✅ Ollama is running" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Ollama is not running!" -ForegroundColor Red
    Write-Host "  Please install and start Ollama:" -ForegroundColor Yellow
    Write-Host "  1. Download from: https://ollama.ai/download" -ForegroundColor White
    Write-Host "  2. Install and run: ollama serve" -ForegroundColor White
    Write-Host "  3. Pull model: ollama pull llama2" -ForegroundColor White
    Write-Host ""
    exit 1
}
Write-Host ""

# Start AI Agents Service
Write-Host "[3/5] Starting AI Agents Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\agents'; python -m venv venv; .\venv\Scripts\Activate.ps1; pip install -r requirements.txt; uvicorn main:app --reload --port 8000" -WindowStyle Normal
Write-Host "  ✅ AI Agents starting on http://localhost:8000" -ForegroundColor Green
Start-Sleep -Seconds 5
Write-Host ""

# Start Backend Service
Write-Host "[4/5] Starting Backend Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm install; npm run dev" -WindowStyle Normal
Write-Host "  ✅ Backend starting on http://localhost:5000" -ForegroundColor Green
Start-Sleep -Seconds 5
Write-Host ""

# Start Frontend Service
Write-Host "[5/5] Starting Frontend Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm install; npm run dev" -WindowStyle Normal
Write-Host "  ✅ Frontend starting on http://localhost:5173" -ForegroundColor Green
Write-Host ""

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  🎉 All services are starting!             " -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access the application at:" -ForegroundColor White
Write-Host "  🌐 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  🔧 Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "  🤖 AI Agents: http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this window (services will continue running)..." -ForegroundColor Yellow
Read-Host "Press Enter to continue"
