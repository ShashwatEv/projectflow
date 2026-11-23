import { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CheckSquare,
  Code2,
  FolderKanban,
  Globe2,
  Layers,
  Play,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Terminal,
  Users,
  Video,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import introVideoUrl from '../../../project-flow-intro.mp4';
import { useOnboardingSandbox } from '../../context/OnboardingSandboxContext';
import { type AccentColor, useTheme } from '../../context/ThemeContext';

const BASE = import.meta.env.BASE_URL || '/';
// Update if your About illustration uses a numbered filename (e.g. `${BASE}illustrations/12.svg`)
const ABOUT_ILLUSTRATION = `${BASE}illustrations/12.svg`;

const ACCENT_STYLES: Record<
  AccentColor,
  {
    text: string;
    subtle: string;
    border: string;
    button: string;
    glow: string;
    activePill: string;
  }
> = {
  indigo: {
    text: 'text-indigo-600 dark:text-indigo-400',
    subtle: 'bg-indigo-50 dark:bg-indigo-950/40',
    border: 'border-indigo-200/80 dark:border-indigo-500/30',
    button: 'bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-500',
    glow: 'bg-indigo-500/15',
    activePill: 'bg-indigo-600 text-white shadow-sm',
  },
  emerald: {
    text: 'text-emerald-600 dark:text-emerald-400',
    subtle: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200/80 dark:border-emerald-500/30',
    button: 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500',
    glow: 'bg-emerald-500/15',
    activePill: 'bg-emerald-600 text-white shadow-sm',
  },
  blue: {
    text: 'text-blue-600 dark:text-blue-400',
    subtle: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200/80 dark:border-blue-500/30',
    button: 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500',
    glow: 'bg-blue-500/15',
    activePill: 'bg-blue-600 text-white shadow-sm',
  },
  purple: {
    text: 'text-purple-600 dark:text-purple-400',
    subtle: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-200/80 dark:border-purple-500/30',
    button: 'bg-purple-600 hover:bg-purple-700 focus-visible:ring-purple-500',
    glow: 'bg-purple-500/15',
    activePill: 'bg-purple-600 text-white shadow-sm',
  },
  rose: {
    text: 'text-rose-600 dark:text-rose-400',
    subtle: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200/80 dark:border-rose-500/30',
    button: 'bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500',
    glow: 'bg-rose-500/15',
    activePill: 'bg-rose-600 text-white shadow-sm',
  },
  orange: {
    text: 'text-orange-600 dark:text-orange-400',
    subtle: 'bg-orange-50 dark:bg-orange-950/40',
    border: 'border-orange-200/80 dark:border-orange-500/30',
    button: 'bg-orange-600 hover:bg-orange-700 focus-visible:ring-orange-500',
    glow: 'bg-orange-500/15',
    activePill: 'bg-orange-600 text-white shadow-sm',
  },
};

interface RoleShowcase {
  id: string;
  label: string;
  icon: typeof Code2;
  headline: string;
  summary: string;
  illustration: string;
  ctaLabel: string;
  ctaPath: string;
  highlights: string[];
}

const ROLE_SHOWCASES: RoleShowcase[] = [
  {
    id: 'engineering',
    label: 'Engineering',
    icon: Terminal,
    headline: 'Review diffs, inspect branches, and ship from Code Studio.',
    summary:
      'Connect repositories, inspect code buffers with Monaco diff views, and run safe sandboxed checks without leaving your workspace.',
    illustration: `${BASE}illustrations/3.svg`,
    ctaLabel: 'Open Code Studio',
    ctaPath: '/code',
    highlights: [
      'GitHub branch & commit tree synchronization',
      'In-browser Monaco editor with AI code review',
      'Sandboxed terminal execution before production push',
    ],
  },
  {
    id: 'product',
    label: 'Product & Sprints',
    icon: CheckSquare,
    headline: 'Turn roadmaps into structured Kanban and sprint boards.',
    summary:
      'Break initiatives into prioritized tasks, track real-time column transitions, and keep every contributor clear on what ships next.',
    illustration: `${BASE}illustrations/8.svg`,
    ctaLabel: 'Go to My Tasks',
    ctaPath: '/tasks',
    highlights: [
      'Interactive Kanban columns with live status updates',
      'Safe Sandbox onboarding mode for new contributors',
      'Instant keyboard shortcuts for rapid task creation',
    ],
  },
  {
    id: 'leadership',
    label: 'Team Leads',
    icon: BarChart3,
    headline: 'Track velocity, workload balance, and delivery health.',
    summary:
      'See real-time completion ratios, spot bottlenecks early, and keep cross-functional pods aligned with live telemetry.',
    illustration: `${BASE}illustrations/6.svg`,
    ctaLabel: 'View Analytics',
    ctaPath: '/analytics',
    highlights: [
      'Live sprint velocity & priority distribution charts',
      'Role-based access controls across admins & members',
      'Audit trail & 2FA verification enforcement',
    ],
  },
  {
    id: 'mobile',
    label: 'Mobile Flow',
    icon: Smartphone,
    headline: 'Triage tasks, capture ideas, and join calls from anywhere.',
    summary:
      'Purpose-built mobile views let you capture tasks in seconds, swipe through daily triage, and stay connected with team presence.',
    illustration: `${BASE}illustrations/7.svg`,
    ctaLabel: 'Open Dashboard',
    ctaPath: '/dashboard',
    highlights: [
      'Quick Capture & Unified Inbox for fast follow-ups',
      'Swipeable Triage Deck & Daily Standup updates',
      'Real-time team directory & live meeting rooms',
    ],
  },
];

const FEATURES = [
  {
    icon: CheckSquare,
    title: 'Keep work moving',
    description: 'Plan tasks, set priorities, and track progress clearly across Kanban and sprint boards.',
    to: '/tasks',
    cta: 'Open Tasks',
  },
  {
    icon: FolderKanban,
    title: 'Bring projects together',
    description: 'Organize multi-team initiatives and keep tasks, repositories, and milestones connected.',
    to: '/projects',
    cta: 'Browse Projects',
  },
  {
    icon: Video,
    title: 'Meet & share in real time',
    description: 'Launch peer-to-peer WebRTC calls, screen sharing, and scoped project chat rooms.',
    to: '/meetings',
    cta: 'Join Meetings',
  },
  {
    icon: Code2,
    title: 'Build with your tools',
    description: 'Inspect branches in Code Studio, review diffs, and run sandboxed developer checks.',
    to: '/code',
    cta: 'Launch Studio',
  },
  {
    icon: BarChart3,
    title: 'See the bigger picture',
    description: 'Monitor sprint velocity, workload distribution, and completion trends at a glance.',
    to: '/analytics',
    cta: 'See Insights',
  },
  {
    icon: Users,
    title: 'Coordinate across teams',
    description: 'View active teammates, manage roles, and stay synchronized across desktop and mobile.',
    to: '/team',
    cta: 'View Team',
  },
];

const FLOW_STEPS = [
  {
    number: '01',
    title: 'Plan together',
    description: 'Turn team priorities into clear, structured boards with unambiguous ownership.',
    detail:
      'Create a project workspace, link your repository, and break milestones into prioritized tasks your whole team can see.',
    illustration: `${BASE}illustrations/2.svg`,
    badge: 'Planning & Scope',
  },
  {
    number: '02',
    title: 'Make progress',
    description: 'Collaborate in real time across tasks, live meetings, and integrated code workflows.',
    detail:
      'Hop into scoped WebRTC video rooms with screen sharing, discuss blockers in project channels, and update task status live.',
    illustration: `${BASE}illustrations/11.svg`,
    badge: 'Live Execution',
  },
  {
    number: '03',
    title: 'Learn and improve',
    description: 'Use live velocity telemetry and retrospectives to decide what ships next.',
    detail:
      'Review completion metrics, balance team workload, and carry actionable improvements into your next sprint cycle.',
    illustration: `${BASE}illustrations/10.svg`,
    badge: 'Continuous Flow',
  },
];

const ARCHITECTURE_PILLARS = [
  {
    icon: Globe2,
    title: 'Cross-Device Continuity',
    description: 'Dedicated desktop and mobile experiences backed by one unified state.',
  },
  {
    icon: ShieldCheck,
    title: 'Sandbox & 2FA Security',
    description: 'Safe onboarding isolation with verified write promotion and audit trails.',
  },
  {
    icon: Layers,
    title: 'Realtime Sync Engine',
    description: 'Instant updates across Kanban boards, team chat, presence, and live calls.',
  },
];

export default function ProjectFlowAbout() {
  const { accentColor } = useTheme();
  const accent = ACCENT_STYLES[accentColor];
  const { startTour } = useOnboardingSandbox();

  const [heroMedia, setHeroMedia] = useState<'video' | 'network'>('video');
  const [activeRoleIndex, setActiveRoleIndex] = useState<number>(0);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const activeRole = ROLE_SHOWCASES[activeRoleIndex] ?? ROLE_SHOWCASES[0]!;
  const activeStep = FLOW_STEPS[activeStepIndex] ?? FLOW_STEPS[0]!;

  return (
    <div className="min-h-full overflow-x-hidden bg-background text-foreground">
      <div className="mx-auto max-w-6xl space-y-12 px-4 py-6 sm:space-y-16 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* 1. Hero Section with Interactive Media Switcher */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="h-1 w-full bg-gradient-to-r from-[#4B74FF] via-indigo-500 to-violet-500" />
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full ${accent.glow} blur-3xl`}
          />

          <div className="relative grid min-w-0 items-center gap-8 p-5 sm:p-9 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10 lg:p-12">
            {/* Left Copy & Actions */}
            <div className="min-w-0 space-y-5 sm:space-y-6">
              <div
                className={`inline-flex items-center gap-2 rounded-full border ${accent.border} ${accent.subtle} px-3.5 py-1.5 text-xs font-semibold ${accent.text}`}
              >
                <Sparkles size={14} />
                Connected Workspace Platform
              </div>

              <div className="space-y-4">
                <h1 className="max-w-xl text-[1.9rem] font-bold leading-[1.13] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
                  Meet the workspace that keeps your team in flow.
                </h1>
                <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                  ProjectFlow unites sprint planning, real-time WebRTC meetings, and developer tooling in one synchronized workspace—built for both focused desktop work and rapid mobile triage.
                </p>
              </div>

              <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
                <Link
                  to="/dashboard"
                  className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 min-[420px]:w-auto ${accent.button}`}
                >
                  Explore your workspace
                  <ArrowRight size={16} />
                </Link>
                <button
                  type="button"
                  onClick={startTour}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-[420px]:w-auto"
                >
                  <Play size={15} className={accent.text} />
                  Take the guided tour
                </button>
              </div>

              {/* Compact Architecture Pillars */}
              <div className="grid grid-cols-1 gap-2.5 pt-2 sm:grid-cols-3">
                {ARCHITECTURE_PILLARS.map(({ icon: Icon, title }) => (
                  <div
                    key={title}
                    className="flex items-center gap-2 rounded-xl border border-border/80 bg-muted/40 px-3 py-2 text-xs font-medium text-foreground"
                  >
                    <Icon size={14} className={`shrink-0 ${accent.text}`} />
                    <span className="truncate">{title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Interactive Media Stage (Video / Connected Network SVG) */}
            <div className="min-w-0 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div
                  role="tablist"
                  aria-label="Workspace preview mode"
                  className="inline-flex rounded-xl border border-border bg-muted/60 p-1"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={heroMedia === 'video'}
                    onClick={() => setHeroMedia('video')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      heroMedia === 'video'
                        ? accent.activePill
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Product Walkthrough
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={heroMedia === 'network'}
                    onClick={() => setHeroMedia('network')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      heroMedia === 'network'
                        ? accent.activePill
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Connected Architecture
                  </button>
                </div>

                <span
                  className={`hidden rounded-full border ${accent.border} ${accent.subtle} px-2.5 py-1 text-[11px] font-semibold sm:inline-block ${accent.text}`}
                >
                  {heroMedia === 'video' ? 'HD Intro' : 'Live Sync'}
                </span>
              </div>

              {heroMedia === 'video' ? (
                <div className="overflow-hidden rounded-2xl border border-border bg-black shadow-xl">
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
                  <div className="flex items-center justify-between gap-3 border-t border-border bg-card px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">
                        ProjectFlow in a nutshell
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        See how planning, meetings, and code connect
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHeroMedia('network')}
                      className={`shrink-0 text-xs font-semibold hover:underline ${accent.text}`}
                    >
                      View network map →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-indigo-200/80 bg-[#ECEEFF] shadow-xl dark:border-slate-800">
                  <div className="relative aspect-video w-full p-4 sm:p-6">
                    <img
                      src={ABOUT_ILLUSTRATION}
                      alt="ProjectFlow global connected workspace network"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-border bg-card px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">
                        Unified Multi-Team Network
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Real-time sync across web, desktop, and mobile clients
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHeroMedia('video')}
                      className={`shrink-0 text-xs font-semibold hover:underline ${accent.text}`}
                    >
                      ← Back to video
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 2. Interactive Role & Workflow Explorer */}
        <section
          aria-labelledby="about-roles-heading"
          className="overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-8 lg:p-10"
        >
          <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 lg:flex-row lg:items-end">
            <div className="max-w-xl space-y-2">
              <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${accent.text}`}>
                Built for every workflow
              </p>
              <h2
                id="about-roles-heading"
                className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
              >
                Explore how your team uses ProjectFlow.
              </h2>
            </div>

            {/* Interactive Role Filter Pills */}
            <div
              role="tablist"
              aria-label="Workflow role selector"
              className="flex flex-wrap gap-2"
            >
              {ROLE_SHOWCASES.map((role, index) => {
                const Icon = role.icon;
                const isSelected = index === activeRoleIndex;
                return (
                  <button
                    key={role.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActiveRoleIndex(index)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                      isSelected
                        ? `border-transparent ${accent.activePill}`
                        : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{role.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Role Panel */}
          <div className="mt-6 grid items-center gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            <div className="space-y-5">
              <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {activeRole.headline}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                {activeRole.summary}
              </p>

              <ul className="space-y-2.5">
                {activeRole.highlights.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-xs font-medium text-foreground sm:text-sm"
                  >
                    <CheckCircle2 size={16} className={`shrink-0 ${accent.text}`} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-1">
                <Link
                  to={activeRole.ctaPath}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:-translate-y-0.5 ${accent.button}`}
                >
                  <span>{activeRole.ctaLabel}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-indigo-200/70 bg-[#ECEEFF] p-4 dark:border-slate-800 sm:p-6">
              <img
                key={activeRole.illustration}
                src={activeRole.illustration}
                alt={activeRole.label}
                className="mx-auto aspect-[16/10] w-full max-w-md object-contain transition-all duration-300"
              />
            </div>
          </div>
        </section>

        {/* 3. Core Capabilities Grid with Direct Module Links */}
        <section aria-labelledby="about-features-heading" className="space-y-6 sm:space-y-8">
          <div className="max-w-2xl">
            <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.16em] ${accent.text}`}>
              Everything works together
            </p>
            <h2
              id="about-features-heading"
              className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              Less juggling. More meaningful progress.
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Jump directly into any workspace module—from task boards to live calls and telemetry.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description, to, cta }) => (
              <Link
                key={title}
                to={to}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-ring/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div>
                  <div
                    className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl border ${accent.border} ${accent.subtle} ${accent.text} transition-transform duration-200 group-hover:scale-105`}
                  >
                    <Icon size={19} />
                  </div>
                  <h3 className="text-base font-semibold text-card-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>

                <div
                  className={`mt-4 inline-flex items-center gap-1.5 text-xs font-semibold ${accent.text}`}
                >
                  <span>{cta}</span>
                  <ArrowRight
                    size={13}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. Interactive Three-Step Workflow Rhythm */}
        <section
          aria-labelledby="about-flow-heading"
          className="rounded-3xl border border-border bg-muted/30 p-5 sm:p-8 lg:p-10"
        >
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-xl">
              <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.16em] ${accent.text}`}>
                A simple rhythm
              </p>
              <h2
                id="about-flow-heading"
                className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
              >
                From a plan to progress.
              </h2>
            </div>

            <button
              type="button"
              onClick={startTour}
              className={`inline-flex items-center gap-1.5 self-start text-xs font-semibold hover:underline sm:self-auto ${accent.text}`}
            >
              <Play size={13} />
              Launch interactive tour
            </button>
          </div>

          {/* Interactive Step Selector Cards */}
          <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
            {FLOW_STEPS.map((step, index) => {
              const isActive = index === activeStepIndex;
              return (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => setActiveStepIndex(index)}
                  aria-pressed={isActive}
                  className={`flex gap-4 rounded-2xl border p-5 text-left transition-all sm:block ${
                    isActive
                      ? `border-indigo-500/60 bg-card shadow-md ring-1 ring-indigo-500/20`
                      : 'border-border bg-card/70 hover:bg-card hover:shadow-xs'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                      isActive
                        ? accent.activePill
                        : `border ${accent.border} ${accent.subtle} ${accent.text}`
                    }`}
                  >
                    {step.number}
                  </span>
                  <div className="sm:mt-4">
                    <h3 className="font-semibold text-card-foreground">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Step Spotlight Drawer */}
          <div className="mt-5 grid items-center gap-6 rounded-2xl border border-border bg-card p-5 sm:p-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-2.5">
              <span
                className={`inline-flex items-center rounded-full border ${accent.border} ${accent.subtle} px-3 py-0.5 text-[11px] font-semibold ${accent.text}`}
              >
                Step {activeStep.number} • {activeStep.badge}
              </span>
              <h3 className="text-lg font-bold text-foreground sm:text-xl">
                {activeStep.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {activeStep.detail}
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-indigo-200/70 bg-[#ECEEFF] p-3 dark:border-slate-800">
              <img
                key={activeStep.illustration}
                src={activeStep.illustration}
                alt={activeStep.title}
                className="mx-auto aspect-[16/9] w-full max-w-xs object-contain"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}