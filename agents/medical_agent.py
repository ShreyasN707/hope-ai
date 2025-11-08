from typing import Optional
import requests
from models import VisionAnalysisResult, MedicalAssessment, Severity
from config import settings
import json

class MedicalReasoningAgent:
    def __init__(self):
        self.llm_provider = settings.llm_provider
        self.ollama_base_url = settings.ollama_base_url
        self.ollama_model = settings.ollama_model
    
    def create_medical_prompt(self, vision_result: VisionAnalysisResult, user_notes: Optional[str] = None) -> str:
        """Create a detailed prompt for medical assessment with confidence awareness"""
        
        # Filter health issues by confidence (only include moderate to high confidence)
        significant_issues = [issue for issue in vision_result.health_issues if issue.confidence > 0.55]
        
        health_issues_text = "\n".join([
            f"- {issue.issue}: {issue.description} (Confidence: {issue.confidence:.2f})"
            for issue in significant_issues
        ]) if significant_issues else "No significant health issues detected with sufficient confidence"
        
        user_context = f"\n\nUser Notes: {user_notes}" if user_notes else ""
        
        # Add confidence warning for emotion analysis
        emotion_note = ""
        if vision_result.emotion_confidence < 0.65:
            emotion_note = " (Note: Low confidence - emotional state may be uncertain)"
        
        prompt = f"""You are a veterinary expert AI assistant analyzing an animal's condition. Based on the following analysis, provide a comprehensive and ACCURATE medical assessment.

VISION ANALYSIS RESULTS:
- Species: {vision_result.species.value} (Confidence: {vision_result.species_confidence:.2f})
- Emotional State: {vision_result.emotional_state.value} (Confidence: {vision_result.emotion_confidence:.2f}){emotion_note}
- Health Issues Detected:
{health_issues_text}
{user_context}

CRITICAL GUIDELINES:
- Only consider health issues with confidence > 0.55 as significant
- If emotion confidence is low (< 0.65), do NOT base severity assessment primarily on emotional state
- Image analysis can have false positives - be conservative in severity assessment
- When in doubt, recommend professional veterinary examination rather than assuming worst case

Your task is to:
1. Determine the severity level: NORMAL, LOW, URGENT, or CRITICAL (be CONSERVATIVE)
   - NORMAL: No immediate concerns, routine care only
   - LOW: Minor issues that need attention but not urgent (checkup within 1 week)
   - URGENT: Significant CONFIRMED issues requiring veterinary care within 12-24 hours
   - CRITICAL: Life-threatening condition requiring IMMEDIATE veterinary attention (only if multiple high-confidence issues or user reports severe symptoms)
   
   IMPORTANT: Prefer NORMAL or LOW unless there is strong evidence (high confidence scores or multiple corroborating issues)

2. Provide a condition summary (2-3 sentences) - be specific about detected issues

3. List immediate actions the caretaker should take (4-6 specific, actionable steps)

4. Provide detailed care instructions (5-7 steps) - include first aid if needed

5. List warning signs to watch for (4-6 signs) that indicate worsening condition

6. Estimate urgency in hours (null if NORMAL, 1-168 hours based on severity)
   - CRITICAL: 1-6 hours
   - URGENT: 6-24 hours
   - LOW: 24-168 hours

Respond ONLY with a valid JSON object in this exact format:
{{
    "severity": "NORMAL|LOW|URGENT|CRITICAL",
    "condition_summary": "string",
    "immediate_actions": ["action1", "action2", ...],
    "care_instructions": ["instruction1", "instruction2", ...],
    "warning_signs": ["sign1", "sign2", ...],
    "estimated_urgency_hours": null or number
}}

Be empathetic but direct. Prioritize animal safety. If in doubt, recommend veterinary consultation."""
        
        return prompt
    
    async def get_llm_response(self, prompt: str) -> str:
        """Get response from Ollama (free local LLM)"""
        try:
            # Call Ollama API
            response = requests.post(
                f"{self.ollama_base_url}/api/generate",
                json={
                    "model": self.ollama_model,
                    "prompt": f"You are a veterinary expert. {prompt}",
                    "stream": False,
                    "options": {
                        "temperature": settings.llm_temperature,
                        "num_predict": settings.max_tokens
                    }
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "")
            else:
                print(f"Ollama Error: {response.status_code}")
                return self.generate_fallback_response(None)
        
        except Exception as e:
            print(f"LLM Error: {e}")
            return self.generate_fallback_response(None)
    
    def generate_fallback_response(self, vision_result: Optional[VisionAnalysisResult] = None) -> str:
        """Generate intelligent fallback response based on vision analysis"""
        
        if vision_result is None or not vision_result.health_issues:
            severity = "NORMAL"
            urgency = None
            summary = "No significant health issues detected. Animal appears to be in acceptable condition. Regular monitoring recommended."
        else:
            # STRICT severity assessment based on confidence and issue type
            critical_keywords = ['severe', 'critical', 'bleeding', 'emaciated']
            urgent_keywords = ['infection', 'wound', 'injury', 'severe malnutrition']
            moderate_keywords = ['mange', 'dermatitis', 'dehydration', 'possible']
            
            # Filter by confidence - only consider significant findings
            high_confidence_issues = [issue for issue in vision_result.health_issues if issue.confidence > 0.70]
            moderate_confidence_issues = [issue for issue in vision_result.health_issues if 0.60 <= issue.confidence <= 0.70]
            
            max_confidence = max([issue.confidence for issue in vision_result.health_issues])
            issue_texts = [issue.issue.lower() + ' ' + issue.description.lower() for issue in vision_result.health_issues]
            combined_text = ' '.join(issue_texts)
            
            # Determine severity with STRICT thresholds
            has_critical = any(keyword in combined_text for keyword in critical_keywords)
            has_urgent = any(keyword in combined_text for keyword in urgent_keywords)
            has_moderate = any(keyword in combined_text for keyword in moderate_keywords)
            
            # CRITICAL: Only if multiple HIGH confidence issues or severe keywords with high confidence
            if (has_critical and max_confidence > 0.75 and len(high_confidence_issues) >= 2) or (max_confidence > 0.85 and len(high_confidence_issues) >= 3):
                severity = "CRITICAL"
                urgency = 2
                summary = f"Multiple significant health issues detected: {', '.join([issue.issue for issue in high_confidence_issues[:2]])}. Immediate veterinary care strongly recommended."
            # URGENT: Multiple moderate-high confidence issues or urgent keywords with good confidence
            elif (has_urgent and max_confidence > 0.70) or (len(high_confidence_issues) >= 2) or (max_confidence > 0.78):
                severity = "URGENT"
                urgency = 12
                summary = f"Health concerns requiring attention: {', '.join([issue.issue for issue in (high_confidence_issues + moderate_confidence_issues)[:2]])}. Veterinary consultation recommended within 24 hours."
            # LOW: Single moderate issue or possible issues
            elif len(vision_result.health_issues) >= 1 and (max_confidence > 0.58 or has_moderate):
                severity = "LOW"
                urgency = 96
                summary = f"Potential health concern detected: {vision_result.health_issues[0].issue}. Schedule veterinary checkup when convenient."
            # NORMAL: No significant issues or very low confidence
            else:
                severity = "NORMAL"
                urgency = None
                summary = "No significant health issues detected with sufficient confidence. Animal appears to be in acceptable condition. Continue regular monitoring."
        
        return json.dumps({
            "severity": severity,
            "condition_summary": summary,
            "immediate_actions": [
                "Ensure the animal has access to clean, fresh water",
                "Provide a safe, warm, and comfortable resting area",
                "Do NOT attempt to treat serious injuries yourself" if severity in ["CRITICAL", "URGENT"] else "Monitor behavior and appetite",
                "Contact a veterinarian or animal rescue organization immediately" if severity == "CRITICAL" else ("Schedule veterinary consultation within 24 hours" if severity == "URGENT" else "Consider veterinary checkup if symptoms persist or worsen"),
                "Keep the animal calm and minimize stress",
                "Document any changes in behavior, eating, or activity levels"
            ],
            "care_instructions": [
                "Isolate from other animals if skin infection or mange is suspected",
                "Provide small amounts of easily digestible food if malnutrition detected",
                "Keep wounds clean and dry; prevent animal from licking wounds",
                "Maintain detailed notes on symptoms and behavior changes",
                "Ensure adequate shelter from weather extremes",
                "Follow veterinarian's treatment plan strictly"
            ],
            "warning_signs": [
                "Rapid deterioration in condition or energy levels",
                "Complete loss of appetite or inability to drink water",
                "Difficulty breathing, walking, or standing",
                "Increased bleeding, discharge, or wound infection",
                "Seizures, collapse, or loss of consciousness"
            ],
            "estimated_urgency_hours": urgency
        })
    
    def parse_assessment(self, llm_response: str, vision_result: Optional[VisionAnalysisResult] = None) -> Optional[MedicalAssessment]:
        """Parse LLM response into MedicalAssessment"""
        try:
            # Try to extract JSON from response
            start = llm_response.find('{')
            end = llm_response.rfind('}') + 1
            
            if start >= 0 and end > start:
                json_str = llm_response[start:end]
                data = json.loads(json_str)
            else:
                data = json.loads(llm_response)
            
            return MedicalAssessment(
                severity=Severity(data['severity']),
                condition_summary=data['condition_summary'],
                immediate_actions=data['immediate_actions'],
                care_instructions=data['care_instructions'],
                warning_signs=data['warning_signs'],
                estimated_urgency_hours=data.get('estimated_urgency_hours')
            )
        
        except Exception as e:
            print(f"Error parsing assessment: {e}")
            print(f"LLM Response was: {llm_response[:200] if llm_response else 'None'}...")
            # Return None to trigger fallback in assess method
            return None
    
    async def assess(self, vision_result: VisionAnalysisResult, user_notes: Optional[str] = None) -> MedicalAssessment:
        """Perform complete medical assessment with confidence-based validation"""
        try:
            # Filter health issues by confidence threshold
            significant_issues = [issue for issue in vision_result.health_issues if issue.confidence > 0.55]
            
            # If no SIGNIFICANT health issues detected, return NORMAL assessment
            if not significant_issues:
                return MedicalAssessment(
                    severity=Severity.NORMAL,
                    condition_summary="No significant health concerns detected with sufficient confidence. Animal appears to be in acceptable condition. Continue monitoring and provide routine care.",
                    immediate_actions=["Continue regular care and monitoring", "Maintain proper nutrition and hydration", "Provide comfortable shelter and clean environment", "Monitor for any changes in behavior or appetite"],
                    care_instructions=["Maintain regular feeding schedule with quality food", "Ensure fresh water is available at all times", "Provide routine grooming and hygiene", "Schedule routine veterinary checkups as needed", "Ensure safe, comfortable living environment"],
                    warning_signs=["Sudden changes in appetite or water intake", "Lethargy or unusual decreased activity", "Any visible injuries, wounds, or discharge", "Persistent scratching or skin irritation", "Difficulty breathing or moving"],
                    estimated_urgency_hours=None
                )
            
            # Create prompt with confidence-aware context
            prompt = self.create_medical_prompt(vision_result, user_notes)
            
            # Get LLM response
            llm_response = await self.get_llm_response(prompt)
            
            # Parse and return assessment
            assessment = self.parse_assessment(llm_response, vision_result)
            
            # If parsing failed, use intelligent fallback
            if assessment is None:
                print("LLM parsing failed, using intelligent fallback based on vision analysis")
                fallback_response = self.generate_fallback_response(vision_result)
                assessment = self.parse_assessment(fallback_response, vision_result)
            
            # VALIDATION: Ensure severity matches confidence levels
            if assessment and significant_issues:
                max_confidence = max([issue.confidence for issue in significant_issues])
                
                # Downgrade severity if confidence doesn't support it
                if assessment.severity == Severity.CRITICAL and max_confidence < 0.75:
                    print(f"Downgrading CRITICAL to URGENT due to insufficient confidence ({max_confidence:.2f})")
                    assessment.severity = Severity.URGENT
                    assessment.estimated_urgency_hours = 12
                elif assessment.severity == Severity.URGENT and max_confidence < 0.65:
                    print(f"Downgrading URGENT to LOW due to insufficient confidence ({max_confidence:.2f})")
                    assessment.severity = Severity.LOW
                    assessment.estimated_urgency_hours = 96
            
            return assessment
        
        except Exception as e:
            print(f"Medical assessment error: {e}")
            raise Exception(f"Failed to complete medical assessment: {str(e)}")

# Singleton instance
medical_agent = MedicalReasoningAgent()
