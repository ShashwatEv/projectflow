import { Check, Sun, Moon, Laptop, Sparkles } from 'lucide-react';
import { useTheme, AccentColor, TypographySize, ThemeMode } from '../../../context/ThemeContext';
import { toast } from 'sonner';

const ACCENTS: { id: AccentColor; bg: string; ring: string }[] = [
  { id: 'indigo', bg: 'bg-[#4f46e5]', ring: 'ring-[#4f46e5]' },
  { id: 'emerald', bg: 'bg-[#10b981]', ring: 'ring-[#10b981]' },
  { id: 'blue', bg: 'bg-[#2563eb]', ring: 'ring-[#2563eb]' },
  { id: 'purple', bg: 'bg-[#9333ea]', ring: 'ring-[#9333ea]' },
  { id: 'rose', bg: 'bg-[#f43f5e]', ring: 'ring-[#f43f5e]' },
  { id: 'orange', bg: 'bg-[#ea580c]', ring: 'ring-[#ea580c]' },
];

export default function AppearanceSettings() {
  const {
    themeMode,
    setThemeMode,
    accentColor,
    setAccentColor,
    typographySize,
    setTypographySize,
    reduceMotion,
    setReduceMotion,
    chatWallpaper,
    setChatWallpaper,
  } = useTheme();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Appearance</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Customize how ProjectFlow looks and feels across your devices.
        </p>
      </div>

      {/* 1. Interface Theme */}
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Interface Theme
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Light Mode */}
          <button
            type="button"
            onClick={() => {
              setThemeMode('light');
              toast.success('Switched to Light mode');
            }}
            className={`group text-left p-3.5 rounded-2xl border transition-all ${
              themeMode === 'light'
                ? 'border-indigo-600 bg-white ring-2 ring-indigo-500/20 shadow-md'
                : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-gray-300'
            }`}
          >
            <div className="h-20 bg-gray-100 rounded-xl p-2.5 flex flex-col justify-between mb-3 border border-gray-200/60">
              <div className="flex gap-1.5">
                <div className="w-4 h-4 rounded bg-indigo-500" />
                <div className="w-12 h-2 rounded bg-gray-300" />
              </div>
              <div className="space-y-1">
                <div className="w-full h-2 rounded bg-gray-200" />
                <div className="w-3/4 h-2 rounded bg-gray-200" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
              <Sun size={15} className="text-amber-500" />
              <span>Light Mode</span>
            </div>
          </button>

          {/* Dark Mode */}
          <button
            type="button"
            onClick={() => {
              setThemeMode('dark');
              toast.success('Switched to Dark mode');
            }}
            className={`group text-left p-3.5 rounded-2xl border transition-all ${
              themeMode === 'dark'
                ? 'border-indigo-500 bg-[#161b22] ring-2 ring-indigo-500/30 shadow-md'
                : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-gray-700'
            }`}
          >
            <div className="h-20 bg-[#0d1117] rounded-xl p-2.5 flex flex-col justify-between mb-3 border border-gray-800">
              <div className="flex gap-1.5">
                <div className="w-4 h-4 rounded bg-indigo-500" />
                <div className="w-12 h-2 rounded bg-gray-700" />
              </div>
              <div className="space-y-1">
                <div className="w-full h-2 rounded bg-gray-800" />
                <div className="w-3/4 h-2 rounded bg-gray-800" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
              <Moon size={15} className="text-indigo-400" />
              <span>Dark Mode</span>
            </div>
          </button>

          {/* System Default */}
          <button
            type="button"
            onClick={() => {
              setThemeMode('system');
              toast.success('Matched system preference');
            }}
            className={`group text-left p-3.5 rounded-2xl border transition-all ${
              themeMode === 'system'
                ? 'border-indigo-500 bg-gray-50 dark:bg-gray-800 ring-2 ring-indigo-500/20 shadow-md'
                : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-gray-300'
            }`}
          >
            <div className="h-20 bg-gradient-to-r from-gray-200 to-[#0d1117] rounded-xl p-2.5 flex items-center justify-center mb-3">
              <Laptop size={28} className="text-gray-400" />
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
              <Laptop size={15} className="text-gray-400" />
              <span>System Default</span>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Accent Color */}
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Accent Color
        </label>
        <div className="flex items-center gap-3">
          {ACCENTS.map((item) => {
            const isSelected = accentColor === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setAccentColor(item.id);
                  toast.success(`Accent color changed to ${item.id}`);
                }}
                className={`relative w-10 h-10 rounded-full ${item.bg} flex items-center justify-center transition-all ${
                  isSelected ? `ring-4 ${item.ring} ring-offset-2 ring-offset-white dark:ring-offset-gray-900 scale-110 shadow-md` : 'hover:scale-105 opacity-90'
                }`}
              >
                {isSelected && <Check size={16} className="text-white drop-shadow" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* 3. Typography Size */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Typography Size
          </label>
          <div className="inline-flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
            {(['compact', 'default', 'large'] as TypographySize[]).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  setTypographySize(size);
                  toast.success(`Font scale set to ${size}`);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                  typographySize === size
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Accessibility / Reduce Motion */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Accessibility
          </label>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">Reduce Motion</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Minimize heavy interface transitions and animations.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const nextState = !reduceMotion;
                setReduceMotion(nextState);
                toast.success(nextState ? 'Reduced motion enabled' : 'Reduced motion disabled');
              }}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                reduceMotion ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  reduceMotion ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Chat Wallpaper & Theming Studio */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
              Chat Wallpaper & Theme
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Choose your chat backdrop style (WhatsApp doodle, Telegram blue, Ambient Aurora, or Engineering Grids).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {[
            {
              id: 'whatsapp',
              name: 'WhatsApp Doodle',
              desc: 'Classic geometric doodle',
              bgClass: 'bg-[#efeae2] dark:bg-[#0b141a] border-[#00a884]/40',
              previewStyle: 'radial-gradient(#128c7e25 1.5px, transparent 1.5px)',
            },
            {
              id: 'telegram',
              name: 'Telegram Clouds',
              desc: 'Iconic soft gradient sky',
              bgClass: 'bg-gradient-to-b from-[#72b5e8]/30 via-[#2a75b2]/20 to-[#1d2733] border-sky-400/40',
              previewStyle: 'none',
            },
            {
              id: 'cyberpunk',
              name: 'Cyberpunk Neon',
              desc: 'High-contrast dark grid',
              bgClass: 'bg-[#05050c] border-pink-500/40',
              previewStyle: 'linear-gradient(to right, #ec489915 1px, transparent 1px), linear-gradient(to bottom, #3b82f615 1px, transparent 1px)',
            },
            {
              id: 'subtle-grid',
              name: 'Subtle Grid',
              desc: 'Technical dot grid',
              bgClass: 'bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700',
              previewStyle: 'linear-gradient(to right, #80808012 1px, transparent 1px), linear-gradient(to bottom, #80808012 1px, transparent 1px)',
            },
            {
              id: 'dots',
              name: 'Blueprint Dots',
              desc: 'Architectural blueprint',
              bgClass: 'bg-indigo-50/50 dark:bg-[#0d1117] border-indigo-400/40',
              previewStyle: 'radial-gradient(#6366f125 1.5px, transparent 1.5px)',
            },
            {
              id: 'gradient',
              name: 'Ambient Aurora',
              desc: 'Soft glowing hues',
              bgClass: 'bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/5 dark:bg-gray-900 border-purple-400/40',
              previewStyle: 'none',
            },
            {
              id: 'minimal',
              name: 'Clean Solid',
              desc: 'Pure distraction-free',
              bgClass: 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700',
              previewStyle: 'none',
            },
          ].map((item) => {
            const isSelected = chatWallpaper === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setChatWallpaper(item.id as any);
                  toast.success(`Chat theme set to ${item.name}`);
                }}
                className={`group text-left p-3 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-500/30 shadow-md bg-white dark:bg-gray-800'
                    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/80 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                {/* Mini Preview Box */}
                <div
                  className={`h-16 w-full rounded-xl border border-gray-200/60 dark:border-gray-700/60 mb-2.5 p-2 flex flex-col justify-end relative overflow-hidden ${item.bgClass}`}
                  style={{
                    backgroundImage: item.previewStyle !== 'none' ? item.previewStyle : undefined,
                    backgroundSize: item.previewStyle !== 'none' ? '12px 12px' : undefined,
                  }}
                >
                  <div className="flex gap-1.5 justify-end">
                    <div className="w-12 h-2.5 bg-indigo-500/80 rounded-md shadow-2xs" />
                  </div>
                  <div className="flex gap-1.5 justify-start mt-1">
                    <div className="w-8 h-2 bg-gray-300/80 dark:bg-gray-700 rounded-md shadow-2xs" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{item.name}</p>
                    {isSelected && <Check size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}