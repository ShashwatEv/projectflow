import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { 
  Code2, GitBranch, FileCode, Save, RefreshCw, Key, 
  Loader2, Laptop, Sparkles, Bot, Send, X, Copy, Check, 
  GitPullRequest, Lock, FileDiff
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { askGeminiCodeAssistant } from '../../lib/geminiClient';
import { fetchBranches } from '../../lib/githubService';
import CodeStudioPRModal from '../components/CodeStudioPRModal';
import MonacoDiffModal from '../components/MonacoDiffModal';
import StudioTerminal from '../components/StudioTerminal';
import { useStudioPresence } from '../../lib/useStudioPresence';
import { dispatchAutomation } from '../../lib/automationTrigger';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const SUPER_ADMIN_EMAIL = 'shashwatop69@gmail.com';

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
  const navigate = useNavigate();
  const theme = useAccentTheme();
  const { user } = useAuth();

  const isSuperAdmin = user?.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase();
  const isVerified = Boolean(user?.is_verified || isSuperAdmin);

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

  // Branches & PR Modal
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [isPrModalOpen, setIsPrModalOpen] = useState<boolean>(false);

  // File tree and active file states
  const [files, setFiles] = useState<FileTreeItem[]>([]);
  const [activeFile, setActiveFile] = useState<string>('');
  const [activeFileContent, setActiveFileContent] = useState<string>(
    '// Select a file to view and edit'
  );
  const [originalShaContent, setOriginalShaContent] = useState<string>('');
  const [activeFileSha, setActiveFileSha] = useState<string>('');
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);
  const [loadingContent, setLoadingContent] = useState<boolean>(false);
  const [savingFile, setSavingFile] = useState<boolean>(false);

  // Diff Modal & Terminal States
  const [isDiffModalOpen, setIsDiffModalOpen] = useState<boolean>(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(true); // Default open to verify immediately

  // AI Assistant States
  const [showAiDrawer, setShowAiDrawer] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);

  // Real-time team presence
  const activePeers = useStudioPresence(selectedProjectId, activeFile);

  // 1. Fetch available projects
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

  // 2. Fetch branches when repo updates
  useEffect(() => {
    async function loadBranches() {
      if (!repoInput.includes('/')) return;
      try {
        const branchList = await fetchBranches(repoInput, githubToken);
        if (branchList && branchList.length > 0) {
          setBranches(branchList);
          const targetBranch = branchList.includes('main') ? 'main' : (branchList[0] || 'main');
          setSelectedBranch(targetBranch);
        } else {
          setBranches(['main']);
          setSelectedBranch('main');
        }
      } catch {
        setBranches(['main']);
        setSelectedBranch('main');
      }
    }
    loadBranches();
  }, [repoInput, githubToken]);

  // 3. Fetch Repository Tree
  const fetchRepoFiles = async (repoName: string, branchName: string) => {
    if (!repoName.includes('/') || !branchName) return;
    setLoadingFiles(true);
    setFiles([]);
    setActiveFile('');
    setActiveFileContent('// Select a file from the explorer on the left');
    setOriginalShaContent('');

    const [owner, repo] = repoName.split('/');

    try {
      const headers: Record<string, string> = {
        Accept: 'application/vnd.github.v3+json',
      };
      if (githubToken.trim()) {
        headers['Authorization'] = `token ${githubToken.trim()}`;
      }

      let res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${branchName}?recursive=1`,
        { headers }
      );

      if (res.status === 404 && branchName === 'main') {
        const fallbackRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`,
          { headers }
        );
        if (fallbackRes.ok) {
          res = fallbackRes;
          setSelectedBranch('master');
        }
      }

      if (!res.ok) {
        setLoadingFiles(false);
        return;
      }

      const data = await res.json();
      if (data.tree) {
        setFiles(data.tree.filter((item: FileTreeItem) => item.type === 'blob'));
        toast.success(`Connected to ${repoName} (${branchName})`);
      }
    } catch {
      // Handled silently
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (repoInput && selectedBranch) {
      fetchRepoFiles(repoInput, selectedBranch);
    }
  }, [repoInput, selectedBranch, githubToken]);

  // 4. Fetch file content
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
        setOriginalShaContent(decoded);
      }
    } catch {
      toast.error('Failed to read file content');
    } finally {
      setLoadingContent(false);
    }
  };

  const handleSaveToken = (val: string) => {
    setGithubToken(val);
    localStorage.setItem('pf_github_token', val);
    setShowTokenInput(false);
    toast.success('GitHub Token configured!');
  };

  const openInLocalVSCode = () => {
    if (!repoInput) return;
    const gitUrl = `https://github.com/${repoInput}.git`;
    window.location.href = `vscode://vscode.git/clone?url=${gitUrl}`;
    toast.info('Opening desktop VS Code...');
  };

  // Commit & Push
  const handleCommitAndPush = async () => {
    if (!isVerified) {
      toast.error('Identity Verification Required', {
        description: 'Please verify your email address to commit and push code changes directly to GitHub repositories.',
        action: {
          label: 'Verify Now',
          onClick: () => navigate('/settings'),
        },
      });
      return;
    }

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
            branch: selectedBranch,
            sha: activeFileSha,
          }),
        }
      );

      const resData = await res.json();
      if (res.ok) {
        toast.success(`Committed & pushed ${activeFile}!`);
        if (resData.content?.sha) {
          setActiveFileSha(resData.content.sha);
          setOriginalShaContent(activeFileContent);
        }

        await dispatchAutomation({
          event: 'code_pushed',
          title: `Code Push: ${activeFile}`,
          description: `Committed changes to \`${activeFile}\` on branch \`${selectedBranch}\` in \`${repoInput}\`.`,
          user: localStorage.getItem('pf_user_name') || 'Team Member',
        });
      } else {
        toast.error(resData.message || 'Push failed');
      }
    } catch {
      toast.error('Failed to commit changes');
    } finally {
      setSavingFile(false);
    }
  };

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
    <div className="flex flex-col h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] bg-[#0d1117] text-gray-200 overflow-hidden">
      {/* Top Studio Bar */}
      <div className="h-14 border-b border-gray-800 bg-[#161b22] px-4 flex items-center justify-between gap-3 shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <Code2 className="text-indigo-400" size={20} />
          <h2 className="font-bold text-sm text-white hidden md:block">Code Studio</h2>

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
          <div className="flex items-center gap-1.5 bg-[#0d1117] border border-gray-700 rounded-lg px-2 py-1">
            <input
              type="text"
              value={repoInput}
              onChange={(e) => {
                setRepoInput(e.target.value);
                localStorage.setItem('pf_active_repo', e.target.value);
              }}
              placeholder="owner/repo"
              className="bg-transparent text-xs text-white outline-none w-32 sm:w-40 font-mono"
            />
          </div>

          {/* Branch Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#0d1117] border border-gray-700 rounded-lg px-2 py-1">
            <GitBranch size={13} className="text-indigo-400" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent text-xs text-gray-300 outline-none font-mono cursor-pointer"
            >
              {branches.map((b) => (
                <option key={b} value={b} className="bg-[#161b22] text-white">
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Review Diff Button */}
          <button
            onClick={() => setIsDiffModalOpen(true)}
            disabled={!activeFile}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-purple-400 border border-gray-700 text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
            title="Inspect Monaco Diff against remote base"
          >
            <FileDiff size={13} />
            <span className="hidden sm:inline">Review Diff</span>
          </button>

          {/* Create PR Button */}
          <button
            onClick={() => {
              if (!isVerified) {
                toast.error('Identity Verification Required', {
                  description: 'Please verify your email address to open pull requests.',
                  action: {
                    label: 'Verify Now',
                    onClick: () => navigate('/settings'),
                  },
                });
                return;
              }
              setIsPrModalOpen(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 text-xs font-semibold transition-all active:scale-95"
            title="Create Pull Request"
          >
            <GitPullRequest size={13} className="text-indigo-400" />
            <span className="hidden sm:inline">Open PR</span>
            {!isVerified && <Lock size={11} className="opacity-70 ml-0.5" />}
          </button>

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
            <span className="hidden sm:inline">AI Assist</span>
          </button>

          {/* Local VS Code Deep Link */}
          <button
            onClick={openInLocalVSCode}
            title="Open repository in desktop VS Code"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-all active:scale-95"
          >
            <Laptop size={14} />
            <span className="hidden lg:inline">Open in VS Code</span>
          </button>

          {/* Commit & Push Button */}
          <button
            onClick={handleCommitAndPush}
            disabled={savingFile || !activeFile}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 active:scale-95"
            title={!isVerified ? 'Verification required to commit & push changes' : 'Commit & push file'}
          >
            {savingFile ? (
              <Loader2 size={14} className="animate-spin" />
            ) : !isVerified ? (
              <Lock size={13} />
            ) : (
              <Save size={14} />
            )}
            <span>Push</span>
          </button>

          {/* Token Toggle Button */}
          <button
            onClick={() => setShowTokenInput(!showTokenInput)}
            title="Configure GitHub Personal Access Token"
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
        <div className="bg-[#1f242c] border-b border-gray-700 px-4 py-3 flex items-center justify-between gap-4 text-xs shrink-0">
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
            Required for pushing commits, branches, and 5,000 req/hr rate limits.
          </span>
        </div>
      )}

      {/* Main Studio Area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* File Explorer Sidebar */}
        <div className="w-56 md:w-64 bg-[#161b22] border-r border-gray-800 flex flex-col shrink-0 min-h-0">
          <div className="p-3 border-b border-gray-800 flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0">
            <span>Files ({files.length})</span>
            <button onClick={() => fetchRepoFiles(repoInput, selectedBranch)} className="hover:text-white">
              <RefreshCw size={13} className={loadingFiles ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar text-xs min-h-0">
            {loadingFiles ? (
              <div className="p-8 text-center text-gray-400">
                <Loader2 className="animate-spin mx-auto mb-2 text-indigo-400" size={20} />
                <span>Loading tree...</span>
              </div>
            ) : files.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-xs">
                {selectedBranch ? `No files found on branch ${selectedBranch}.` : 'Select a branch to explore files.'}
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
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Monaco Editor + Bottom Terminal Canvas */}
          <div className="flex-1 flex flex-col bg-[#0d1117] min-h-0 overflow-hidden">
            {/* Active File Bar */}
            <div className="h-9 bg-[#0d1117] border-b border-gray-800 px-4 flex items-center justify-between text-xs shrink-0">
              <span className="font-mono text-gray-400">{activeFile || 'No file selected'}</span>
              
              <div className="flex items-center gap-3">
                {loadingContent && (
                  <span className="text-indigo-400 flex items-center gap-1 text-[11px]">
                    <Loader2 size={12} className="animate-spin" /> Loading...
                  </span>
                )}

                {activeFile && (
                  <div className="flex items-center gap-1">
                    {activePeers
                      .filter((p) => p.activeFile === activeFile)
                      .map((peer, i) => (
                        <span
                          key={i}
                          title={`${peer.name} is looking at this file`}
                          className="w-5 h-5 rounded-full bg-indigo-600/40 border border-indigo-400 text-[10px] font-bold text-indigo-200 flex items-center justify-center uppercase cursor-default"
                        >
                          {peer.name?.charAt(0) || 'D'}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Monaco Editor Container */}
            <div className="flex-1 min-h-0 relative overflow-hidden">
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

            {/* In-Studio Terminal Sandbox Bar (Fixed at bottom) */}
            <StudioTerminal
              isOpen={isTerminalOpen}
              onToggle={() => setIsTerminalOpen(!isTerminalOpen)}
              activeCode={activeFileContent}
            />
          </div>

          {/* AI Code Assistant Drawer */}
          {showAiDrawer && (
            <div className="w-80 md:w-96 bg-[#161b22] border-l border-gray-800 flex flex-col shrink-0 min-h-0">
              <div className="p-3 border-b border-gray-800 flex items-center justify-between shrink-0">
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

              {/* Quick Prompt Action Chips */}
              <div className="p-2 border-b border-gray-800 flex flex-wrap gap-1.5 bg-[#0d1117]/50 shrink-0">
                <button
                  onClick={() => {
                    const prompt = 'Find any potential bugs, unhandled null checks, or edge cases in this code.';
                    setAiPrompt(prompt);
                    handleAskAi(undefined, prompt);
                  }}
                  className="px-2 py-0.5 rounded text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                >
                  Find Bugs
                </button>
                <button
                  onClick={() => {
                    const prompt = 'Add clean TypeScript types and JSDoc comments to this code.';
                    setAiPrompt(prompt);
                    handleAskAi(undefined, prompt);
                  }}
                  className="px-2 py-0.5 rounded text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                >
                  Add Docs
                </button>
                <button
                  onClick={() => {
                    const prompt = 'Optimize this file for cleaner performance and modern best practices.';
                    setAiPrompt(prompt);
                    handleAskAi(undefined, prompt);
                  }}
                  className="px-2 py-0.5 rounded text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                >
                  Optimize
                </button>
              </div>

              {/* AI Output Area */}
              <div className="flex-1 overflow-y-auto p-3 text-xs font-sans text-gray-300 space-y-3 custom-scrollbar min-h-0">
                {aiLoading ? (
                  <div className="p-8 text-center text-purple-400 space-y-2">
                    <Loader2 className="animate-spin mx-auto text-purple-400" size={24} />
                    <p className="text-xs text-gray-400">Analyzing code with pooled Gemini keys...</p>
                  </div>
                ) : aiResponse ? (
                  <div className="space-y-2">
                    <div className="bg-[#0d1117] p-3 rounded-xl border border-gray-800 text-[12px] whitespace-pre-wrap font-mono leading-relaxed select-text">
                      {aiResponse}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-16 px-4 text-xs">
                    Select a quick action above or type a question to inspect <span className="font-mono text-gray-400">{activeFile || 'this file'}</span>.
                  </div>
                )}
              </div>

              {/* Input Prompt Box */}
              <form onSubmit={handleAskAi} className="p-3 border-t border-gray-800 bg-[#161b22] flex gap-2 shrink-0">
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

      {/* Pull Request Creation Modal */}
      <CodeStudioPRModal
        isOpen={isPrModalOpen}
        onClose={() => setIsPrModalOpen(false)}
        repo={repoInput}
        token={githubToken}
        currentBranch={selectedBranch}
        defaultBaseBranch="main"
      />

      {/* Monaco Diff Modal */}
      <MonacoDiffModal
        isOpen={isDiffModalOpen}
        onClose={() => setIsDiffModalOpen(false)}
        filePath={activeFile}
        originalContent={originalShaContent}
        modifiedContent={activeFileContent}
        onConfirmPush={() => {
          setIsDiffModalOpen(false);
          handleCommitAndPush();
        }}
        isPushing={savingFile}
      />
    </div>
  );
}