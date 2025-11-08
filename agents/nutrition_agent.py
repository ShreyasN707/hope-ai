from typing import Optional
import requests
from models import VisionAnalysisResult, Species, NutritionPlan, MedicalAssessment
from config import settings
import json

class NutritionCarePlannerAgent:
    def __init__(self):
        self.llm_provider = settings.llm_provider
        self.ollama_base_url = settings.ollama_base_url
        self.ollama_model = settings.ollama_model
        
        # Predefined dangerous foods for quick reference
        self.dangerous_foods = {
            Species.DOG: [
                "Chocolate (toxic)",
                "Grapes and raisins (kidney failure)",
                "Onions and garlic (anemia)",
                "Xylitol (hypoglycemia)",
                "Avocado (toxicity)",
                "Alcohol (poisoning)",
                "Caffeine (toxicity)",
                "Macadamia nuts (weakness)",
                "Raw dough (bloat)"
            ],
            Species.CAT: [
                "Chocolate (toxic)",
                "Onions and garlic (anemia)",
                "Grapes and raisins (kidney issues)",
                "Alcohol (poisoning)",
                "Caffeine (toxicity)",
                "Raw eggs (salmonella)",
                "Raw fish (thiamine deficiency)",
                "Milk and dairy (lactose intolerance)",
                "Xylitol (toxicity)"
            ],
            Species.COW: [
                "Moldy or spoiled feed (mycotoxins)",
                "Certain plants (nightshade, bracken fern)",
                "Excessive grain (acidosis)",
                "Wilted cherry leaves (cyanide)",
                "Lawn clippings (fermentation)",
                "Processed human foods"
            ]
        }
    
    def create_nutrition_prompt(self, species: Species, vision_result: VisionAnalysisResult, 
                                medical_assessment: MedicalAssessment) -> str:
        """Create nutrition planning prompt"""
        
        health_context = ""
        if vision_result.health_issues:
            health_context = "Health concerns detected:\n"
            for issue in vision_result.health_issues:
                health_context += f"- {issue.issue}\n"
        
        prompt = f"""You are a veterinary nutrition expert. Create a comprehensive nutrition and care plan for the following animal:

ANIMAL INFORMATION:
- Species: {species.value}
- Emotional State: {vision_result.emotional_state.value}
- Medical Severity: {medical_assessment.severity.value}
- Condition: {medical_assessment.condition_summary}

{health_context}

Create a detailed nutrition and care plan including:

1. RECOMMENDED FOODS (5-7 specific foods):
   - List safe, nutritious foods appropriate for this species
   - Include both regular diet and recovery foods if needed
   - Consider the animal's current health condition

2. DANGEROUS FOODS (list foods that are toxic or harmful):
   - Species-specific dangerous foods
   - Common foods people might mistakenly offer

3. HYDRATION PLAN:
   - Water intake recommendations
   - Signs of proper hydration
   - Special considerations based on health status

4. FEEDING SCHEDULE:
   - Frequency of meals
   - Portion size guidelines
   - Timing considerations

5. SPECIAL CONSIDERATIONS (3-5 points):
   - Diet adjustments based on health issues
   - Supplements if needed
   - Monitoring guidelines

Respond ONLY with a valid JSON object in this format:
{{
    "recommended_foods": ["food1", "food2", ...],
    "dangerous_foods": ["food1", "food2", ...],
    "hydration_plan": "detailed hydration guidance",
    "feeding_schedule": "feeding schedule details",
    "special_considerations": ["consideration1", "consideration2", ...]
}}

Be specific and practical. Prioritize the animal's health and recovery needs."""
        
        return prompt
    
    async def get_llm_response(self, prompt: str) -> str:
        """Get response from Ollama (free local LLM)"""
        try:
            # Call Ollama API
            response = requests.post(
                f"{self.ollama_base_url}/api/generate",
                json={
                    "model": self.ollama_model,
                    "prompt": f"You are a veterinary nutrition expert. {prompt}",
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "num_predict": 1000
                    }
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "")
            else:
                print(f"Ollama returned status {response.status_code}, using fallback")
                return ""
        
        except Exception as e:
            print(f"Nutrition LLM Error: {e}")
            return ""
    
    def generate_fallback_response(self, vision_result: Optional[VisionAnalysisResult] = None) -> str:
        """Generate concise, focused nutrition plan"""
        
        species = vision_result.species.value if vision_result else "animal"
        
        if species == "dog":
            return json.dumps({
                "recommendedFoods": [
                    "High-quality dog food (age-appropriate)",
                    "Lean chicken (cooked, boneless)",
                    "Rice or sweet potato",
                    "Carrots, green beans"
                ],
                "dangerousFoods": [
                    "Chocolate (toxic)",
                    "Grapes/raisins (kidney damage)",
                    "Onions/garlic (anemia)",
                    "Xylitol (hypoglycemia)"
                ],
                "hydrationPlan": "Fresh water always available. ~1 oz per pound body weight daily.",
                "feedingSchedule": "Adults: 2 meals daily. Puppies: 3-4 meals daily.",
                "specialConsiderations": [
                    "Transition diets gradually over 7-10 days",
                    "Monitor weight and adjust portions"
                ]
            })
        elif species == "cat":
            return json.dumps({
                "recommendedFoods": [
                    "High-quality wet cat food (primary)",
                    "Premium dry food (supplementary)",
                    "Cooked chicken/fish (plain)",
                    "Cat grass"
                ],
                "dangerousFoods": [
                    "Onions/garlic (anemia)",
                    "Chocolate (toxic)",
                    "Grapes/raisins (kidney damage)",
                    "Tuna (mercury risk)"
                ],
                "hydrationPlan": "Multiple water sources. Wet food preferred for hydration.",
                "feedingSchedule": "Adults: 2-3 small meals daily. Kittens: 4-6 meals daily.",
                "specialConsiderations": [
                    "Obligate carnivores - need meat-based diet",
                    "Wet food preferred for health"
                ]
            })
        else:
            return json.dumps({
                "recommendedFoods": [
                    "Species-appropriate commercial food",
                    "Fresh water daily"
                ],
                "dangerousFoods": [
                    "Chocolate",
                    "Onions/garlic",
                    "Grapes/raisins"
                ],
                "hydrationPlan": "Fresh water daily. Monitor intake.",
                "feedingSchedule": "Follow species guidelines. Consult vet.",
                "specialConsiderations": [
                    "Avoid sudden diet changes",
                    "Consult veterinarian for specific needs"
                ]
            })
    
    def generate_fallback_plan(self, species: Species) -> str:
        """Generate fallback nutrition plan based on species"""
        if species == Species.DOG:
            return json.dumps({
                "recommendedFoods": [
                    "High-quality dog food (age-appropriate)",
                    "Lean chicken (cooked, boneless)",
                    "Rice or sweet potato",
                    "Carrots, green beans"
                ],
                "dangerousFoods": [
                    "Chocolate (toxic)",
                    "Grapes/raisins (kidney damage)",
                    "Onions/garlic (anemia)",
                    "Xylitol (hypoglycemia)"
                ],
                "hydrationPlan": "Fresh water always available. ~1 oz per pound body weight daily.",
                "feedingSchedule": "Adults: 2 meals daily. Puppies: 3-4 meals daily.",
                "specialConsiderations": [
                    "Transition diets gradually over 7-10 days",
                    "Monitor weight and adjust portions"
                ]
            })
        elif species == Species.CAT:
            return json.dumps({
                "recommendedFoods": [
                    "High-quality wet cat food (primary)",
                    "Premium dry food (supplementary)",
                    "Cooked chicken/fish (plain)",
                    "Cat grass"
                ],
                "dangerousFoods": [
                    "Onions/garlic (anemia)",
                    "Chocolate (toxic)",
                    "Grapes/raisins (kidney damage)",
                    "Tuna (mercury risk)"
                ],
                "hydrationPlan": "Multiple water sources. Wet food preferred for hydration.",
                "feedingSchedule": "Adults: 2-3 small meals daily. Kittens: 4-6 meals daily.",
                "specialConsiderations": [
                    "Obligate carnivores - need meat-based diet",
                    "Wet food preferred for health"
                ]
            })
        else:
            return json.dumps({
                "recommendedFoods": [
                    "Species-appropriate commercial food",
                    "Fresh water daily"
                ],
                "dangerousFoods": [
                    "Chocolate",
                    "Onions/garlic",
                    "Grapes/raisins"
                ],
                "hydrationPlan": "Fresh water daily. Monitor intake.",
                "feedingSchedule": "Follow species guidelines. Consult vet.",
                "specialConsiderations": [
                    "Avoid sudden diet changes",
                    "Consult veterinarian for specific needs"
                ]
            })
    
    def parse_nutrition_plan(self, llm_response: str, species: Species) -> NutritionPlan:
        """Parse LLM response into NutritionPlan"""
        try:
            # Extract JSON from response
            start = llm_response.find('{')
            end = llm_response.rfind('}') + 1
            
            if start >= 0 and end > start:
                json_str = llm_response[start:end]
                data = json.loads(json_str)
            else:
                data = json.loads(llm_response)
            
            return NutritionPlan(
                recommended_foods=data['recommended_foods'],
                dangerous_foods=data['dangerous_foods'],
                hydration_plan=data['hydration_plan'],
                feeding_schedule=data['feeding_schedule'],
                special_considerations=data['special_considerations']
            )
        
        except Exception as e:
            print(f"Error parsing nutrition plan: {e}")
            # Return fallback plan
            fallback = self.generate_fallback_plan(species)
            return self.parse_nutrition_plan(fallback, species)
    
    async def create_plan(self, vision_result: VisionAnalysisResult, 
                         medical_assessment: MedicalAssessment) -> NutritionPlan:
        """Create comprehensive nutrition plan with intelligent fallbacks"""
        try:
            species = vision_result.species
            
            # Create prompt
            prompt = self.create_nutrition_prompt(species, vision_result, medical_assessment)
            
            # Get LLM response
            llm_response = await self.get_llm_response(prompt)
            
            # Parse response - if empty or invalid, use fallback
            if llm_response and len(llm_response.strip()) > 50:
                try:
                    plan = self.parse_nutrition_plan(llm_response, species)
                    return plan
                except Exception as parse_error:
                    print(f"Failed to parse LLM nutrition response: {parse_error}")
            
            # Use intelligent fallback based on species
            print(f"Using fallback nutrition plan for {species.value}")
            fallback_json = self.generate_fallback_plan(species)
            plan = self.parse_nutrition_plan(fallback_json, species)
            return plan
        
        except Exception as e:
            print(f"Nutrition planning error: {e}")
            # Return fallback
            fallback = self.generate_fallback_plan(vision_result.species)
            return self.parse_nutrition_plan(fallback, vision_result.species)

# Singleton instance
nutrition_agent = NutritionCarePlannerAgent()
