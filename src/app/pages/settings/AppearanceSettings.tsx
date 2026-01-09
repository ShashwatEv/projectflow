import { Moon, Sun, Monitor, CloudRain, Trees } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Interface Theme</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Select how you want the dashboard to look.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <ThemeOption 
            active={theme === 'light'} 
            onClick={() => setTheme('light')}
            icon={<Sun size={24} />}
            label="Light Mode"
            previewColor="bg-gray-100"
          />
          <ThemeOption 
            active={theme === 'dark'} 
            onClick={() => setTheme('dark')}
            icon={<Moon size={24} />}
            label="Dark Mode"
            previewColor="bg-gray-900"
          />
          <ThemeOption 
            active={theme === 'system'} 
            onClick={() => setTheme('system')}
            icon={<Monitor size={24} />}
            label="System Default"
            previewColor="bg-gradient-to-r from-gray-200 to-gray-900"
          />
        </div>
      </div>
    </div>
  );
}

function ThemeOption({ active, onClick, icon, label, previewColor }: any) {
  return (
    <button 
      onClick={onClick}
      className={`relative p-4 rounded-xl border-2 text-left transition-all ${
        active 
          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-600' 
          : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
      }`}
    >
      <div className={`h-24 w-full rounded-lg mb-4 ${previewColor} border border-gray-200 dark:border-gray-600 shadow-inner flex items-center justify-center overflow-hidden`}>
        {/* Abstract Preview UI */}
        <div className="space-y-2 w-3/4 opacity-40">
           <div className="h-2 w-1/2 bg-current rounded-full opacity-50"></div>
           <div className="h-2 w-full bg-current rounded-full opacity-30"></div>
           <div className="h-2 w-3/4 bg-current rounded-full opacity-30"></div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${active ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
           {icon}
        </div>
        <span className={`font-medium ${active ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-900 dark:text-gray-200'}`}>
          {label}
        </span>
      </div>
      
      {active && (
        <div className="absolute top-3 right-3 h-3 w-3 bg-indigo-600 rounded-full animate-bounce"></div>
      )}
    </button>
  );
}