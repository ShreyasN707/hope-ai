import express, { Request, Response } from 'express';
import { Feedback } from '../models/Feedback';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Extend Express Request type
interface AuthRequest extends Request {
  user?: any;
}

// Submit feedback for an analysis
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const {
      analysisId,
      emotionAccurate,
      emotionCorrection,
      healthIssuesAccurate,
      healthCorrections,
      overallRating,
      comments,
    } = req.body;

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({
      userId: req.user!._id,
      analysisId,
    });

    if (existingFeedback) {
      // Update existing feedback
      existingFeedback.emotionAccurate = emotionAccurate;
      existingFeedback.emotionCorrection = emotionCorrection;
      existingFeedback.healthIssuesAccurate = healthIssuesAccurate;
      existingFeedback.healthCorrections = healthCorrections;
      existingFeedback.overallRating = overallRating;
      existingFeedback.comments = comments;
      
      await existingFeedback.save();
      
      return res.json({
        success: true,
        message: 'Feedback updated successfully',
        feedback: existingFeedback,
      });
    }

    // Create new feedback
    const feedback = new Feedback({
      analysisId,
      userId: req.user!._id,
      emotionAccurate,
      emotionCorrection,
      healthIssuesAccurate,
      healthCorrections,
      overallRating,
      comments,
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully. Thank you for helping us improve!',
      feedback,
    });
  } catch (error: any) {
    console.error('Feedback submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message,
    });
  }
});

// Get feedback for an analysis
router.get('/:analysisId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const feedback = await Feedback.findOne({
      userId: req.user!._id,
      analysisId: req.params.analysisId,
    });

    res.json({
      success: true,
      feedback,
    });
  } catch (error: any) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get feedback',
      error: error.message,
    });
  }
});

// Get aggregated feedback statistics (for model improvement tracking)
router.get('/stats/aggregate', authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          totalFeedback: { $sum: 1 },
          avgRating: { $avg: '$overallRating' },
          emotionAccuracyRate: {
            $avg: { $cond: ['$emotionAccurate', 1, 0] },
          },
          healthAccuracyRate: {
            $avg: { $cond: ['$healthIssuesAccurate', 1, 0] },
          },
        },
      },
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        totalFeedback: 0,
        avgRating: 0,
        emotionAccuracyRate: 0,
        healthAccuracyRate: 0,
      },
    });
  } catch (error: any) {
    console.error('Get feedback stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get feedback statistics',
      error: error.message,
    });
  }
});

export default router;
