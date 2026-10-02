import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Code2, GitBranch, FileCode, Save, RefreshCw, Key, 
  Loader2, Laptop, Sparkles, Bot, Send, X, Copy, Check
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { askGeminiCodeAssistant } from '../../lib/geminiClient';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  github_repo?: string;
}

interface FileTreeItem {
  path: string;
  type: 'tree' | 'blob';
  sha: string;
}

export default function CodeStudio() {
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Persisted state from localStorage
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    return localStorage.getItem('pf_selected_project_id') || '';
  });
  const [repoInput, setRepoInput] = useState<string>(() => {
    return localStorage.getItem('pf_active_repo') || '';
  });

  const [githubToken, setGithubToken] = useState<string>(
    localStorage.getItem('pf_github_token') || ''
  );
  const [showTokenInput, setShowTokenInput] = useState<boolean>(false);

  // File tree and active file states
  const [files, setFiles] = useState<FileTreeItem[]>([]);
  const [activeFile, setActiveFile] = useState<string>('');
  const [activeFileContent, setActiveFileContent] = useState<string>(
    '// Select a file to view and edit'
  );
  const [activeFileSha, setActiveFileSha] = useState<string>('');
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);
  const [loadingContent, setLoadingContent] = useState<boolean>(false);
  const [savingFile, setSavingFile] = useState<boolean>(false);

  // AI Assistant States
  const [showAiDrawer, setShowAiDrawer] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);

  // 1. Fetch available projects and load saved or first project's repo
  useEffect(() => {
    async function loadProjects() {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, github_repo')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setProjects(data);

        const savedProjectId = localStorage.getItem('pf_selected_project_id');
        const activeProj = data.find((p) => p.id === savedProjectId) || data[0];

        if (activeProj) {
          setSelectedProjectId(activeProj.id);
          localStorage.setItem('pf_selected_project_id', activeProj.id);

          const savedRepo = localStorage.getItem('pf_active_repo');
          const repoToUse = savedRepo || activeProj.github_repo || 'octocat/Hello-World';
          setRepoInput(repoToUse);
          localStorage.setItem('pf_active_repo', repoToUse);
        }
      }
    }

    loadProjects();
  }, []);

  // 2. Fetch Repository Tree from GitHub
  const fetchRepoFiles = async (repoName: string) => {
    if (!repoName.includes('/')) return;
    setLoadingFiles(true);
    setFiles([]);
    setActiveFile('');
    setActiveFileContent('// Select a file from the explorer on the left');

    const [owner, repo] = repoName.split('/');

    try {
      const headers: Record<string, string> = {
        Accept: 'application/vnd.github.v3+json',
      };
      if (githubToken.trim()) {
        headers['Authorization'] = `token ${githubToken.trim()}`;
      }

      // Try 'main' branch first
      let res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`,
        { headers }
      );
      let data = await res.json();

      // Fallback to 'master' if 'main' is not found
      if (res.status === 404) {
        res = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`,
          { headers }
        );
        data = await res.json();
      }

      if (data.tree) {
        setFiles(data.tree.filter((item: FileTreeItem) => item.type === 'blob'));
        toast.success(`Connected to ${repoName}`);
      } else {
        toast.error(data.message || 'Could not load repo files');
      }
    } catch {
      toast.error('Failed to load GitHub repository');
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (repoInput) {
      fetchRepoFiles(repoInput);
    }
  }, [repoInput, githubToken]);

  // 3. Fetch file content
  const loadFileContent = async (item: FileTreeItem) => {
    setActiveFile(item.path);
    setActiveFileSha(item.sha);
    setLoadingContent(true);

    const [owner, repo] = repoInput.split('/');
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    };
    if (githubToken.trim()) {
      headers['Authorization'] = `token ${githubToken.trim()}`;
    }

    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/blobs/${item.sha}`,
        { headers }
      );
      const data = await res.json();

      if (data.content) {
        const decoded = decodeURIComponent(
          escape(window.atob(data.content.replace(/\s/g, '')))
        );
        setActiveFileContent(decoded);
      }
    } catch {
      toast.error('Failed to read file content');
    } finally {
      setLoadingContent(false);
    }
  };

  // 4. Save Token Locally
  const handleSaveToken = (val: string) => {
    setGithubToken(val);
    localStorage.setItem('pf_github_token', val);
    setShowTokenInput(false);
    toast.success('GitHub Token configured!');
  };

  // 5. Open in Local Desktop VS Code
  const openInLocalVSCode = () => {
    if (!repoInput) return;
    const gitUrl = `https://github.com/${repoInput}.git`;
    window.location.href = `vscode://vscode.git/clone?url=${gitUrl}`;
    toast.info('Opening desktop VS Code...');
  };

  // 6. Push Commit to GitHub
  const handleCommitAndPush = async () => {
    if (!githubToken.trim()) {
      toast.error('Please configure a GitHub Token first to push changes');
      setShowTokenInput(true);
      return;
    }

    if (!activeFile) {
      toast.error('No file selected');
      return;
    }

    const [owner, repo] = repoInput.split('/');
    setSavingFile(true);

    try {
      const encodedContent = window.btoa(unescape(encodeURIComponent(activeFileContent)));
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${activeFile}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `token ${githubToken.trim()}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Update ${activeFile} via ProjectFlow Code Studio`,
            content: encodedContent,
            sha: activeFileSha,
          }),
        }
      );

      const resData = await res.json();
      if (res.ok) {
        toast.success(`Committed & pushed ${activeFile}! 🎉`);
        if (resData.content?.sha) {
          setActiveFileSha(resData.content.sha);
        }
      } else {
        toast.error(resData.message || 'Push failed');
      }
    } catch {
      toast.error('Failed to commit changes');
    } finally {
      setSavingFile(false);
    }
  };

  // 7. Ask AI Assistant
  const handleAskAi = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = customQuery || aiPrompt;
    if (!query.trim() || aiLoading) return;

    setAiLoading(true);
    setAiResponse('');
    try {
      const res = await askGeminiCodeAssistant(query, activeFileContent, activeFile);
      setAiResponse(res);
    } catch (err: any) {
      toast.error(err.message || 'AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  const copyAiResponse = () => {
    if (!aiResponse) return;
    navigator.clipboard.writeText(aiResponse);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
    toast.success('Copied to clipboard');
  };

  const getLanguageFromPath = (filePath: string) => {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) return 'typescript';
    if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) return 'javascript';
    if (filePath.endsWith('.css')) return 'css';
    if (filePath.endsWith('.html')) return 'html';
    if (filePath.endsWith('.json')) return 'json';
    if (filePath.endsWith('.py')) return 'python';
    if (filePath.endsWith('.rs')) return 'rust';
    if (filePath.endsWith('.md')) return 'markdown';
    return 'plaintext';
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-gray-200">
      {/* Top Studio Bar */}
      <div className="h-14 border-b border-gray-800 bg-[#161b22] px-4 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <Code2 className="text-indigo-400" size={20} />
          <h2 className="font-bold text-sm text-white hidden sm:block">Code Studio</h2>

          {/* Project Selector */}
          <select
            value={selectedProjectId}
            onChange={(e) => {
              const projId = e.target.value;
              const proj = projects.find((p) => p.id === projId);
              setSelectedProjectId(projId);
              localStorage.setItem('pf_selected_project_id', projId);

              if (proj?.github_repo) {
                setRepoInput(proj.github_repo);
                localStorage.setItem('pf_active_repo', proj.github_repo);
              }
            }}
            className="bg-[#0d1117] text-xs font-semibold text-gray-300 border border-gray-700 rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-500"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Repo Input */}
          <div className="flex items-center gap-1.5 bg-[#0d1117] border border-gray-700 rounded-lg px-2.5 py-1">
            <GitBranch size={13} className="text-gray-400" />
            <input
              type="text"
              value={repoInput}
              onChange={(e) => {
                setRepoInput(e.target.value);
                localStorage.setItem('pf_active_repo', e.target.value);
              }}
              placeholder="owner/repo"
              className="bg-transparent text-xs text-white outline-none w-36 sm:w-44 font-mono"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* AI Assist Button */}
          <button
            onClick={() => setShowAiDrawer(!showAiDrawer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all active:scale-95 ${
              showAiDrawer 
                ? 'bg-purple-600/30 border-purple-500 text-purple-300 shadow-sm shadow-purple-900/40' 
                : 'bg-purple-950/30 border-purple-800/80 text-purple-400 hover:bg-purple-900/30'
            }`}
          >
            <Sparkles size={14} />
            <span>AI Assist</span>
          </button>

          {/* Deep link: Open in Local Desktop VS Code */}
          <button
            onClick={openInLocalVSCode}
            title="Open repository in your local desktop VS Code"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-all active:scale-95"
          >
            <Laptop size={14} />
            <span className="hidden md:inline">Open in Local VS Code</span>
          </button>

          {/* Commit & Push Button */}
          <button
            onClick={handleCommitAndPush}
            disabled={savingFile || !activeFile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 active:scale-95"
          >
            {savingFile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Commit & Push</span>
          </button>

          {/* Token Toggle Button */}
          <button
            onClick={() => setShowTokenInput(!showTokenInput)}
            title="Configure GitHub Personal Access Token (5,000 req/hr)"
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              githubToken 
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' 
                : 'bg-amber-950/40 border-amber-800 text-amber-400 animate-pulse'
            }`}
          >
            <Key size={15} />
          </button>
        </div>
      </div>

      {/* GitHub Token Config Dropdown */}
      {showTokenInput && (
        <div className="bg-[#1f242c] border-b border-gray-700 px-4 py-3 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Key size={15} className="text-amber-400" />
            <span className="text-gray-300">GitHub Personal Access Token:</span>
            <input
              type="password"
              placeholder="ghp_xxxxxxxxxxxx"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              className="bg-[#0d1117] border border-gray-700 rounded-lg px-2.5 py-1 text-white font-mono w-64 outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => handleSaveToken(githubToken)}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg"
            >
              Save
            </button>
          </div>
          <span className="text-[11px] text-gray-400 hidden lg:inline">
            Required for pushing commits and 5,000 req/hr rate limit.
          </span>
        </div>
      )}

      {/* Main Studio Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* File Explorer Sidebar */}
        <div className="w-56 md:w-64 bg-[#161b22] border-r border-gray-800 flex flex-col shrink-0">
          <div className="p-3 border-b border-gray-800 flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
            <span>Files ({files.length})</span>
            <button onClick={() => fetchRepoFiles(repoInput)} className="hover:text-white">
              <RefreshCw size={13} className={loadingFiles ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar text-xs">
            {loadingFiles ? (
              <div className="p-8 text-center text-gray-400">
                <Loader2 className="animate-spin mx-auto mb-2 text-indigo-400" size={20} />
                <span>Loading repo...</span>
              </div>
            ) : files.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-xs">
                No files found. Check repository name.
              </div>
            ) : (
              files.map((file) => {
                const isSelected = activeFile === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => loadFileContent(file)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 truncate transition-colors font-mono text-[11px] ${
                      isSelected
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                        : 'text-gray-300 hover:bg-[#1f242c]'
                    }`}
                  >
                    <FileCode size={13} className="shrink-0 text-gray-400" />
                    <span className="truncate">{file.path}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Editor Center & AI Drawer */}
        <div className="flex-1 flex overflow-hidden">
          {/* Monaco Editor Area */}
          <div className="flex-1 flex flex-col bg-[#0d1117] overflow-hidden">
            {/* Active File Bar */}
            <div className="h-9 bg-[#0d1117] border-b border-gray-800 px-4 flex items-center justify-between text-xs">
              <span className="font-mono text-gray-400">{activeFile || 'No file selected'}</span>
              {loadingContent && (
                <span className="text-indigo-400 flex items-center gap-1">
                  <Loader2 size={12} className="animate-spin" /> Loading content...
                </span>
              )}
            </div>

            {/* Monaco Editor */}
            <div className="flex-1">
              <Editor
                height="100%"
                theme="vs-dark"
                language={getLanguageFromPath(activeFile)}
                value={activeFileContent}
                onChange={(val) => setActiveFileContent(val || '')}
                options={{
                  fontSize: 13,
                  minimap: { enabled: true },
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  automaticLayout: true,
                  tabSize: 2,
                }}
              />
            </div>
          </div>

          {/* AI Code Assistant Drawer */}
          {showAiDrawer && (
            <div className="w-80 md:w-96 bg-[#161b22] border-l border-gray-800 flex flex-col shrink-0">
              <div className="p-3 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-400">
                  <Bot size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">ProjectFlow AI</span>
                </div>
                <div className="flex items-center gap-1">
                  {aiResponse && (
                    <button
                      onClick={copyAiResponse}
                      title="Copy response"
                      className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                    >
                      {copiedResponse ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  )}
                  <button onClick={() => setShowAiDrawer(false)} className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white">
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Quick Prompt Chips */}
              <div className="p-2 border-b border-gray-800 flex flex-wrap gap-1.5 bg-[#0d1117]/50">
                <button
                  onClick={() => {
                    const prompt = 'Find any potential bugs, memory leaks, or unhandled edge cases in this code.';
                    setAiPrompt(prompt);
                    handleAskAi(undefined, prompt);
                  }}
                  className="px-2 py-0.5 rounded text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                >
                  🐞 Find Bugs
                </button>
                <button
                  onClick={() => {
                    const prompt = 'Add clear TypeScript types, JSDoc comments, and improve readability.';
                    setAiPrompt(prompt);
                    handleAskAi(undefined, prompt);
                  }}
                  className="px-2 py-0.5 rounded text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                >
                  📝 Add Docs & Types
                </button>
                <button
                  onClick={() => {
                    const prompt = 'Optimize this file for cleaner performance and modern best practices.';
                    setAiPrompt(prompt);
                    handleAskAi(undefined, prompt);
                  }}
                  className="px-2 py-0.5 rounded text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                >
                  ⚡ Optimize
                </button>
              </div>

              {/* AI Messages / Output Panel */}
              <div className="flex-1 overflow-y-auto p-3 text-xs font-sans text-gray-300 space-y-3 custom-scrollbar">
                {aiLoading ? (
                  <div className="p-8 text-center text-purple-400 space-y-2">
                    <Loader2 className="animate-spin mx-auto text-purple-400" size={24} />
                    <p className="text-xs text-gray-400">Analyzing code & rotating API pool...</p>
                  </div>
                ) : aiResponse ? (
                  <div className="space-y-2">
                    <div className="bg-[#0d1117] p-3 rounded-xl border border-gray-800 text-[12px] whitespace-pre-wrap font-mono leading-relaxed select-text">
                      {aiResponse}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-16 px-4 text-xs">
                    Select a quick action above or type a prompt below to analyze <span className="font-mono text-gray-400">{activeFile || 'current file'}</span>.
                  </div>
                )}
              </div>

              {/* Input Prompt Box */}
              <form onSubmit={handleAskAi} className="p-3 border-t border-gray-800 bg-[#161b22] flex gap-2">
                <input
                  type="text"
                  placeholder="Ask AI about this code..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="flex-1 bg-[#0d1117] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500 placeholder-gray-500"
                />
                <button
                  type="submit"
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="p-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl transition-all"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}