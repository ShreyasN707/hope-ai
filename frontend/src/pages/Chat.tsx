import { useState, useEffect } from 'react';
import { Send, Dog, RefreshCw } from 'lucide-react';
import { chatAPI } from '../lib/api';
import { useAnalysisStore } from '../store/analysisStore';
import toast from 'react-hot-toast';

interface Message {
  role: string;
  content: string;
  timestamp?: string | Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [availableAnalyses, setAvailableAnalyses] = useState<any[]>([]);
  const { recentAnalyses } = useAnalysisStore();
  
  // Load available analyses on mount
  useEffect(() => {
    loadAnalyses();
  }, []);
  
  // Load chat history when analysis is selected
  useEffect(() => {
    if (selectedAnalysisId) {
      loadChatHistory(selectedAnalysisId);
    } else {
      setMessages([]);
    }
  }, [selectedAnalysisId]);
  
  const loadAnalyses = async () => {
    try {
      // Get from store first
      if (recentAnalyses && recentAnalyses.length > 0) {
        setAvailableAnalyses(recentAnalyses);
        // Auto-select the most recent one
        if (!selectedAnalysisId) {
          setSelectedAnalysisId(recentAnalyses[0].analysisId);
        }
      }
    } catch (error) {
      console.error('Error loading analyses:', error);
    }
  };
  
  const loadChatHistory = async (analysisId: string) => {
    try {
      const response = await chatAPI.getChatHistory(analysisId);
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Error loading chat history:', error);
      setMessages([]);
    }
  };

  const formatTimestamp = (timestamp: string | Date | undefined) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    
    // Format time as HH:MM AM/PM
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const timeStr = `${displayHours}:${displayMinutes} ${ampm}`;
    
    // Format date as DD/MM/YYYY
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    const month = (date.getMonth() + 1) < 10 ? `0${date.getMonth() + 1}` : (date.getMonth() + 1);
    const year = date.getFullYear();
    const dateStr = `${day}/${month}/${year}`;
    
    return `${timeStr} • ${dateStr}`;
  };
  
  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages([...messages, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage({
        message: currentInput,
        analysisId: selectedAnalysisId,
      });
      setMessages(prev => [...prev, { role: 'assistant', content: response.response, timestamp: new Date().toISOString() }]);
    } catch (error: any) {
      toast.error('Failed to get response');
      // Remove the user message if failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };
  
  const handleAnalysisChange = (analysisId: string | null) => {
    setSelectedAnalysisId(analysisId);
  };
  
  const selectedAnalysis = availableAnalyses.find(a => a.analysisId === selectedAnalysisId);
  const hasContext = selectedAnalysisId !== null;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Dog className="w-8 h-8 text-hope" />
            Pet Whisperer {hasContext && '🔮'}
          </h1>
          <p className="text-gray-600 mt-1">
            {hasContext ? 'Chat about your analyzed pet' : 'General pet behavior consultant'}
          </p>
        </div>
        
        {/* Analysis Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Chat about:</label>
          <select
            value={selectedAnalysisId || ''}
            onChange={(e) => handleAnalysisChange(e.target.value || null)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-hope"
          >
            <option value="">General Questions</option>
            {availableAnalyses.map((analysis) => (
              <option key={analysis.analysisId} value={analysis.analysisId}>
                {analysis.visionAnalysis?.species || 'Unknown'} - {formatTimestamp(analysis.timestamp || analysis.createdAt)}
              </option>
            ))}
          </select>
          <button
            onClick={loadAnalyses}
            className="p-2 text-gray-600 hover:text-hope"
            title="Refresh analyses"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Context Display */}
      {hasContext && selectedAnalysis && (
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl border-2 border-blue-300 dark:border-blue-600 shadow-lg animate-scale-pop">
          <div className="flex items-start gap-4">
            {selectedAnalysis.imageUrl ? (
              <img 
                src={selectedAnalysis.imageUrl} 
                alt="Pet" 
                className="w-20 h-20 rounded-xl object-cover shadow-md ring-2 ring-white dark:ring-gray-700 animate-scale-pop"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="%236b7280" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"%3E%3C/circle%3E%3Cpolyline points="21 15 16 10 5 21"%3E%3C/polyline%3E%3C/svg%3E';
                }}
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-md ring-2 ring-white dark:ring-gray-700">
                <span className="text-3xl">🐾</span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">
                💬 Chatting about your {selectedAnalysis.visionAnalysis?.species || 'pet'}
              </h3>
              <p className="text-sm text-blue-700">
                <strong>Emotional State:</strong> {selectedAnalysis.visionAnalysis?.emotionalState || 'Unknown'}
                {selectedAnalysis.medicalAssessment?.severity && (
                  <span className="ml-3">
                    <strong>Health:</strong> {selectedAnalysis.medicalAssessment.severity}
                  </span>
                )}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                🔮 I have full context about this pet's analysis. Ask me specific questions!
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 h-[600px] flex flex-col animate-fade-in-up delay-100">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-20 animate-fade-in-up">
              {hasContext ? (
                <div>
                  <Dog className="w-16 h-16 mx-auto mb-4 text-hope opacity-50" />
                  <p className="text-lg font-medium">Start chatting about your {selectedAnalysis?.visionAnalysis?.species}!</p>
                  <p className="text-sm mt-2">I have all the analysis details. Ask me:</p>
                  <div className="mt-4 space-y-2 text-left max-w-md mx-auto">
                    <p className="text-sm">• "Why is my {selectedAnalysis?.visionAnalysis?.species} feeling {selectedAnalysis?.visionAnalysis?.emotionalState}?"</p>
                    <p className="text-sm">• "What can I do to help with the health issues?"</p>
                    <p className="text-sm">• "How should I approach caring for this pet?"</p>
                  </div>
                </div>
              ) : (
                <div>
                  <Dog className="w-16 h-16 mx-auto mb-4 text-hope opacity-50" />
                  <p className="text-lg font-medium">Ask me anything about pet behavior and emotions!</p>
                  <p className="text-sm mt-2 text-gray-400">Select an analyzed pet above for personalized advice</p>
                </div>
              )}
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in-${msg.role === 'user' ? 'right' : 'left'}`}>
              <div className={`max-w-[75%] p-4 rounded-2xl shadow-md ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-hope to-purple-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.timestamp && (
                  <div className={`text-xs mt-2 opacity-70 ${
                    msg.role === 'user' ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    🕐 {formatTimestamp(msg.timestamp)}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-2xl shadow-md">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <div className="animate-bounce">🐾</div>
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-hope focus:border-transparent transition-all"
            placeholder={hasContext ? "Ask about this specific pet..." : "Ask about pet behavior..."}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-hope to-purple-600 text-white rounded-xl hover:from-hope-dark hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
