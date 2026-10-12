import { useState, useRef, ReactNode } from 'react';
import { Loader2, ArrowDown } from 'lucide-react';
import { triggerHaptic } from '../../lib/haptics';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const threshold = 65;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      const touch = e.touches[0];
      if (touch) {
        startYRef.current = touch.clientY;
      }
    } else {
      startYRef.current = 0;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startYRef.current || refreshing) return;
    const touch = e.touches[0];
    if (!touch) return;

    const currentY = touch.clientY;
    const diff = currentY - startYRef.current;

    if (diff > 0 && containerRef.current && containerRef.current.scrollTop === 0) {
      const dampened = Math.min(diff * 0.45, 90);
      setPullY(dampened);

      if (dampened >= threshold && pullY < threshold) {
        triggerHaptic('tap');
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullY >= threshold && !refreshing) {
      setRefreshing(true);
      triggerHaptic('success');
      setPullY(threshold);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullY(0);
        startYRef.current = 0;
      }
    } else {
      setPullY(0);
      startYRef.current = 0;
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative h-full overflow-y-auto touch-scroll-smooth"
    >
      <div
        style={{
          height: `${pullY}px`,
          opacity: pullY > 10 ? 1 : 0,
        }}
        className="overflow-hidden flex items-center justify-center transition-all duration-150 pointer-events-none"
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 shadow-md text-xs font-mono text-gray-700 dark:text-gray-300">
          {refreshing ? (
            <Loader2 size={14} className="animate-spin text-indigo-500" />
          ) : (
            <ArrowDown
              size={14}
              style={{ transform: `rotate(${pullY >= threshold ? 180 : 0}deg)` }}
              className="text-indigo-500 transition-transform duration-200"
            />
          )}
          <span>{refreshing ? 'Updating workspace...' : pullY >= threshold ? 'Release to reload' : 'Pull to refresh'}</span>
        </div>
      </div>

      {children}
    </div>
  );
}