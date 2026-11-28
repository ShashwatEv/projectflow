import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Check,
  Sparkles,
  ShieldAlert,
  Layers,
  Code2,
  CheckCircle2,
  CirclePlay,
  RotateCcw,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useOnboardingSandbox } from '../../context/OnboardingSandboxContext';
import { useAccentTheme } from '../../lib/useAccentTheme';
import OnboardingSpotlight from './OnboardingSpotlight';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

const BASE = import.meta.env.BASE_URL || '/';
const GUIDE_VIDEO_URL = `${BASE}guide-video.mp4`;

interface TourStep {
  title: string;
  badge: string;
  illustration: string;
  path: string;
  selector: string;
  description: string;
  actionHint: string;
  shortcuts?: { keys: string[]; label: string }[];
}

const MOBILE_TOUR_STEPS: TourStep[] = [
  {
    title: 'Mobile Command Hub',
    badge: 'Mobile Overview',
    illustration: `${BASE}illustrations/7.svg`,
    path: '/dashboard',
    selector: 'main',
    description:
      'Check active initiatives, recent updates, and priority tasks on the go from your mobile command hub.',
    actionHint: 'Review key metrics and jump straight into mobile workflows.',
  },
  {
    title: 'Mobile Projects Overview',
    badge: 'Active Projects',
    illustration: `${BASE}illustrations/2.svg`,
    path: '/mobile/projects',
    selector: 'main',
    description:
      'Browse your active projects, track milestones, and open project boards cleanly on smaller screens.',
    actionHint: 'Tap any project card to inspect tasks and progress.',
  },
  {
    title: 'Quick Capture & Unified Inbox',
    badge: 'Instant Capture',
    illustration: `${BASE}illustrations/1.svg`,
    path: '/capture',
    selector: 'main',
    description:
      'Capture tasks, notes, and follow-ups in seconds while moving, and keep incoming updates organized in your inbox.',
    actionHint: 'Use Quick Capture to log an idea before it slips.',
  },
  {
    title: 'Triage Deck & Standup Stories',
    badge: 'Rapid Triage',
    illustration: `${BASE}illustrations/8.svg`,
    path: '/triage',
    selector: 'main',
    description:
      'Triage task items quickly and catch up on daily standup updates without digging through long tables.',
    actionHint: 'Swipe or tap through items to prioritize what needs attention today.',
  },
  {
    title: 'People & Workspace Presence',
    badge: 'Team Directory',
    illustration: `${BASE}illustrations/10.svg`,
    path: '/mobile/people',
    selector: 'main',
    description:
      'See who is active across the workspace, check roles, and connect directly with teammates.',
    actionHint: 'Open the people directory to view teammates and status.',
  },
  {
    title: 'Project Meetings on Mobile',
    badge: 'Live Calls',
    illustration: `${BASE}illustrations/11.svg`,
    path: '/meetings',
    selector: '[aria-label="Start or join a meeting"], main',
    description:
      'Join ongoing project meetings, participate in live call chat, or enter a 16-character meeting invite code.',
    actionHint: 'Select a room or paste a meeting invite code to join.',
  },
  {
    title: 'Security & Account Settings',
    badge: 'Identity & 2FA',
    illustration: `${BASE}illustrations/5.svg`,
    path: '/settings',
    selector: 'main',
    description:
      'Manage your account verification, two-factor authentication, and notification preferences.',
    actionHint: 'Verify your account and 2FA to unlock full database write access.',
  },
];

