import { useState } from 'react';
import { GitPullRequest, X, Loader2, Sparkles, Wand2 } from 'lucide-react';
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
  const [baseBranch, setBaseBranch] = useState(defaultBaseBranch);
  const [loading, setLoading] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  if (!isOpen) return null;

  // AI-Driven Conventional Commit and Markdown PR Summary
  const handleGenerateAiSummary = async () => {
    setIsGeneratingAi(true);

    const prompt = `
You are a Principal Software Engineer drafting a GitHub Pull Request.
Repository: ${repo}
Comparing Branch: ${currentBranch} into ${baseBranch}
Active Edited File: ${activeFile || 'Multiple workspace edits'}

Code Context:
${activeFileContent.slice(0, 3000) || '// Standard workspace update'}

Return pure JSON without markdown backticks:
{
  "title": "feat(scope): concise conventional commit title",
  "body": "## Overview\\nSummary of changes.\\n\\n## Key Improvements\\n- Bullet item 1\\n- Bullet item 2\\n\\n## Verification\\n- [ ] Code builds cleanly\\n- [ ] Edge cases handled"
}
`;

    try {
      const raw = await askGeminiCodeAssistant(prompt, activeFileContent, 'pull_request.json');
      const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(clean);

      if (parsed.title) setTitle(parsed.title);
      if (parsed.body) setBody(parsed.body);
      toast.success('Generated PR Title & Summary with Gemini!');
    } catch {
      // Clean fallback if model returns raw text or parse fails
      setTitle(`feat: update ${activeFile || 'project module'}`);
      setBody(
        `## Overview\nAutomated updates committed via ProjectFlow Code Studio.\n\n## Verification\n- [ ] Staging verified\n- [ ] No regression detected`
      );
      toast.info('Applied standardized PR template.');
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
      toast.success(`Pull Request #${pr.number} created!`);
      onClose();
      setTitle('');
      setBody('');
    } catch (err: any) {
      toast.error(err.message || 'Error creating PR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#161b22] border border-gray-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-[#0d1117]/80">
          <div className="flex items-center gap-2.5 text-indigo-400">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <GitPullRequest size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Create Pull Request</h3>
              <p className="text-[11px] text-gray-400">Targeting {repo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Branch Comparator */}
          <div className="bg-[#0d1117] p-3 rounded-2xl border border-gray-800 font-mono text-[11px] text-gray-400 flex items-center justify-between">
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
              onClick={handleGenerateAiSummary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-bold transition-all disabled:opacity-50"
            >
              {isGeneratingAi ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Wand2 size={13} />
              )}
              <span>{isGeneratingAi ? 'Analyzing Diff...' : 'AI Auto-Fill Title & Body'}</span>
            </button>
          </div>

          {/* Title Field */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1">
              Pull Request Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. feat(auth): enforce OTP verification gates"
              className={`w-full bg-[#0d1117] border border-gray-800 rounded-xl px-3.5 py-2.5 text-white outline-none ${theme.ringAccent} font-mono`}
            />
          </div>

          {/* Body Field */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1">
              Description (Markdown Supported)
            </label>
            <textarea
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Detailed description of architectural changes, tests, and screenshots..."
              className={`w-full bg-[#0d1117] border border-gray-800 rounded-xl px-3.5 py-2.5 text-white outline-none ${theme.ringAccent} resize-none font-mono text-[11px] leading-relaxed custom-scrollbar`}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl ${theme.btnPrimary} text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50`}
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