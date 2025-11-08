import { Link } from 'react-router-dom';
import { Upload, MessageCircle, Clock, Heart } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Dashboard() {
  const { user } = useAuthStore();

  return (
    <div>
      {/* Animated Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-hope to-purple-600 bg-clip-text text-transparent">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          🐾 Giving a voice to those who cannot speak
        </p>
      </div>

      {/* Feature Cards with Staggered Animation */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link
          to="/analyze"
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all group hover-lift animate-scale-pop overflow-hidden relative"
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <Upload className="w-7 h-7 text-white animate-wiggle group-hover:animate-bounce-cute" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Analyze Pet 📸</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Upload an image to get instant AI-powered health and emotion analysis
            </p>
          </div>
        </Link>

        <Link
          to="/chat"
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all group hover-lift animate-scale-pop delay-100 overflow-hidden relative"
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <MessageCircle className="w-7 h-7 text-white animate-wiggle group-hover:animate-bounce-cute" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Pet Whisperer 🔮</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Chat with our AI to understand pet behavior and emotional needs
            </p>
          </div>
        </Link>

        <Link
          to="/history"
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all group hover-lift animate-scale-pop delay-200 overflow-hidden relative"
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent dark:from-green-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <Clock className="w-7 h-7 text-white animate-wiggle group-hover:animate-bounce-cute" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">History 📊</h3>
            <p className="text-gray-600 dark:text-gray-400">
              View your past analyses and track animal health over time
            </p>
          </div>
        </Link>
      </div>

      {/* Animated SOS Banner */}
      <div className="mt-12 bg-gradient-to-r from-hope via-blue-500 to-purple-600 rounded-2xl p-8 text-white animate-gradient-shift shadow-2xl animate-fade-in-up delay-300 relative overflow-hidden">
        {/* Animated circles background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-float delay-200"></div>
        
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
              Emergency SOS 🚨
            </h2>
            <p className="text-blue-50 text-lg">
              Critical cases automatically trigger rescue alerts to nearby vets and animal welfare organizations
            </p>
          </div>
          <Heart className="w-20 h-20 opacity-50 animate-heartbeat" />
        </div>
      </div>

      {/* Cute paw prints decoration */}
      <div className="mt-8 text-center text-4xl opacity-20 dark:opacity-10 animate-fade-in-up delay-400">
        🐾 🐾 🐾
      </div>
    </div>
  );
}
