import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Compass, ArrowRight, ArrowLeft, X, Check, ShieldCheck, 
  Sparkles, FolderKanban, CheckSquare, Code2, BarChart2 
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

interface TourStep {
  title: string;
  path: string;
  description: string;
  actionHint: string;
  icon: React.ReactNode;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to ProjectFlow Dashboard',
    path: '/dashboard',
    description: 'Your central command hub. Monitor real-time project counts, active workspace members, overall velocity, and high-level deliverables at a glance.',
    actionHint: 'Review quick metrics and recent workspace activity.',
    icon: <Sparkles className="text-orange-500" size={22} />,
  },
  {
    title: 'Manage & Collaborate on Projects',
    path: '/projects',
    description: 'Organize your team goals into dedicated workspaces. Track progress meters, assign owners, and drill down into individual Kanban boards.',
    actionHint: 'Create or inspect a project board to view sprint tasks.',
    icon: <FolderKanban className="text-orange-500" size={22} />,
  },
  {
    title: 'Track Personal & Team Deliverables',
    path: '/tasks',
    description: 'Switch between an agile Kanban board and a compact List view. Filter by due date, prioritize urgent blockers, and manage sub-tasks with one click.',
    actionHint: 'Click any task to view discussions or drag across columns.',
    icon: <CheckSquare className="text-orange-500" size={22} />,
  },
  {
    title: 'Code Studio & AI Assistant',
    path: '/code',
    description: 'Inspect GitHub repositories in-browser, open desktop VS Code deep-links, test edits in Monaco Editor, and ask the pooled Gemini AI assistant for instant reviews.',
    actionHint: 'Commit files, switch branches, or open pull requests.',
    icon: <Code2 className="text-orange-500" size={22} />,
  },
  {
    title: 'Monitor Velocity & Analytics',
    path: '/analytics',
    description: 'Real-time charts powered by Supabase. Review your team completion rate, workload distribution by priority, and progress milestones.',
    actionHint: 'Analyze team performance graphs updated live.',
    icon: <BarChart2 className="text-orange-500" size={22} />,
  },
];

export default function OnboardingTour() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [agreedTerms, setAgreedTerms] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Check if user has already finished onboarding
  useEffect(() => {
    async function checkStatus() {
      if (!user?.id) return;

      const localCompleted = localStorage.getItem(`pf_tour_${user.id}`);
      if (localCompleted === 'true') return;

      try {
        const { data } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        if (!data?.onboarding_completed) {
          setIsVisible(true);
        } else {
          localStorage.setItem(`pf_tour_${user.id}`, 'true');
        }
      } catch {
        setIsVisible(true);
      }
    }

    checkStatus();
  }, [user]);

  // Navigate when step changes
  const goToStep = (index: number) => {
    if (index >= 0 && index < TOUR_STEPS.length) {
      setCurrentStepIndex(index);
      const targetPath = TOUR_STEPS[index]?.path;
      if (targetPath && location.pathname !== targetPath) {
        navigate(targetPath);
      }
    } else if (index >= TOUR_STEPS.length) {
      // Reached the end -> open terms modal
      setIsVisible(false);
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
    setIsVisible(false);
    setShowTermsModal(true);
  };

  const handleCompleteOnboarding = async () => {
    if (!agreedTerms) {
      toast.error('Please check the box to agree to the Terms & Conditions.');
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
      setShowTermsModal(false);
      toast.success('Welcome aboard! You have completed workspace onboarding. 🚀');
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
      {/* 1. Interactive Walkthrough Floating Guide Box */}
      {isVisible && step && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-[#161b22] border-2 border-orange-500/80 rounded-2xl shadow-2xl p-5 text-xs text-gray-200 animate-in slide-in-from-bottom-5 duration-300">
          {/* Header Row */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-950/40 border border-orange-500/30">
                {step.icon}
              </div>
              <div>
                <span className="font-bold text-[10px] uppercase text-orange-400 tracking-wider">
                  Step {currentStepIndex + 1} of {TOUR_STEPS.length}
                </span>
                <h4 className="font-bold text-sm text-white line-clamp-1">{step.title}</h4>
              </div>
            </div>

            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
              title="Skip Tour"
            >
              <X size={16} />
            </button>
          </div>

          {/* Description & Action Hint */}
          <div className="py-3.5 space-y-2">
            <p className="text-gray-300 leading-relaxed text-xs">{step.description}</p>
            <div className="bg-[#0d1117] p-2.5 rounded-xl border border-gray-800 text-[11px] text-gray-400 flex items-center gap-2">
              <Compass size={14} className="text-orange-400 shrink-0" />
              <span>{step.actionHint}</span>
            </div>
          </div>

          {/* Footer Navigation Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-800">
            <button
              type="button"
              onClick={handleSkip}
              className="text-gray-400 hover:text-white font-semibold text-[11px] hover:underline"
            >
              Skip Tour
            </button>

            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold flex items-center gap-1 transition-all"
                >
                  <ArrowLeft size={13} />
                  <span>Back</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center gap-1 shadow-sm transition-all active:scale-95"
              >
                <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Terms & Conditions Mandatory Agreement Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#161b22] border border-gray-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-800 bg-[#0d1117]/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-950/40 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Terms of Use & Community Agreement</h3>
                <p className="text-xs text-gray-400 mt-0.5">Please review and confirm to enter your workspace.</p>
              </div>
            </div>

            {/* Scrollable Terms Content */}
            <div className="p-6 space-y-4 text-xs text-gray-300">
              <div className="bg-[#0d1117] p-4 rounded-2xl border border-gray-800 max-h-52 overflow-y-auto space-y-3 custom-scrollbar text-[11px] leading-relaxed">
                <p className="font-semibold text-white">1. Workspace & Code Integrity</p>
                <p className="text-gray-400">
                  You agree to use ProjectFlow Code Studio, Monaco editor buffers, and integrated repositories in compliance with all relevant software licenses and security policies. Sensitive secrets and credentials should be stored securely using environment variables.
                </p>

                <p className="font-semibold text-white">2. AI Assistance Quotas</p>
                <p className="text-gray-400">
                  Integrated Gemini assistant queries are pooled across team members on the Developer tier. Automated queries must adhere to fair usage and non-abuse guidelines.
                </p>

                <p className="font-semibold text-white">3. Collaboration & Communication</p>
                <p className="text-gray-400">
                  Shared channels, direct messages, and task comments must remain respectful and constructive. Workspace administrators reserve the right to moderate shared content.
                </p>
              </div>

              {/* Checkbox agreement */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-[#0d1117]/50 border border-gray-800 cursor-pointer hover:border-gray-700 transition-colors">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-700 text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
                <span className="text-xs text-gray-300 font-medium select-none">
                  I have read and agree to the <strong>Terms of Service</strong> and <strong>Workspace Collaboration Guidelines</strong>.
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleCompleteOnboarding}
                disabled={!agreedTerms || submitting}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 text-xs flex items-center justify-center gap-2"
              >
                <Check size={16} />
                <span>Agree & Enter ProjectFlow</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}