import { useEffect, useState } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { Check, FileCode2, X, Ban, CheckCheck } from 'lucide-react';
import type { ProposedCodeEdit } from '../../lib/geminiClient';

interface CodeEditReviewModalProps {
  summary: string;
  edits: ProposedCodeEdit[];
  onClose: () => void;
  onApply: (edits: ProposedCodeEdit[]) => void;
  onDeny: (path: string) => void;
}

function getLanguage(path: string) {
  const extension = path.split('.').pop()?.toLowerCase();
  const languages: Record<string, string> = {
    css: 'css',
    html: 'html',
    js: 'javascript',
    jsx: 'javascript',
    json: 'json',
    md: 'markdown',
    py: 'python',
    rs: 'rust',
    ts: 'typescript',
    tsx: 'typescript',
    yaml: 'yaml',
    yml: 'yaml',
  };
  return languages[extension || ''] || 'plaintext';
}

export default function CodeEditReviewModal({
  summary,
  edits,
  onClose,
  onApply,
  onDeny,
}: CodeEditReviewModalProps) {
  const [selectedPaths, setSelectedPaths] = useState<string[]>(edits.map((edit) => edit.path));
  const [activePath, setActivePath] = useState(edits[0]?.path || '');
  const activeEdit = edits.find((edit) => edit.path === activePath);

  useEffect(() => {
    setSelectedPaths((current) => current.filter((path) => edits.some((edit) => edit.path === path)));
    if (activePath && !edits.some((edit) => edit.path === activePath)) {
      setActivePath(edits[0]?.path || '');
    }
  }, [edits, activePath]);

  const togglePath = (path: string) => {
    setSelectedPaths((current) =>
      current.includes(path) ? current.filter((item) => item !== path) : [...current, path]
    );
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-edit-review-title"
        className="flex h-[92vh] w-full max-w-[1500px] flex-col overflow-hidden rounded-2xl border border-gray-700 bg-[#0d1117] shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-gray-800 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <h2 id="ai-edit-review-title" className="flex items-center gap-2 text-sm font-bold text-white">
              <FileCode2 size={17} className="text-purple-400" />
              Review AI changes
            </h2>
            <p className="mt-1 max-w-3xl text-xs text-gray-400">{summary}</p>
            <p className="mt-1 text-[10px] text-amber-300">
              Allow applies a file to its local editor buffer. Deny discards that file's suggestion.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close change review" className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white">
            <X size={17} />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
          <aside className="flex max-h-[34vh] w-full shrink-0 flex-col border-b border-gray-800 sm:max-h-none sm:w-72 sm:border-b-0 sm:border-r">
            <div className="flex items-center justify-between border-b border-gray-800 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              <span>{edits.length} proposed</span>
              <button
                type="button"
                onClick={() => setSelectedPaths(selectedPaths.length === edits.length ? [] : edits.map((edit) => edit.path))}
                className="text-indigo-300 normal-case tracking-normal hover:text-indigo-200"
              >
                {selectedPaths.length === edits.length ? 'Clear' : 'Select all'}
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {edits.map((edit) => (
                <div key={edit.path} className={`mb-1 rounded-lg p-2 ${activePath === edit.path ? 'bg-gray-800' : 'hover:bg-gray-900'}`}>
                  <div className="flex min-w-0 items-start gap-2">
                    <input
                      type="checkbox"
                      checked={selectedPaths.includes(edit.path)}
                      onChange={() => togglePath(edit.path)}
                      aria-label={`Select ${edit.path} for bulk review`}
                      className="mt-1 accent-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setActivePath(edit.path)}
                      className="min-w-0 flex-1 text-left font-mono text-[11px] text-gray-200"
                    >
                      <span className="block truncate">{edit.path}</span>
                      <span className="mt-0.5 block text-[9px] text-gray-500">
                        {edit.originalContent === edit.content ? 'No changes' : 'Modified'}
                      </span>
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onApply([edit])}
                      className="inline-flex min-h-7 flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600/20 px-2 text-[10px] font-bold text-emerald-300 hover:bg-emerald-600/35"
                      aria-label={`Allow changes to ${edit.path}`}
                    >
                      <Check size={11} /> Allow
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeny(edit.path)}
                      className="inline-flex min-h-7 flex-1 items-center justify-center gap-1 rounded-lg border border-gray-700 px-2 text-[10px] font-semibold text-gray-400 hover:border-rose-800 hover:bg-rose-950/30 hover:text-rose-300"
                      aria-label={`Deny changes to ${edit.path}`}
                    >
                      <Ban size={11} /> Deny
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <div className="min-h-0 min-w-0 flex-1">
            {activeEdit ? (
              <DiffEditor
                height="100%"
                theme="vs-dark"
                original={activeEdit.originalContent}
                modified={activeEdit.content}
                language={getLanguage(activeEdit.path)}
                options={{
                  fontSize: 12,
                  minimap: { enabled: false },
                  renderSideBySide: true,
                  readOnly: true,
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-gray-500">Choose a file to review.</div>
            )}
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-800 px-4 py-3 sm:px-6">
          <span className="text-xs text-gray-400">{selectedPaths.length} of {edits.length} selected</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => selectedPaths.forEach(onDeny)}
              disabled={!selectedPaths.length}
              className="inline-flex items-center gap-1 rounded-xl border border-gray-700 px-3 py-2 text-xs font-semibold text-gray-300 hover:border-rose-800 hover:bg-rose-950/30 hover:text-rose-300 disabled:opacity-40"
            >
              <Ban size={13} /> Deny selected
            </button>
            <button
              type="button"
              disabled={!selectedPaths.length}
              onClick={() => onApply(edits.filter((edit) => selectedPaths.includes(edit.path)))}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck size={14} />
              Allow selected
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
