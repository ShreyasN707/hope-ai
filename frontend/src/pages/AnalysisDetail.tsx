import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { historyAPI } from '../lib/api';
import { useAnalysisStore } from '../store/analysisStore';
import { getSeverityColor, formatDate } from '../lib/utils';
import { AlertCircle } from 'lucide-react';

export default function AnalysisDetail() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { currentAnalysis, recentAnalyses } = useAnalysisStore();

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        // First try to get from store
        if (currentAnalysis?.analysisId === id) {
          setAnalysis(currentAnalysis);
          setLoading(false);
          return;
        }
        
        // Check recent analyses
        const cachedAnalysis = recentAnalyses.find(a => a.analysisId === id);
        if (cachedAnalysis) {
          setAnalysis(cachedAnalysis);
          setLoading(false);
          return;
        }
        
        // Fallback to API
        const data = await historyAPI.getAnalysisById(id!);
        setAnalysis(data.analysis);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [id, currentAnalysis, recentAnalyses]);

  if (loading) return <div>Loading...</div>;
  if (!analysis) return <div>Analysis not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="animate-fade-in-up">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
          Analysis Details 📋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Comprehensive analysis results for your pet</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden mb-6 animate-scale-pop hover-lift transition-all">
        {analysis.imageUrl ? (
          <img 
            src={analysis.imageUrl} 
            alt="Pet" 
            className="w-full h-64 object-contain bg-gray-50 dark:bg-gray-700"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const parent = (e.target as HTMLImageElement).parentElement;
              if (parent) {
                parent.innerHTML = '<div class="w-full h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800"><div class="text-center"><div class="text-6xl mb-2">🐾</div><p class="text-gray-500 dark:text-gray-400">Image not available</p></div></div>';
              }
            }}
          />
        ) : (
          <div className="w-full h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="text-center">
              <div className="text-6xl mb-2">🐾</div>
              <p className="text-gray-500 dark:text-gray-400">Image not available</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Vision Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-scale-pop delay-100 hover-lift transition-all">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            👁️ Vision Analysis
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Species</p>
              <p className="font-bold capitalize text-lg text-gray-900 dark:text-white">{analysis.visionAnalysis?.species || 'Unknown'}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all" 
                    style={{width: `${((analysis.visionAnalysis?.speciesConfidence || 0) * 100)}%`}}
                  ></div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {((analysis.visionAnalysis?.speciesConfidence || 0) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Emotional State</p>
              <p className="font-bold capitalize text-lg text-gray-900 dark:text-white flex items-center gap-2">
                {analysis.visionAnalysis?.emotionalState === 'happy' && '😊'}
                {analysis.visionAnalysis?.emotionalState === 'scared' && '😰'}
                {analysis.visionAnalysis?.emotionalState === 'stressed' && '😟'}
                {analysis.visionAnalysis?.emotionalState === 'aggressive' && '😠'}
                {analysis.visionAnalysis?.emotionalState === 'neutral' && '😐'}
                {analysis.visionAnalysis?.emotionalState || 'Neutral'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all" 
                    style={{width: `${((analysis.visionAnalysis?.emotionConfidence || 0) * 100)}%`}}
                  ></div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {((analysis.visionAnalysis?.emotionConfidence || 0) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Health Issues */}
          {analysis.visionAnalysis?.healthIssues && analysis.visionAnalysis.healthIssues.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-semibold mb-3 text-red-600">⚠️ Health Issues Detected</h3>
              <div className="space-y-3">
                {analysis.visionAnalysis.healthIssues.map((issue: any, i: number) => (
                  <div key={i} className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-red-900">{issue.issue}</p>
                      <span className="text-xs px-2 py-1 bg-red-200 text-red-800 rounded">
                        {(issue.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-red-700">{issue.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Medical Assessment */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-scale-pop delay-200 hover-lift transition-all">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold">🏥 Medical Assessment</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(analysis.medicalAssessment?.severity || 'NORMAL')}`}>
              {analysis.medicalAssessment?.severity || 'NORMAL'}
            </span>
            {analysis.medicalAssessment?.estimatedUrgencyHours && (
              <span className="ml-2 text-sm text-orange-600 font-medium">
                ⏱️ {analysis.medicalAssessment.estimatedUrgencyHours}h urgency
              </span>
            )}
          </div>
          
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2 text-blue-900">Condition Summary</h3>
            <p className="text-gray-700">{analysis.medicalAssessment?.conditionSummary || 'No assessment available'}</p>
          </div>
          
          {analysis.medicalAssessment?.immediateActions && analysis.medicalAssessment.immediateActions.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2 text-red-700">🚨 Immediate Actions Required</h3>
              <ul className="list-disc list-inside space-y-1 pl-2">
                {analysis.medicalAssessment.immediateActions.map((action: string, i: number) => (
                  <li key={i} className="text-gray-700">{action}</li>
                ))}
              </ul>
            </div>
          )}
          
          {analysis.medicalAssessment?.careInstructions && analysis.medicalAssessment.careInstructions.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2 text-green-700">📋 Care Instructions</h3>
              <ol className="list-decimal list-inside space-y-1 pl-2">
                {analysis.medicalAssessment.careInstructions.map((instruction: string, i: number) => (
                  <li key={i} className="text-gray-700">{instruction}</li>
                ))}
              </ol>
            </div>
          )}
          
          {analysis.medicalAssessment?.warningGns && analysis.medicalAssessment.warningGns.length > 0 && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold mb-2 text-yellow-800">⚠️ Warning Signs to Monitor</h3>
              <ul className="list-disc list-inside space-y-1 pl-2">
                {analysis.medicalAssessment.warningGns.map((sign: string, i: number) => (
                  <li key={i} className="text-yellow-900 text-sm">{sign}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Nutrition Plan */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-scale-pop delay-300 hover-lift transition-all">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">🍖 Nutrition Plan</h2>
          <div className="space-y-4">
            {analysis.nutritionPlan?.recommendedFoods && analysis.nutritionPlan.recommendedFoods.length > 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <h3 className="font-bold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                  ✅ Safe Foods
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {analysis.nutritionPlan.recommendedFoods.slice(0, 6).map((food: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-green-500">•</span>
                      <span className="text-sm">{food}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {analysis.nutritionPlan?.dangerousFoods && analysis.nutritionPlan.dangerousFoods.length > 0 && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-300 dark:border-red-700">
                <h3 className="font-bold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  ⚠️ Toxic Foods (NEVER GIVE)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {analysis.nutritionPlan.dangerousFoods.slice(0, 6).map((food: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-red-800 dark:text-red-300 font-medium">
                      <span className="text-red-500">⚠️</span>
                      <span className="text-sm">{food}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid md:grid-cols-2 gap-4">
              {analysis.nutritionPlan?.hydrationPlan && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-bold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                    💧 Hydration
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{analysis.nutritionPlan.hydrationPlan}</p>
                </div>
              )}
              
              {analysis.nutritionPlan?.feedingSchedule && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h3 className="font-bold text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-2">
                    ⏰ Schedule
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{analysis.nutritionPlan.feedingSchedule}</p>
                </div>
              )}
            </div>
            
            
            {analysis.nutritionPlan?.specialConsiderations && analysis.nutritionPlan.specialConsiderations.length > 0 && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <h3 className="font-bold text-yellow-700 dark:text-yellow-400 mb-2 flex items-center gap-2">
                  💡 Key Tips
                </h3>
                <div className="space-y-1">
                  {analysis.nutritionPlan.specialConsiderations.slice(0, 3).map((consideration: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-yellow-500 mt-0.5">•</span>
                      <span className="text-sm">{consideration}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-gray-400 text-sm text-center">{formatDate(analysis.createdAt)}</p>
      </div>
    </div>
  );
}
