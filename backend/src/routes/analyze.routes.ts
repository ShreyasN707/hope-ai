import { Router, Response } from 'express';
import Joi from 'joi';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Analysis } from '../models/Analysis';
import { agentsService } from '../services/agentsService';

const router = Router();

// Validation schema
const analyzeSchema = Joi.object({
  imageUrl: Joi.string().uri().required(),
  userNotes: Joi.string().optional().allow(''),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
  }).optional(),
});

// Analyze animal endpoint
router.post('/analyze', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Validate input
    const { error, value } = analyzeSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }
    
    const { imageUrl, userNotes, location } = value;
    
    // Call agents service for analysis
    const analysisResult = await agentsService.analyzeAnimal({
      image_url: imageUrl,
      user_notes: userNotes,
      user_location: location ? {
        lat: location.latitude,
        lng: location.longitude,
      } : undefined,
    });
    
    // Save analysis to database
    const analysis = new Analysis({
      userId: req.userId,
      imageUrl: imageUrl,
      visionAnalysis: {
        species: analysisResult.vision_analysis.species,
        speciesConfidence: analysisResult.vision_analysis.species_confidence,
        emotionalState: analysisResult.vision_analysis.emotional_state,
        emotionConfidence: analysisResult.vision_analysis.emotion_confidence,
        healthIssues: analysisResult.vision_analysis.health_issues,
      },
      medicalAssessment: {
        severity: analysisResult.medical_assessment.severity,
        conditionSummary: analysisResult.medical_assessment.condition_summary,
        immediateActions: analysisResult.medical_assessment.immediate_actions,
        careInstructions: analysisResult.medical_assessment.care_instructions,
        warningGns: analysisResult.medical_assessment.warning_signs,
        estimatedUrgencyHours: analysisResult.medical_assessment.estimated_urgency_hours,
      },
      nutritionPlan: {
        recommendedFoods: analysisResult.nutrition_plan.recommended_foods,
        dangerousFoods: analysisResult.nutrition_plan.dangerous_foods,
        hydrationPlan: analysisResult.nutrition_plan.hydration_plan,
        feedingSchedule: analysisResult.nutrition_plan.feeding_schedule,
        specialConsiderations: analysisResult.nutrition_plan.special_considerations,
      },
      requiresSOS: analysisResult.requires_sos,
      userNotes: userNotes,
      location: location ? {
        latitude: location.latitude,
        longitude: location.longitude,
      } : undefined,
    });
    
    await analysis.save();
    
    res.json({
      message: 'Analysis completed successfully',
      analysisId: analysis._id,
      result: {
        visionAnalysis: analysisResult.vision_analysis,
        medicalAssessment: analysisResult.medical_assessment,
        nutritionPlan: analysisResult.nutrition_plan,
        requiresSOS: analysisResult.requires_sos,
      },
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: error.message || 'Analysis failed. Please try again.' 
    });
  }
});

export default router;
