import { Router, Response } from 'express';
import Joi from 'joi';
import { authenticate, AuthRequest } from '../middleware/auth';
import { agentsService } from '../services/agentsService';
import { Chat } from '../models/Chat';
import { Analysis } from '../models/Analysis';

const router = Router();

// Validation schemas
const chatSchema = Joi.object({
  message: Joi.string().required().min(1).max(1000),
  analysisId: Joi.string().optional(), // Optional: which analysis to chat about
});

// RAG Chat with Pet Whisperer endpoint (analysis-specific)
router.post('/chat', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Validate input
    const { error, value } = chatSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }
    
    const { message, analysisId } = value;
    const userId = req.user!._id;
    
    let chatSession;
    let analysisContext = null;
    
    // If analysisId provided, this is analysis-specific chat (RAG mode)
    if (analysisId) {
      // Verify user owns this analysis
      const analysis = await Analysis.findOne({ _id: analysisId, userId });
      if (!analysis) {
        res.status(404).json({ error: 'Analysis not found' });
        return;
      }
      
      // Build RAG context from analysis
      analysisContext = {
        species: analysis.visionAnalysis.species,
        emotionalState: analysis.visionAnalysis.emotionalState,
        healthIssues: analysis.visionAnalysis.healthIssues.map(h => h.issue),
        severity: analysis.medicalAssessment.severity,
        conditionSummary: analysis.medicalAssessment.conditionSummary,
        immediateActions: analysis.medicalAssessment.immediateActions,
        careInstructions: analysis.medicalAssessment.careInstructions,
        nutritionPlan: {
          recommendedFoods: analysis.nutritionPlan.recommendedFoods,
          dangerousFoods: analysis.nutritionPlan.dangerousFoods,
        },
      };
      
      // Find or create chat session for this analysis
      chatSession = await Chat.findOne({ analysisId, userId });
      if (!chatSession) {
        chatSession = new Chat({
          analysisId,
          userId,
          messages: [],
          analysisContext: {
            species: analysis.visionAnalysis.species,
            emotionalState: analysis.visionAnalysis.emotionalState,
            healthIssues: analysis.visionAnalysis.healthIssues.map(h => h.issue),
            severity: analysis.medicalAssessment.severity,
            conditionSummary: analysis.medicalAssessment.conditionSummary,
          },
        });
      }
    }
    
    // Get chat history
    const history = chatSession ? chatSession.messages.map(m => ({
      role: m.role,
      content: m.content,
    })) : [];
    
    // Call agents service with RAG context
    const chatResult = await agentsService.chatWithWhisperer({
      message,
      history,
      context: analysisContext,
    });
    
    // Save chat messages if it's an analysis-specific chat
    if (chatSession) {
      chatSession.messages.push(
        { role: 'user', content: message, timestamp: new Date() },
        { role: 'assistant', content: chatResult.response, timestamp: new Date() }
      );
      await chatSession.save();
    }
    
    res.json({
      response: chatResult.response,
      suggestions: chatResult.suggestions || [],
      chatId: chatSession?._id,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: error.message || 'Chat service unavailable. Please try again.' 
    });
  }
});

// Get chat history for a specific analysis
router.get('/chat/history/:analysisId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { analysisId } = req.params;
    const userId = req.user!._id;
    
    const chatSession = await Chat.findOne({ analysisId, userId });
    
    if (!chatSession) {
      res.json({ messages: [] });
      return;
    }
    
    res.json({
      messages: chatSession.messages,
      analysisContext: chatSession.analysisContext,
    });
  } catch (error: any) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to retrieve chat history' });
  }
});

// Get all chat sessions for user
router.get('/chat/sessions', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    
    const chatSessions = await Chat.find({ userId })
      .populate('analysisId', 'imageUrl visionAnalysis.species createdAt')
      .sort({ updatedAt: -1 })
      .limit(20);
    
    res.json({ chatSessions });
  } catch (error: any) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({ error: 'Failed to retrieve chat sessions' });
  }
});

export default router;
