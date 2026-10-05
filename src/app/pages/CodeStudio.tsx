import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor, { OnMount } from '@monaco-editor/react';
import { 
  Code2, GitBranch, FileCode, Save, RefreshCw, Key, 
  Loader2, Laptop, Sparkles, Bot, Send, X, Copy, Check, 
  GitPullRequest, Lock, Unlock, FileDiff, Users, User
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
import { recordAuditLog } from '../../lib/auditLogger';

const SUPER_ADMIN_EMAIL = 'shashwatop69@gmail.com';

interface Project {
  id: string;
  name: string;
  github_repo?: string;
  locked_file?: string | null;
  locked_by?: string | null;
}

interface FileTreeItem {
  path: string;
  type: 'tree' | 'blob';
  sha: string;
}

interface PeerCursor {
  userId: string;
  userName: string;
  lineNumber: number;
  column: number;
  file: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

// Build clean, authorized headers without sending invalid tokens
function getGitHubHeaders(token: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  const trimmed = token?.trim();
  if (trimmed && trimmed.length > 8 && trimmed !== 'undefined' && trimmed !== 'null') {
    headers['Authorization'] = trimmed.startsWith('github_pat_')
      ? `Bearer ${trimmed}`
      : `token ${trimmed}`;
  }
  return headers;
}

export default function CodeStudio() {
  const navigate = useNavigate();
  const theme = useAccentTheme();
  const { user } = useAuth();

  const isSuperAdmin = user?.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase();
  const isVerified = Boolean(user?.is_verified || isSuperAdmin);

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

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
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(true);

  // AI Assistant States (Multi-turn conversation transcript)
  const [showAiDrawer, setShowAiDrawer] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Real-time team presence & Cursors
  const activePeers = useStudioPresence(selectedProjectId, activeFile);
  const editorRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);
  const [peerCursors, setPeerCursors] = useState<Record<string, PeerCursor>>({});

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (showAiDrawer) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showAiDrawer]);

  // 1. Fetch available projects
  useEffect(() => {
    async function loadProjects() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setProjects(data);

        const savedProjectId = localStorage.getItem('pf_selected_project_id');
        const activeProj = data.find((p) => p.id === savedProjectId) || data[0];

        if (activeProj) {
          setSelectedProjectId(activeProj.id);
          setActiveProject(activeProj);
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

  // 2. Real-time Cursor Broadcast Listener
  useEffect(() => {
    if (!selectedProjectId) return;

    const cursorChannel = supabase
      .channel(`studio_cursor_${selectedProjectId}`)
      .on('broadcast', { event: 'cursor_move' }, (payload: any) => {
        const { userId, userName, lineNumber, column, file } = payload.payload;
        if (userId === user?.id) return;

        setPeerCursors((prev) => ({
          ...prev,
          [userId]: { userId, userName, lineNumber, column, file },
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(cursorChannel);
    };
  }, [selectedProjectId, user?.id]);

  // Render Monaco Remote Cursor Annotations
  useEffect(() => {
    if (!editorRef.current || !activeFile) return;

    const activeRemoteCursors = Object.values(peerCursors).filter(
      (c) => c.file === activeFile
    );

    const newDecorations = activeRemoteCursors.map((cursor) => ({
      range: {
        startLineNumber: cursor.lineNumber,
        startColumn: cursor.column,
        endLineNumber: cursor.lineNumber,
        endColumn: cursor.column + 1,
      },
      options: {
        className: 'bg-indigo-500/30 border-l-2 border-indigo-400',
        hoverMessage: { value: `**${cursor.userName}** is editing here` },
      },
    }));

    decorationsRef.current = editorRef.current.deltaDecorations(
      decorationsRef.current,
      newDecorations
    );
  }, [peerCursors, activeFile]);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;

    editor.onDidChangeCursorPosition((e) => {
      if (!selectedProjectId || !user?.id || !activeFile) return;

      supabase.channel(`studio_cursor_${selectedProjectId}`).send({
        type: 'broadcast',
        event: 'cursor_move',
        payload: {
          userId: user.id,
          userName: user.name || 'Team Member',
          lineNumber: e.position.lineNumber,
          column: e.position.column,
          file: activeFile,
        },
      });
    });
  };

  // 3. Fetch branches when repo updates
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

  // 4. Fetch Repository Tree with defensive headers
  const fetchRepoFiles = async (repoName: string, branchName: string) => {
    if (!repoName.includes('/') || !branchName) return;
    setLoadingFiles(true);
    setFiles([]);
    setActiveFile('');
    setActiveFileContent('// Select a file from the explorer on the left');
    setOriginalShaContent('');

    const [owner, repo] = repoName.split('/');

    try {
      const headers = getGitHubHeaders(githubToken);

      let res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${branchName}?recursive=1`,
        { headers }
      );

      // Branch fallback check (main -> master)
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

  // 5. Fetch file content
  const loadFileContent = async (item: FileTreeItem) => {
    setActiveFile(item.path);
    setActiveFileSha(item.sha);
    setLoadingContent(true);

    const [owner, repo] = repoInput.split('/');
    const headers = getGitHubHeaders(githubToken);

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

  // Toggle File Lease Lock
  const handleToggleFileLock = async () => {
    if (!selectedProjectId || !activeFile) return;

    const isCurrentlyLocked = activeProject?.locked_file === activeFile;
    const isLockedByMe = activeProject?.locked_by === user?.id;

    if (isCurrentlyLocked && !isLockedByMe && !isSuperAdmin) {
      toast.error('This file is locked by another engineer.');
      return;
    }

    try {
      const payload = isCurrentlyLocked
        ? { locked_file: null, locked_by: null, locked_at: null }
        : { locked_file: activeFile, locked_by: user?.id, locked_at: new Date().toISOString() };

      const { error } = await supabase
        .from('projects')
        .update(payload)
        .eq('id', selectedProjectId);

      if (error) throw error;

      setActiveProject((prev: any) => ({ ...prev, ...payload }));
      toast.success(isCurrentlyLocked ? 'File lock released' : 'File locked for review lease');
    } catch {
      toast.error('Failed to toggle file lease');
    }
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
            ...getGitHubHeaders(githubToken),
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

        await recordAuditLog(`Pushed commit to ${activeFile}`, 'integrations', {
          branch: selectedBranch,
          repo: repoInput,
        });

        await dispatchAutomation({
          event: 'code_pushed',
          title: `Code Push: ${activeFile}`,
          description: `Committed changes to \`${activeFile}\` on branch \`${selectedBranch}\` in \`${repoInput}\`.`,
          user: user?.name || 'Authenticated Member',
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

  // AI Assistant Handler with immediate user message render
  const handleAskAi = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = (customQuery || aiPrompt).trim();
    if (!query || aiLoading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: query,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setAiPrompt('');
    setAiLoading(true);

    try {
      const res = await askGeminiCodeAssistant(query, activeFileContent, activeFile);
      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'assistant',
        text: res,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      toast.error(err.message || 'AI request failed');
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'assistant',
        text: `⚠️ **Error**: ${err.message || 'Could not communicate with the model. Verify your API key and connection.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setAiLoading(false);
    }
  };

  const copyMessageText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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

  const isFileLockedByOther =
    Boolean(activeProject?.locked_file === activeFile) &&
    activeProject?.locked_by !== user?.id &&
    !isSuperAdmin;

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
              setActiveProject(proj || null);
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

          {/* Active Presence Peer Badges */}
          {activePeers.length > 0 && (
            <div className="hidden xl:flex items-center gap-1.5 pl-2 border-l border-gray-700">
              <Users size={13} className="text-emerald-400" />
              <div className="flex -space-x-1.5">
                {activePeers.slice(0, 3).map((peer: any, i: number) => (
                  <img
                    key={i}
                    src={peer.avatar || '/pfp.jpg'}
                    alt={peer.name}
                    title={`${peer.name} viewing ${peer.activeFile || 'project'}`}
                    className="w-5 h-5 rounded-full border border-gray-800 object-cover"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* File Lock Lease Toggle */}
          {activeFile && (
            <button
              onClick={handleToggleFileLock}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all active:scale-95 ${
                activeProject?.locked_file === activeFile
                  ? 'bg-amber-950/40 border-amber-800 text-amber-400'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
              }`}
              title={activeProject?.locked_file === activeFile ? 'Release file review lock' : 'Acquire lock lease for review'}
            >
              {activeProject?.locked_file === activeFile ? <Lock size={13} /> : <Unlock size={13} />}
              <span className="hidden sm:inline">
                {activeProject?.locked_file === activeFile ? 'Locked' : 'Lock Lease'}
              </span>
            </button>
          )}

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
            <span className="hidden lg:inline">VS Code</span>
          </button>

          {/* Commit & Push Button */}
          <button
            onClick={handleCommitAndPush}
            disabled={savingFile || !activeFile || isFileLockedByOther}
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
            Required for pushing commits, branches, and higher API rate limits.
          </span>
        </div>
      )}

      {/* Lock Lease Warning Ribbon */}
      {isFileLockedByOther && (
        <div className="bg-amber-950/60 border-b border-amber-800/80 px-4 py-2 flex items-center justify-between text-xs text-amber-300 font-medium">
          <div className="flex items-center gap-2">
            <Lock size={14} className="shrink-0" />
            <span>This file is currently checked out with a review lock. Buffer is in read-only mode.</span>
          </div>
        </div>
      )}

      {/* Main Studio Area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* File Explorer Sidebar */}
        <div className="w-56 md:w-64 bg-[#161b22] border-r border-gray-800 flex flex-col shrink-0 min-h-0">
          <div className="p-3 border-b border-gray-800 flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0">
            <span>Files ({files.length})</span>
            <button onClick={() => fetchRepoFiles(repoInput, selectedBranch)} className="hover:text-white" title="Refresh tree">
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
              files.map((file) => (
                <button
                  key={file.sha}
                  onClick={() => loadFileContent(file)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left truncate transition-colors ${
                    activeFile === file.path 
                      ? `${theme.bgSubtle} ${theme.textAccent} font-semibold border${theme.borderAccent}/30` 
                      : 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
                  }`}
                >
                  <FileCode size={14} className={activeFile === file.path ? theme.textAccent : 'text-gray-500'} />
                  <span className="truncate">{file.path}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Editor + Terminal Workspace */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <div className="flex-1 min-h-0 relative">
            {loadingContent ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d1117] z-10 space-y-2">
                <Loader2 size={24} className={`animate-spin ${theme.textAccent}`} />
                <span className="text-xs text-gray-400">Reading remote blob...</span>
              </div>
            ) : null}

            <Editor
              height="100%"
              theme="vs-dark"
              language={getLanguageFromPath(activeFile)}
              value={activeFileContent}
              onMount={handleEditorDidMount}
              onChange={(val) => setActiveFileContent(val || '')}
              options={{
                fontSize: 13,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                readOnly: isFileLockedByOther,
                tabSize: 2,
              }}
            />
          </div>

          {/* Interactive Sandboxed Terminal CLI */}
          <StudioTerminal
            isOpen={isTerminalOpen}
            onToggle={() => setIsTerminalOpen(!isTerminalOpen)}
            activeCode={activeFileContent}
            activeFilePath={activeFile}
          />
        </div>

        {/* AI Assistant Side Drawer with Full Chat Transcript */}
        {showAiDrawer && (
          <div className="w-80 md:w-96 bg-[#161b22] border-l border-gray-800 flex flex-col shrink-0 min-h-0 shadow-2xl animate-in slide-in-from-right-10 duration-200">
            {/* Drawer Header */}
            <div className="p-3.5 border-b border-gray-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
                <Bot size={16} />
                <span>Code Assistant</span>
              </div>
              <button onClick={() => setShowAiDrawer(false)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {/* Conversation Messages Viewport */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-0 text-xs">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-gray-500 space-y-2">
                  <Sparkles size={28} className="mx-auto text-purple-400/50" />
                  <p className="text-xs">Ask the assistant to refactor, write unit tests, or review architecture in {activeFile || 'the buffer'}.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot size={14} />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-[#0d1117] border border-gray-800 text-gray-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span className="font-bold text-[10px] opacity-75">
                          {msg.sender === 'user' ? 'You' : 'Assistant'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] opacity-50 font-mono">{msg.timestamp}</span>
                          {msg.sender === 'assistant' && (
                            <button
                              onClick={() => copyMessageText(msg.id, msg.text)}
                              className="opacity-60 hover:opacity-100 transition-opacity p-0.5"
                              title="Copy response"
                            >
                              {copiedId === msg.id ? (
                                <Check size={11} className="text-emerald-400" />
                              ) : (
                                <Copy size={11} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="whitespace-pre-wrap font-sans text-[11px] leading-relaxed">
                        {msg.text}
                      </div>
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-7 h-7 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0 mt-0.5 overflow-hidden">
                        {user?.avatar ? (
                          <img src={user.avatar} alt="You" className="w-full h-full object-cover" />
                        ) : (
                          <User size={13} className="text-gray-300" />
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}

              {aiLoading && (
                <div className="flex items-center gap-2 text-xs text-purple-400 py-1">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Thinking & analyzing context...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Prompt Input Form */}
            <form onSubmit={(e) => handleAskAi(e)} className="p-3 border-t border-gray-800 bg-[#0d1117] space-y-2 shrink-0">
              <div className="relative">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ask a technical question..."
                  className="w-full bg-[#161b22] border border-gray-800 rounded-xl pl-3 pr-10 py-2.5 text-xs text-white outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-purple-400 hover:text-purple-300 disabled:opacity-40"
                >
                  {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Monaco Diff Modal */}
      <MonacoDiffModal
        isOpen={isDiffModalOpen}
        onClose={() => setIsDiffModalOpen(false)}
        filePath={activeFile}
        originalContent={originalShaContent}
        modifiedContent={activeFileContent}
        onConfirmPush={handleCommitAndPush}
        isPushing={savingFile}
      />

      {/* Pull Request Creation Modal */}
      <CodeStudioPRModal
        isOpen={isPrModalOpen}
        onClose={() => setIsPrModalOpen(false)}
        repo={repoInput}
        token={githubToken}
        currentBranch={selectedBranch}
        defaultBaseBranch="main"
        activeFile={activeFile}
        activeFileContent={activeFileContent}
      />
    </div>
  );
}