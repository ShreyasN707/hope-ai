import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IChat extends Document {
  analysisId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  messages: IMessage[];
  analysisContext: {
    species: string;
    emotionalState: string;
    healthIssues: string[];
    severity: string;
    conditionSummary: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
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
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    analysisContext: {
      species: String,
      emotionalState: String,
      healthIssues: [String],
      severity: String,
      conditionSummary: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for faster queries
chatSchema.index({ userId: 1, analysisId: 1 });
chatSchema.index({ userId: 1, createdAt: -1 });

export const Chat = mongoose.model<IChat>('Chat', chatSchema);
