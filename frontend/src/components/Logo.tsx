import { Heart, PawPrint } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function Logo({ size = 'normal', showText = true }: { size?: 'small' | 'normal' | 'large'; showText?: boolean }) {
  const { isDark } = useTheme();
  
  const sizeClasses = {
    small: { icon: 'w-6 h-6', text: 'text-lg' },
    normal: { icon: 'w-8 h-8', text: 'text-2xl' },
    large: { icon: 'w-20 h-20', text: 'text-5xl md:text-6xl' }
  };
  
  const currentSize = sizeClasses[size];
  
  return (
    <div className="flex items-center space-x-2">
      {/* Custom Logo: Heart with Paw Print */}
      <div className="relative">
        <Heart 
          className={`${currentSize.icon} ${
            isDark 
              ? 'text-gradient-to-r from-pink-400 to-red-400 fill-pink-400/20' 
              : 'text-gradient-to-r from-pink-500 to-red-500 fill-pink-500/20'
          } transition-all duration-300`}
        />
        <PawPrint 
          className={`absolute inset-0 ${currentSize.icon} ${
            isDark ? 'text-white/80' : 'text-white/90'
          } scale-75 translate-x-1/2 translate-y-1/2`}
        />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`${currentSize.text} font-bold ${
            isDark 
              ? 'bg-gradient-to-r from-pink-400 via-red-400 to-purple-400 bg-clip-text text-transparent' 
              : 'bg-gradient-to-r from-pink-500 via-red-500 to-purple-500 bg-clip-text text-transparent'
          } transition-all duration-300`}>
            Hope
          </span>
          {size === 'large' && (
            <span className="text-sm md:text-base text-gray-500 dark:text-gray-400 -mt-1">
              AI Pet Care & Rescue
            </span>
          )}
        </div>
      )}
    </div>
  );
}
