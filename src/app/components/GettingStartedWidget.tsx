import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, Circle, ChevronDown, ChevronUp, 
  Sparkles, ShieldCheck, Key, Lock, ArrowRight, ShieldAlert 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOnboardingSandbox } from '../../context/OnboardingSandboxContext';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { toast } from 'sonner';

export default function GettingStartedWidget() {
  const navigate = useNavigate();
  const theme = useAccentTheme();
  const { user } = useAuth();
  const { isSandboxActive, startTour, promoteUserToLive, canMutateDatabase } = useOnboardingSandbox();

  const [isCollapsed, setIsCollapsed] = useState(false);

  // If user is already a full live account, don't show the onboarding widget
  if (!isSandboxActive) return null;

  const hasGithubToken = Boolean(localStorage.getItem('pf_github_token'));
  const isVerified = Boolean(user?.is_verified || user?.email_verified);
  const is2FaActive = Boolean(user?.is_2fa_enabled);

  const milestones = [
    {
      id: 'verify',
      label: 'Verify email identity badge',
      done: isVerified,
      action: () => navigate('/settings'),
    },
    {
      id: '2fa',
      label: 'Activate Two-Factor Authentication',
      done: is2FaActive,
      action: () => navigate('/settings'),
    },
    {
      id: 'github',
      label: 'Configure GitHub Access Token',
      done: hasGithubToken,
      action: () => navigate('/code'),
    },
  ];

  const completedCount = milestones.filter((m) => m.done).length;
  const progressPercent = Math.round((completedCount / milestones.length) * 100);

  const handlePromote = async () => {
    if (!canMutateDatabase) {
      toast.error('Criteria not satisfied', {
        description: 'You must verify your email and activate 2FA before promoting to the shared production database.',
      });
      return;
    }

    await promoteUserToLive();
    toast.success('🎉 Welcome aboard! Your workspace has been promoted to production mode.');
  };

  return (
    <div className="bg-[#161b22] border border-amber-500/30 rounded-2xl p-3.5 shadow-xl space-y-3 text-xs animate-in slide-in-from-bottom-2 duration-200">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldAlert size={14} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-white text-[11px]">Safe Sandbox Mode</h4>
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded">
                Drafting
              </span>
            </div>
            <p className="text-[10px] text-gray-400">Database writes isolated locally</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-400 hover:text-white p-0.5 rounded transition-colors"
        >
          {isCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expanded Checklist */}
      {!isCollapsed && (
        <div className="space-y-3 pt-1">
          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-gray-400 font-mono">
              <span>{completedCount} of {milestones.length} requirements met</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-[#0d1117] h-1.5 rounded-full overflow-hidden border border-gray-800">
              <div
                className={`h-full ${theme.progressBar} transition-all duration-500`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Milestone Items */}
          <div className="space-y-1.5">
            {milestones.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={m.action}
                className="w-full flex items-center justify-between p-1.5 rounded-xl hover:bg-[#0d1117] text-left transition-colors group"
              >
                <div className="flex items-center gap-2 truncate">
                  {m.done ? (
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  ) : (
                    <Circle size={13} className="text-gray-600 shrink-0" />
                  )}
                  <span className={`text-[11px] truncate ${m.done ? 'text-gray-400 line-through' : 'text-gray-200'}`}>
                    {m.label}
                  </span>
                </div>
                <ArrowRight size={11} className="text-gray-500 group-hover:text-white opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-gray-800/80 flex items-center gap-2">
            <button
              type="button"
              onClick={startTour}
              className="flex-1 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-[10px] flex items-center justify-center gap-1 transition-all"
            >
              <Sparkles size={11} className={theme.textAccent} />
              <span>Tour</span>
            </button>

            <button
              type="button"
              onClick={handlePromote}
              disabled={!canMutateDatabase}
              title={!canMutateDatabase ? 'Fulfill verification and 2FA requirements to graduate' : 'Promote to live database'}
              className={`flex-1 py-1.5 rounded-xl ${
                canMutateDatabase 
                  ? `${theme.btnPrimary} text-white` 
                  : 'bg-gray-800/60 text-gray-500 cursor-not-allowed border border-gray-800'
              } font-bold text-[10px] flex items-center justify-center gap-1 transition-all`}
            >
              {canMutateDatabase ? <ShieldCheck size={11} /> : <Lock size={11} />}
              <span>Graduate</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}