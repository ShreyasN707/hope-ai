import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  analysisId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  emotionAccurate: boolean;
  emotionCorrection?: string;
  healthIssuesAccurate: boolean;
  healthCorrections?: string;
  overallRating: number; // 1-5 stars
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    analysisId: {
      type: Schema.Types.ObjectId,
      ref: 'Analysis',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    emotionAccurate: {
      type: Boolean,
      required: true,
    },
    emotionCorrection: {
      type: String,
    },
    healthIssuesAccurate: {
      type: Boolean,
      required: true,
    },
    healthCorrections: {
      type: String,
    },
    overallRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comments: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate feedback
feedbackSchema.index({ userId: 1, analysisId: 1 }, { unique: true });

export const Feedback = mongoose.model<IFeedback>('Feedback', feedbackSchema);
