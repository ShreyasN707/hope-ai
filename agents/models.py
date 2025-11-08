from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class Species(str, Enum):
    DOG = "dog"
    CAT = "cat"
    COW = "cow"
    STRAY = "stray"
    UNKNOWN = "unknown"

class EmotionalState(str, Enum):
    HAPPY = "happy"
    STRESSED = "stressed"
    SCARED = "scared"
    AGGRESSIVE = "aggressive"
    NEUTRAL = "neutral"
    UNKNOWN = "unknown"

class Severity(str, Enum):
    NORMAL = "NORMAL"
    LOW = "LOW"
    URGENT = "URGENT"
    CRITICAL = "CRITICAL"

class HealthIssue(BaseModel):
    issue: str
    confidence: float
    description: str

class VisionAnalysisResult(BaseModel):
    species: Species
    species_confidence: float
    emotional_state: EmotionalState
    emotion_confidence: float
    health_issues: List[HealthIssue]
    raw_detections: List[Dict[str, Any]]

class MedicalAssessment(BaseModel):
    severity: Severity
    condition_summary: str
    immediate_actions: List[str]
    care_instructions: List[str]
    warning_signs: List[str]
    estimated_urgency_hours: Optional[int]

class NutritionPlan(BaseModel):
    recommended_foods: List[str]
    dangerous_foods: List[str]
    hydration_plan: str
    feeding_schedule: str
    special_considerations: List[str]

class RescueCenter(BaseModel):
    name: str
    address: str
    phone: Optional[str]
    distance_km: float
    latitude: float
    longitude: float
    place_id: str
    rating: Optional[float]
    type: str  # vet, ngo, rescue_center

class SOSResponse(BaseModel):
    message_sent: bool
    rescue_centers: List[RescueCenter]
    sos_message: str
    recipients_contacted: List[str]
    error: Optional[str] = None

class ChatMessage(BaseModel):
    role: str  # user or assistant
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    suggestions: List[str] = []

class AnalyzeRequest(BaseModel):
    image_url: str
    user_location: Optional[Dict[str, float]] = None  # lat, lng
    user_notes: Optional[str] = None

class AnalyzeResponse(BaseModel):
    vision_analysis: VisionAnalysisResult
    medical_assessment: MedicalAssessment
    nutrition_plan: NutritionPlan
    requires_sos: bool

class SOSRequest(BaseModel):
    image_url: str
    condition_summary: str
    location: Dict[str, float]  # lat, lng
    contact_whatsapp: Optional[str] = None
    contact_email: Optional[str] = None
