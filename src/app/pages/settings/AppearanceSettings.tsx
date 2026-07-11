import { Moon, Sun, Monitor, Check, Type, Zap } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useState } from 'react';

export default function AppearanceSettings() {
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();
  
  // Local state for the new features (You can move these to Context later if you want them global)
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [reducedMotion, setReducedMotion] = useState(false);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Appearance</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Customize how ProjectFlow looks and feels across your devices.
        </p>
      </div>

      {/* 1. Theme Selection */}
      <section className="space-y-4">
        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Interface Theme
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <ThemeCard active={theme === 'light'} onClick={() => setTheme('light')} label="Light Mode" icon={<Sun size={18} />}>
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

          <ThemeCard active={theme === 'dark'} onClick={() => setTheme('dark')} label="Dark Mode" icon={<Moon size={18} />}>
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

          <ThemeCard active={theme === 'system'} onClick={() => setTheme('system')} label="System Default" icon={<Monitor size={18} />}>
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

      {/* 2. Accent Color */}
      <section className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Accent Color
        </label>
        
        <div className="flex flex-wrap gap-4">
            {(['indigo', 'emerald', 'blue', 'purple', 'rose', 'orange'] as const).map((color) => (
                <button
                    key={color}
                    onClick={() => setAccentColor(color)}
                    className={`group relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                        accentColor === color ? 'scale-110 ring-4 ring-offset-4 ring-gray-200 dark:ring-gray-700 dark:ring-offset-gray-900' : 'hover:scale-105'
                    }`}
                >
                    <div className={`w-full h-full rounded-full shadow-md ${getColorClass(color)}`}></div>
                    {accentColor === color && <Check size={20} className="absolute text-white drop-shadow-md" />}
                </button>
            ))}
        </div>
      </section>

      {/* 3. Typography & Motion */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          
          {/* Font Size */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-4">
                 <Type size={18} className="text-gray-400" />
                 <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Typography Size</h3>
             </div>
             <div className="flex p-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
                 {['sm', 'md', 'lg'].map((size) => (
                     <button
                        key={size}
                        onClick={() => setFontSize(size as 'sm' | 'md' | 'lg')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
                            fontSize === size 
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                     >
                         {size === 'sm' ? 'Compact' : size === 'md' ? 'Default' : 'Large'}
                     </button>
                 ))}
             </div>
          </div>

          {/* Accessibility */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-4">
                 <Zap size={18} className="text-gray-400" />
                 <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Accessibility</h3>
             </div>
             
             <button 
                onClick={() => setReducedMotion(!reducedMotion)}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
             >
                 <div className="text-left">
                     <p className="font-semibold text-gray-900 dark:text-white text-sm">Reduce Motion</p>
                     <p className="text-xs text-gray-500 mt-1">Minimize heavy interface animations.</p>
                 </div>
                 <div className={`w-12 h-6 rounded-full transition-colors relative ${reducedMotion ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                     <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${reducedMotion ? 'translate-x-6' : 'translate-x-0'}`}></div>
                 </div>
             </button>
          </div>
      </section>

    </div>
  );
}

// Helpers
function getColorClass(color: string) {
    switch(color) {
        case 'indigo': return 'bg-[#4f46e5]';
        case 'emerald': return 'bg-[#10b981]';
        case 'blue': return 'bg-[#3b82f6]';
        case 'purple': return 'bg-[#9333ea]';
        case 'rose': return 'bg-[#f43f5e]';
        case 'orange': return 'bg-[#f97316]';
        default: return 'bg-[#4f46e5]';
    }
}

function ThemeCard({ active, onClick, label, icon, children }: any) {
  return (
    <button onClick={onClick} className="relative group flex flex-col gap-3 text-left transition-all duration-300 outline-none">
      {/* Notice we are using 'border-primary' and 'ring-primary' here now! */}
      <div className={`relative w-full h-32 rounded-2xl overflow-hidden border-2 transition-all duration-300 shadow-sm ${active ? 'border-primary ring-4 ring-primary/10 scale-[1.02]' : 'border-gray-200 dark:border-gray-700 group-hover:border-gray-300 dark:group-hover:border-gray-600 group-hover:-translate-y-1'}`}>
        {children}
        {active && (
            <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full shadow-lg z-10 animate-in zoom-in">
                <Check size={14} strokeWidth={3} />
            </div>
        )}
      </div>
      <div className="flex items-center gap-2 px-1">
        <div className={`p-1.5 rounded-lg ${active ? 'bg-primary/10 text-primary' : 'text-gray-400'}`}>
            {icon}
        </div>
        <span className={`text-sm font-medium ${active ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}`}>
            {label}
        </span>
      </div>
    </button>
  );
}