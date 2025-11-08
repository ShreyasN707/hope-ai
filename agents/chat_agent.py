from typing import List, Dict, Any, Optional
import requests
from models import ChatMessage, ChatRequest, ChatResponse
from config import settings

class PetWhispererAgent:
    def __init__(self):
        self.llm_provider = settings.llm_provider
        self.ollama_base_url = settings.ollama_base_url
        self.ollama_model = settings.ollama_model
        
        self.system_prompt = """You are the Pet Whisperer, a compassionate and knowledgeable AI assistant specializing in animal psychology, behavior, and emotional wellbeing. You help people understand their pets and stray animals better.

Your expertise includes:
- Animal behavior patterns and body language
- Emotional states and stress signals in animals
- Building trust with scared or traumatized animals
- Pet psychology and mental health
- Species-specific communication and needs
- Rescue and rehabilitation guidance
- Interpretation of medical and behavioral analysis results

Your approach:
- Be warm, empathetic, and understanding
- Explain animal behavior in simple, relatable terms
- Give practical, actionable advice tailored to the specific animal
- Consider both the animal's and human's perspective
- Emphasize patience, kindness, and respect for animals
- Share insights about why animals behave certain ways
- Help build stronger human-animal bonds
- When analysis context is provided, reference it specifically and provide tailored advice

**IMPORTANT: When analysis context is provided about a specific animal:**
- Refer to the specific species, emotional state, and health conditions mentioned
- Provide advice tailored to THAT specific animal's situation
- Reference the analysis findings when relevant (e.g., "Based on the analysis showing your cat is stressed...")
- Connect behavioral advice to their specific health/emotional state
- Be specific, not general

Always prioritize the animal's welfare and emotional health. Give voice to those who cannot speak."""
    
    def create_suggestions(self, message: str) -> List[str]:
        """Generate follow-up suggestions based on the conversation"""
        suggestions = []
        
        message_lower = message.lower()
        
        if any(word in message_lower for word in ['scared', 'afraid', 'fear', 'anxious']):
            suggestions = [
                "How can I help my pet feel safer?",
                "What are signs of anxiety in animals?",
                "How long does it take for a scared animal to calm down?"
            ]
        elif any(word in message_lower for word in ['aggressive', 'biting', 'attacking']):
            suggestions = [
                "Is this aggression or fear-based behavior?",
                "How should I approach an aggressive animal?",
                "What triggers aggressive behavior?"
            ]
        elif any(word in message_lower for word in ['stray', 'rescue', 'trust']):
            suggestions = [
                "What food should I offer to a stray?",
                "How do I approach a stray animal safely?",
                "What are the signs a stray is starting to trust me?"
            ]
        elif any(word in message_lower for word in ['barking', 'meowing', 'noise', 'vocal']):
            suggestions = [
                "What is my pet trying to communicate?",
                "How can I reduce excessive vocalization?",
                "Is this normal behavior for this species?"
            ]
        else:
            suggestions = [
                "How can I better understand my pet's emotions?",
                "What are signs my pet is happy?",
                "How do I build a stronger bond with my pet?"
            ]
        
        return suggestions[:3]
    
    async def get_llm_response(self, messages: List[Dict[str, str]], context: Optional[Dict[str, Any]] = None) -> str:
        """Get response from Ollama (free local LLM) with RAG context"""
        try:
            # Format conversation for Ollama with RAG context
            full_prompt = f"{self.system_prompt}\n\n"
            
            # Add RAG context if provided
            if context:
                full_prompt += "=== ANALYSIS CONTEXT (Use this to provide specific, personalized advice) ===\n"
                if 'species' in context:
                    full_prompt += f"Animal Species: {context['species']}\n"
                if 'emotionalState' in context:
                    full_prompt += f"Current Emotional State: {context['emotionalState']}\n"
                if 'severity' in context:
                    full_prompt += f"Medical Severity: {context['severity']}\n"
                if 'conditionSummary' in context:
                    full_prompt += f"Health Summary: {context['conditionSummary']}\n"
                if 'healthIssues' in context and context['healthIssues']:
                    full_prompt += f"Detected Health Issues: {', '.join(context['healthIssues'])}\n"
                if 'immediateActions' in context and context['immediateActions']:
                    full_prompt += f"Recommended Actions: {'; '.join(context['immediateActions'][:3])}\n"
                if 'nutritionPlan' in context and context['nutritionPlan']:
                    nutrition = context['nutritionPlan']
                    if 'recommendedFoods' in nutrition:
                        full_prompt += f"Safe Foods: {', '.join(nutrition['recommendedFoods'][:5])}\n"
                    if 'dangerousFoods' in nutrition:
                        full_prompt += f"Dangerous Foods: {', '.join(nutrition['dangerousFoods'][:5])}\n"
                full_prompt += "=== END CONTEXT ===\n\n"
                full_prompt += "IMPORTANT: Reference the above analysis when answering. Be specific to THIS animal's condition.\n\n"
            
            for msg in messages:
                full_prompt += f"{msg['role'].upper()}: {msg['content']}\n"
            full_prompt += "ASSISTANT:"
            
            # Call Ollama API
            response = requests.post(
                f"{self.ollama_base_url}/api/generate",
                json={
                    "model": self.ollama_model,
                    "prompt": full_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.8,
                        "num_predict": 800
                    }
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "")
            else:
                return self.generate_fallback_response(messages[-1]['content'])
        
        except Exception as e:
            print(f"Chat LLM Error: {e}")
            return self.generate_fallback_response(messages[-1]['content'])
    
    def generate_fallback_response(self, user_message: str) -> str:
        """Generate a helpful fallback response"""
        message_lower = user_message.lower()
        
        if 'scared' in message_lower or 'afraid' in message_lower:
            return """When an animal is scared, it's usually due to past trauma, unfamiliar situations, or feeling threatened. Here's what you can do:

1. **Create a safe space**: Give them a quiet area where they can retreat
2. **Move slowly**: Sudden movements can increase fear
3. **Speak softly**: Use a calm, gentle voice
4. **Give them time**: Don't force interaction
5. **Positive associations**: Offer treats at a distance

Remember, patience is key. Some animals need weeks or months to fully overcome their fears. Never punish a scared animal - it will only make things worse."""
        
        elif 'trust' in message_lower and 'stray' in message_lower:
            return """Building trust with a stray animal takes patience and consistency:

1. **Start at a distance**: Don't approach directly at first
2. **Offer food regularly**: Same time, same place builds routine
3. **Sit, don't stand**: Make yourself less intimidating
4. **Avoid direct eye contact**: This can seem threatening
5. **Let them come to you**: Never chase or grab
6. **Speak softly**: Use a gentle, consistent voice
7. **Be patient**: Trust can take days to months

Signs they're warming up: relaxed body language, eating while you're near, approaching voluntarily. Every animal is different - respect their pace."""
        
        elif 'barking' in message_lower or 'bark' in message_lower:
            return """Dogs bark at night for several reasons:

1. **Alert barking**: They hear something outside
2. **Anxiety/fear**: Feeling insecure or scared
3. **Attention seeking**: Wants company or interaction
4. **Boredom**: Not enough exercise during the day
5. **Medical issues**: Pain or discomfort

Solutions:
- Ensure adequate daytime exercise
- Create a comfortable sleeping area
- Use white noise to mask outside sounds
- Establish a calming bedtime routine
- Rule out medical issues with a vet

If it persists, consider consulting a professional dog behaviorist."""
        
        else:
            return """I'm here to help you understand your pet better! Animals communicate through body language, vocalizations, and behavior patterns. 

Each species has unique ways of expressing themselves:
- Dogs use tail wagging, ear position, and vocalizations
- Cats communicate through purring, meowing, and body posture
- Understanding these signals helps build stronger bonds

What specific behavior or concern would you like to discuss? I can help you decode what your pet might be trying to tell you."""
    
    async def chat(self, request: ChatRequest) -> ChatResponse:
        """Process chat conversation"""
        try:
            # Build message history
            messages = []
            for msg in request.history:
                messages.append({
                    "role": msg.role,
                    "content": msg.content
                })
            
            # Add current message
            messages.append({
                "role": "user",
                "content": request.message
            })
            
            # Add context if provided
            if request.context:
                context_str = "\n\nCONTEXT (from recent analysis):\n"
                for key, value in request.context.items():
                    context_str += f"- {key}: {value}\n"
                messages[-1]["content"] += context_str
            
            # Get response with RAG context
            response_text = await self.get_llm_response(messages, request.context)
            
            # Generate suggestions
            suggestions = self.create_suggestions(request.message)
            
            return ChatResponse(
                response=response_text,
                suggestions=suggestions
            )
        
        except Exception as e:
            print(f"Chat error: {e}")
            return ChatResponse(
                response="I apologize, but I'm having trouble processing your question right now. Please try again or rephrase your question.",
                suggestions=[
                    "Tell me about animal behavior",
                    "How can I help a scared pet?",
                    "What does my pet's body language mean?"
                ]
            )

# Singleton instance
pet_whisperer_agent = PetWhispererAgent()
