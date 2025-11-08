import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Upload, MessageCircle, Clock, LogOut, Heart, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/analyze', icon: Upload, label: 'Analyze' },
    { path: '/chat', icon: MessageCircle, label: 'Pet Whisperer' },
    { path: '/history', icon: Clock, label: 'History' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-hope fill-hope" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">Hope</span>
            </Link>

            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-hope bg-hope/10 dark:bg-hope/20'
                      : 'text-gray-600 dark:text-gray-300 hover:text-hope hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-hope transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-700/50 z-50 transition-all duration-300 shadow-lg dark:shadow-black/20">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center px-3 py-2 text-xs font-medium transition-all duration-200 ${
                location.pathname === item.path
                  ? 'text-pink-600 dark:text-pink-400 bg-gradient-to-t from-pink-50 to-transparent dark:from-pink-900/20'
                  : 'text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400'
              }`}
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
}
