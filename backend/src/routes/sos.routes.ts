import { Router, Response } from 'express';
import Joi from 'joi';
import { authenticate, AuthRequest } from '../middleware/auth';
import { agentsService } from '../services/agentsService';

const router = Router();

// Validation schema
const sosSchema = Joi.object({
  imageUrl: Joi.string().uri().required(),
  conditionSummary: Joi.string().required(),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
  }).required(),
  contactWhatsapp: Joi.string().optional(),
  contactEmail: Joi.string().email().optional(),
});

// SOS rescue endpoint
router.post('/sos', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Validate input
    const { error, value } = sosSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }
    
    const { imageUrl, conditionSummary, location, contactWhatsapp, contactEmail } = value;
    
    // Call agents service for SOS
    const sosResult = await agentsService.activateSOS({
      image_url: imageUrl,
      condition_summary: conditionSummary,
      location: {
        lat: location.latitude,
        lng: location.longitude,
      },
      contact_whatsapp: contactWhatsapp,
      contact_email: contactEmail,
    });
    
    res.json({
      message: 'SOS activated successfully',
      result: sosResult,
    });
  } catch (error: any) {
    console.error('SOS error:', error);
    res.status(500).json({ 
      error: error.message || 'SOS activation failed. Please try again.' 
    });
  }
});

export default router;
