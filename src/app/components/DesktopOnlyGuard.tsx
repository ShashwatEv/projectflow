import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, ArrowLeft, CheckSquare } from 'lucide-react';
import { useAccentTheme } from '../../lib/useAccentTheme';

interface DesktopOnlyGuardProps {
  children: ReactNode;
  featureName: string;
}

export default function DesktopOnlyGuard({ children, featureName }: DesktopOnlyGuardProps) {
  const navigate = useNavigate();
  const theme = useAccentTheme();

  return (
    <>
      {/* Mobile view notice */}
      <div className="flex md:hidden h-full flex-col items-center justify-center p-6 text-center">
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-xl max-w-sm space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Monitor size={24} />
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-base text-gray-900 dark:text-white">
              {featureName} Requires Desktop
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Multi-pane code buffers, git diff comparisons, and interactive terminals are engineered for larger desktop displays.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className={`w-full py-2.5 rounded-xl ${theme.btnPrimary} text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm`}
            >
              <CheckSquare size={14} />
              <span>Go to My Tasks</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Back to Overview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full desktop rendering */}
      <div className="hidden md:block h-full w-full">
        {children}
      </div>
    </>
  );
}