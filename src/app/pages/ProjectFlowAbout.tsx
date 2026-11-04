import {
  ArrowRight,
  BarChart3,
  CheckSquare,
  Code2,
  FolderKanban,
  Play,
  Sparkles,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import introVideoUrl from '../../../project-flow-intro.mp4';
import { useOnboardingSandbox } from '../../context/OnboardingSandboxContext';
import { type AccentColor, useTheme } from '../../context/ThemeContext';

const ACCENT_STYLES: Record<AccentColor, { text: string; subtle: string; button: string; glow: string }> = {
  indigo: {
    text: 'text-indigo-500 dark:text-indigo-400',
    subtle: 'bg-indigo-50 dark:bg-indigo-950/30',
    button: 'bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-500',
    glow: 'bg-indigo-500/10',
  },
  emerald: {
    text: 'text-emerald-500 dark:text-emerald-400',
    subtle: 'bg-emerald-50 dark:bg-emerald-950/30',
    button: 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500',
    glow: 'bg-emerald-500/10',
  },
  blue: {
    text: 'text-blue-500 dark:text-blue-400',
    subtle: 'bg-blue-50 dark:bg-blue-950/30',
    button: 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500',
    glow: 'bg-blue-500/10',
  },
  purple: {
    text: 'text-purple-500 dark:text-purple-400',
    subtle: 'bg-purple-50 dark:bg-purple-950/30',
    button: 'bg-purple-600 hover:bg-purple-700 focus-visible:ring-purple-500',
    glow: 'bg-purple-500/10',
  },
  rose: {
    text: 'text-rose-500 dark:text-rose-400',
    subtle: 'bg-rose-50 dark:bg-rose-950/30',
    button: 'bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500',
    glow: 'bg-rose-500/10',
  },
  orange: {
    text: 'text-orange-500 dark:text-orange-400',
    subtle: 'bg-orange-50 dark:bg-orange-950/30',
    button: 'bg-orange-600 hover:bg-orange-700 focus-visible:ring-orange-500',
    glow: 'bg-orange-500/10',
  },
};

const FEATURES = [
  {
    icon: CheckSquare,
    title: 'Keep work moving',
    description: 'Plan tasks, set priorities, and see progress clearly across your workflow.',
  },
  {
    icon: FolderKanban,
    title: 'Bring projects together',
    description: 'Organize initiatives and keep the work, context, and milestones connected.',
  },
  {
    icon: Users,
    title: 'Work better as a team',
    description: 'Share updates and coordinate with teammates from one collaborative workspace.',
  },
  {
    icon: Code2,
    title: 'Build with your tools',
    description: 'Explore Code Studio, GitHub workflows, and developer-focused project tools.',
  },
  {
    icon: BarChart3,
    title: 'See the bigger picture',
    description: 'Use analytics and team velocity views to understand progress and workload.',
  },
];

const FLOW_STEPS = [
  { number: '01', title: 'Plan together', description: 'Turn priorities into clear, actionable work.' },
  { number: '02', title: 'Make progress', description: 'Keep ownership and updates visible to the team.' },
  { number: '03', title: 'Learn and improve', description: 'Use project insights to decide what comes next.' },
];

export default function ProjectFlowAbout() {
  const { accentColor } = useTheme();
  const accent = ACCENT_STYLES[accentColor];
  const { startTour } = useOnboardingSandbox();

  return (
    <div className="min-h-full overflow-x-hidden bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div aria-hidden="true" className={`pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full ${accent.glow} blur-3xl motion-safe:animate-pulse`} />
          <div className="relative grid min-w-0 items-center gap-7 p-5 sm:gap-8 sm:p-9 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 lg:p-12">
            <div className="min-w-0 space-y-5 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-700 sm:space-y-6">
              <div className={`inline-flex items-center gap-2 rounded-full border border-border ${accent.subtle} px-3 py-1.5 text-xs font-semibold ${accent.text}`}>
                <Sparkles size={14} />
                A clearer way to move work forward
              </div>
              <div className="space-y-4">
                <h1 className="max-w-xl text-[2rem] font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  Meet the workspace that keeps your team in flow.
                </h1>
                <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-lg">
                  ProjectFlow brings projects, tasks, team collaboration, and developer tools into one shared space—so your team can spend less time switching context and more time making progress.
                </p>
              </div>
              <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
                <Link
                  to="/dashboard"
                  className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 min-[420px]:w-auto ${accent.button}`}
                >
                  Explore your workspace
                  <ArrowRight size={16} />
                </Link>
                <button
                  type="button"
                  onClick={startTour}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-[420px]:w-auto"
                >
                  <Play size={15} className={accent.text} />
                  Take the guided tour
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                A connected home for planning, collaboration, and delivery.
              </p>
            </div>

            <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-black shadow-xl motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-700 motion-safe:delay-150">
              <video
                className="block aspect-video w-full bg-black"
                controls
                playsInline
                preload="metadata"
                aria-label="ProjectFlow introduction video"
              >
                <source src={introVideoUrl} type="video/mp4" />
                Your browser does not support video playback.
              </video>
              <div className="flex items-center justify-between gap-3 bg-card px-3 py-3 sm:px-4">
                <div>
                  <p className="text-sm font-semibold text-card-foreground">ProjectFlow in a nutshell</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">A quick introduction to your workspace</p>
                </div>
                <span className={`shrink-0 rounded-full ${accent.subtle} px-2.5 py-1 text-[11px] font-medium ${accent.text}`}>
                  Watch intro
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14" aria-labelledby="about-features-heading">
          <div className="mb-6 max-w-2xl sm:mb-8">
            <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.16em] ${accent.text}`}>
              Everything works together
            </p>
            <h2 id="about-features-heading" className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Less juggling. More meaningful progress.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              The essentials your team needs to stay aligned—from the first task to the final delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }, index) => (
              <article
                key={title}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-ring/40 hover:shadow-md motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${accent.subtle} ${accent.text}`}>
                  <Icon size={19} />
                </div>
                <h3 className="font-semibold text-card-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-3xl border border-border bg-muted/30 p-5 sm:mb-12 sm:p-8 lg:p-10" aria-labelledby="about-flow-heading">
          <div className="mb-6 max-w-xl">
            <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.16em] ${accent.text}`}>A simple rhythm</p>
            <h2 id="about-flow-heading" className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              From a plan to progress.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
            {FLOW_STEPS.map((step, index) => (
              <article
                key={step.number}
                className="flex gap-4 rounded-2xl border border-border bg-card p-4 sm:block sm:p-5 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${accent.subtle} ${accent.text}`}>
                  {step.number}
                </span>
                <div className="sm:mt-4">
                  <h3 className="font-semibold text-card-foreground">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
