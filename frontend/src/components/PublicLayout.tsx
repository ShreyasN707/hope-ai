import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, LogIn, UserPlus } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthStore } from '../store/authStore';
import Logo from './Logo';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const { isDark, toggleTheme } = useTheme();
  const { token } = useAuthStore();
  const navigate = useNavigate();

  // If user is logged in, redirect to dashboard
  if (token) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 transition-all duration-300 shadow-sm dark:shadow-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200">
              <Logo size="normal" />
            </Link>

            <div className="flex items-center space-x-2">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 hover:scale-110 dark:border dark:border-gray-700/50"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
              </button>

              <Link
                to="/login"
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>

              <Link
                to="/register"
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-500 dark:to-purple-500 text-white rounded-xl hover:from-pink-700 hover:to-purple-700 dark:hover:from-pink-600 dark:hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Up</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              💡 <strong>Sign up</strong> to save your analysis history, use AI chat, and access advanced features!
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Hope - AI Pet Care & Rescue Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
