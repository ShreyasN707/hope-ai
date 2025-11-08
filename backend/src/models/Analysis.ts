import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  imageUrl: string;
  visionAnalysis: {
    species: string;
    speciesConfidence: number;
    emotionalState: string;
    emotionConfidence: number;
    healthIssues: Array<{
      issue: string;
      confidence: number;
      description: string;
    }>;
  };
  medicalAssessment: {
    severity: string;
    conditionSummary: string;
    immediateActions: string[];
    careInstructions: string[];
    warningGns: string[];
    estimatedUrgencyHours?: number;
  };
  nutritionPlan: {
    recommendedFoods: string[];
    dangerousFoods: string[];
    hydrationPlan: string;
    feedingSchedule: string;
    specialConsiderations: string[];
  };
  requiresSOS: boolean;
  userNotes?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const analysisSchema = new Schema<IAnalysis>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    visionAnalysis: {
      species: String,
      speciesConfidence: Number,
      emotionalState: String,
      emotionConfidence: Number,
      healthIssues: [
        {
          issue: String,
          confidence: Number,
          description: String,
        },
      ],
    },
    medicalAssessment: {
      severity: String,
      conditionSummary: String,
      immediateActions: [String],
      careInstructions: [String],
      warningGns: [String],
      estimatedUrgencyHours: Number,
    },
    nutritionPlan: {
      recommendedFoods: [String],
      dangerousFoods: [String],
      hydrationPlan: String,
      feedingSchedule: String,
      specialConsiderations: [String],
    },
    requiresSOS: {
      type: Boolean,
      default: false,
    },
    userNotes: String,
    location: {
      latitude: Number,
      longitude: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
analysisSchema.index({ userId: 1, createdAt: -1 });

export const Analysis = mongoose.model<IAnalysis>('Analysis', analysisSchema);
