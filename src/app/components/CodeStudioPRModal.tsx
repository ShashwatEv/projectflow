import { useState } from 'react';
import { GitPullRequest, X, Loader2, Wand2 } from 'lucide-react';
import { createPullRequest } from '../../lib/githubService';
import { askGeminiCodeAssistant } from '../../lib/geminiClient';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { toast } from 'sonner';

interface PRModalProps {
  isOpen: boolean;
  onClose: () => void;
  repo: string;
  token: string;
  currentBranch: string;
  defaultBaseBranch?: string;
  activeFile?: string;
  activeFileContent?: string;
}

export default function CodeStudioPRModal({
  isOpen,
  onClose,
  repo,
  token,
  currentBranch,
  defaultBaseBranch = 'main',
  activeFile = '',
  activeFileContent = '',
}: PRModalProps) {
  const theme = useAccentTheme();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [baseBranch] = useState(defaultBaseBranch);
  const [loading, setLoading] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  if (!isOpen) return null;

  const fileLabel = activeFile ? activeFile.split('/').pop() || activeFile : 'workspace changes';

  const handleGenerateAiSummary = async () => {
    setIsGeneratingAi(true);

    const prompt = [
      `Draft a GitHub pull request title and description for ${repo} (${currentBranch} -> ${baseBranch}).`,
      activeFile ? `Primary file: ${activeFile}` : '',
      'Code snippet:',
      activeFileContent.slice(0, 3000) || '// No file content provided',
      'Respond with valid JSON only (no markdown fences):',
      '{"title":"type(scope): short summary","body":"## Summary\\n- What changed\\n\\n## Testing\\n- [ ] Verified locally"}',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const raw = await askGeminiCodeAssistant(prompt, activeFileContent, 'pull_request.json');
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw) as {
        title?: string;
        body?: string;
      };

      if (parsed.title?.trim()) setTitle(parsed.title.trim());
      if (parsed.body?.trim()) setBody(parsed.body.trim());
      toast.success('Drafted PR title and summary');
    } catch {
      setTitle(`chore: update ${fileLabel}`);
      setBody(
        `## Summary\n- Update \`${activeFile || currentBranch}\` from Code Studio\n\n## Testing\n- [ ] Verified changes locally`
      );
      toast.info('Applied starter PR template');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error('GitHub Token required to create a Pull Request');
      return;
    }
    if (!title.trim()) {
      toast.error('Please provide a PR title');
      return;
    }

    setLoading(true);
    try {
      const pr = await createPullRequest(repo, token, currentBranch, baseBranch, title, body);
      toast.success(`Pull Request #${pr.number} created`);
      onClose();
      setTitle('');
      setBody('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error creating PR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-gray-800 bg-[#161b22] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 bg-[#0d1117]/80 px-6 py-4">
          <div className="flex items-center gap-2.5 text-indigo-400">
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-2">
              <GitPullRequest size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Create Pull Request</h3>
              <p className="text-[11px] text-gray-400">Targeting {repo}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close pull request modal"
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 p-6 text-xs">
          {/* Branch Comparator */}
          <div className="flex items-center justify-between rounded-2xl border border-gray-800 bg-[#0d1117] p-3 font-mono text-[11px] text-gray-400">
            <span>
              base: <strong className="text-indigo-400">{baseBranch}</strong>
            </span>
            <span className="text-gray-600">←</span>
            <span>
              compare: <strong className="text-emerald-400">{currentBranch}</strong>
            </span>
          </div>

          {/* AI Generator Action Button */}
          <div className="flex justify-end">
            <button
              type="button"
              disabled={isGeneratingAi}
              onClick={() => void handleGenerateAiSummary()}
              className="flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-bold text-purple-400 transition-all hover:bg-purple-500/20 disabled:opacity-50"
            >
              {isGeneratingAi ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Wand2 size={13} />
              )}
              <span>{isGeneratingAi ? 'Drafting...' : 'Draft Title & Description'}</span>
            </button>
          </div>

          {/* Title Field */}
          <div>
            <label className="mb-1 block font-semibold text-gray-300">
              Pull Request Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. feat(auth): enforce OTP verification gates"
              className={`w-full rounded-xl border border-gray-800 bg-[#0d1117] px-3.5 py-2.5 font-mono text-white outline-none ${theme.ringAccent}`}
            />
          </div>

          {/* Body Field */}
          <div>
            <label className="mb-1 block font-semibold text-gray-300">
              Description (Markdown Supported)
            </label>
            <textarea
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Summarize what changed, why it was needed, and how it was tested..."
              className={`custom-scrollbar w-full resize-none rounded-xl border border-gray-800 bg-[#0d1117] px-3.5 py-2.5 font-mono text-[11px] leading-relaxed text-white outline-none ${theme.ringAccent}`}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2.5 border-t border-gray-800/80 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 ${theme.btnPrimary}`}
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              <span>Create Pull Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
