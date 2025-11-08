import { Router, Response } from 'express';
import { upload } from '../middleware/upload';
import { authenticate, AuthRequest } from '../middleware/auth';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const router = Router();
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

// Upload image to local storage (FREE alternative to Cloudinary)
router.post(
  '/upload-image',
  authenticate,
  upload.single('image'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No image file provided' });
        return;
      }
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads');
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (err) {
        // Directory already exists
      }
      
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${req.file.originalname}`;
      const filepath = path.join(uploadsDir, filename);
      
      // Save file to local storage
      await writeFile(filepath, req.file.buffer);
      
      // Generate URL for the file
      const imageUrl = `http://localhost:${process.env.PORT || 5000}/uploads/${filename}`;
      
      res.json({
        message: 'Image uploaded successfully',
        imageUrl: imageUrl,
        publicId: filename,
        width: null,
        height: null,
      });
    } catch (error: any) {
      console.error('Image upload error:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  }
);

export default router;
