# Hope - AI Pet Emotion, Health & Rescue Assistant

**Tagline:** *Giving a voice to those who cannot speak*

A complete, production-ready AI-powered platform for animal health analysis, emotional assessment, behavior consultation, and emergency rescue coordination.

## 🌟 Features

### 1. **Vision Agent** (YOLOv8 + Vision Transformer)
- Species detection (dog, cat, cow, stray animals)
- Emotional state analysis (happy, stressed, scared, aggressive)
- Health issue detection (skin infections, dehydration, malnutrition, wounds)

### 2. **Medical Reasoning Agent** (LLM-powered)
- Severity classification: NORMAL / LOW / URGENT / CRITICAL
- Step-by-step care instructions
- Warning signs and urgency estimation

### 3. **Pet Whisperer Chat** (Conversational AI)
- Real-time behavior consultation
- Pet psychology insights
- Trust-building guidance for strays

### 4. **Nutrition & Care Planner**
- Species-specific food recommendations
- Dangerous foods list
- Hydration and feeding schedules

### 5. **SOS Rescue Agent** (Automated Emergency Response)
- Triggers on CRITICAL severity
- Google Maps integration for nearby vets/NGOs
- WhatsApp Cloud API notifications
- Email alerts with location and condition

### 6. **Memory Storage** (MongoDB)
- Complete analysis history
- Image storage via Cloudinary
- User dashboard with past scans

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│              React + TailwindCSS + Vite                     │
│  (Dashboard, Analyze, Chat, History, Authentication)       │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ REST API
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                      Backend API                             │
│            Node.js + Express + TypeScript                   │
│  (Auth, Upload, Routes, MongoDB Integration)               │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ HTTP Requests
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                     AI Agents Service                        │
│              Python FastAPI + LangGraph                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Vision Agent (YOLOv8 + ViT)                          │ │
│  │  Medical Agent (GPT-4 / Gemini)                       │ │
│  │  Chat Agent (LLM)                                     │ │
│  │  Nutrition Agent (LLM)                                │ │
│  │  SOS Agent (Google Maps + WhatsApp)                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
hope-pet-assistant/
├── frontend/                 # React + TailwindCSS + Vite
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── lib/             # API client, utilities
│   │   ├── store/           # Zustand state management
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── Dockerfile
│   └── vite.config.ts
│
├── backend/                  # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/          # Database, Cloudinary config
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth, upload, error handling
│   │   ├── services/        # Agents service client
│   │   └── server.ts
│   ├── package.json
│   ├── Dockerfile
│   └── tsconfig.json
│
├── agents/                   # Python FastAPI + AI Models
│   ├── vision_agent.py      # YOLOv8 + ViT for image analysis
│   ├── medical_agent.py     # LLM for medical assessment
│   ├── chat_agent.py        # Pet Whisperer conversational AI
│   ├── nutrition_agent.py   # Nutrition planning
│   ├── sos_agent.py         # Emergency rescue coordination
│   ├── models.py            # Pydantic data models
│   ├── config.py            # Configuration
│   ├── main.py              # FastAPI application
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **MongoDB** (local or cloud)
- **Docker & Docker Compose** (optional but recommended)

### Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB
MONGO_URL=mongodb://localhost:27017/hope-pet-assistant

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# OpenAI (choose one: OpenAI or Gemini)
OPENAI_API_KEY=sk-your-openai-api-key

# Google Gemini (alternative to OpenAI)
GEMINI_API_KEY=your-gemini-api-key

# WhatsApp Cloud API (for SOS alerts)
WHATSAPP_API_KEY=your-whatsapp-api-key
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id

# Google Maps
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Ports
PORT=5000
VITE_API_URL=http://localhost:5000/api
AGENTS_SERVICE_URL=http://localhost:8000
```

### Installation Methods

#### Option 1: Docker (Recommended)

```bash
# 1. Clone the repository
git clone <repository-url>
cd animal-viibe

# 2. Copy environment file
cp .env.example .env
# Edit .env with your API keys

# 3. Start all services
docker-compose up -d

# Services will be available at:
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
# AI Agents: http://localhost:8000
# MongoDB: localhost:27017
```

#### Option 2: Manual Setup

**1. Install Python Dependencies (AI Agents)**

```bash
cd agents
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**2. Install Node.js Dependencies (Backend)**

```bash
cd backend
npm install
npm run dev  # Starts on port 5000
```

**3. Install Node.js Dependencies (Frontend)**

```bash
cd frontend
npm install
npm run dev  # Starts on port 5173
```

