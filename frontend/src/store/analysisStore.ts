import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface HealthIssue {
  issue: string;
  confidence: number;
  description: string;
}

interface VisionAnalysis {
  species: string;
  speciesConfidence: number;
  emotionalState: string;
  emotionConfidence: number;
  healthIssues: HealthIssue[];
}

interface MedicalAssessment {
  severity: string;
  conditionSummary: string;
  immediateActions: string[];
  careInstructions: string[];
  warningGns: string[];
  estimatedUrgencyHours: number | null;
}

interface NutritionPlan {
  recommendedFoods: string[];
  dangerousFoods: string[];
  hydrationPlan: string;
  feedingSchedule: string;
  specialConsiderations: string[];
}

interface AnalysisResult {
  analysisId: string;
  imageUrl: string;
  visionAnalysis: VisionAnalysis;
  medicalAssessment: MedicalAssessment;
  nutritionPlan: NutritionPlan;
  requiresSOS: boolean;
  timestamp: string;
}

interface LoadingAnalysis {
  imageUrl: string;
  startTime: string;
  status: 'uploading' | 'analyzing' | 'complete' | 'error';
}

interface AnalysisState {
  currentAnalysis: AnalysisResult | null;
  recentAnalyses: AnalysisResult[];
  loadingAnalysis: LoadingAnalysis | null;
  setCurrentAnalysis: (analysis: AnalysisResult) => void;
  addToHistory: (analysis: AnalysisResult) => void;
  clearCurrent: () => void;
  setLoadingAnalysis: (loading: LoadingAnalysis | null) => void;
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set) => ({
      currentAnalysis: null,
      recentAnalyses: [],
      loadingAnalysis: null,
      
      setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
      
      addToHistory: (analysis) =>
        set((state) => ({
          currentAnalysis: analysis,
          recentAnalyses: [
            analysis,
            ...state.recentAnalyses.filter((a) => a.analysisId !== analysis.analysisId),
          ].slice(0, 10), // Keep only last 10
          loadingAnalysis: null, // Clear loading state when complete
        })),
      
      clearCurrent: () => set({ currentAnalysis: null }),
      
      setLoadingAnalysis: (loading) => set({ loadingAnalysis: loading }),
    }),
    {
      name: 'analysis-storage',
    }
  )
);
