import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Analysis } from '../models/Analysis';

const router = Router();

// Get analysis history for authenticated user
router.get('/history', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Fetch analyses with pagination
    const analyses = await Analysis.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count
    const total = await Analysis.countDocuments({ userId: req.userId });
    
    res.json({
      analyses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get single analysis by ID
router.get('/history/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).lean();
    
    if (!analysis) {
      res.status(404).json({ error: 'Analysis not found' });
      return;
    }
    
    res.json({ analysis });
  } catch (error: any) {
    console.error('Analysis fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

// Delete analysis by ID
router.delete('/history/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const analysis = await Analysis.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    
    if (!analysis) {
      res.status(404).json({ error: 'Analysis not found' });
      return;
    }
    
    res.json({ message: 'Analysis deleted successfully' });
  } catch (error: any) {
    console.error('Analysis delete error:', error);
    res.status(500).json({ error: 'Failed to delete analysis' });
  }
});

export default router;
