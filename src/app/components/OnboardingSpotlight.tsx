import { useEffect, useState, useRef, useCallback } from 'react';
import { ArrowRight, ArrowLeft, X, Sparkles, Compass, GripHorizontal } from 'lucide-react';
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

  // Drag State
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialOffsetX: number; initialOffsetY: number }>({
    startX: 0,
    startY: 0,
    initialOffsetX: 0,
    initialOffsetY: 0,
  });

  // Reset drag position on step changes
  useEffect(() => {
    setDragOffset({ x: 0, y: 0 });
  }, [stepIndex]);

  const calculatePosition = useCallback(() => {
    const el = document.querySelector(targetSelector);
    if (el) {
      const domRect = el.getBoundingClientRect();
      if (domRect.width > 0 && domRect.height > 0) {
        setRect({
          top: domRect.top + window.scrollY,
          left: domRect.left + window.scrollX,
          width: domRect.width,
          height: domRect.height,
        });
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return true;
      }
    }
    return false;
  }, [targetSelector]);

  useEffect(() => {
    calculatePosition();

    let retries = 0;
    const interval = setInterval(() => {
      retries++;
      if (calculatePosition() || retries >= 15) {
        clearInterval(interval);
      }
    }, 100);

    const observer = new MutationObserver(() => {
      calculatePosition();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition);

    return () => {
      clearInterval(interval);
      observer.disconnect();
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition);
    };
  }, [targetSelector, calculatePosition]);

  // Drag Event Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag from header/grip
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialOffsetX: dragOffset.x,
      initialOffsetY: dragOffset.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.startX;
      const dy = e.clientY - dragStartRef.current.startY;
      setDragOffset({
        x: dragStartRef.current.initialOffsetX + dx,
        y: dragStartRef.current.initialOffsetY + dy,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const padding = 10;
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  // Base calculated coordinates
  const baseTop = rect
    ? Math.min(viewportHeight - 290, Math.max(20, rect.top + rect.height + 16))
    : viewportHeight / 2 - 140;

  const baseLeft = rect
    ? Math.min(viewportWidth - 420, Math.max(20, rect.left))
    : viewportWidth / 2 - 190;

  const computedTop = Math.max(10, Math.min(viewportHeight - 240, baseTop + dragOffset.y));
  const computedLeft = Math.max(10, Math.min(viewportWidth - 410, baseLeft + dragOffset.x));

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto transition-opacity duration-300">
      {/* SVG Spotlight Cutout Mask */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
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
          fill="rgba(5, 8, 15, 0.72)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Target Pulsing Boundary Outline */}
      {rect && (
        <div
          style={{
            top: rect.top - padding,
            left: rect.left - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
          }}
          className="absolute border-2 border-indigo-500 rounded-2xl pointer-events-none shadow-lg shadow-indigo-500/20 animate-pulse transition-all duration-200"
        />
      )}

      {/* Draggable Theme-Adaptive Floating Guide Box */}
      <div
        ref={tooltipRef}
        style={{
          top: computedTop,
          left: computedLeft,
        }}
        className="absolute w-[400px] max-w-[calc(100vw-2.5rem)] bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-2xl text-xs text-gray-800 dark:text-gray-200 z-50 animate-in fade-in zoom-in-95 duration-200 select-none"
      >
        {/* Header - Drag Handle */}
        <div 
          onMouseDown={handleMouseDown}
          className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 cursor-grab active:cursor-grabbing"
          title="Drag to move guide"
        >
          <div className="flex items-center gap-2.5 pointer-events-none">
            <div className={`p-1.5 rounded-xl ${theme.bgSubtle} ${theme.textAccent} border ${theme.borderAccent}/30`}>
              <Sparkles size={16} />
            </div>
            <div>
              <span className="font-bold text-[10px] uppercase text-gray-400 dark:text-gray-400 tracking-wider">
                Step {stepIndex + 1} of {totalSteps}
              </span>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{title}</h4>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <GripHorizontal size={15} className="text-gray-400 dark:text-gray-500" />
            <button
              onClick={onSkip}
              onMouseDown={(e) => e.stopPropagation()}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="py-3.5 space-y-3">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-xs">
            {description}
          </p>

          {/* Action Hint with Full Multiline Text Wrap */}
          <div className="bg-gray-50 dark:bg-[#0d1117] p-3 rounded-2xl border border-gray-200 dark:border-gray-800/80 text-[11px] text-gray-600 dark:text-gray-400 flex items-start gap-2.5 font-mono">
            <Compass size={15} className={`${theme.textAccent} shrink-0 mt-0.5`} />
            <span className="leading-relaxed break-words whitespace-normal text-gray-700 dark:text-gray-300">
              {actionHint}
            </span>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onSkip}
            className="text-[11px] font-semibold text-gray-400 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:underline transition-colors"
          >
            Skip Guide
          </button>

          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={onBack}
                className="px-3.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold flex items-center gap-1 transition-all"
              >
                <ArrowLeft size={13} />
                <span>Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={onNext}
              className={`px-4.5 py-1.5 rounded-xl ${theme.btnPrimary} text-white font-bold flex items-center gap-1 shadow-md transition-all active:scale-95`}
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