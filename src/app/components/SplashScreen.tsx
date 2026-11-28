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
      className={`fixed inset-0 z-[99999] flex select-none flex-col items-center justify-between bg-[#090d16] p-6 transition-opacity duration-300 ${
        isFadingOut ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      {/* Top Header Logo */}
      <div className="flex w-full max-w-sm items-center justify-between pt-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-[#121726] shadow-lg">
            <Sparkles size={16} className="text-indigo-400" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white">ProjectFlow</span>
        </div>
        <span className="rounded-full border border-white/5 bg-white/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-gray-500">
          v1.2.0
        </span>
      </div>

      {/* Center Sliding Visual Showcase */}
      <div className="my-auto flex w-full max-w-sm flex-col items-center">
        <div className="relative flex aspect-[4/3] w-full flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#111728] p-5 shadow-2xl">
          <div
            className="absolute -right-10 -top-10 h-44 w-44 rounded-full opacity-20 blur-3xl transition-colors duration-500"
            style={{ backgroundColor: slide.accentColor }}
          />

          <div className="relative z-10 flex items-center justify-between">
            <span
              className="rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all duration-300"
              style={{
                color: slide.accentColor,
                borderColor: `${slide.accentColor}40`,
                backgroundColor: `${slide.accentColor}15`,
              }}
            >
              {slide.badge}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-gray-300">
              <IconComponent size={16} />
            </div>
          </div>

          <div className="relative z-10 space-y-2 py-3">
            {slide.previewType === 'kanban' && (
              <div className="animate-in fade-in space-y-2 duration-300">
                <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-semibold text-gray-200">Sprint Backlog Ready</span>
                  </div>
                  <span className="font-mono text-[10px] text-gray-400">3 Tasks</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-indigo-400" />
                    <span className="text-xs font-semibold text-indigo-200">Code Review Complete</span>
                  </div>
                  <span className="font-mono text-[10px] text-indigo-300">1 Task</span>
                </div>
              </div>
            )}

            {slide.previewType === 'chat' && (
              <div className="animate-in fade-in space-y-2 duration-300">
                <div className="flex items-start gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/20 text-[10px] font-bold text-emerald-300">
                    A
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-2 text-[11px] text-gray-200">
                    Branch deployed to staging successfully
                  </div>
                </div>
                <div className="flex items-start justify-end gap-2">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/20 p-2 text-[11px] text-emerald-200">
                    Reviewing telemetry now
                  </div>
                </div>
              </div>
            )}

            {slide.previewType === 'code' && (
              <div className="animate-in fade-in space-y-2 duration-300">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-2.5 font-mono text-[11px] text-purple-300">
                  <span>git pull origin main</span>
                  <span className="text-[9px] font-bold text-emerald-400">up to date</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-2.5 font-mono text-[11px] text-gray-400">
                  <span>supabase gen types</span>
                  <span className="text-[9px] font-bold text-indigo-400">generated</span>
                </div>
              </div>
            )}
          </div>

          <div className="relative z-10 border-t border-white/5 pt-2">
            <h3 className="text-sm font-bold tracking-tight text-white">{slide.title}</h3>
            <p className="mt-0.5 text-[11px] leading-snug text-gray-400">{slide.subtitle}</p>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="mt-5 flex items-center gap-2">
          {SLIDES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Slide ${item.id + 1}`}
              onClick={() => setActiveSlide(item.id)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeSlide === item.id ? 'w-6 bg-indigo-400' : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="pb-2 text-center font-mono text-[11px] text-gray-500">
        Initializing workspace...
      </div>
    </div>
  );
}