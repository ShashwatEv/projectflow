import { useState, useEffect } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { X, GitCommit, FileDiff, Columns2, AlignJustify } from 'lucide-react';
import { useAccentTheme } from '../../lib/useAccentTheme';

interface MonacoDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  filePath: string;
  originalContent: string;
  modifiedContent: string;
  onConfirmPush: () => void;
  isPushing: boolean;
}

export default function MonacoDiffModal({
  isOpen,
  onClose,
  filePath,
  originalContent,
  modifiedContent,
  onConfirmPush,
  isPushing,
}: MonacoDiffModalProps) {
  const theme = useAccentTheme();
  const [renderSideBySide, setRenderSideBySide] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPushing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPushing, onClose]);

  if (!isOpen) return null;

  const getLanguageFromPath = (path: string) => {
    if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'typescript';
    if (path.endsWith('.js') || path.endsWith('.jsx')) return 'javascript';
    if (path.endsWith('.css')) return 'css';
    if (path.endsWith('.html')) return 'html';
    if (path.endsWith('.json')) return 'json';
    if (path.endsWith('.py')) return 'python';
    if (path.endsWith('.rs')) return 'rust';
    return 'plaintext';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      onClick={() => {
        if (!isPushing) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="monaco-diff-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="flex h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-gray-800 bg-[#161b22] shadow-2xl animate-in zoom-in-95 duration-200"
      >
        {/* Modal Top Bar with Split or Unified View Switcher */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-800 bg-[#0d1117] px-6">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-2 text-purple-400">
              <FileDiff size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="monaco-diff-modal-title"
                  className="font-mono text-sm font-bold text-white"
                >
                  {filePath}
                </h3>
                <span className="rounded bg-gray-800 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-500">
                  Diff Review
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Comparing Base GitHub SHA against Local Staging
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Split vs Inline Toggle */}
            <div className="mr-2 flex items-center rounded-xl border border-gray-800 bg-[#161b22] p-0.5">
              <button
                type="button"
                onClick={() => setRenderSideBySide(true)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  renderSideBySide
                    ? 'bg-gray-800 text-white shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Side by side comparison"
              >
                <Columns2 size={13} />
                <span>Split</span>
              </button>
              <button
                type="button"
                onClick={() => setRenderSideBySide(false)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  !renderSideBySide
                    ? 'bg-gray-800 text-white shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Unified inline diff"
              >
                <AlignJustify size={13} />
                <span>Unified</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isPushing}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-400 transition-colors hover:bg-gray-800 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirmPush}
              disabled={isPushing}
              className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 ${theme.btnPrimary}`}
            >
              <GitCommit size={15} />
              <span>{isPushing ? 'Committing...' : 'Confirm & Commit Push'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isPushing}
              aria-label="Close diff review"
              title="Close diff review"
              className="ml-1 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Diff Editor Body */}
        <div className="flex-1 overflow-hidden bg-[#0d1117] p-2">
          <DiffEditor
            height="100%"
            theme="vs-dark"
            original={originalContent}
            modified={modifiedContent}
            language={getLanguageFromPath(filePath)}
            options={{
              fontSize: 12,
              minimap: { enabled: false },
              renderSideBySide: renderSideBySide,
              readOnly: true,
              automaticLayout: true,
            }}
          />
        </div>

        {/* Legend Footer */}
        <div className="flex h-9 items-center justify-between border-t border-gray-800 bg-[#0d1117] px-6 font-mono text-[11px] text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Red: Remote Base on GitHub
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Green: Staged Workspace Edits
            </span>
          </div>
          <span>Review diff thoroughly prior to remote push</span>
        </div>
      </section>
    </div>
  );
}