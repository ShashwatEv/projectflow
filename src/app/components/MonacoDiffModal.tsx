import { useState } from 'react';
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-gray-800 rounded-3xl w-full max-w-6xl h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar with Split or Unified View Switcher */}
        <div className="h-14 border-b border-gray-800 px-6 flex items-center justify-between shrink-0 bg-[#0d1117]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <FileDiff size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-mono">{filePath}</h3>
                <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                  Diff Review
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Comparing Base GitHub SHA against Local Staging</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Split vs Inline Toggle */}
            <div className="flex items-center bg-[#161b22] border border-gray-800 rounded-xl p-0.5 mr-2">
              <button
                type="button"
                onClick={() => setRenderSideBySide(true)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
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
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
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
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirmPush}
              disabled={isPushing}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl ${theme.btnPrimary} font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50`}
            >
              <GitCommit size={15} />
              <span>{isPushing ? 'Committing...' : 'Confirm & Commit Push'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Diff Editor Body */}
        <div className="flex-1 overflow-hidden p-2 bg-[#0d1117]">
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
        <div className="h-9 border-t border-gray-800 px-6 flex items-center justify-between text-[11px] font-mono text-gray-400 bg-[#0d1117]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Red: Remote Base on GitHub
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Green: Staged Workspace Edits
            </span>
          </div>
          <span>Review diff thoroughly prior to remote push</span>
        </div>
      </div>
    </div>
  );
}