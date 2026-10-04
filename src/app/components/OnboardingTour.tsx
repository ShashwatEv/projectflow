import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, Check, Sparkles, FolderKanban, 
  CheckSquare, Code2, BarChart2, ShieldAlert,
  ArrowRight, Layers
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useOnboardingSandbox } from '../../context/OnboardingSandboxContext';
import { useAccentTheme } from '../../lib/useAccentTheme';
import OnboardingSpotlight from './OnboardingSpotlight';
import { toast } from 'sonner';

interface TourStep {
  title: string;
  path: string;
  selector: string;
  description: string;
  actionHint: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Workspace Command Hub',
    path: '/dashboard',
    selector: 'main',
    description: 'Your central command center. Monitor overall sprint velocity, active team contributors, and upcoming milestones at a glance.',
    actionHint: 'Look over top-level metrics and your daily delivery timeline.',
  },
  {
    title: 'Safe Sandbox Kanban Board',
    path: '/tasks',
    selector: '[data-tour="kanban-board"], main',
    description: 'Interactive sprint board. As a new user, actions taken here remain in Safe Sandbox Mode until your identity and 2FA are validated.',
    actionHint: 'Drag demo cards between columns to test real-time state changes.',
  },
  {
    title: 'Collaborative Projects',
    path: '/projects',
    selector: 'main',
    description: 'Organize work into repositories and initiatives. Connect GitHub repositories to synchronize commit trees and branches.',
    actionHint: 'Create or inspect workspaces linked with repository remotes.',
  },
  {
    title: 'In-Browser Code Studio',
    path: '/code',
    selector: 'main',
    description: 'Inspect code buffers, review git diffs against remote HEAD, execute sandboxed terminal tasks, and get Gemini AI assistance.',
    actionHint: 'Test the Monaco editor and the in-memory JS terminal sandbox.',
  },
  {
    title: 'Team Velocity & Analytics',
    path: '/analytics',
    selector: 'main',
    description: 'Real-time telemetry showing workload distribution by priority and completion ratios across all active repositories.',
    actionHint: 'Inspect velocity charts powered by Supabase realtime feeds.',
  },
];

export default function OnboardingTour() {
  const { user } = useAuth();
  const theme = useAccentTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { isTourOpen, startTour, closeTour, isSandboxActive, promoteUserToLive, canMutateDatabase } = useOnboardingSandbox();

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [agreedTerms, setAgreedTerms] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Auto-prompt tour on first visit if not yet completed
  useEffect(() => {
    async function checkTourStatus() {
      if (!user?.id) return;

      const localDone = localStorage.getItem(`pf_tour_${user.id}`);
      if (localDone === 'true') return;

      try {
        const { data } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', user.id)
          .maybeSingle();

        if (!data?.onboarding_completed) {
          startTour();
        } else {
          localStorage.setItem(`pf_tour_${user.id}`, 'true');
        }
      } catch {
        startTour();
      }
    }

    checkTourStatus();
  }, [user?.id]);

  const goToStep = (index: number) => {
    if (index >= 0 && index < TOUR_STEPS.length) {
      setCurrentStepIndex(index);
      const targetPath = TOUR_STEPS[index]?.path;
      if (targetPath && location.pathname !== targetPath) {
        navigate(targetPath);
      }
    } else if (index >= TOUR_STEPS.length) {
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
        localStorage.setItem(`pf_tour_${user.id}`, 'true');
        await supabase
          .from('users')
          .update({ onboarding_completed: true })
          .eq('id', user.id);
      }

      if (canMutateDatabase) {
        await promoteUserToLive();
        toast.success('Onboarding complete! Full production workspace active.');
      } else {
        toast.info('Tour completed! You are in Safe Sandbox mode until 2FA & email verification are verified.');
      }

      setShowTermsModal(false);
      navigate('/dashboard');
    } catch {
      setShowTermsModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const step = TOUR_STEPS[currentStepIndex];

  return (
    <>
      {/* 1. Dynamic Element Spotlight Mask */}
      {isTourOpen && step && (
        <OnboardingSpotlight
          targetSelector={step.selector}
          title={step.title}
          description={step.description}
          actionHint={step.actionHint}
          stepIndex={currentStepIndex}
          totalSteps={TOUR_STEPS.length}
          onNext={handleNext}
          onBack={handleBack}
          onSkip={handleSkip}
        />
      )}

      {/* 2. Workspace Access & Collaboration Agreement Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#161b22] border border-gray-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-0">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-800 bg-[#0d1117]/80 flex items-center gap-3.5">
              <div className={`w-11 h-11 rounded-2xl ${theme.bgSubtle} ${theme.textAccent} border ${theme.borderAccent}/30 flex items-center justify-center shrink-0`}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Workspace Security & Sandbox Policy</h3>
                <p className="text-xs text-gray-400 mt-0.5">Understand your access tier and workspace authority</p>
              </div>
            </div>

            {/* Terms Explanations */}
            <div className="p-6 space-y-4 text-xs text-gray-300">
              <div className="bg-[#0d1117] p-4 rounded-2xl border border-gray-800 max-h-52 overflow-y-auto space-y-3 custom-scrollbar text-[11px] leading-relaxed">
                <div>
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <Layers size={13} className={theme.textAccent} />
                    1. Safe Sandbox Isolation
                  </p>
                  <p className="text-gray-400 mt-0.5">
                    New accounts operate in an isolated draft sandbox. Card reordering and draft task edits do not overwrite production team data until you satisfy full account verification and 2FA.
                  </p>
                </div>

                <div>
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <Code2 size={13} className={theme.textAccent} />
                    2. Code Studio & Terminal Security
                  </p>
                  <p className="text-gray-400 mt-0.5">
                    Terminal commands run inside a sandboxed browser runtime. Outbound git commits and push requests require personal GitHub tokens and a verified identity badge.
                  </p>
                </div>

                <div>
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles size={13} className={theme.textAccent} />
                    3. Gemini AI Rate Limits
                  </p>
                  <p className="text-gray-400 mt-0.5">
                    Integrated code review and pull request generation quotas are shared across the team. Automated queries adhere to workspace fair-use policies.
                  </p>
                </div>
              </div>

              {/* Status Warning Pill if unverified */}
              {isSandboxActive && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-2.5 text-amber-400 text-[11px]">
                  <ShieldAlert size={16} className="shrink-0" />
                  <span>
                    Your account is currently in <strong>Safe Sandbox Mode</strong>. Verify your email and configure 2FA in Settings to unlock direct database write authority.
                  </span>
                </div>
              )}

              {/* Checkbox */}
              <label className="flex items-start gap-3 p-3 rounded-2xl bg-[#0d1117]/60 border border-gray-800 cursor-pointer hover:border-gray-700 transition-colors">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className={`mt-0.5 w-4 h-4 rounded border-gray-700 ${theme.toggleActive} focus:ring-0 cursor-pointer`}
                />
                <span className="text-xs text-gray-300 font-medium select-none">
                  I understand the sandbox security policy and agree to the <strong>Community Terms of Service</strong>.
                </span>
              </label>

              {/* Confirm Button */}
              <button
                type="button"
                onClick={handleCompleteTerms}
                disabled={!agreedTerms || submitting}
                className={`w-full py-3.5 ${theme.btnPrimary} disabled:opacity-40 text-white font-bold rounded-2xl transition-all shadow-md active:scale-95 text-xs flex items-center justify-center gap-2`}
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