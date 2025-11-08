# 🚀 START HERE - Quick Setup Guide

## ✅ Updated to Use 100% FREE Services!

Your application now uses:
- **Ollama** (FREE local LLM) instead of OpenAI
- **OpenStreetMap** (FREE) instead of Google Maps  
- **Local Storage** (FREE) instead of Cloudinary

## Prerequisites (Install These First)

### 1. MongoDB
```powershell
# Download and install MongoDB Community Edition
# https://www.mongodb.com/try/download/community

# OR use Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. Ollama (FREE Local LLM)
```powershell
# Download from: https://ollama.ai/download
# Install and run:
ollama serve

# Download the Llama2 model (only once):
ollama pull llama2
```

## 🎯 Start the Application

### Option 1: Start All Services Manually

Open **3 separate PowerShell terminals** and run:

**Terminal 1 - AI Agents:**
```powershell
cd c:\Users\shreyas\Downloads\animal-viibe\agents
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Backend:**
```powershell
cd c:\Users\shreyas\Downloads\animal-viibe\backend
npm install
npm run dev
```

**Terminal 3 - Frontend:**
```powershell
cd c:\Users\shreyas\Downloads\animal-viibe\frontend
npm install
npm run dev
```

## 🌐 Access Your Application

Once all services are running:

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000  
- **AI Agents**: http://localhost:8000

## ✨ First Time Use

1. Go to http://localhost:5173
2. Click "Register" and create an account
3. Login with your credentials
4. Upload a pet image to analyze
5. Try the Pet Whisperer chat!

## 🐛 Troubleshooting

### MongoDB Not Running
```powershell
# Check if MongoDB is running
Get-Process mongod
```

### Ollama Not Found
```powershell
# Start Ollama
ollama serve

# Verify it's running
Invoke-WebRequest http://localhost:11434/api/version
```

### Port Already in Use
```powershell
# Kill processes on ports
npx kill-port 5000 8000 5173
```

### Python Package Errors
```powershell
cd agents
pip install --upgrade pip
pip install -r requirements.txt
```

## 💡 Tips

- **First Analysis**: Takes 10-20 seconds as models load
- **Chat Responses**: 5-15 seconds (Ollama is running locally)
- **Image Analysis**: Uses YOLOv8 (downloads automatically first time)

## 📋 What's Different (FREE Version)

| Feature | FREE Alternative | Original |
|---------|-----------------|----------|
| LLM | Ollama/Llama2 | OpenAI GPT-4 |
| Maps | OpenStreetMap | Google Maps |
| Storage | Local Filesystem | Cloudinary |
| Cost | $0/month | ~$60/month |

## 🎉 You're All Set!

The application is now ready to use with zero API costs!

---

Need help? Check **SETUP-FREE.md** for detailed instructions.
