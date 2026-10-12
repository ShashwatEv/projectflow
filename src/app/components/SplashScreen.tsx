import { useState, useEffect } from 'react';
import { Kanban, MessageSquare, Code2, Sparkles, LucideIcon } from 'lucide-react';

interface SplashScreenProps {
  onFinish?: () => void;
  minDurationMs?: number;
}

interface Slide {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accentColor: string;
  previewType: 'kanban' | 'chat' | 'code';
}

const SLIDES: Slide[] = [
  {
    id: 0,
    badge: 'Sprint Planning',
    title: 'Agile Delivery at Speed',
    subtitle: 'Manage triage, sprint velocity, and task pipelines effortlessly.',
    icon: Kanban,
    accentColor: '#6366f1',
    previewType: 'kanban',
  },
  {
    id: 1,
    badge: 'Team Channels',
    title: 'Realtime Collaboration',
    subtitle: 'Direct messaging, instant alerts, and contextual workspace rooms.',
    icon: MessageSquare,
    accentColor: '#10b981',
    previewType: 'chat',
  },
  {
    id: 2,
    badge: 'Developer Hub',
    title: 'Engineering Workbench',
    subtitle: 'Connect repositories, inspect branches, and manage pull requests.',
    icon: Code2,
    accentColor: '#8b5cf6',
    previewType: 'code',
  },
];

export default function SplashScreen({
  onFinish,
  minDurationMs = 3600,
}: SplashScreenProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 1100);

    const finishTimeout = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        if (onFinish) onFinish();
      }, 400);
    }, minDurationMs);

    return () => {
      clearInterval(slideInterval);
      clearTimeout(finishTimeout);
    };
  }, [minDurationMs, onFinish]);

  const slide = SLIDES[activeSlide] ?? SLIDES[0];
  if (!slide) return null;

  const IconComponent = slide.icon;

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#090d16] flex flex-col items-center justify-between p-6 select-none transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Header Logo */}
      <div className="w-full flex items-center justify-between pt-4 max-w-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#121726] border border-white/10 flex items-center justify-center shadow-lg">
            <Sparkles size={16} className="text-indigo-400" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white">ProjectFlow</span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
          v1.0.0 Mobile
        </span>
      </div>

      {/* Center Sliding Visual Showcase */}
      <div className="w-full max-w-sm flex flex-col items-center my-auto">
        <div className="relative w-full aspect-[4/3] rounded-3xl bg-[#111728] border border-white/10 p-5 shadow-2xl flex flex-col justify-between overflow-hidden">
          {/* Subtle Ambient Background Gradient */}
          <div
            className="absolute -right-10 -top-10 w-44 h-44 rounded-full blur-3xl opacity-20 transition-colors duration-500"
            style={{ backgroundColor: slide.accentColor }}
          />

          {/* Slide Top Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border transition-all duration-300"
              style={{
                color: slide.accentColor,
                borderColor: `${slide.accentColor}40`,
                backgroundColor: `${slide.accentColor}15`,
              }}
            >
              {slide.badge}
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-gray-300">
              <IconComponent size={16} />
            </div>
          </div>

          {/* Dynamic Mockup Card Previews */}
          <div className="relative z-10 space-y-2 py-3">
            {slide.previewType === 'kanban' && (
              <div className="space-y-2 animate-in fade-in duration-300">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs text-gray-200 font-semibold">Sprint Backlog Ready</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">3 Tasks</span>
                </div>
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span className="text-xs text-indigo-200 font-semibold">Code Review Complete</span>
                  </div>
                  <span className="text-[10px] text-indigo-300 font-mono">1 Task</span>
                </div>
              </div>
            )}

            {slide.previewType === 'chat' && (
              <div className="space-y-2 animate-in fade-in duration-300">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] flex items-center justify-center text-emerald-300 font-bold shrink-0">
                    A
                  </div>
                  <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-[11px] text-gray-200">
                    Branch deployed to staging successfully
                  </div>
                </div>
                <div className="flex items-start gap-2 justify-end">
                  <div className="bg-emerald-500/20 border border-emerald-500/30 p-2 rounded-xl text-[11px] text-emerald-200">
                    Reviewing telemetry now
                  </div>
                </div>
              </div>
            )}

            {slide.previewType === 'code' && (
              <div className="space-y-2 animate-in fade-in duration-300">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 font-mono text-[11px] text-purple-300 flex items-center justify-between">
                  <span>git pull origin main</span>
                  <span className="text-[9px] text-emerald-400 font-bold">up to date</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 font-mono text-[11px] text-gray-400 flex items-center justify-between">
                  <span>supabase gen types</span>
                  <span className="text-[9px] text-indigo-400 font-bold">generated</span>
                </div>
              </div>
            )}
          </div>

          {/* Slide Information */}
          <div className="relative z-10 pt-2 border-t border-white/5">
            <h3 className="text-sm font-bold text-white tracking-tight">{slide.title}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{slide.subtitle}</p>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex items-center gap-1.5 mt-5">
          {SLIDES.map((s) => (
            <div
              key={s.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeSlide === s.id ? 'w-6 bg-indigo-500' : 'w-1.5 bg-white/15'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Loading Progress Bar */}
      <div className="w-full max-w-sm pb-6 flex flex-col items-center gap-2.5">
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all ease-linear"
            style={{
              width: '100%',
              animation: `splashProgress ${minDurationMs}ms linear forwards`,
            }}
          />
        </div>
        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
          Starting Workspace Environment
        </span>
      </div>

      <style>{`
        @keyframes splashProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}