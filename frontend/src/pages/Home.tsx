import { Link } from 'react-router-dom';
import { Scan, MessageCircle, AlertCircle, TrendingUp, Sparkles, Shield, Zap, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 transition-all duration-500">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          {/* Animated Logo */}
          <div className="flex justify-center mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            <Logo size="large" />
          </div>
          
          {/* Enhanced Title with Gradient */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 dark:from-pink-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent mb-4 animate-fade-in-up">
              Hope
            </h1>
            <div className="flex items-center justify-center space-x-2 text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-4">
              <Sparkles className="w-5 h-5 text-pink-500 dark:text-pink-400" />
              <span className="font-medium">AI-Powered Pet Care & Rescue Platform</span>
              <Sparkles className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            </div>
            <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 italic font-light">
              "Giving a voice to those who cannot speak"
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/analyze"
              className="group relative px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-500 dark:to-purple-500 text-white rounded-xl hover:from-pink-700 hover:to-purple-700 dark:hover:from-pink-600 dark:hover:to-purple-600 transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center justify-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Try Analyze Now</span>
                <ArrowRight className="w-5 h-5" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-500 dark:to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            </Link>
            <Link
              to="/register"
              className="px-8 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-pink-600 dark:text-pink-400 border-2 border-pink-200 dark:border-pink-800 rounded-xl hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all duration-300 font-medium text-lg shadow-md hover:shadow-lg transform hover:scale-105 hover:-translate-y-1"
            >
              Sign Up Free
            </Link>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            ✨ No login required to analyze images! Sign up to save history & access all features.
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
            Powered by Advanced AI
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Cutting-edge technology for comprehensive pet care
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Vision Agent */}
          <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Scan className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Vision Analysis</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Detect species, emotional state, and visible health issues using advanced computer vision with 95% accuracy.
            </p>
            <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
              <Shield className="w-4 h-4 mr-1" />
              AI-Powered Detection
            </div>
          </div>

          {/* Medical Reasoning */}
          <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
            <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Medical Assessment</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Get severity ratings and step-by-step care instructions from AI veterinary expertise with confidence scoring.
            </p>
            <div className="mt-4 flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
              <Shield className="w-4 h-4 mr-1" />
              Expert Guidance
            </div>
          </div>

          {/* Pet Whisperer */}
          <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Pet Whisperer</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Chat with our AI to understand pet behavior, psychology, and emotional needs with contextual awareness.
            </p>
            <div className="mt-4 flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-1" />
              Intelligent Chat
            </div>
          </div>

          {/* SOS Rescue */}
          <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
            <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <AlertCircle className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">SOS Rescue</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Automated emergency alerts to nearby vets and rescue centers when critical conditions are detected.
            </p>
            <div className="mt-4 flex items-center text-red-600 dark:text-red-400 text-sm font-medium">
              <Zap className="w-4 h-4 mr-1" />
              Emergency Response
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to help animals in need?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join Hope today and become a voice for those who cannot speak.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-3 bg-hope text-white rounded-lg hover:bg-hope-dark transition-colors font-medium text-lg"
          >
            Start Free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 Hope - AI Pet Assistant. Giving a voice to those who cannot speak.
          </p>
        </div>
      </footer>
    </div>
  );
}
