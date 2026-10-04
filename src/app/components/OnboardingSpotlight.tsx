import { useEffect, useState, useRef } from 'react';
import { ArrowRight, ArrowLeft, X, Sparkles, Shield, Compass } from 'lucide-react';
import { useAccentTheme } from '../../lib/useAccentTheme';

interface SpotlightProps {
  targetSelector: string;
  title: string;
  description: string;
  actionHint: string;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function OnboardingSpotlight({
  targetSelector,
  title,
  description,
  actionHint,
  stepIndex,
  totalSteps,
  onNext,
  onBack,
  onSkip,
}: SpotlightProps) {
  const theme = useAccentTheme();
  const [rect, setRect] = useState<TargetRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function updatePosition() {
      const el = document.querySelector(targetSelector);
      if (el) {
        const domRect = el.getBoundingClientRect();
        setRect({
          top: domRect.top + window.scrollY,
          left: domRect.left + window.scrollX,
          width: domRect.width,
          height: domRect.height,
        });
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Fallback to center if element is not in active view
        setRect(null);
      }
    }

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [targetSelector]);

  const padding = 8;
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto transition-opacity duration-300">
      {/* SVG Spotlight Cutout Mask */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="spotlight-mask">
            {/* White area covers full screen */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black rectangle cuts out transparent hole over target */}
            {rect && (
              <rect
                x={rect.left - padding}
                y={rect.top - padding}
                width={rect.width + padding * 2}
                height={rect.height + padding * 2}
                rx="16"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(5, 8, 15, 0.75)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Target Bounding Pulsing Outline */}
      {rect && (
        <div
          style={{
            top: rect.top - padding,
            left: rect.left - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
          }}
          className="absolute border-2 border-indigo-400 rounded-2xl pointer-events-none shadow-lg shadow-indigo-500/20 animate-pulse"
        />
      )}

      {/* Anchored Tooltip Box */}
      <div
        ref={tooltipRef}
        style={{
          top: rect
            ? Math.min(viewportHeight - 280, Math.max(20, rect.top + rect.height + 16))
            : '50%',
          left: rect
            ? Math.min(viewportWidth - 400, Math.max(20, rect.left))
            : '50%',
          transform: rect ? 'none' : 'translate(-50%, -50%)',
        }}
        className="absolute w-96 max-w-[calc(100vw-2.5rem)] bg-[#161b22] border border-gray-700/80 rounded-3xl p-5 shadow-2xl text-xs text-gray-200 z-50 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-xl ${theme.bgSubtle} ${theme.textAccent} border ${theme.borderAccent}/30`}>
              <Sparkles size={16} />
            </div>
            <div>
              <span className="font-bold text-[10px] uppercase text-gray-400 tracking-wider">
                Interactive Tour ({stepIndex + 1}/{totalSteps})
              </span>
              <h4 className="font-bold text-sm text-white line-clamp-1">{title}</h4>
            </div>
          </div>
          <button
            onClick={onSkip}
            className="p-1 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="py-3.5 space-y-2.5">
          <p className="text-gray-300 leading-relaxed text-xs">{description}</p>
          <div className="bg-[#0d1117] p-2.5 rounded-xl border border-gray-800 text-[11px] text-gray-400 flex items-center gap-2 font-mono">
            <Compass size={14} className={theme.textAccent} />
            <span className="text-gray-300">{actionHint}</span>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-800">
          <button
            type="button"
            onClick={onSkip}
            className="text-[11px] font-semibold text-gray-400 hover:text-white hover:underline"
          >
            Skip Guide
          </button>

          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={onBack}
                className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold flex items-center gap-1 transition-all"
              >
                <ArrowLeft size={13} />
                <span>Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={onNext}
              className={`px-4 py-1.5 rounded-xl ${theme.btnPrimary} text-white font-bold flex items-center gap-1 shadow-md transition-all active:scale-95`}
            >
              <span>{stepIndex === totalSteps - 1 ? 'Finish' : 'Next'}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}