const DESKTOP_TOUR_STEPS: TourStep[] = [
  {
    title: 'Workspace Overview',
    badge: 'Overview',
    illustration: `${BASE}illustrations/7.svg`,
    path: '/dashboard',
    selector: 'main',
    description:
      'Track sprint progress, active teammates, and upcoming deadlines from one workspace overview.',
    actionHint: 'Check your daily task summary and recent project activity.',
  },
  {
    title: 'Sprint Kanban Board',
    badge: 'Tasks',
    illustration: `${BASE}illustrations/8.svg`,
    path: '/tasks',
    selector: '[data-tour="kanban-board"], main',
    description:
      'Organize tasks across To Do, In Progress, Review, and Done. New accounts start in Safe Sandbox Mode until email verification and 2FA are enabled.',
    actionHint:
      'Drag cards across columns or use J/K/H/L and Space to triage tasks.',
  },
  {
    title: 'Projects & Repositories',
    badge: 'Projects',
    illustration: `${BASE}illustrations/2.svg`,
    path: '/projects',
    selector: 'main',
    description:
      'Group tasks by project and connect GitHub repositories to sync branches and pull requests.',
    actionHint: 'Create a project or open an existing board to inspect its checklist.',
  },
  {
    title: 'Project Meetings & Screen Sharing',
    badge: 'Meetings',
    illustration: `${BASE}illustrations/11.svg`,
    path: '/meetings',
    selector: '[aria-label="Start or join a meeting"], main',
    description:
      'Start peer-to-peer video calls, share your screen, and chat live inside project rooms—or join via a 16-character invite code.',
    actionHint:
      'Pick a project room to start a call or enter an invite code to join.',
  },
  {
    title: 'In-Browser Code Studio',
    badge: 'Code Studio',
    illustration: `${BASE}illustrations/3.svg`,
    path: '/code',
    selector: 'main',
    description:
      'Browse repository files, review side-by-side diffs, run sandboxed checks, and prepare pull requests without leaving your workspace.',
    actionHint: 'Open a file from the explorer or launch Code Studio directly from any task card.',
  },
  {
    title: 'Sprint Analytics & Velocity',
    badge: 'Analytics',
    illustration: `${BASE}illustrations/6.svg`,
    path: '/analytics',
    selector: 'main',
    description:
      'Monitor task completion rates, priority breakdowns, and sprint velocity across your active projects.',
    actionHint: 'Filter metrics by project or timeframe to spot bottlenecks early.',
  },
  {
    title: 'Team Directory & Channels',
    badge: 'Team',
    illustration: `${BASE}illustrations/10.svg`,
    path: '/team',
    selector: 'main',
    description:
      'See who is online, check team roles, and collaborate in dedicated project channels.',
    actionHint: 'Message teammates or filter the directory by team.',
  },
  {
    title: 'Verification & Two-Factor Security',
    badge: 'Security',
    illustration: `${BASE}illustrations/5.svg`,
    path: '/settings',
    selector: 'main',
    description:
      'Verify your email and enable two-factor authentication to unlock live database writes and repository pushes.',
    actionHint: 'Open Verification or Security in Settings to complete your setup.',
  },
  {
    title: 'Command Palette & Shortcuts',
    badge: 'Shortcuts',
    illustration: `${BASE}illustrations/4.svg`,
    path: '/dashboard',
    selector:
      'button[aria-label="Search projects, people, and pages"], button[aria-label="Open search"]',
    description:
      'Jump straight to projects, people, and pages from the command palette or with keyboard shortcuts.',
    actionHint:
      'Press Ctrl+K anywhere to search. Shortcuts work whenever you are not typing in an input field.',
    shortcuts: [
      { keys: ['Ctrl', 'K'], label: 'Open search' },
      { keys: ['Alt', 'N'], label: 'New task' },
      { keys: ['Alt', 'P'], label: 'Projects' },
      { keys: ['Alt', 'I'], label: 'Inbox' },
      { keys: ['Alt', 'U'], label: 'People' },
      { keys: ['Alt', 'Shift', 'D'], label: 'Dashboard' },
      { keys: ['Alt', 'Shift', 'N'], label: 'Quick capture' },
    ],
  },
];

