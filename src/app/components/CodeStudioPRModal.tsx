import { useState } from 'react';
import { GitPullRequest, X, Loader2 } from 'lucide-react';
import { createPullRequest } from '../../lib/githubService';
import { toast } from 'sonner';

interface PRModalProps {
  isOpen: boolean;
  onClose: () => void;
  repo: string;
  token: string;
  currentBranch: string;
  defaultBaseBranch?: string;
}

export default function CodeStudioPRModal({
  isOpen,
  onClose,
  repo,
  token,
  currentBranch,
  defaultBaseBranch = 'main',
}: PRModalProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [baseBranch, setBaseBranch] = useState(defaultBaseBranch);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#161b22] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400">
            <GitPullRequest size={18} />
            <h3 className="font-bold text-sm text-white">Create Pull Request</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="bg-[#0d1117] p-2.5 rounded-xl border border-gray-800 font-mono text-[11px] text-gray-400 flex items-center justify-between">
            <span>base: <strong className="text-indigo-400">{baseBranch}</strong></span>
            <span>←</span>
            <span>compare: <strong className="text-emerald-400">{currentBranch}</strong></span>
          </div>

          <div>
            <label className="block text-gray-400 font-medium mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. feat: add presence avatars to editor"
              className="w-full bg-[#0d1117] border border-gray-700 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-gray-400 font-medium mb-1">Description (Optional)</label>
            <textarea
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What changes does this pull request include?"
              className="w-full bg-[#0d1117] border border-gray-700 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              <span>Create PR</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}