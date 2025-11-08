import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Ollama Configuration (FREE local LLM)
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama2"
    
    # OpenStreetMap/Nominatim (FREE)
    nominatim_base_url: str = "https://nominatim.openstreetmap.org"
    nominatim_email: str = "user@example.com"
    
    # Model Configuration
    yolo_model_path: str = "yolov8n.pt"
    vision_transformer_model: str = "google/vit-base-patch16-224"
    
    # LLM Configuration
    llm_provider: str = "ollama"  # Using free Ollama
    llm_temperature: float = 0.7
    max_tokens: int = 1000
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