**4. Start MongoDB**

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install MongoDB locally
```

## 📖 API Documentation

### Backend API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

#### Image Upload
- `POST /api/upload-image` - Upload pet image to Cloudinary

#### Analysis
- `POST /api/analyze` - Complete AI analysis (Vision + Medical + Nutrition)
  ```json
  {
    "imageUrl": "https://...",
    "userNotes": "optional notes",
    "location": { "latitude": 0, "longitude": 0 }
  }
  ```

#### Chat
- `POST /api/chat` - Chat with Pet Whisperer
  ```json
  {
    "message": "Why is my dog scared?",
    "history": [...]
  }
  ```

#### SOS
- `POST /api/sos` - Activate emergency rescue
  ```json
  {
    "imageUrl": "https://...",
    "conditionSummary": "Critical injury",
    "location": { "latitude": 0, "longitude": 0 },
    "contactWhatsapp": "+1234567890",
    "contactEmail": "user@example.com"
  }
  ```

#### History
- `GET /api/history` - Get analysis history
- `GET /api/history/:id` - Get single analysis
- `DELETE /api/history/:id` - Delete analysis

### AI Agents Service Endpoints

- `GET /` - Service health check
- `POST /analyze` - Complete analysis pipeline
- `POST /chat` - Pet Whisperer chat
- `POST /sos` - SOS rescue coordination
- `POST /vision/analyze` - Vision analysis only
- `POST /medical/assess` - Medical assessment only
- `POST /nutrition/plan` - Nutrition plan only

## 🧪 Testing

### Test Backend
```bash
cd backend
npm test
```

### Test AI Agents
```bash
cd agents
pytest
```

### Manual API Testing
```bash
# Health check
curl http://localhost:8000/health

# Test analysis (replace with actual image URL)
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"image_url": "https://example.com/dog.jpg"}'
```

## 🔑 API Keys Setup Guide

### 1. OpenAI API Key
1. Visit https://platform.openai.com/api-keys
2. Create new secret key
3. Add to `.env`: `OPENAI_API_KEY=sk-...`

### 2. Google Gemini API Key (Alternative)
1. Visit https://makersuite.google.com/app/apikey
2. Create API key
3. Add to `.env`: `GEMINI_API_KEY=...`

### 3. Google Maps API Key
1. Visit https://console.cloud.google.com/
2. Enable Maps JavaScript API and Places API
3. Create credentials → API Key
4. Add to `.env`: `GOOGLE_MAPS_API_KEY=...`

### 4. WhatsApp Cloud API
1. Visit https://developers.facebook.com/
2. Create WhatsApp Business App
3. Get Access Token and Phone Number ID
4. Add to `.env`: `WHATSAPP_API_KEY=...` and `WHATSAPP_PHONE_NUMBER_ID=...`

### 5. Cloudinary
1. Visit https://cloudinary.com/
2. Sign up for free account
3. Get credentials from dashboard
4. Add to `.env`: `CLOUDINARY_CLOUD_NAME=...`, `CLOUDINARY_API_KEY=...`, `CLOUDINARY_API_SECRET=...`

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # Hot reload enabled
```

### Frontend Development
```bash
cd frontend
npm run dev  # Hot reload enabled
```

### AI Agents Development
```bash
cd agents
uvicorn main:app --reload  # Hot reload enabled
```

## 📦 Deployment

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
# Deploy dist/ folder to Netlify, Vercel, or any static host
```

**Backend:**
```bash
cd backend
npm run build
# Deploy to Heroku, Railway, AWS, or any Node.js host
```

**AI Agents:**
```bash
cd agents
# Deploy to Google Cloud Run, AWS Lambda, or any Python host
```

### Docker Production
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🔒 Security Notes

- **NEVER** commit `.env` file
- Use strong JWT secrets in production
- Enable HTTPS/SSL in production
- Implement rate limiting (already included)
- Validate all user inputs (Joi validation included)
- Use environment-specific configurations

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB is running
docker ps | grep mongo

# Restart MongoDB
docker restart mongodb
```

### Port Already in Use
```bash
# Kill process on port 5000
npx kill-port 5000

# Kill process on port 8000
npx kill-port 8000
```

### Python Dependencies Issues
```bash
# Clear cache and reinstall
pip cache purge
pip install --no-cache-dir -r requirements.txt
```

### YOLO Model Download
The YOLOv8 model will download automatically on first run. If issues occur:
```bash
cd agents
python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"
```

## 📊 Performance

- **Vision Analysis**: ~2-5 seconds
- **Medical Assessment**: ~3-8 seconds (LLM dependent)
- **Chat Response**: ~1-3 seconds
- **SOS Activation**: ~2-4 seconds

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- YOLOv8 by Ultralytics
- Vision Transformers by Google
- OpenAI GPT-4 / Google Gemini
- React, Node.js, FastAPI communities

## 📧 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@hope-ai.example.com

---

**Hope** - Giving a voice to those who cannot speak. 🐾❤️
