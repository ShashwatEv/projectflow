import { useEffect, useState } from 'react';

interface LoadingSlide {
  id: number;
  image: string;
  badge: string;
  step: string;
  title: string;
  description: string;
}

const BASE = import.meta.env.BASE_URL || '/';

const SLIDES: LoadingSlide[] = [
  {
    id: 1,
    image: `${BASE}illustrations/1.svg`,
    badge: 'Live Collaboration',
    step: '01 / 04',
    title: 'Real-Time Meetings & Insights',
    description:
      'Sync with your team over WebRTC calls, screen sharing, and live sprint metrics.',
  },
  {
    id: 2,
    image: `${BASE}illustrations/2.svg`,
    badge: 'Sprint Planning',
    step: '02 / 04',
    title: 'Organized Tasks & Workflows',
    description:
      'Break down complex projects into actionable tasks across multi-team boards.',
  },
  {
    id: 3,
    image: `${BASE}illustrations/3.svg`,
    badge: 'Code Studio',
    step: '03 / 04',
    title: 'Build & Ship Together',
    description:
      'Inspect branches, review snippets, and streamline engineering workflows in one hub.',
  },
  {
    id: 4,
    image: `${BASE}illustrations/4.svg`,
    badge: 'Cloud Sync',
    step: '04 / 04',
    title: 'Fast, Encrypted & Always Ready',
    description:
      'Your workspace stays synchronized and protected across every device.',
  },
];

interface SlidingLoaderProps {
  /** Interval between slides in milliseconds (default: 2200ms) */
  intervalMs?: number;
  /** Optional callback when auto-dismiss completes */
  onComplete?: () => void;
  /** Auto-call onComplete after this duration (ms) when provided */
  autoDismissMs?: number;
}

export function SlidingLoader({
  intervalMs = 2200,
  onComplete,
  autoDismissMs,
}: SlidingLoaderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [cycleTick, setCycleTick] = useState(0);

  useEffect(() => {
    if (SLIDES.length <= 1) return;

    const timer = window.setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
      setCycleTick((t) => t + 1);
    }, intervalMs);

    return () => window.clearTimeout(timer);
  }, [activeIndex, cycleTick, intervalMs]);

  useEffect(() => {
    if (!onComplete || !autoDismissMs) return;
    const doneTimer = window.setTimeout(() => {
      onComplete();
    }, autoDismissMs);
    return () => window.clearTimeout(doneTimer);
  }, [autoDismissMs, onComplete]);

  const safeIndex =
    SLIDES.length > 0 ? Math.min(Math.max(activeIndex, 0), SLIDES.length - 1) : 0;
  const currentSlide = SLIDES[safeIndex] ?? SLIDES[0]!;

  const handleSelectSlide = (index: number) => {
    setActiveIndex(index);
    setCycleTick((t) => t + 1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-slate-50/95 px-4 py-8 backdrop-blur-md dark:bg-slate-950/95"
      role="status"
      aria-live="polite"
    >
      {/* Subtle Ambient Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#4B74FF]/15 blur-3xl dark:bg-[#4B74FF]/20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-600/15"
      />

      {/* Main Editorial Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-800/90 dark:bg-slate-900 dark:shadow-black/40 sm:max-w-xl lg:max-w-2xl">
        {/* Top Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-[#4B74FF] via-indigo-500 to-violet-500" />

        {/* Illustration Stage */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#ECEEFF] sm:aspect-[16/9]">
          {SLIDES.map((slide, index) => {
            const isActive = index === safeIndex;
            return (
              <img
                key={slide.id}
                src={slide.image}
                alt={slide.title}
                className={`absolute inset-0 h-full w-full object-contain p-3 transition-all duration-700 ease-out sm:p-5 ${
                  isActive
                    ? 'translate-x-0 scale-100 opacity-100'
                    : index < safeIndex
                      ? '-translate-x-8 scale-95 opacity-0 pointer-events-none'
                      : 'translate-x-8 scale-95 opacity-0 pointer-events-none'
                }`}
              />
            );
          })}

          {/* Top Badge & Slide Counter */}
          <div className="pointer-events-none absolute inset-x-4 top-4 flex items-center justify-between">
            <span className="rounded-full border border-indigo-200/70 bg-white/95 px-3 py-1 text-xs font-semibold tracking-wide text-[#4B74FF] shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95 dark:text-indigo-300">
              {currentSlide.badge}
            </span>
            <span className="rounded-full bg-slate-900/75 px-2.5 py-1 font-mono text-[11px] font-medium text-white backdrop-blur-sm dark:bg-slate-800/90">
              {currentSlide.step}
            </span>
          </div>
        </div>

        {/* Copy & Slide Indicators */}
        <div className="px-6 pb-7 pt-6 text-center sm:px-10 sm:pb-8 sm:pt-7">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 transition-opacity duration-300 dark:text-white sm:text-2xl">
            {currentSlide.title}
          </h2>
          <p className="mx-auto mt-2.5 max-w-lg text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-[15px]">
            {currentSlide.description}
          </p>

          {/* Pagination Dots */}
          <div className="mt-6 flex items-center justify-center gap-2.5">
            {SLIDES.map((slide, index) => {
              const isActive = index === safeIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => handleSelectSlide(index)}
                  aria-label={`Show slide ${index + 1}: ${slide.title}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'w-8 bg-[#4B74FF] dark:bg-indigo-400'
                      : 'w-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SlidingLoader;