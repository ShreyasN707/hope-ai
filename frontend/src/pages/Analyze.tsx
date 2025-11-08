import { useState } from 'react';
import { Upload, LogIn, UserPlus } from 'lucide-react';
import { uploadAPI, analysisAPI } from '../lib/api';
import { useAnalysisStore } from '../store/analysisStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

export default function Analyze() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const { addToHistory, setLoadingAnalysis, loadingAnalysis } = useAnalysisStore();
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const isAuthenticated = !!token;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setProgress('Uploading image...');
    
    try {
      // Track upload progress
      setLoadingAnalysis({
        imageUrl: preview!,
        startTime: new Date().toISOString(),
        status: 'uploading',
      });
      
      const uploadResult = await uploadAPI.uploadImage(file);
      
      setProgress('Analyzing with AI (this may take 10-20 seconds)...');
      setLoadingAnalysis({
        imageUrl: uploadResult.imageUrl,
        startTime: new Date().toISOString(),
        status: 'analyzing',
      });
      
      const analysisResult = await analysisAPI.analyze({
        imageUrl: uploadResult.imageUrl,
      });
      
      // Map snake_case from backend to camelCase for frontend
      const mappedAnalysis = {
        analysisId: analysisResult.analysisId,
        imageUrl: uploadResult.imageUrl,
        visionAnalysis: {
          species: analysisResult.result.visionAnalysis?.species || 'unknown',
          speciesConfidence: analysisResult.result.visionAnalysis?.species_confidence || 0,
          emotionalState: analysisResult.result.visionAnalysis?.emotional_state || 'neutral',
          emotionConfidence: analysisResult.result.visionAnalysis?.emotion_confidence || 0,
          healthIssues: analysisResult.result.visionAnalysis?.health_issues || [],
        },
        medicalAssessment: {
          severity: analysisResult.result.medicalAssessment?.severity || 'NORMAL',
          conditionSummary: analysisResult.result.medicalAssessment?.condition_summary || '',
          immediateActions: analysisResult.result.medicalAssessment?.immediate_actions || [],
          careInstructions: analysisResult.result.medicalAssessment?.care_instructions || [],
          warningGns: analysisResult.result.medicalAssessment?.warning_signs || [],
          estimatedUrgencyHours: analysisResult.result.medicalAssessment?.estimated_urgency_hours || null,
        },
        nutritionPlan: {
          recommendedFoods: analysisResult.result.nutritionPlan?.recommended_foods || [],
          dangerousFoods: analysisResult.result.nutritionPlan?.dangerous_foods || [],
          hydrationPlan: analysisResult.result.nutritionPlan?.hydration_plan || '',
          feedingSchedule: analysisResult.result.nutritionPlan?.feeding_schedule || '',
          specialConsiderations: analysisResult.result.nutritionPlan?.special_considerations || [],
        },
        requiresSOS: analysisResult.result.requiresSOS || false,
        timestamp: new Date().toISOString(),
      };
      
      // Store in analysis store and navigate only if authenticated
      if (isAuthenticated) {
        addToHistory(mappedAnalysis);
        setProgress('Complete!');
        toast.success('Analysis complete! Redirecting to results...');
        setTimeout(() => navigate(`/history/${analysisResult.analysisId}`), 1000);
      } else {
        // For non-authenticated users, show success message
        setProgress('Complete!');
        toast.success('Analysis complete! Sign up to save and view full results.', {
          duration: 5000,
          icon: '✨',
        });
        setTimeout(() => {
          setFile(null);
          setPreview(null);
          setProgress('');
        }, 3000);
      }
    } catch (error: any) {
      setLoadingAnalysis({
        imageUrl: preview!,
        startTime: new Date().toISOString(),
        status: 'error',
      });
      toast.error(error.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="animate-fade-in-up">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
          Analyze Pet 🔍
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Upload an image for instant AI-powered analysis</p>
        
        {/* Sign-up banner for non-authenticated users */}
        {!isAuthenticated && (
          <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border-2 border-pink-200 dark:border-pink-800 rounded-xl">
            <p className="text-pink-900 dark:text-pink-300 font-semibold mb-2">
              ✨ You're using Hope as a guest
            </p>
            <p className="text-pink-700 dark:text-pink-400 text-sm mb-3">
              Sign up to save your analysis history, access AI chat, and unlock all features!
            </p>
            <div className="flex gap-2">
              <Link
                to="/register"
                className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-500 dark:to-purple-500 text-white text-sm font-medium rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up Free</span>
              </Link>
              <Link
                to="/login"
                className="flex items-center space-x-1 px-4 py-2 border-2 border-pink-300 dark:border-pink-700 text-pink-700 dark:text-pink-300 text-sm font-medium rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            </div>
          </div>
        )}
      </div>
      
      {/* Show in-progress analysis status */}
      {loadingAnalysis && loadingAnalysis.status !== 'complete' && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-2 border-blue-300 dark:border-blue-600 rounded-xl animate-scale-pop shadow-lg">
          <p className="font-semibold text-blue-900 dark:text-blue-300">Analysis in progress...</p>
          <p className="text-sm text-blue-700 dark:text-blue-400">Status: {loadingAnalysis.status}</p>
          <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
            {isAuthenticated 
              ? "You can navigate away - results will be saved to your history"
              : "Analysis will complete in a moment. Sign up to save results!"}
          </p>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 hover-lift transition-all animate-scale-pop delay-100">
        {!preview ? (
          <label className="flex flex-col items-center justify-center h-64 border-3 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl cursor-pointer hover:border-hope dark:hover:border-hope transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 group">
            <Upload className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4 group-hover:text-hope transition-colors animate-bounce-cute" />
            <span className="text-gray-600 dark:text-gray-400 font-medium text-lg">📸 Click to upload image</span>
            <span className="text-gray-400 dark:text-gray-500 text-sm mt-2">Supports JPG, PNG up to 10MB</span>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        ) : (
          <div>
            <img src={preview} alt="Preview" className="w-full h-64 object-contain mb-4 rounded" />
            
            {progress && (
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl border-2 border-blue-200 dark:border-blue-700 animate-fade-in-up">
                <p className="text-blue-900 dark:text-blue-300 text-sm font-medium flex items-center gap-2">
                  <span className="animate-spin-paw">🐾</span>
                  {progress}
                </p>
                <div className="mt-3 h-3 bg-blue-200 dark:bg-blue-900 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse rounded-full" style={{ width: loading ? '70%' : '100%' }}></div>
                </div>
              </div>
            )}
            
            <div className="flex gap-4">
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-hope to-blue-600 text-white py-3 px-6 rounded-xl hover:from-hope-dark hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin-paw">🐾</span>
                    {progress || 'Analyzing...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    🔍 Analyze Now
                  </span>
                )}
              </button>
              <button
                onClick={() => { 
                  setFile(null); 
                  setPreview(null); 
                  setProgress(''); 
                }}
                disabled={loading}
                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 font-semibold transition-all dark:text-white"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