export default function OnboardingTour() {
  const { user } = useAuth();
  const theme = useAccentTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isTourOpen,
    isGuideOpen,
    guideSession,
    startTour,
    beginTour,
    closeGuide,
    closeTour,
    isSandboxActive,
    promoteUserToLive,
    canMutateDatabase,
  } = useOnboardingSandbox();

  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [hasWatchedGuide, setHasWatchedGuide] = useState<boolean>(false);
  const [guideVideoError, setGuideVideoError] = useState<boolean>(false);
  const [guideVideoAttempt, setGuideVideoAttempt] = useState<number>(0);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [agreedTerms, setAgreedTerms] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const syncViewport = () => setIsMobileViewport(window.innerWidth < 1024);
    syncViewport();
    window.addEventListener('resize', syncViewport);
    return () => window.removeEventListener('resize', syncViewport);
  }, []);

  const tourSteps = useMemo(
    () => (isMobileViewport ? MOBILE_TOUR_STEPS : DESKTOP_TOUR_STEPS),
    [isMobileViewport]
  );

  useEffect(() => {
    setCurrentStepIndex((prev) =>
      tourSteps.length > 0 ? Math.min(prev, tourSteps.length - 1) : 0
    );
  }, [tourSteps]);

  useEffect(() => {
    setHasWatchedGuide(false);
    setGuideVideoError(false);
    setGuideVideoAttempt(0);
  }, [guideSession]);

  useEffect(() => {
    if (isTourOpen) setCurrentStepIndex(0);
  }, [isTourOpen]);

  // Auto-prompt tour on first visit if not yet completed
  useEffect(() => {
    let active = true;

    async function checkTourStatus() {
      if (!user?.id) return;

      const completionKey = `pf_tour_${user.id}`;
      if (localStorage.getItem(completionKey) === 'true') return;

      try {
        const [profileResult, progressResult] = await Promise.all([
          supabase
            .from('users')
            .select('onboarding_completed')
            .eq('id', user.id)
            .maybeSingle(),
          supabase
            .from('user_setup_progress')
            .select('completed_steps')
            .eq('user_id', user.id)
            .maybeSingle(),
        ]);
        if (!active) return;

        if (profileResult.error && progressResult.error) {
          console.error('Could not check whether onboarding was completed.', {
            profileError: profileResult.error,
            progressError: progressResult.error,
          });
          startTour();
          return;
        }

        const completed =
          profileResult.data?.onboarding_completed === true ||
          progressResult.data?.completed_steps?.includes('tour') === true;

        if (completed) {
          localStorage.setItem(completionKey, 'true');
        } else {
          startTour();
        }
      } catch (error) {
        if (active) {
          console.error('Could not check whether onboarding was completed.', error);
          startTour();
        }
      }
    }

    checkTourStatus();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const goToStep = (index: number) => {
    if (index >= 0 && index < tourSteps.length) {
      setCurrentStepIndex(index);
      const targetPath = tourSteps[index]?.path;
      if (targetPath && location.pathname !== targetPath) {
        navigate(targetPath);
      }
    } else if (index >= tourSteps.length) {
      closeTour();
      setShowTermsModal(true);
    }
  };

  const handleNext = () => {
    goToStep(currentStepIndex + 1);
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      goToStep(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    closeTour();
    setShowTermsModal(true);
  };

  const handleCompleteTerms = async () => {
    if (!agreedTerms) {
      toast.error('Please accept the workspace safety and collaboration agreement');
      return;
    }

    setSubmitting(true);
    try {
      if (user?.id) {
        const completionKey = `pf_tour_${user.id}`;
        localStorage.setItem(completionKey, 'true');
        window.dispatchEvent(new CustomEvent('onboarding-tour-completed'));
        let isPersisted = false;

        const profileResult = await supabase
          .from('users')
          .update({ onboarding_completed: true })
          .eq('id', user.id)
          .select('id')
          .maybeSingle();
        if (profileResult.error) {
          console.error('Could not save onboarding completion to the user profile.', profileResult.error);
        } else {
          isPersisted = Boolean(profileResult.data?.id);
        }

        const progressResult = await supabase
          .from('user_setup_progress')
          .select('completed_steps')
          .eq('user_id', user.id)
          .maybeSingle();

        if (progressResult.error) {
          console.error('Could not read shared onboarding progress.', progressResult.error);
        } else {
          const completedSteps = new Set(progressResult.data?.completed_steps ?? []);
          completedSteps.add('tour');
          const saveProgressResult = await supabase
            .from('user_setup_progress')
            .upsert(
              {
                user_id: user.id,
                completed_steps: [...completedSteps],
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id' }
            );
          if (saveProgressResult.error) {
            console.error('Could not save shared onboarding progress.', saveProgressResult.error);
          } else {
            isPersisted = true;
          }
        }

        if (!isPersisted) {
          toast.error(
            'The tour is complete, but we could not sync it to your account. It may appear again on another device.'
          );
        }
      }

      if (canMutateDatabase) {
        await promoteUserToLive();
        toast.success('Onboarding complete! Full production workspace active.');
      } else {
        toast.info(
          'Tour completed! You are in Safe Sandbox mode until 2FA & email verification are verified.'
        );
      }

      setShowTermsModal(false);
      navigate('/dashboard');
    } catch {
      setShowTermsModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const step = tourSteps[currentStepIndex];

  return (
    <>
      <Dialog
        open={isGuideOpen}
        onOpenChange={(open) => {
          if (!open) closeGuide();
        }}
      >
        <DialogContent className="max-h-[92dvh] w-[min(94vw,760px)] max-w-none gap-0 overflow-y-auto rounded-2xl border border-border bg-background p-0 text-foreground shadow-2xl sm:rounded-3xl">
          <div className="px-5 pb-5 pt-6 pr-14 sm:px-8 sm:pb-6 sm:pt-8">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-500">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-border bg-indigo-50 text-indigo-500 dark:bg-indigo-950/40">
                <Sparkles size={13} />
              </span>
              Getting started <span className="text-muted-foreground/60">/</span>{' '}
              {isMobileViewport ? 'Mobile Guide' : 'Desktop Guide'} • Step 1 of 2
            </div>
            <DialogHeader className="gap-2 text-left">
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Meet your ProjectFlow workspace
              </DialogTitle>
              <DialogDescription className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                Watch this quick beginner guide, then explore the{' '}
                {isMobileViewport ? 'mobile' : 'desktop'} key features in an interactive tour.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-4 px-5 pb-5 sm:px-8 sm:pb-8">
            <div className="overflow-hidden rounded-xl border border-border bg-black shadow-xl sm:rounded-2xl">
              <video
                key={guideVideoAttempt}
                className="aspect-video w-full bg-black"
                controls
                playsInline
                preload="metadata"
                onEnded={() => setHasWatchedGuide(true)}
                onError={() => setGuideVideoError(true)}
              >
                <source src={GUIDE_VIDEO_URL} type="video/mp4" />
                Your browser does not support video playback.
              </video>
            </div>

            {guideVideoError ? (
              <div
                role="alert"
                className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/10 p-3.5 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between"
              >
                <span>The guide could not be loaded. Check your connection and try again.</span>
                <button
                  type="button"
                  onClick={() => {
                    setGuideVideoError(false);
                    setGuideVideoAttempt((attempt) => attempt + 1);
                  }}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-destructive/25 px-3 py-2 font-semibold transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <RotateCcw size={14} />
                  Retry video
                </button>
              </div>
            ) : (
              <div
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                  hasWatchedGuide
                    ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : 'border-border bg-muted/40 text-muted-foreground'
                }`}
              >
                {hasWatchedGuide ? (
                  <CheckCircle2 size={18} className="shrink-0" />
                ) : (
                  <CirclePlay size={18} className="shrink-0 text-indigo-500" />
                )}
                <span className="leading-relaxed">
                  {hasWatchedGuide
                    ? 'Guide complete. Your interactive tour is ready.'
                    : 'Watch the video to the end to continue.'}
                </span>
              </div>
            )}

            <div className="border-t border-border pt-4">
              <button
                type="button"
                onClick={beginTour}
                disabled={!hasWatchedGuide || guideVideoError}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
              >
                Continue to {isMobileViewport ? 'mobile' : 'desktop'} tour
                <CirclePlay size={17} />
              </button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Your tour will open in the workspace as soon as you continue.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 1. Dynamic Element Spotlight Mask */}
      {isTourOpen && step && (
        <OnboardingSpotlight
          targetSelector={step.selector}
          title={step.title}
          description={step.description}
          actionHint={step.actionHint}
          illustration={step.illustration}
          badge={step.badge}
          shortcuts={isMobileViewport ? undefined : step.shortcuts}
          stepIndex={currentStepIndex}
          totalSteps={tourSteps.length}
          onNext={handleNext}
          onBack={handleBack}
          onSkip={handleSkip}
        />
      )}

      {/* 2. Workspace Access & Collaboration Agreement Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md animate-in fade-in duration-200 dark:bg-black/80">
          <div className="w-full max-w-lg space-y-0 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-[#161b22]">
            {/* Modal Header */}
            <div className="flex items-center gap-3.5 border-b border-gray-100 bg-gray-50/90 px-6 py-5 dark:border-gray-800 dark:bg-[#0d1117]/80">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${theme.bgSubtle} ${theme.textAccent} ${theme.borderAccent}/30`}
              >
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Workspace Security & Sandbox Policy
                </h3>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  Understand your access tier and workspace authority
                </p>
              </div>
            </div>

            {/* Terms Explanations */}
            <div className="space-y-4 p-6 text-xs text-gray-700 dark:text-gray-300">
              <div className="custom-scrollbar max-h-52 space-y-3 overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 p-4 text-[11px] leading-relaxed dark:border-gray-800 dark:bg-[#0d1117]">
                <div>
                  <p className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
                    <Layers size={13} className={theme.textAccent} />
                    1. Safe Sandbox Isolation
                  </p>
                  <p className="mt-0.5 text-gray-600 dark:text-gray-400">
                    New accounts operate in an isolated draft sandbox. Card reordering and draft task
                    edits do not overwrite production team data until you satisfy full account
                    verification and 2FA.
                  </p>
                </div>

                <div>
                  <p className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
                    <Code2 size={13} className={theme.textAccent} />
                    2. Code Studio & Terminal Security
                  </p>
                  <p className="mt-0.5 text-gray-600 dark:text-gray-400">
                    Terminal commands run inside a sandboxed browser runtime. Outbound git commits and
                    push requests require personal GitHub tokens and a verified identity badge.
                  </p>
                </div>

                <div>
                  <p className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
                    <Sparkles size={13} className={theme.textAccent} />
                    3. Gemini AI Rate Limits
                  </p>
                  <p className="mt-0.5 text-gray-600 dark:text-gray-400">
                    Integrated code review and pull request generation quotas are shared across the
                    team. Automated queries adhere to workspace fair-use policies.
                  </p>
                </div>
              </div>

              {/* Status Warning Pill if unverified */}
              {isSandboxActive && (
                <div className="flex items-center gap-2.5 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-3 text-[11px] text-amber-700 dark:text-amber-400">
                  <ShieldAlert size={16} className="shrink-0" />
                  <span>
                    Your account is currently in <strong>Safe Sandbox Mode</strong>. Verify your email
                    and configure 2FA in Settings to unlock direct database write authority.
                  </span>
                </div>
              )}

              {/* Checkbox */}
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50/80 p-3 transition-colors hover:border-gray-300 dark:border-gray-800 dark:bg-[#0d1117]/60 dark:hover:border-gray-700">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className={`mt-0.5 h-4 w-4 cursor-pointer rounded border-gray-300 dark:border-gray-700 ${theme.toggleActive} focus:ring-0`}
                />
                <span className="select-none text-xs font-medium text-gray-700 dark:text-gray-300">
                  I understand the sandbox security policy and agree to the{' '}
                  <strong>Community Terms of Service</strong>.
                </span>
              </label>

              {/* Confirm Button */}
              <button
                type="button"
                onClick={handleCompleteTerms}
                disabled={!agreedTerms || submitting}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-40 ${theme.btnPrimary}`}
              >
                {submitting ? (
                  <Sparkles size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                <span>Enter ProjectFlow Workspace</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}