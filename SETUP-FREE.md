# Hope - FREE Setup Guide (No Paid APIs Required)

This version uses **100% FREE alternatives** to paid services:
- ✅ **Ollama** instead of OpenAI/GPT (runs locally)
- ✅ **OpenStreetMap** instead of Google Maps (free API)
- ✅ **Local Storage** instead of Cloudinary (saves to disk)

## Prerequisites

1. **MongoDB** - Database
   - Download: https://www.mongodb.com/try/download/community
   - Or use Docker: `docker run -d -p 27017:27017 --name mongodb mongo:latest`

2. **Ollama** - Local LLM (FREE alternative to OpenAI)
   - Download: https://ollama.ai/download
   - Install and run: `ollama serve`
   - Pull the model: `ollama pull llama2`

3. **Node.js** 18+ and npm
   - Download: https://nodejs.org/

4. **Python** 3.10+
   - Download: https://www.python.org/downloads/

## Quick Start (Windows)

### Option 1: Automated Setup

```powershell
# Navigate to project directory
cd c:\Users\shreyas\Downloads\animal-viibe

# Run the startup script
.\start-app.ps1
```

The script will:
- Check if MongoDB and Ollama are running
- Install all dependencies
- Start all 3 services in separate windows

### Option 2: Manual Setup

**Step 1: Start MongoDB**
```powershell
# Start MongoDB (if not using Docker)
mongod
```

**Step 2: Start Ollama**
```powershell
# In a new terminal
ollama serve

# Pull the model (first time only)
ollama pull llama2
```

**Step 3: Start AI Agents**
```powershell
cd agents
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Step 4: Start Backend**
```powershell
# In a new terminal
cd backend
npm install
npm run dev
```

**Step 5: Start Frontend**
```powershell
# In a new terminal
cd frontend
npm install
npm run dev
```

## Access the Application

- 🌐 **Frontend**: http://localhost:5173
- 🔧 **Backend API**: http://localhost:5000
- 🤖 **AI Agents**: http://localhost:8000

## First Time Setup

1. **Register an account** at http://localhost:5173
2. **Login** with your credentials
3. **Upload a pet image** to analyze
4. **Chat with Pet Whisperer** for behavior insights

## Features Using FREE Services

### ✅ Vision Analysis
- Uses **YOLOv8** (free, runs locally)
- Uses **Vision Transformer** (free, runs locally)
- Detects species, emotions, and health issues

### ✅ Medical Assessment
- Uses **Ollama + Llama2** (free, runs locally)
- Provides severity ratings and care instructions
- NO OpenAI API key required

### ✅ Pet Whisperer Chat
- Uses **Ollama + Llama2** (free, runs locally)
- Real-time conversation about pet behavior
- NO API costs

### ✅ Nutrition Planning
- Uses **Ollama + Llama2** (free, runs locally)
- Species-specific meal plans
- Dangerous foods warnings

### ✅ SOS Rescue
- Uses **OpenStreetMap Overpass API** (free)
- Finds nearby vets and rescue centers
- NO Google Maps API key required

### ✅ Image Storage
- Uses **Local File System** (free)
- Images saved to `./uploads/` directory
- NO Cloudinary API key required

## Troubleshooting

### Ollama Not Found
```powershell
# Check if Ollama is running
Invoke-WebRequest -Uri "http://localhost:11434/api/version"

# If not running, start it:
ollama serve
```

### MongoDB Connection Error
```powershell
# Check if MongoDB is running
Get-Process mongod

# Or check Docker container
docker ps | Select-String mongodb
```

### Port Already in Use
```powershell
# Kill process on port 5000
npx kill-port 5000

# Kill process on port 8000
npx kill-port 8000

# Kill process on port 5173
npx kill-port 5173
```

### Ollama Model Not Downloaded
```powershell
# Download the Llama2 model (only needed once)
ollama pull llama2

# List installed models
ollama list
```

## Performance Notes

- **Ollama/Llama2** responses take 5-15 seconds (depends on your hardware)
- **YOLOv8** analysis takes 2-5 seconds
- **OpenStreetMap** queries take 2-4 seconds

For faster LLM responses, you can use smaller models:
```powershell
# Use a smaller, faster model
ollama pull phi

# Update .env.example:
# OLLAMA_MODEL=phi
```

## Cost Comparison

| Service | Paid Version | FREE Alternative | Savings |
|---------|-------------|------------------|---------|
| LLM | OpenAI GPT-4: $0.03/1K tokens | Ollama: FREE | $30+/month |
| Maps | Google Maps: $7/1K requests | OpenStreetMap: FREE | $20+/month |
| Storage | Cloudinary: $0.02/GB | Local: FREE | $10+/month |
| **Total** | **~$60/month** | **$0/month** | **$720/year** |

## Support

If you encounter issues:
1. Check all services are running
2. Review console logs for errors
3. Ensure Ollama model is downloaded
4. Verify MongoDB is accessible

---

**Hope** - Giving a voice to those who cannot speak. 🐾❤️

*Now with 100% FREE infrastructure!*
