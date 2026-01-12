import { useState } from 'react';
import { Moon, Sun, Monitor, Check } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [accentColor, setAccentColor] = useState('indigo'); // Mock state for UI demo

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Appearance</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Customize how ProjectFlow looks on your device.
        </p>
      </div>

      {/* 1. Theme Selection */}
      <section className="space-y-4">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Interface Theme
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* Light Mode Card */}
          <ThemeCard 
            active={theme === 'light'} 
            onClick={() => setTheme('light')}
            label="Light Mode"
            icon={<Sun size={18} />}
          >
            {/* Light Mode Preview (Mini UI) */}
            <div className="absolute inset-0 bg-gray-100 flex p-3 gap-2">
               <div className="w-1/4 h-full bg-white rounded-lg border border-gray-200 shadow-sm"></div>
               <div className="flex-1 flex flex-col gap-2">
                  <div className="h-8 w-full bg-white rounded-lg border border-gray-200 shadow-sm"></div>
                  <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm p-2 space-y-2">
                     <div className="h-2 w-1/2 bg-gray-100 rounded"></div>
                     <div className="h-2 w-3/4 bg-gray-100 rounded"></div>
                  </div>
               </div>
            </div>
          </ThemeCard>

          {/* Dark Mode Card */}
          <ThemeCard 
            active={theme === 'dark'} 
            onClick={() => setTheme('dark')}
            label="Dark Mode"
            icon={<Moon size={18} />}
          >
            {/* Dark Mode Preview (Mini UI) */}
            <div className="absolute inset-0 bg-[#0B1120] flex p-3 gap-2">
               <div className="w-1/4 h-full bg-[#1e293b] rounded-lg border border-gray-700 shadow-sm"></div>
               <div className="flex-1 flex flex-col gap-2">
                  <div className="h-8 w-full bg-[#1e293b] rounded-lg border border-gray-700 shadow-sm"></div>
                  <div className="flex-1 bg-[#1e293b] rounded-lg border border-gray-700 shadow-sm p-2 space-y-2">
                     <div className="h-2 w-1/2 bg-gray-700 rounded"></div>
                     <div className="h-2 w-3/4 bg-gray-700 rounded"></div>
                  </div>
               </div>
            </div>
          </ThemeCard>

          {/* System Mode Card */}
          <ThemeCard 
            active={theme === 'system'} 
            onClick={() => setTheme('system')}
            label="System Default"
            icon={<Monitor size={18} />}
          >
            {/* Split Preview (Diagonal) */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-[#0B1120] flex items-center justify-center">
                <div className="relative w-full h-full p-3 gap-2 flex opacity-60">
                   <div className="w-1/4 h-full bg-white/20 backdrop-blur-sm rounded-lg border border-white/30"></div>
                   <div className="flex-1 flex flex-col gap-2">
                      <div className="h-8 w-full bg-white/20 backdrop-blur-sm rounded-lg border border-white/30"></div>
                      <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30"></div>
                   </div>
                </div>
            </div>
          </ThemeCard>
        </div>
      </section>

      {/* 2. Accent Color (Visual Demo) */}
      <section className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Accent Color
            </label>
            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">Coming Soon</span>
        </div>
        
        <div className="flex flex-wrap gap-4">
            {['indigo', 'emerald', 'blue', 'purple', 'rose', 'orange'].map((color) => (
                <button
                    key={color}
                    onClick={() => setAccentColor(color)}
                    className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        accentColor === color ? 'scale-110 ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 dark:ring-offset-gray-900' : 'hover:scale-105'
                    }`}
                >
                    <div className={`w-full h-full rounded-full shadow-sm ${getColorClass(color)}`}></div>
                    {accentColor === color && (
                        <Check size={16} className="absolute text-white drop-shadow-md" />
                    )}
                </button>
            ))}
        </div>
      </section>

    </div>
  );
}

// Helper for color classes
function getColorClass(color: string) {
    switch(color) {
        case 'indigo': return 'bg-indigo-600';
        case 'emerald': return 'bg-emerald-500';
        case 'blue': return 'bg-blue-500';
        case 'purple': return 'bg-purple-600';
        case 'rose': return 'bg-rose-500';
        case 'orange': return 'bg-orange-500';
        default: return 'bg-indigo-600';
    }
}

// Reusable Theme Card Component
function ThemeCard({ active, onClick, label, icon, children }: any) {
  return (
    <button 
      onClick={onClick}
      className={`relative group flex flex-col gap-3 text-left transition-all duration-300 outline-none`}
    >
      {/* Preview Box */}
      <div 
        className={`
            relative w-full h-32 rounded-2xl overflow-hidden border-2 transition-all duration-300 shadow-sm
            ${active 
                ? 'border-indigo-600 ring-4 ring-indigo-500/10 scale-[1.02]' 
                : 'border-gray-200 dark:border-gray-700 group-hover:border-indigo-300 dark:group-hover:border-indigo-700 group-hover:-translate-y-1'
            }
        `}
      >
        {children}
        
        {/* Active Badge */}
        {active && (
            <div className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full shadow-lg z-10 animate-in zoom-in">
                <Check size={12} strokeWidth={4} />
            </div>
        )}
      </div>

      {/* Label & Icon */}
      <div className="flex items-center gap-2 px-1">
        <div className={`p-1.5 rounded-lg ${active ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
            {icon}
        </div>
        <span className={`text-sm font-medium ${active ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>
            {label}
        </span>
      </div>
    </button>
  );
}