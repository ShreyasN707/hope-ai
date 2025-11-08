from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import (
    AnalyzeRequest, AnalyzeResponse, ChatRequest, ChatResponse,
    SOSRequest, SOSResponse, Severity
)
from vision_agent import vision_agent
from medical_agent import medical_agent
from chat_agent import pet_whisperer_agent
from nutrition_agent import nutrition_agent
from sos_agent import sos_agent
import uvicorn

# Create FastAPI app
app = FastAPI(
    title="Hope AI Pet Assistant - Agents Service",
    description="AI agents for pet emotion, health analysis, and rescue coordination",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Hope AI Agents",
        "status": "operational",
        "agents": [
            "Vision Agent",
            "Medical Reasoning Agent",
            "Pet Whisperer Agent",
            "Nutrition Planner Agent",
            "SOS Rescue Agent"
        ]
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "agents": {
            "vision": "ready",
            "medical": "ready",
            "chat": "ready",
            "nutrition": "ready",
            "sos": "ready"
        }
    }

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_animal(request: AnalyzeRequest):
    """
    Complete animal analysis pipeline:
    1. Vision analysis (species, emotion, health issues)
    2. Medical assessment (severity, care instructions)
    3. Nutrition planning
    """
    try:
        # Step 1: Vision Analysis
        vision_result = await vision_agent.analyze(request.image_url)
        
        # Step 2: Medical Assessment
        medical_assessment = await medical_agent.assess(
            vision_result,
            request.user_notes
        )
        
        # Step 3: Nutrition Planning
        nutrition_plan = await nutrition_agent.create_plan(
            vision_result,
            medical_assessment
        )
        
        # Determine if SOS is required
        requires_sos = medical_assessment.severity == Severity.CRITICAL
        
        return AnalyzeResponse(
            vision_analysis=vision_result,
            medical_assessment=medical_assessment,
            nutrition_plan=nutrition_plan,
            requires_sos=requires_sos
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat_with_pet_whisperer(request: ChatRequest):
    """
    Chat with the Pet Whisperer agent for behavioral and emotional guidance
    """
    try:
        response = await pet_whisperer_agent.chat(request)
        return response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@app.post("/sos", response_model=SOSResponse)
async def activate_sos_rescue(request: SOSRequest):
    """
    Activate SOS rescue protocol:
    1. Find nearby veterinary clinics and rescue centers
    2. Generate SOS message
    3. Send notifications via WhatsApp/Email
    """
    try:
        response = await sos_agent.activate_sos(request)
        return response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SOS activation failed: {str(e)}")

@app.post("/vision/analyze")
async def vision_only_analysis(request: AnalyzeRequest):
    """Vision analysis only (for testing)"""
    try:
        result = await vision_agent.analyze(request.image_url)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vision analysis failed: {str(e)}")

@app.post("/medical/assess")
async def medical_only_assessment(request: AnalyzeRequest):
    """Medical assessment only (requires vision analysis first)"""
    try:
        vision_result = await vision_agent.analyze(request.image_url)
        medical_assessment = await medical_agent.assess(vision_result, request.user_notes)
        return medical_assessment
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Medical assessment failed: {str(e)}")

@app.post("/nutrition/plan")
async def nutrition_only_plan(request: AnalyzeRequest):
    """Nutrition planning only"""
    try:
        vision_result = await vision_agent.analyze(request.image_url)
        medical_assessment = await medical_agent.assess(vision_result)
        nutrition_plan = await nutrition_agent.create_plan(vision_result, medical_assessment)
        return nutrition_plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Nutrition planning failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
