import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor, { OnMount } from '@monaco-editor/react';
import { 
  Code2, GitBranch, Workflow, FileCode, Save, RefreshCw, Key,
  Loader2, Laptop, Sparkles, Bot, Send, X, Copy, Check, 
  GitPullRequest, Lock, Unlock, FileDiff, Users, User,
  Plus, ArrowDownToLine, GitFork, WandSparkles, Search, ChevronDown, GripVertical,
  FilePlus2, FolderPlus, Trash2, RotateCcw
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { askGeminiCodeAssistant, generateCodeEdits, type ProposedCodeEdit } from '../../lib/geminiClient';
import { consumeTeamChatCodeHandoff, getPersonalOpenRouterKeyStorageKey } from '../../lib/teamChatCodeHandoff';
import { fetchBranches } from '../../lib/githubService';
import CodeStudioPRModal from '../components/CodeStudioPRModal';
import MonacoDiffModal from '../components/MonacoDiffModal';
import CodeEditReviewModal from '../components/CodeEditReviewModal';
import StudioTerminal from '../components/StudioTerminal';
import ProjectWorkflowCanvas from '../components/ProjectWorkflowCanvas';
import { useStudioPresence } from '../../lib/useStudioPresence';
import { dispatchAutomation } from '../../lib/automationTrigger';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'sonner';
import { recordAuditLog } from '../../lib/auditLogger';

import { isUserVerified, isSuperAdmin as checkIsSuperAdmin } from '../../lib/constants';

interface Project {
  id: string;
  name: string;
  owner_id?: string | null;
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

interface OpenTab {
  path: string;
  sha: string;
  content: string;
  originalContent: string;
  isDirty: boolean;
}

function isAssistantExcludedPath(path: string) {
  const filename = path.split('/').pop()?.toLowerCase() || '';
  return filename === '.env' || filename.startsWith('.env.');
}

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
  const { theme: colorMode } = useTheme();
  const { user, session } = useAuth();
  const workflowQuery = new URLSearchParams(window.location.search);
  const requestedWorkflowProject = workflowQuery.get('workflowProject');
  const isWorkflowViewLink = workflowQuery.get('workflowView') === '1';
  const hasTeamChatAssistantHandoff = workflowQuery.get('assistantHandoff') === '1';

  const isSuperAdmin = checkIsSuperAdmin(user?.email, user?.role);
  const isVerified = isUserVerified(user, session);
  const [studioMode, setStudioMode] = useState<'editor' | 'workflow'>(
    requestedWorkflowProject || isWorkflowViewLink ? 'workflow' : 'editor'
  );

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // Persisted state from localStorage
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    return requestedWorkflowProject || localStorage.getItem('pf_selected_project_id') || '';
  });
  const [repoInput, setRepoInput] = useState<string>(() => {
    return localStorage.getItem('pf_active_repo') || '';
  });
  const [githubToken, setGithubToken] = useState<string>(
    localStorage.getItem('pf_github_token') || ''
  );
  const [showTokenInput, setShowTokenInput] = useState<boolean>(false);

  // Dynamic Repository Owner Avatar
  const [repoOwnerAvatar, setRepoOwnerAvatar] = useState<string>('');

  // Branches & New Branch Modal
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [isPrModalOpen, setIsPrModalOpen] = useState<boolean>(false);
  const [showNewBranchModal, setShowNewBranchModal] = useState<boolean>(false);
  const [newBranchName, setNewBranchName] = useState<string>('');
  const [isCreatingBranch, setIsCreatingBranch] = useState<boolean>(false);

  // Multi-tab buffer state
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeFile, setActiveFile] = useState<string>('');

  // File tree states
  const [files, setFiles] = useState<FileTreeItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);
  const [loadingContent, setLoadingContent] = useState<boolean>(false);
  const [savingFile, setSavingFile] = useState<boolean>(false);
  const [fileAction, setFileAction] = useState<'new-file' | 'new-folder' | 'delete' | null>(null);
  const [fileActionPath, setFileActionPath] = useState('');
  const [pendingDeletes, setPendingDeletes] = useState<string[]>([]);
  const [pendingDeleteTarget, setPendingDeleteTarget] = useState<string | null>(null);
  const [pendingCreateTarget, setPendingCreateTarget] = useState<string | null>(null);
  const [isPushingDeletes, setIsPushingDeletes] = useState(false);

  // Diff Modal & Terminal States
  const [isDiffModalOpen, setIsDiffModalOpen] = useState<boolean>(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(true);

  // AI Assistant States
  const [showAiDrawer, setShowAiDrawer] = useState<boolean>(false);
  const [assistantWidth, setAssistantWidth] = useState(() => {
    if (typeof window === 'undefined') return 440;
    const savedWidth = Number(window.localStorage.getItem('codestudio-assistant-width'));
    return Number.isFinite(savedWidth) && savedWidth >= 320 ? Math.min(savedWidth, 720) : 440;
  });
  const [isResizingAssistant, setIsResizingAssistant] = useState(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [handoffCredentials, setHandoffCredentials] = useState<{ userId: string; apiKey: string } | null>(null);
  const [aiEditMode, setAiEditMode] = useState(false);
  const [contextPaths, setContextPaths] = useState<string[]>([]);
  const [contextSearch, setContextSearch] = useState('');
  const [isContextPickerOpen, setIsContextPickerOpen] = useState(true);
  const [editProposal, setEditProposal] = useState<{
    summary: string;
    edits: ProposedCodeEdit[];
    repo: string;
    branch: string;
  } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasTeamChatAssistantHandoff || !user?.id) return;
    const handoff = consumeTeamChatCodeHandoff(user.id);
    if (handoff) {
      setShowAiDrawer(true);
      setAiEditMode(true);
      setAiPrompt(handoff.prompt);
      setHandoffCredentials({ userId: handoff.userId, apiKey: handoff.apiKey });
    } else {
      toast.error('The Code Studio assistant request expired. Please retry from team chat.');
    }

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete('assistantHandoff');
    window.history.replaceState(window.history.state, '', `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
  }, [hasTeamChatAssistantHandoff, user?.id]);

  useEffect(() => {
    if (!isResizingAssistant) return;
    const updateWidth = (event: PointerEvent) => {
      const maxWidth = Math.max(320, Math.min(720, window.innerWidth * 0.7));
      setAssistantWidth(Math.min(maxWidth, Math.max(320, window.innerWidth - event.clientX)));
    };
    const stopResizing = () => setIsResizingAssistant(false);
    window.addEventListener('pointermove', updateWidth);
    window.addEventListener('pointerup', stopResizing, { once: true });
    return () => {
      window.removeEventListener('pointermove', updateWidth);
      window.removeEventListener('pointerup', stopResizing);
    };
  }, [isResizingAssistant]);

  useEffect(() => {
    window.localStorage.setItem('codestudio-assistant-width', String(assistantWidth));
  }, [assistantWidth]);

  // Real-time team presence & Cursors
  const activePeers = useStudioPresence(selectedProjectId, activeFile);
  const editorRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);
  const [peerCursors, setPeerCursors] = useState<Record<string, PeerCursor>>({});

  // Active tab convenience lookup
  const activeTab = openTabs.find((t) => t.path === activeFile);
  const activeFileContent = activeTab ? activeTab.content : '// Select a file from the explorer on the left';
  const originalShaContent = activeTab ? activeTab.originalContent : '';
  const activeFileSha = activeTab ? activeTab.sha : '';
  const filteredContextFiles = files
    .filter((file) => !isAssistantExcludedPath(file.path))
    .filter((file) => file.path.toLowerCase().includes(contextSearch.trim().toLowerCase()))
    .slice(0, 100);
  const repositoryFolders = [...new Set(files.flatMap((file) => {
    const segments = file.path.split('/');
    return segments.slice(0, -1).map((_, index) => segments.slice(0, index + 1).join('/'));
  }))].sort();

  useEffect(() => {
    if (activeFile && !contextPaths.length) setContextPaths([activeFile]);
  }, [activeFile, contextPaths.length]);

  // Resolve Repository Owner GitHub Avatar dynamically
  useEffect(() => {
    if (repoInput && repoInput.includes('/')) {
      const owner = repoInput.split('/')[0]?.trim();
      if (owner) {
        setRepoOwnerAvatar(`https://github.com/${owner}.png`);
      } else {
        setRepoOwnerAvatar('');
      }
    } else {
      setRepoOwnerAvatar('');
    }
  }, [repoInput]);

  // Auto-scroll chat transcript to bottom
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

        const savedProjectId = requestedWorkflowProject || localStorage.getItem('pf_selected_project_id');
        const activeProj = data.find((p) => p.id === savedProjectId) || (requestedWorkflowProject ? undefined : data[0]);

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
  }, [requestedWorkflowProject]);

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

    editor.onDidChangeCursorPosition((e: any) => {
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
  const loadBranches = async () => {
    if (!repoInput.includes('/')) return;
    try {
      const branchList = await fetchBranches(repoInput, githubToken);
      if (branchList && branchList.length > 0) {
        setBranches(branchList);
        if (!selectedBranch || !branchList.includes(selectedBranch)) {
          const targetBranch = branchList.includes('main') ? 'main' : (branchList[0] || 'main');
          setSelectedBranch(targetBranch);
        }
      } else {
        setBranches(['main']);
        setSelectedBranch('main');
      }
    } catch {
      setBranches(['main']);
      setSelectedBranch('main');
    }
  };

  useEffect(() => {
    loadBranches();
  }, [repoInput, githubToken]);

  // 4. Fetch Repository Tree with defensive headers
  const fetchRepoFiles = async (repoName: string, branchName: string) => {
    if (!repoName.includes('/') || !branchName) return;
    setLoadingFiles(true);
    setFiles([]);

    const [owner, repo] = repoName.split('/');

    try {
      const headers = getGitHubHeaders(githubToken);

      let res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${branchName}?recursive=1`,
        { headers }
      );

      // Fallback check (main -> master)
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

  // 5. Open / Load File Content into Multi-Tab System
  const loadFileContent = async (item: FileTreeItem) => {
    // If file is already open in tabs, just switch to it
    const existing = openTabs.find((t) => t.path === item.path);
    if (existing) {
      setActiveFile(existing.path);
      return;
    }

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

        const newTab: OpenTab = {
          path: item.path,
          sha: item.sha,
          content: decoded,
          originalContent: decoded,
          isDirty: false,
        };

        setOpenTabs((prev) => [...prev, newTab]);
        setActiveFile(item.path);
      }
    } catch {
      toast.error('Failed to read file content');
    } finally {
      setLoadingContent(false);
    }
  };

  const handleCreateWorkspacePath = (event: React.FormEvent) => {
    event.preventDefault();
    const target = `${repoInput}@${selectedBranch}`;
    if (pendingCreateTarget && pendingCreateTarget !== target) {
      toast.error('Finish or remove your locally created files on the original repository and branch first.');
      return;
    }
    const rawPath = fileActionPath.trim();
    const path = rawPath.replace(/\/+$/, '');
    if (!path || path.startsWith('/') || path.includes('\\') || path.split('/').some((part) => !part || part === '.' || part === '..')) {
      toast.error('Enter a valid repository-relative path.');
      return;
    }

    const targetPath = fileAction === 'new-folder' ? `${path}/.gitkeep` : path;
    if (isAssistantExcludedPath(targetPath)) {
      toast.error('Environment files cannot be created in Code Studio.');
      return;
    }
    if (files.some((file) => file.path === targetPath) || openTabs.some((tab) => tab.path === targetPath)) {
      toast.error(`${targetPath} already exists in this workspace.`);
      return;
    }

    setOpenTabs((current) => [...current, {
      path: targetPath,
      sha: '',
      content: '',
      originalContent: '',
      isDirty: true,
    }]);
    setPendingCreateTarget(target);
    setFiles((current) => [...current, { path: targetPath, type: 'blob' as const, sha: '' }].sort((a, b) => a.path.localeCompare(b.path)));
    setActiveFile(targetPath);
    setFileAction(null);
    setFileActionPath('');
    toast.success(fileAction === 'new-folder'
      ? `Folder staged with ${targetPath} placeholder. Push the file to create it on GitHub.`
      : `New file staged: ${targetPath}`);
  };

  const handleStageDelete = (event: React.FormEvent) => {
    event.preventDefault();
    const target = `${repoInput}@${selectedBranch}`;
    if (pendingDeleteTarget && pendingDeleteTarget !== target) {
      toast.error('Push or undo staged deletions on the original repository and branch first.');
      return;
    }
    const [kind, ...pathSegments] = fileActionPath.split(':');
    const targetPath = pathSegments.join(':');
    if (!targetPath || (kind !== 'file' && kind !== 'folder')) {
      toast.error('Choose a file or folder to delete.');
      return;
    }

    const targetFiles = kind === 'file'
      ? files.filter((file) => file.path === targetPath)
      : files.filter((file) => file.path.startsWith(`${targetPath}/`));
    if (!targetFiles.length) {
      toast.error('That path does not contain any tracked files.');
      return;
    }
    const localOnly = targetFiles.filter((file) => !file.sha).map((file) => file.path);
    const paths = targetFiles.filter((file) => file.sha && !pendingDeletes.includes(file.path)).map((file) => file.path);
    if (activeProject?.locked_file && paths.includes(activeProject.locked_file) && activeProject.locked_by !== user?.id && !isSuperAdmin) {
      toast.error('Cannot delete a file locked by another engineer.');
      return;
    }

    const removedSet = new Set([...paths, ...localOnly]);
    const dirtyPaths = openTabs.filter((tab) => tab.isDirty && removedSet.has(tab.path));
    if (dirtyPaths.length && !window.confirm(`Stage deletion and discard unsaved changes in ${dirtyPaths.length} file${dirtyPaths.length === 1 ? '' : 's'}?\n\n${dirtyPaths.map((tab) => tab.path).join('\n')}`)) {
      return;
    }
    setPendingDeletes((current) => [...new Set([...current, ...paths])]);
    if (paths.length) setPendingDeleteTarget(target);
    if (pendingCreateTarget === target && !openTabs.some((tab) => !removedSet.has(tab.path) && !tab.sha)) {
      setPendingCreateTarget(null);
    }
    setFiles((current) => current.filter((file) => !localOnly.includes(file.path)));
    setOpenTabs((current) => current.filter((tab) => !removedSet.has(tab.path)));
    if (removedSet.has(activeFile)) {
      setActiveFile(openTabs.find((tab) => !removedSet.has(tab.path))?.path || '');
    }
    setFileAction(null);
    setFileActionPath('');
    if (paths.length) {
      toast.success(`${paths.length} tracked file${paths.length === 1 ? '' : 's'} staged for deletion. Push staged deletes to apply them.`);
    } else {
      toast.success('Removed the locally staged path.');
    }
  };

  const handlePushStagedDeletes = async () => {
    if (!pendingDeletes.length || isPushingDeletes) return;
    if (pendingDeleteTarget !== `${repoInput}@${selectedBranch}`) {
      toast.error('Switch back to the repository and branch where these deletions were staged.');
      return;
    }
    if (!isVerified) {
      toast.error('Identity verification is required to push deletions.');
      return;
    }
    if (!githubToken.trim()) {
      toast.error('Configure a GitHub token before pushing deletions.');
      setShowTokenInput(true);
      return;
    }
    const [owner, repo] = repoInput.split('/');
    if (!owner || !repo || !selectedBranch) {
      toast.error('Connect a repository and branch before pushing deletions.');
      return;
    }

    setIsPushingDeletes(true);
    const headers = { ...getGitHubHeaders(githubToken), 'Content-Type': 'application/json' };
    const apiRoot = `https://api.github.com/repos/${owner}/${repo}`;
    const request = async (url: string, method: string, body?: object) => {
      const response = await fetch(url, {
        method,
        headers,
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || `GitHub request failed (${response.status}).`);
      return result;
    };

    try {
      const ref = await request(`${apiRoot}/git/ref/heads/${encodeURIComponent(selectedBranch)}`, 'GET');
      const commit = await request(`${apiRoot}/git/commits/${ref.object.sha}`, 'GET');
      const tree = await request(`${apiRoot}/git/trees`, 'POST', {
        base_tree: commit.tree.sha,
        tree: [...new Set(pendingDeletes)].map((path) => ({
          path,
          mode: '100644',
          type: 'blob',
          sha: null,
        })),
      });
      const nextCommit = await request(`${apiRoot}/git/commits`, 'POST', {
        message: `Delete ${pendingDeletes.length} file${pendingDeletes.length === 1 ? '' : 's'} via ProjectFlow Code Studio`,
        tree: tree.sha,
        parents: [ref.object.sha],
      });
      await request(`${apiRoot}/git/refs/heads/${encodeURIComponent(selectedBranch)}`, 'PATCH', {
        sha: nextCommit.sha,
      });

      const deletedPaths = new Set(pendingDeletes);
      setFiles((current) => current.filter((file) => !deletedPaths.has(file.path)));
      setOpenTabs((current) => current.filter((tab) => !deletedPaths.has(tab.path)));
      setPendingDeletes([]);
      setPendingDeleteTarget(null);
      toast.success(`Pushed deletion of ${deletedPaths.size} file${deletedPaths.size === 1 ? '' : 's'}.`);
      await recordAuditLog(`Pushed deletion of ${deletedPaths.size} Code Studio files`, 'integrations', {
        branch: selectedBranch,
        repo: repoInput,
        paths: [...deletedPaths],
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to push staged deletions.');
    } finally {
      setIsPushingDeletes(false);
    }
  };

  const handleUndoStagedDelete = (path: string) => {
    const remaining = pendingDeletes.filter((pendingPath) => pendingPath !== path);
    setPendingDeletes(remaining);
    if (!remaining.length) setPendingDeleteTarget(null);
  };

  // Update content for currently active tab
  const handleContentChange = (newVal: string) => {
    setOpenTabs((prev) =>
      prev.map((t) => {
        if (t.path === activeFile) {
          return {
            ...t,
            content: newVal,
            isDirty: newVal !== t.originalContent,
          };
        }
        return t;
      })
    );
  };

  // Close Tab Handler
  const handleCloseTab = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    const tabToClose = openTabs.find((t) => t.path === path);
    if (tabToClose?.isDirty) {
      if (!confirm(`Discard unsaved changes in ${path}?`)) return;
    }

    const remaining = openTabs.filter((t) => t.path !== path);
    setOpenTabs(remaining);

    if (activeFile === path) {
      setActiveFile(remaining.length > 0 ? remaining[remaining.length - 1]!.path : '');
    }
  };

  // Branch Creation Directly on GitHub
  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    const branchClean = newBranchName.trim().replace(/\s+/g, '-');
    if (!branchClean) return;

    if (!isVerified) {
      toast.error('Identity Verification Required', {
        description: 'Please verify your email address in Settings to create branches directly on GitHub.',
        action: { label: 'Verify Now', onClick: () => navigate('/settings') },
      });
      return;
    }

    if (!githubToken.trim()) {
      toast.error('GitHub Personal Access Token required to branch.');
      setShowTokenInput(true);
      return;
    }

    setIsCreatingBranch(true);
    const [owner, repo] = repoInput.split('/');

    try {
      // 1. Get SHA of base branch
      const refRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${selectedBranch || 'main'}`,
        { headers: getGitHubHeaders(githubToken) }
      );

      if (!refRes.ok) throw new Error('Could not resolve base branch SHA.');
      const refData = await refRes.json();
      const baseSha = refData.object?.sha;

      // 2. Create new branch ref
      const createRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/refs`,
        {
          method: 'POST',
          headers: {
            ...getGitHubHeaders(githubToken),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ref: `refs/heads/${branchClean}`,
            sha: baseSha,
          }),
        }
      );

      if (!createRes.ok) {
        const errJson = await createRes.json().catch(() => ({}));
        throw new Error(errJson.message || 'Branch creation rejected by GitHub');
      }

      toast.success(`Branch created: ${branchClean}`);
      setShowNewBranchModal(false);
      setNewBranchName('');
      await loadBranches();
      setSelectedBranch(branchClean);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create branch');
    } finally {
      setIsCreatingBranch(false);
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
    if (activeTab && !activeTab.sha && pendingCreateTarget !== `${repoInput}@${selectedBranch}`) {
      toast.error('Switch back to the repository and branch where this new file was created.');
      return;
    }
    if (!isVerified) {
      toast.error('Identity Verification Required', {
        description: 'Please verify your email address to commit and push code changes directly to GitHub repositories.',
        action: { label: 'Verify Now', onClick: () => navigate('/settings') },
      });
      return;
    }

    if (!githubToken.trim()) {
      toast.error('Please configure a GitHub Token first to push changes');
      setShowTokenInput(true);
      return;
    }

    if (!activeFile || !activeTab) {
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
            ...(activeFileSha ? { sha: activeFileSha } : {}),
          }),
        }
      );

      const resData = await res.json();
      if (res.ok) {
        toast.success(`Committed & pushed ${activeFile}!`);
        const newSha = resData.content?.sha || activeFileSha;

        // Reset dirty status on tab
        setOpenTabs((prev) =>
          prev.map((t) =>
            t.path === activeFile
              ? { ...t, sha: newSha, originalContent: t.content, isDirty: false }
              : t
          )
        );
        if (!activeFileSha && !openTabs.some((tab) => tab.path !== activeFile && !tab.sha)) {
          setPendingCreateTarget(null);
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
        if (!activeFileSha) {
          await fetchRepoFiles(repoInput, selectedBranch);
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

  // AI Assistant Chat Handler
  const handleAskAi = async (
    e?: React.FormEvent,
    customQuery?: string,
    contextOverride?: string[]
  ) => {
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
      if (aiEditMode) {
        const selectedPaths = [...new Set(contextOverride ?? contextPaths)].filter((path) => !isAssistantExcludedPath(path));
        if (!selectedPaths.length || selectedPaths.length > 5) {
          throw new Error('Choose between one and five tracked repository files for the edit.');
        }

        const contextFiles = await Promise.all(selectedPaths.map(async (path) => {
          const openTab = openTabs.find((tab) => tab.path === path);
          if (openTab) return { path, content: openTab.content };

          const treeItem = files.find((item) => item.path === path);
          if (!treeItem) throw new Error(`${path} is no longer in the loaded repository tree. Refresh files and retry.`);

          const [owner, repo] = repoInput.split('/');
          if (!owner || !repo) throw new Error('Connect a GitHub repository before requesting file edits.');
          const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/git/blobs/${treeItem.sha}`,
            { headers: getGitHubHeaders(githubToken) }
          );
          if (!response.ok) throw new Error(`Could not load ${path} from GitHub (${response.status}).`);
          const blob = await response.json();
          if (typeof blob.content !== 'string') throw new Error(`GitHub did not return file content for ${path}.`);
          const content = decodeURIComponent(escape(window.atob(blob.content.replace(/\s/g, ''))));
          return { path, content };
        }));

        const apiKey = (handoffCredentials?.userId === user?.id ? handoffCredentials?.apiKey || '' : '') || (
          user?.id ? localStorage.getItem(getPersonalOpenRouterKeyStorageKey(user.id)) || undefined : undefined
        );
        const proposal = await generateCodeEdits(query, contextFiles, apiKey);
        setEditProposal({ ...proposal, repo: repoInput, branch: selectedBranch });
        setMessages((prev) => [...prev, {
          id: crypto.randomUUID(),
          sender: 'assistant',
          text: `${proposal.summary}\n\n${proposal.edits.length} file${proposal.edits.length === 1 ? '' : 's'} proposed. Review the diff before applying any changes.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
        toast.success(`AI prepared ${proposal.edits.length} file change${proposal.edits.length === 1 ? '' : 's'} for review`);
        return;
      }

      const assistantFile = isAssistantExcludedPath(activeFile) ? '' : activeFile;
      const selectedCode = assistantFile ? editorRef.current?.getModel()?.getValueInRange(editorRef.current.getSelection()) : '';
      const assistantCode = selectedCode?.trim() ? selectedCode : assistantFile ? activeFileContent : '';
      const apiKey = (handoffCredentials?.userId === user?.id ? handoffCredentials?.apiKey || '' : '') || (
        user?.id ? localStorage.getItem(getPersonalOpenRouterKeyStorageKey(user.id)) || undefined : undefined
      );
      const res = await askGeminiCodeAssistant(query, assistantCode, assistantFile, apiKey);
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
        text: `⚠️ **Error**: ${err.message || 'Could not communicate with the model.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAiEdits = (edits: ProposedCodeEdit[]): boolean => {
    if (edits.some((edit) => isAssistantExcludedPath(edit.path))) {
      toast.error('The assistant cannot edit environment files.');
      return false;
    }
    const missingFiles = edits.filter((edit) => !files.some((file) => file.path === edit.path));
    if (missingFiles.length) {
      toast.error('The repository tree changed. Refresh files and generate the edit again.');
      return false;
    }

    const lockedPaths = edits.filter((edit) =>
      activeProject?.locked_file === edit.path &&
      activeProject.locked_by !== user?.id &&
      !isSuperAdmin
    );
    if (lockedPaths.length) {
      toast.error(`Cannot edit files locked by another engineer: ${lockedPaths.map((edit) => edit.path).join(', ')}`);
      return false;
    }

    setOpenTabs((currentTabs) => {
      const nextTabs = [...currentTabs];
      edits.forEach((edit) => {
        const existingIndex = nextTabs.findIndex((tab) => tab.path === edit.path);
        const treeItem = files.find((item) => item.path === edit.path);
        if (!treeItem) return;
        if (existingIndex >= 0) {
          const currentTab = nextTabs[existingIndex];
          if (currentTab) {
            nextTabs[existingIndex] = {
              ...currentTab,
              content: edit.content,
              isDirty: edit.content !== currentTab.originalContent,
            };
          }
        } else {
          nextTabs.push({
            path: edit.path,
            sha: treeItem.sha,
            content: edit.content,
            originalContent: edit.originalContent,
            isDirty: edit.content !== edit.originalContent,
          });
        }
      });
      return nextTabs;
    });

    const nextActiveFile = edits[0]?.path;
    if (nextActiveFile) setActiveFile(nextActiveFile);
    toast.success('Reviewed AI edits applied to local Code Studio buffers. Use Review Diff before pushing.');
    return true;
  };

  // Apply snippet directly into Monaco Editor buffer
  const handleApplySnippetToEditor = (rawSnippet: string) => {
    if (isAssistantExcludedPath(activeFile)) {
      toast.error('The assistant cannot edit environment files.');
      return;
    }
    if (!editorRef.current) {
      toast.error('Editor is not mounted');
      return;
    }

    // Strip markdown code fences if present
    const cleanSnippet = rawSnippet.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');

    const selection = editorRef.current.getSelection();
    editorRef.current.executeEdits('ai-assistant', [
      {
        range: selection,
        text: cleanSnippet,
        forceMoveMarkers: true,
      },
    ]);

    // Update active tab content state immediately
    const updated = editorRef.current.getValue();
    handleContentChange(updated);
    toast.success('Applied snippet to editor buffer!');
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
    <div className="code-studio-page flex flex-col h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] bg-[#0d1117] text-gray-200 overflow-hidden" data-theme={colorMode}>
      {/* Top Studio Bar */}
      <div className="code-studio-topbar h-14 border-b border-gray-800 bg-[#161b22] px-4 flex items-center justify-between gap-3 shrink-0 z-10">
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

          <div className="flex items-center rounded-lg border border-gray-700 bg-[#0d1117] p-0.5">
            <button
              type="button"
              onClick={() => setStudioMode('editor')}
              className={`rounded-md px-2 py-1 text-[11px] font-semibold transition-colors ${
                studioMode === 'editor' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Code
            </button>
            <button
              type="button"
              onClick={() => setStudioMode('workflow')}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors ${
                studioMode === 'workflow' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Workflow size={12} /> Workflow
            </button>
          </div>

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

          {/* Branch Selector Dropdown & New Branch Trigger */}
          <div className="flex items-center gap-1 bg-[#0d1117] border border-gray-700 rounded-lg px-2 py-1">
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
            <button
              onClick={() => setShowNewBranchModal(true)}
              title="Create new branch from current base"
              className="p-1 hover:text-white text-gray-400 hover:bg-gray-800 rounded transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Active Repository Owner Avatar & Collaborator Presence */}
          <div className="flex items-center gap-2 pl-2.5 border-l border-gray-700/80">
            {repoOwnerAvatar ? (
              <a
                href={`https://github.com/${repoInput.split('/')[0]}`}
                target="_blank"
                rel="noreferrer"
                title={`Repository Owner: ${repoInput.split('/')[0]}`}
                className="relative group block"
              >
                <img
                  src={repoOwnerAvatar}
                  alt={repoInput.split('/')[0]}
                  onError={(e) => {
                    e.currentTarget.src = user?.avatar || '/pfp.jpg';
                  }}
                  className="w-6 h-6 rounded-full border border-gray-700 object-cover ring-1 ring-emerald-500/40 hover:ring-emerald-400 transition-all shadow-xs"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-[#161b22]" />
              </a>
            ) : (
              <img
                src={user?.avatar || '/pfp.jpg'}
                alt="Profile"
                className="w-6 h-6 rounded-full border border-gray-700 object-cover"
              />
            )}

            {/* Active Collaborators */}
            {activePeers.length > 0 && (
              <div className="hidden xl:flex items-center gap-1.5 pl-1.5 border-l border-gray-700/60">
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
                  action: { label: 'Verify Now', onClick: () => navigate('/settings') },
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
            Required for pushing commits, creating branches, and higher API rate limits.
          </span>
        </div>
      )}

      {/* New Branch Modal */}
      {showNewBranchModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-gray-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <GitFork size={16} />
                <span>Create New Branch</span>
              </div>
              <button onClick={() => setShowNewBranchModal(false)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Branching from <strong className="text-white font-mono">{selectedBranch}</strong> in <strong className="text-white font-mono">{repoInput}</strong>.
            </p>

            <form onSubmit={handleCreateBranch} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Branch Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="feature/auth-pipeline"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="w-full bg-[#0d1117] border border-gray-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewBranchModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingBranch || !newBranchName.trim()}
                  className={`px-5 py-2 rounded-xl ${theme.btnPrimary} font-bold text-white flex items-center gap-1.5 disabled:opacity-50`}
                >
                  {isCreatingBranch && <Loader2 size={13} className="animate-spin" />}
                  <span>Create & Checkout</span>
                </button>
              </div>
            </form>
          </div>
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
      {studioMode === 'workflow' ? (
        <ProjectWorkflowCanvas
          projectId={selectedProjectId || null}
          projectName={activeProject?.name}
          projectOwnerId={activeProject?.owner_id}
          currentUserId={user?.id}
          isAdmin={isSuperAdmin}
          forceReadOnly={isWorkflowViewLink}
        />
      ) : (
      <div className="code-studio-workspace flex flex-1 min-h-0 overflow-hidden" data-theme={colorMode}>
        {fileAction && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="studio-file-action-title"
              className="w-full max-w-md rounded-2xl border border-gray-700 bg-[#161b22] p-5 shadow-2xl"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 id="studio-file-action-title" className="text-sm font-bold text-white">
                    {fileAction === 'new-file' ? 'Create file' : fileAction === 'new-folder' ? 'Create folder' : 'Delete file or folder'}
                  </h2>
                  <p className="mt-1 text-[11px] leading-relaxed text-gray-400">
                    {fileAction === 'new-file'
                      ? 'New files open as local buffers. Use Push to create them on the selected branch.'
                      : fileAction === 'new-folder'
                        ? 'GitHub stores files, not empty folders. A .gitkeep placeholder will be created for this folder.'
                        : 'This only stages the deletion locally. Push staged deletions to create one GitHub commit.'}
                  </p>
                </div>
                <button type="button" onClick={() => setFileAction(null)} aria-label="Close file actions" className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white">
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={fileAction === 'delete' ? handleStageDelete : handleCreateWorkspacePath} className="space-y-4">
                {fileAction === 'delete' ? (
                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-semibold text-gray-300">Tracked path</span>
                    <select
                      value={fileActionPath}
                      onChange={(event) => setFileActionPath(event.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-700 bg-[#0d1117] px-3 py-2 text-xs text-gray-200 outline-none focus:border-rose-500"
                    >
                      <option value="">Choose file or folder…</option>
                      {files.filter((file) => !pendingDeletes.includes(file.path)).map((file) => (
                        <option key={`file:${file.path}`} value={`file:${file.path}`}>File: {file.path}</option>
                      ))}
                      {repositoryFolders.map((folder) => {
                        const count = files.filter((file) => file.path.startsWith(`${folder}/`) && !pendingDeletes.includes(file.path)).length;
                        if (!count) return null;
                        return <option key={`folder:${folder}`} value={`folder:${folder}`}>Folder: {folder} ({count} files)</option>;
                      })}
                    </select>
                    <span className="block text-[10px] text-rose-300/80">
                      Deleting a folder stages all {fileActionPath.startsWith('folder:')
                        ? files.filter((file) => file.path.startsWith(`${fileActionPath.slice(7)}/`) && !pendingDeletes.includes(file.path)).length
                        : 'tracked'} file(s) inside it.
                    </span>
                  </label>
                ) : (
                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-semibold text-gray-300">{fileAction === 'new-file' ? 'File path' : 'Folder path'}</span>
                    <input
                      autoFocus
                      value={fileActionPath}
                      onChange={(event) => setFileActionPath(event.target.value)}
                      placeholder={fileAction === 'new-file' ? 'src/components/NewComponent.tsx' : 'src/components/new-folder'}
                      required
                      className="w-full rounded-lg border border-gray-700 bg-[#0d1117] px-3 py-2 font-mono text-xs text-gray-200 outline-none focus:border-indigo-500"
                    />
                    <span className="block text-[10px] text-gray-500">Path is relative to the repository root on branch {selectedBranch || '—'}.</span>
                  </label>
                )}
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setFileAction(null)} className="rounded-lg border border-gray-700 px-3 py-2 text-xs font-semibold text-gray-300 hover:bg-gray-800">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={fileAction === 'delete' ? !fileActionPath : !fileActionPath.trim()}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-white disabled:opacity-40 ${
                      fileAction === 'delete' ? 'bg-rose-700 hover:bg-rose-600' : 'bg-indigo-600 hover:bg-indigo-500'
                    }`}
                  >
                    {fileAction === 'new-file' ? <FilePlus2 size={13} /> : fileAction === 'new-folder' ? <FolderPlus size={13} /> : <Trash2 size={13} />}
                    {fileAction === 'delete' ? 'Stage deletion' : 'Create'}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {/* File Explorer Sidebar */}
        <div className="w-56 md:w-64 bg-[#161b22] border-r border-gray-800 flex flex-col shrink-0 min-h-0">
          <div className="border-b border-gray-800 p-2.5 shrink-0">
            <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
              <span>Files ({files.length})</span>
              <button onClick={() => fetchRepoFiles(repoInput, selectedBranch)} className="hover:text-white" title="Refresh tree">
                <RefreshCw size={13} className={loadingFiles ? 'animate-spin' : ''} />
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => { setFileAction('new-file'); setFileActionPath(''); }}
                disabled={!selectedBranch}
                className="flex min-w-0 flex-1 items-center justify-center gap-1 rounded-md border border-gray-700 px-1.5 py-1.5 text-[10px] font-semibold text-gray-300 hover:border-indigo-500/60 hover:bg-indigo-950/30 hover:text-indigo-200 disabled:opacity-40"
                title="Create a file"
              >
                <FilePlus2 size={12} /> File
              </button>
              <button
                type="button"
                onClick={() => { setFileAction('new-folder'); setFileActionPath(''); }}
                disabled={!selectedBranch}
                className="flex min-w-0 flex-1 items-center justify-center gap-1 rounded-md border border-gray-700 px-1.5 py-1.5 text-[10px] font-semibold text-gray-300 hover:border-indigo-500/60 hover:bg-indigo-950/30 hover:text-indigo-200 disabled:opacity-40"
                title="Create a folder"
              >
                <FolderPlus size={12} /> Folder
              </button>
              <button
                type="button"
                onClick={() => {
                  setFileAction('delete');
                  setFileActionPath(activeFile ? `file:${activeFile}` : '');
                }}
                disabled={!files.length}
                className="flex min-w-0 flex-1 items-center justify-center gap-1 rounded-md border border-gray-700 px-1.5 py-1.5 text-[10px] font-semibold text-gray-300 hover:border-rose-800 hover:bg-rose-950/30 hover:text-rose-300 disabled:opacity-40"
                title="Delete a file or folder"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
            {pendingDeletes.length > 0 && (
              <button
                type="button"
                onClick={handlePushStagedDeletes}
                disabled={isPushingDeletes}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md bg-rose-700/80 px-2 py-1.5 text-[10px] font-bold text-white hover:bg-rose-600 disabled:opacity-50"
              >
                {isPushingDeletes ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                Push {pendingDeletes.length} staged deletion{pendingDeletes.length === 1 ? '' : 's'}
              </button>
            )}
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
                const isPendingDelete = pendingDeletes.includes(file.path);
                return (
                  <div key={`${file.path}-${file.sha}`} className="group flex items-center gap-1">
                    <button
                      onClick={() => !isPendingDelete && loadFileContent(file)}
                      disabled={isPendingDelete}
                      className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2.5 py-1.5 text-left truncate transition-colors ${
                        isPendingDelete
                          ? 'text-rose-300/70 line-through'
                          : activeFile === file.path
                            ? `${theme.bgSubtle} ${theme.textAccent} font-semibold border${theme.borderAccent}/30`
                            : 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
                      }`}
                    >
                      <FileCode size={14} className={`shrink-0 ${isPendingDelete ? 'text-rose-400/70' : activeFile === file.path ? theme.textAccent : 'text-gray-500'}`} />
                      <span className="truncate">{file.path}</span>
                    </button>
                    {isPendingDelete && (
                      <button
                        type="button"
                        onClick={() => handleUndoStagedDelete(file.path)}
                        className="rounded p-1 text-gray-500 hover:bg-gray-800 hover:text-white"
                        title={`Undo deletion of ${file.path}`}
                        aria-label={`Undo deletion of ${file.path}`}
                      >
                        <RotateCcw size={12} />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Editor + Multi-Tab Strip + Terminal Workspace */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          
          {/* Multi-File Tab Bar */}
          <div className="h-9 bg-[#161b22] border-b border-gray-800 flex items-center px-2 gap-1 overflow-x-auto custom-scrollbar select-none shrink-0">
            {openTabs.length === 0 ? (
              <span className="text-[11px] text-gray-500 italic px-2">No files open in buffer</span>
            ) : (
              openTabs.map((tab) => {
                const isActive = tab.path === activeFile;
                const fileName = tab.path.split('/').pop() || tab.path;

                return (
                  <div
                    key={tab.path}
                    onClick={() => setActiveFile(tab.path)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-t-lg text-xs font-mono cursor-pointer transition-all border-b-2 ${
                      isActive
                        ? 'bg-[#0d1117] text-white border-indigo-500'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 border-transparent'
                    }`}
                  >
                    <span>{fileName}</span>
                    {/* Unsaved Changes Dirty Indicator */}
                    {tab.isDirty && (
                      <span className="w-2 h-2 rounded-full bg-amber-400" title="Unsaved changes" />
                    )}
                    <button
                      onClick={(e) => handleCloseTab(e, tab.path)}
                      className="p-0.5 rounded hover:bg-gray-700/60 text-gray-500 hover:text-white"
                      title="Close tab"
                    >
                      <X size={11} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex-1 min-h-0 relative">
            {loadingContent ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d1117] z-10 space-y-2">
                <Loader2 size={24} className={`animate-spin ${theme.textAccent}`} />
                <span className="text-xs text-gray-400">Reading remote blob...</span>
              </div>
            ) : null}

            <Editor
              height="100%"
              theme={colorMode === 'dark' ? 'vs-dark' : 'light'}
              language={getLanguageFromPath(activeFile)}
              value={activeFileContent}
              onMount={handleEditorDidMount}
              onChange={(val) => handleContentChange(val || '')}
              options={{
                fontSize: 13,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                readOnly: isFileLockedByOther || !activeFile,
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

        {/* AI Assistant Side Drawer */}
        {showAiDrawer && (
          <>
          <div
            role="separator"
            aria-label="Resize code assistant"
            aria-orientation="vertical"
            aria-valuemin={320}
            aria-valuemax={720}
            aria-valuenow={assistantWidth}
            tabIndex={0}
            onPointerDown={(event) => {
              event.preventDefault();
              setIsResizingAssistant(true);
            }}
            onKeyDown={(event) => {
              if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
              event.preventDefault();
              setAssistantWidth((width) => Math.min(720, Math.max(320, width + (event.key === 'ArrowLeft' ? -24 : 24))));
            }}
            className="group flex w-2 shrink-0 cursor-col-resize items-center justify-center border-l border-gray-800 bg-[#161b22] text-gray-600 hover:text-purple-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            title="Drag to resize. Use arrow keys for precise resizing."
          >
            <GripVertical size={14} />
          </div>
          <div
            style={{ width: `${assistantWidth}px`, maxWidth: '70vw' }}
            className={`flex shrink-0 flex-col border-l border-gray-800 bg-[#161b22] shadow-2xl min-h-0 ${isResizingAssistant ? 'select-none' : 'animate-in slide-in-from-right-10 duration-200'}`}
          >
            {/* Drawer Header */}
            <div className="p-3.5 border-b border-gray-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
                <Bot size={16} />
                <span>Code Assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden text-[9px] text-gray-500 sm:inline">{assistantWidth}px</span>
                <button type="button" onClick={() => setShowAiDrawer(false)} aria-label="Close code assistant" className="text-gray-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1 border-b border-gray-800 p-2">
              <button
                type="button"
                onClick={() => setAiEditMode(false)}
                aria-pressed={!aiEditMode}
                className={`rounded-lg px-2 py-2 text-[11px] font-semibold ${!aiEditMode ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
              >
                Ask questions
              </button>
              <button
                type="button"
                onClick={() => setAiEditMode(true)}
                aria-pressed={aiEditMode}
                className={`flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-[11px] font-semibold ${aiEditMode ? 'bg-purple-600/30 text-purple-200' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
              >
                <WandSparkles size={13} /> Edit files
              </button>
            </div>

            {aiEditMode && (
              <section className="border-b border-gray-800 bg-[#11161e]">
                <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-gray-200">Edit context <span className="ml-1 font-normal text-gray-500">{contextPaths.length}/5 files</span></p>
                    <p className="mt-0.5 truncate text-[9px] text-gray-500">
                      {contextPaths.length ? contextPaths.join(', ') : 'Select tracked files to give the assistant context'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {activeFile && !contextPaths.includes(activeFile) && !isAssistantExcludedPath(activeFile) && (
                      <button
                        type="button"
                        disabled={contextPaths.length >= 5}
                        onClick={() => setContextPaths((current) => [...current, activeFile])}
                        className="rounded-md px-2 py-1 text-[9px] font-semibold text-purple-300 hover:bg-purple-950/40 disabled:opacity-40"
                      >
                        + Current file
                      </button>
                    )}
                    <button
                      type="button"
                      aria-expanded={isContextPickerOpen}
                      aria-label={isContextPickerOpen ? 'Collapse edit context picker' : 'Expand edit context picker'}
                      onClick={() => setIsContextPickerOpen((open) => !open)}
                      className="rounded-md p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                      <ChevronDown size={14} className={isContextPickerOpen ? '' : '-rotate-90'} />
                    </button>
                  </div>
                </div>
                {isContextPickerOpen && (
                <div className="border-t border-gray-800/80 p-3">
                <p className="mb-2 text-[10px] leading-relaxed text-gray-500">
                  Choose tracked files or filter by a folder path. Selected source is sent to the configured AI provider. Approved edits stay local until you push.
                </p>
                <label className="relative mb-2 block">
                  <Search size={12} className="absolute left-2.5 top-2.5 text-gray-500" />
                  <input
                    type="search"
                    value={contextSearch}
                    onChange={(event) => setContextSearch(event.target.value)}
                    aria-label="Filter repository files by name or folder"
                    placeholder="Filter files or folder (src/components/)"
                    className="w-full rounded-lg border border-gray-700 bg-[#0d1117] py-2 pl-8 pr-2 text-[10px] text-gray-200 outline-none focus:border-purple-500"
                  />
                </label>
                {contextSearch.includes('/') && filteredContextFiles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const remaining = Math.max(0, 5 - contextPaths.length);
                      const additions = filteredContextFiles
                        .filter((file) => !contextPaths.includes(file.path))
                        .slice(0, remaining)
                        .map((file) => file.path);
                      setContextPaths((current) => [...current, ...additions]);
                      if (filteredContextFiles.length - additions.length > 0) {
                        toast.info('Context is limited to five files per edit request.');
                      }
                    }}
                    disabled={contextPaths.length >= 5}
                    className="mb-2 w-full rounded-lg border border-purple-800/60 bg-purple-950/30 px-2 py-1.5 text-left text-[10px] font-semibold text-purple-300 hover:bg-purple-900/40 disabled:opacity-40"
                  >
                    Select matching files in this path
                  </button>
                )}
                <div className="max-h-36 space-y-0.5 overflow-y-auto rounded-lg border border-gray-800 p-1">
                  {filteredContextFiles.map((file) => (
                    <label key={`${file.path}-${file.sha}`} className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 hover:bg-gray-800">
                      <input
                        type="checkbox"
                        checked={contextPaths.includes(file.path)}
                        disabled={!contextPaths.includes(file.path) && contextPaths.length >= 5}
                        onChange={(event) => {
                          if (event.target.checked) {
                            if (contextPaths.length >= 5) {
                              toast.info('Choose at most five files for each edit request.');
                              return;
                            }
                            setContextPaths((current) => [...current, file.path]);
                          } else {
                            setContextPaths((current) => current.filter((path) => path !== file.path));
                          }
                        }}
                        className="accent-purple-500"
                      />
                      <span className="truncate font-mono text-[10px] text-gray-300">{file.path}</span>
                    </label>
                  ))}
                  {filteredContextFiles.length === 0 && (
                    <p className="px-2 py-3 text-center text-[10px] text-gray-500">
                      {loadingFiles ? 'Loading repository files…' : 'No tracked files match this filter.'}
                    </p>
                  )}
                </div>
                </div>
                )}
              </section>
            )}

            {/* Conversation Messages Viewport */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-0 text-xs">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-gray-500 space-y-2">
                  <Sparkles size={28} className="mx-auto text-purple-400/50" />
                  <p className="text-xs">
                    {aiEditMode
                      ? 'Describe what to change. The assistant prepares a multi-file diff for review before it touches your workspace buffers.'
                      : `Ask the assistant to refactor, write unit tests, or explain ${activeFile || 'your code'}.`}
                  </p>
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
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] opacity-50 font-mono mr-1">{msg.timestamp}</span>

                          {msg.sender === 'assistant' && (
                            <>
                              {/* Apply to Editor Button */}
                              {!aiEditMode && activeFile && !isAssistantExcludedPath(activeFile) && (
                                <button
                                  onClick={() => handleApplySnippetToEditor(msg.text)}
                                  className="px-1.5 py-0.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded flex items-center gap-1 text-[10px] font-semibold"
                                  title="Insert or replace active editor buffer"
                                >
                                  <ArrowDownToLine size={10} />
                                  <span>Apply</span>
                                </button>
                              )}

                              {/* Copy Button */}
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
                            </>
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
            <form onSubmit={(e) => handleAskAi(e)} className="space-y-2 border-t border-gray-800 bg-[#0d1117] p-3 shrink-0">
              <div className="flex flex-wrap gap-1">
                {(aiEditMode
                  ? ['Fix bugs in these files', 'Add tests for this code', 'Refactor for readability']
                  : ['Explain this file', 'Find potential bugs', 'Write unit tests']
                ).map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setAiPrompt(suggestion)}
                    className="rounded-full border border-gray-800 px-2 py-1 text-[9px] text-gray-400 transition hover:border-purple-700/70 hover:bg-purple-950/30 hover:text-purple-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <div className="relative">
                <textarea
                  rows={aiEditMode ? 3 : 2}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  aria-label={aiEditMode ? 'Describe the code changes to make' : 'Ask a coding question'}
                  placeholder={aiEditMode ? 'Describe the changes you want across the selected files…' : 'Ask a technical question…'}
                  className="w-full resize-none bg-[#161b22] border border-gray-800 rounded-xl pl-3 pr-10 py-2.5 text-xs text-white outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  disabled={aiLoading || !aiPrompt.trim() || (aiEditMode && contextPaths.length === 0)}
                  aria-label={aiEditMode ? 'Generate file edits for review' : 'Send question'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-purple-400 hover:text-purple-300 disabled:opacity-40"
                >
                  {aiLoading ? <Loader2 size={14} className="animate-spin" /> : aiEditMode ? <WandSparkles size={14} /> : <Send size={14} />}
                </button>
              </div>
              {aiEditMode && (
                <p className="text-[9px] text-gray-500">
                  {contextPaths.length ? 'Review and allow changes per file; nothing is pushed to GitHub automatically.' : 'Select at least one tracked file above.'}
                </p>
              )}
            </form>
          </div>
          </>
        )}
      </div>
      )}

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

      {editProposal && (
        <CodeEditReviewModal
          summary={editProposal.summary}
          edits={editProposal.edits}
          onClose={() => setEditProposal(null)}
          onApply={(edits) => {
            if (editProposal.repo !== repoInput || editProposal.branch !== selectedBranch) {
              toast.error('The connected repository or branch changed. Generate a fresh proposal before applying.');
              return;
            }
            if (handleApplyAiEdits(edits)) {
              const appliedPaths = new Set(edits.map((edit) => edit.path));
              setEditProposal((current) => {
                if (!current) return null;
                const remaining = current.edits.filter((edit) => !appliedPaths.has(edit.path));
                return remaining.length ? { ...current, edits: remaining } : null;
              });
            }
          }}
          onDeny={(path) => setEditProposal((current) => {
            if (!current) return null;
            const remaining = current.edits.filter((edit) => edit.path !== path);
            return remaining.length ? { ...current, edits: remaining } : null;
          })}
        />
      )}

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