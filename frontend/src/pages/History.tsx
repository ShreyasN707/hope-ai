import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { historyAPI } from '../lib/api';
import { formatDate, getSeverityColor } from '../lib/utils';

export default function History() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await historyAPI.getHistory();
        setAnalyses(data.analyses);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="animate-fade-in-up">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-400">
          Analysis History 📋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">View and manage your pet analysis history</p>
      </div>
      <div className="space-y-4">
        {analyses.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12 animate-fade-in-up">
            <div className="text-6xl mb-4 opacity-50">📋</div>
            <p className="text-lg mb-4">No analyses yet. Start by analyzing your first pet!</p>
            <Link to="/analyze" className="inline-flex items-center gap-2 bg-gradient-to-r from-hope to-blue-600 text-white px-6 py-3 rounded-xl hover:from-hope-dark hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
              📸 Analyze Now
            </Link>
          </div>
        ) : (
          analyses.map((analysis, index) => (
            <Link
              key={analysis._id}
              to={`/history/${analysis._id}`}
              className="block bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all hover-lift animate-scale-pop"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <img
                  src={analysis.imageUrl}
                  alt="Pet"
                  className="w-24 h-24 object-cover rounded-xl shadow-md ring-2 ring-white dark:ring-gray-700"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold capitalize text-lg text-gray-900 dark:text-white flex items-center gap-1">
                      {analysis.visionAnalysis.species === 'cat' && '🐱'}
                      {analysis.visionAnalysis.species === 'dog' && '🐶'}
                      {analysis.visionAnalysis.species}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${getSeverityColor(analysis.medicalAssessment.severity)}`}>
                      {analysis.medicalAssessment.severity}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                    {analysis.medicalAssessment.conditionSummary}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400 dark:text-gray-500 text-xs flex items-center gap-1">
                      📅 {formatDate(analysis.createdAt)}
                    </p>
                    <span className="text-hope text-sm font-medium">
                      View Details →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
