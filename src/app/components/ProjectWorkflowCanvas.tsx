import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  FileImage,
  FileJson2,
  GitBranch,
  History,
  LayoutTemplate,
  Loader2,
  Plus,
  RotateCcw,
  RotateCw,
  Save,
  Share2,
  Play,
  Square,
  Trash2,
  Unplug,
  Workflow,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabaseClient';
import { useTheme } from '../../context/ThemeContext';

type WorkflowStatus = 'todo' | 'in_progress' | 'blocked' | 'done';
type WorkflowNode = {
  id: string;
  title: string;
  description: string;
  x: number;
  y: number;
  status: WorkflowStatus;
  taskId: string | null;
  ownerId: string | null;
  dueDate: string | null;
};
type WorkflowEdge = { id: string; source: string; target: string };
type WorkflowData = { nodes: WorkflowNode[]; edges: WorkflowEdge[] };
type ProjectTask = {
  id: string;
  title: string;
  status: string | null;
  assigned_to: string | null;
  due_date: string | null;
};
type ProjectMember = { user_id: string; role: string };
type PublicProfile = { id: string; name: string | null; avatar: string | null };
type WorkflowVersion = { id: string; version_number: number; workflow_data: WorkflowData; created_at: string };
type WorkflowRun = {
  id: string;
  status: 'running' | 'completed' | 'failed';
  workflow_snapshot: WorkflowData;
  result_note: string | null;
  started_at: string;
  finished_at: string | null;
  started_by: string;
};
type SavedTemplate = { id: string; name: string; workflow_data: WorkflowData };

const EMPTY_WORKFLOW: WorkflowData = { nodes: [], edges: [] };
const NODE_WIDTH = 250;
const NODE_HEIGHT = 148;
const BOARD_WIDTH = 1800;
const BOARD_HEIGHT = 1200;

const DEFAULT_STATUS = { value: 'todo' as const, label: 'To do', color: 'bg-slate-400' };
const STATUS_OPTIONS: { value: WorkflowStatus; label: string; color: string }[] = [
  DEFAULT_STATUS,
  { value: 'in_progress', label: 'In progress', color: 'bg-blue-500' },
  { value: 'blocked', label: 'Blocked', color: 'bg-rose-500' },
  { value: 'done', label: 'Done', color: 'bg-emerald-500' },
];
const WORKFLOW_TEMPLATES = [
  { id: 'software-delivery', name: 'Software delivery', steps: ['Plan scope', 'Design solution', 'Implement', 'Review and test', 'Release'] },
  { id: 'product-launch', name: 'Product launch', steps: ['Research users', 'Define positioning', 'Build launch assets', 'Prepare release', 'Measure results'] },
  { id: 'sprint-cycle', name: 'Sprint cycle', steps: ['Refine backlog', 'Plan sprint', 'Build and collaborate', 'Review work', 'Retrospective'] },
];

function createTemplateData(steps: string[]): WorkflowData {
  const nodes = steps.map((title, index) => ({
    id: crypto.randomUUID(),
    title,
    description: '',
    x: 100 + (index % 4) * 340,
    y: 100 + Math.floor(index / 4) * 210,
    status: 'todo' as const,
    taskId: null,
    ownerId: null,
    dueDate: null,
  }));
  return {
    nodes,
    edges: nodes.flatMap((node, index) => {
      const previous = nodes[index - 1];
      return previous ? [{ id: crypto.randomUUID(), source: previous.id, target: node.id }] : [];
    }),
  };
}

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (char) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
  })[char] || char);
}

function isWorkflowData(value: unknown): value is WorkflowData {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<WorkflowData>;
  return Array.isArray(data.nodes) && Array.isArray(data.edges);
}

function statusFromTask(status: string | null): WorkflowStatus {
  if (status === 'done') return 'done';
  if (status === 'blocked') return 'blocked';
  if (status === 'in_progress' || status === 'in progress') return 'in_progress';
  return 'todo';
}

interface ProjectWorkflowCanvasProps {
  projectId: string | null;
  projectName?: string;
  projectOwnerId?: string | null;
  currentUserId?: string;
  isAdmin: boolean;
  forceReadOnly?: boolean;
}

export default function ProjectWorkflowCanvas({
  projectId,
  projectName,
  projectOwnerId,
  currentUserId,
  isAdmin,
  forceReadOnly = false,
}: ProjectWorkflowCanvasProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [workflow, setWorkflow] = useState<WorkflowData>(EMPTY_WORKFLOW);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<WorkflowData[]>([]);
  const [redoStack, setRedoStack] = useState<WorkflowData[]>([]);
  const [versions, setVersions] = useState<WorkflowVersion[]>([]);
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const dragRef = useRef<{
    id: string;
    x: number;
    y: number;
    startX: number;
    startY: number;
    before: WorkflowData;
  } | null>(null);
  const selectedNode = workflow.nodes.find((node) => node.id === selectedNodeId) || null;

  const canEdit = useMemo(
    () => !forceReadOnly && (isAdmin || Boolean(currentUserId && members.some(
      (member) => member.user_id === currentUserId && ['owner', 'editor'].includes(member.role.toLowerCase())
    ))),
    [currentUserId, forceReadOnly, isAdmin, members]
  );

  useEffect(() => {
    let active = true;
    if (!projectId) {
      setWorkflow(EMPTY_WORKFLOW);
      setTasks([]);
      setMembers([]);
      setProfiles([]);
      setDirty(false);
      setLoadError(null);
      setVersions([]);
      setRuns([]);
      setSavedTemplates([]);
      setUndoStack([]);
      setRedoStack([]);
      return;
    }
    setLoading(true);
    setLoadError(null);
    setSelectedNodeId(null);
    setConnectingFrom(null);

    void (async () => {
      const [workflowResult, tasksResult, membersResult, versionsResult, runsResult, templatesResult] = await Promise.all([
        supabase
          .from('project_workflows')
          .select('workflow_data')
          .eq('project_id', projectId)
          .maybeSingle(),
        supabase
          .from('tasks')
          .select('id, title, status, assigned_to, due_date')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true }),
        supabase
          .from('project_members')
          .select('user_id, role')
          .eq('project_id', projectId),
        supabase
          .from('project_workflow_versions')
          .select('id, version_number, workflow_data, created_at')
          .eq('project_id', projectId)
          .order('version_number', { ascending: false })
          .limit(20),
        supabase
          .from('project_workflow_runs')
          .select('id, status, workflow_snapshot, result_note, started_at, finished_at, started_by')
          .eq('project_id', projectId)
          .order('started_at', { ascending: false })
          .limit(20),
        currentUserId
          ? supabase
            .from('workflow_templates')
            .select('id, name, workflow_data')
            .eq('user_id', currentUserId)
            .order('created_at', { ascending: false })
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (!active) return;
      const error = workflowResult.error || tasksResult.error || membersResult.error ||
        versionsResult.error || runsResult.error || templatesResult.error;
      if (error) {
        console.error('Could not load project workflow data:', error);
        setLoadError('Could not load this project workflow. Check that the workflow migration is applied and you have project access.');
        setWorkflow(EMPTY_WORKFLOW);
        setTasks([]);
        setMembers([]);
        setVersions([]);
        setRuns([]);
        setSavedTemplates([]);
        setLoading(false);
        return;
      }

      const loadedWorkflow =
        workflowResult.data && isWorkflowData(workflowResult.data.workflow_data)
          ? workflowResult.data.workflow_data
          : EMPTY_WORKFLOW;
      setWorkflow(loadedWorkflow);
      setUndoStack([]);
      setRedoStack([]);
      setVersions((versionsResult.data || []) as WorkflowVersion[]);
      setRuns((runsResult.data || []) as WorkflowRun[]);
      setSavedTemplates((templatesResult.data || []) as SavedTemplate[]);
      setTasks((tasksResult.data || []) as ProjectTask[]);
      const nextMembers = (membersResult.data || []) as ProjectMember[];
      if (projectOwnerId && !nextMembers.some((member) => member.user_id === projectOwnerId)) {
        nextMembers.push({ user_id: projectOwnerId, role: 'owner' });
      }
      setMembers(nextMembers);

      const memberIds = [...new Set(nextMembers.map((member) => member.user_id))];
      if (memberIds.length) {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('id, name, avatar')
          .in('id', memberIds);
        if (!active) return;
        if (profileError) {
          console.error('Could not load project member profiles:', profileError);
          setLoadError('Workflow loaded, but member names are unavailable. Apply the profile-view migration to enable owner selection.');
        } else {
          setProfiles((profileData || []) as PublicProfile[]);
        }
      } else {
        setProfiles([]);
      }

      setDirty(false);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [projectId, projectOwnerId, currentUserId]);

  const updateWorkflow = (next: WorkflowData) => {
    setUndoStack((history) => [...history.slice(-49), workflow]);
    setRedoStack([]);
    setWorkflow(next);
    setDirty(true);
  };

  const undoWorkflowChange = useCallback(() => {
    const previous = undoStack[undoStack.length - 1];
    if (!previous) return;
    setRedoStack((history) => [...history, workflow]);
    setUndoStack((history) => history.slice(0, -1));
    setWorkflow(previous);
    setDirty(true);
  }, [undoStack, workflow]);

  const redoWorkflowChange = useCallback(() => {
    const next = redoStack[redoStack.length - 1];
    if (!next) return;
    setUndoStack((history) => [...history, workflow]);
    setRedoStack((history) => history.slice(0, -1));
    setWorkflow(next);
    setDirty(true);
  }, [redoStack, workflow]);

  useEffect(() => {
    const handleHistoryShortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      const target = event.target;
      if (target instanceof HTMLElement && target.matches('input, textarea, select, [contenteditable="true"]')) return;
      if (event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) redoWorkflowChange();
        else undoWorkflowChange();
      } else if (event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redoWorkflowChange();
      }
    };
    window.addEventListener('keydown', handleHistoryShortcut);
    return () => window.removeEventListener('keydown', handleHistoryShortcut);
  }, [redoWorkflowChange, undoWorkflowChange]);

  const addStep = () => {
    if (!canEdit) return;
    const id = crypto.randomUUID();
    const lastNode = workflow.nodes[workflow.nodes.length - 1];
    const node: WorkflowNode = {
      id,
      title: 'New workflow step',
      description: '',
      x: lastNode ? Math.min(lastNode.x + 330, BOARD_WIDTH - NODE_WIDTH - 40) : 120,
      y: lastNode ? Math.min(lastNode.y + (workflow.nodes.length % 2 ? 190 : 0), BOARD_HEIGHT - NODE_HEIGHT - 40) : 100,
      status: 'todo',
      taskId: null,
      ownerId: null,
      dueDate: null,
    };
    updateWorkflow({ ...workflow, nodes: [...workflow.nodes, node] });
    setSelectedNodeId(id);
    setConnectingFrom(null);
  };

  const handleNodeClick = (nodeId: string) => {
    if (!connectingFrom) {
      setSelectedNodeId(nodeId);
      return;
    }
    if (connectingFrom === nodeId) {
      setConnectingFrom(null);
      return;
    }
    if (workflow.edges.some((edge) => edge.source === connectingFrom && edge.target === nodeId)) {
      toast.info('Those steps are already connected.');
    } else {
      updateWorkflow({
        ...workflow,
        edges: [...workflow.edges, { id: crypto.randomUUID(), source: connectingFrom, target: nodeId }],
      });
    }
    setConnectingFrom(null);
    setSelectedNodeId(nodeId);
  };

  const updateNode = (nodeId: string, patch: Partial<WorkflowNode>) => {
    updateWorkflow({
      ...workflow,
      nodes: workflow.nodes.map((node) => node.id === nodeId ? { ...node, ...patch } : node),
    });
  };

  const removeNode = (nodeId: string) => {
    updateWorkflow({
      nodes: workflow.nodes.filter((node) => node.id !== nodeId),
      edges: workflow.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
    });
    setSelectedNodeId(null);
    setConnectingFrom(null);
  };

  const saveWorkflow = async () => {
    if (!projectId || !canEdit || !dirty || saving) return;
    setSaving(true);
    const snapshot = workflow;
    const { error } = await supabase.from('project_workflows').upsert(
      { project_id: projectId, workflow_data: snapshot },
      { onConflict: 'project_id' }
    );
    if (error) {
      console.error('Could not save project workflow:', error);
      toast.error('Could not save workflow. Confirm your project role and that the workflow migration is applied.');
    } else {
      setDirty(JSON.stringify(workflow) !== JSON.stringify(snapshot));
      setUndoStack([]);
      setRedoStack([]);
      const { data: versionData, error: versionError } = await supabase
        .from('project_workflow_versions')
        .select('id, version_number, workflow_data, created_at')
        .eq('project_id', projectId)
        .order('version_number', { ascending: false })
        .limit(20);
      if (versionError) {
        console.error('Could not reload workflow versions:', versionError);
        toast.error('Workflow saved, but version history could not be refreshed.');
      } else {
        setVersions((versionData || []) as WorkflowVersion[]);
      }
      const activeRun = runs.find((run) => run.status === 'running');
      if (activeRun) {
        const { data: updatedRun, error: runError } = await supabase
          .from('project_workflow_runs')
          .update({ workflow_snapshot: snapshot })
          .eq('id', activeRun.id)
          .eq('status', 'running')
          .select('id, status, workflow_snapshot, result_note, started_at, finished_at, started_by')
          .single();
        if (runError) {
          console.error('Workflow saved, but run progress could not be updated:', runError);
          toast.error('Workflow saved, but active run progress could not be updated.');
        } else {
          setRuns((items) => items.map((run) => run.id === activeRun.id ? updatedRun as WorkflowRun : run));
        }
      }
      toast.success('Workflow saved');
    }
    setSaving(false);
  };

  const applyTemplate = (template: SavedTemplate | { id: string; name: string; steps: string[] }) => {
    if ('steps' in template) {
      updateWorkflow(createTemplateData(template.steps));
    } else {
      updateWorkflow(template.workflow_data);
    }
    setSelectedNodeId(null);
    setSelectedTemplateId('');
    toast.success(`${template.name} template added. Save to keep it.`);
  };

  const saveAsTemplate = async () => {
    if (!currentUserId || !workflow.nodes.length) return;
    const name = window.prompt('Name this workflow template');
    if (name === null) return;
    const cleanName = name.trim();
    if (!cleanName) {
      toast.error('Enter a template name.');
      return;
    }
    const templateData: WorkflowData = {
      nodes: workflow.nodes.map((node) => ({ ...node, taskId: null, ownerId: null })),
      edges: workflow.edges,
    };
    const { data, error } = await supabase
      .from('workflow_templates')
      .insert({ user_id: currentUserId, name: cleanName, workflow_data: templateData })
      .select('id, name, workflow_data')
      .single();
    if (error) {
      console.error('Could not save workflow template:', error);
      toast.error('Could not save this template. Apply the workflow history migration and try again.');
      return;
    }
    setSavedTemplates((items) => [data as SavedTemplate, ...items]);
    toast.success('Workflow template saved to your account.');
  };

  const startWorkflowRun = async () => {
    if (!projectId || !currentUserId || !canEdit || !workflow.nodes.length) return;
    const { data, error } = await supabase
      .from('project_workflow_runs')
      .insert({
        project_id: projectId,
        status: 'running',
        workflow_snapshot: workflow,
        started_by: currentUserId,
      })
      .select('id, status, workflow_snapshot, result_note, started_at, finished_at, started_by')
      .single();
    if (error) {
      console.error('Could not start workflow run:', error);
      toast.error(error.code === '23505'
        ? 'This project already has a running workflow. Finish it before starting another.'
        : 'Could not start a workflow run. Check access and migration status.');
      return;
    }
    setRuns((items) => [data as WorkflowRun, ...items]);
    toast.success('Workflow run started. Track progress by updating the steps.');
  };

  const finishWorkflowRun = async (run: WorkflowRun, status: 'completed' | 'failed') => {
    if (!currentUserId || !canEdit) return;
    const resultNote = window.prompt(
      status === 'completed' ? 'Optional completion note' : 'What blocked or failed this run?',
      ''
    );
    if (resultNote === null) return;
    const { data, error } = await supabase
      .from('project_workflow_runs')
      .update({
        status,
        result_note: resultNote.trim() || null,
        finished_by: currentUserId,
        finished_at: new Date().toISOString(),
      })
      .eq('id', run.id)
      .eq('status', 'running')
      .select('id, status, workflow_snapshot, result_note, started_at, finished_at, started_by')
      .single();
    if (error) {
      console.error('Could not finish workflow run:', error);
      toast.error('Could not update this run. Refresh and check its current status.');
      return;
    }
    setRuns((items) => items.map((item) => item.id === run.id ? data as WorkflowRun : item));
    toast.success(status === 'completed' ? 'Workflow run completed.' : 'Workflow run marked as failed.');
  };

  const restoreVersion = (version: WorkflowVersion) => {
    if (!canEdit) return;
    if (!window.confirm(`Restore version ${version.version_number}? Your current unsaved changes will be replaced.`)) return;
    updateWorkflow(version.workflow_data);
    setSelectedNodeId(null);
    setShowHistory(false);
    toast.info(`Version ${version.version_number} restored in the editor. Save to publish it.`);
  };

  const makeSvg = () => {
    const padding = 48;
    const width = Math.max(720, ...workflow.nodes.map((node) => node.x + NODE_WIDTH + padding));
    const height = Math.max(420, ...workflow.nodes.map((node) => node.y + NODE_HEIGHT + padding));
    const edgeMarkup = workflow.edges.map((edge) => {
      const source = workflow.nodes.find((node) => node.id === edge.source);
      const target = workflow.nodes.find((node) => node.id === edge.target);
      if (!source || !target) return '';
      const x1 = source.x + NODE_WIDTH;
      const y1 = source.y + NODE_HEIGHT / 2;
      const x2 = target.x;
      const y2 = target.y + NODE_HEIGHT / 2;
      const bend = Math.max(48, Math.abs(x2 - x1) / 2);
      return `<path d="M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>`;
    }).join('');
    const nodeMarkup = workflow.nodes.map((node) => {
      const status = STATUS_OPTIONS.find((option) => option.value === node.status) || DEFAULT_STATUS;
      const title = escapeXml(node.title);
      const description = escapeXml(node.description || (node.taskId ? taskTitle(node.taskId) : ''));
      return `<g transform="translate(${node.x} ${node.y})"><rect width="${NODE_WIDTH}" height="${NODE_HEIGHT}" rx="12" fill="${isLight ? '#ffffff' : '#161b22'}" stroke="${isLight ? '#cbd5e1' : '#475569'}"/><path d="M12 0h226a12 12 0 0 1 12 12v4H0v-4A12 12 0 0 1 12 0" fill="${node.status === 'done' ? '#10b981' : node.status === 'blocked' ? '#f43f5e' : node.status === 'in_progress' ? '#3b82f6' : '#94a3b8'}"/><text x="16" y="46" font-family="Arial,sans-serif" font-size="15" font-weight="700" fill="${isLight ? '#111827' : '#f3f4f6'}">${title}</text><text x="16" y="68" font-family="Arial,sans-serif" font-size="11" fill="#64748b">${status.label}</text><text x="16" y="96" font-family="Arial,sans-serif" font-size="11" fill="${isLight ? '#475569' : '#cbd5e1'}">${description.slice(0, 60)}</text><text x="16" y="126" font-family="Arial,sans-serif" font-size="10" fill="#64748b">${escapeXml(profileName(node.ownerId))} · ${escapeXml(node.dueDate || 'No due date')}</text></g>`;
    }).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b"/></marker></defs><rect width="100%" height="100%" fill="${isLight ? '#f8fafc' : '#0d1117'}"/>${edgeMarkup}${nodeMarkup}</svg>`;
  };

  const downloadFile = (name: string, content: string, type: string) => {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const copyShareLink = async () => {
    if (!projectId) return;
    const shareUrl = new URL('/code', window.location.origin);
    shareUrl.searchParams.set('workflowProject', projectId);
    shareUrl.searchParams.set('workflowView', '1');
    try {
      await navigator.clipboard.writeText(shareUrl.toString());
      toast.success('Read-only workflow link copied. Only signed-in project members can open it.');
    } catch (error) {
      console.error('Could not copy workflow share link:', error);
      toast.error('Clipboard access is unavailable in this browser.');
    }
  };

  const startDrag = (event: React.PointerEvent<HTMLDivElement>, node: WorkflowNode) => {
    if (!canEdit || connectingFrom) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      id: node.id,
      x: node.x,
      y: node.y,
      startX: event.clientX,
      startY: event.clientY,
      before: workflow,
    };
  };

  const moveNode = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = (event.clientX - drag.startX) / scale;
    const dy = (event.clientY - drag.startY) / scale;
    setWorkflow((current) => ({
      ...current,
      nodes: current.nodes.map((node) => node.id === drag.id
        ? {
          ...node,
          x: Math.max(20, Math.min(BOARD_WIDTH - NODE_WIDTH - 20, drag.x + dx)),
          y: Math.max(20, Math.min(BOARD_HEIGHT - NODE_HEIGHT - 20, drag.y + dy)),
        }
        : node),
    }));
    setDirty(true);
  };

  const finishDrag = () => {
    const drag = dragRef.current;
    if (drag && JSON.stringify(drag.before) !== JSON.stringify(workflow)) {
      setUndoStack((history) => [...history.slice(-49), drag.before]);
      setRedoStack([]);
    }
    dragRef.current = null;
  };

  const profileName = (id: string | null) =>
    profiles.find((profile) => profile.id === id)?.name || (id ? 'Project member' : 'Unassigned');
  const taskTitle = (id: string | null) => tasks.find((task) => task.id === id)?.title || 'Unlinked task';
  const isLight = !isDark;

  if (!projectId) {
    return (
      <div className={`flex min-h-0 flex-1 items-center justify-center p-8 text-center ${isLight ? 'bg-gray-50 text-gray-600' : 'bg-[#0d1117] text-gray-300'}`}>
        <div>
          <Workflow className="mx-auto mb-3 text-indigo-500" size={32} />
          <p className="font-semibold">Select a project to open its workflow.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-0 flex-1 flex-col overflow-hidden ${isLight ? 'bg-gray-50 text-gray-800' : 'bg-[#0d1117] text-gray-200'}`}>
      <header className={`flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 ${isLight ? 'border-gray-200 bg-white' : 'border-gray-800 bg-[#161b22]'}`}>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Workflow className="text-indigo-500" size={18} />
            <h2 className={`truncate text-sm font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
              {projectName || 'Project'} workflow
            </h2>
          </div>
          <p className={`mt-1 text-[11px] ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
            Drag steps to arrange them. Connect related steps and link existing project tasks.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`hidden text-[11px] sm:inline ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
            {workflow.nodes.length} steps · {workflow.edges.length} connections
          </span>
          <button
            type="button"
            onClick={undoWorkflowChange}
            disabled={!canEdit || !undoStack.length}
            className={`rounded-lg border p-2 disabled:opacity-40 ${isLight ? 'border-gray-200 hover:bg-gray-100' : 'border-gray-700 hover:bg-gray-800'}`}
            title="Undo"
            aria-label="Undo"
          ><RotateCcw size={14} /></button>
          <button
            type="button"
            onClick={redoWorkflowChange}
            disabled={!canEdit || !redoStack.length}
            className={`rounded-lg border p-2 disabled:opacity-40 ${isLight ? 'border-gray-200 hover:bg-gray-100' : 'border-gray-700 hover:bg-gray-800'}`}
            title="Redo"
            aria-label="Redo"
          ><RotateCw size={14} /></button>
          {canEdit && (
            <div className="flex items-center gap-1">
              <LayoutTemplate size={14} className={isLight ? 'text-gray-500' : 'text-gray-400'} />
              <select
                value={selectedTemplateId}
                onChange={(event) => {
                  const templateId = event.target.value;
                  setSelectedTemplateId(templateId);
                  const starter = WORKFLOW_TEMPLATES.find((item) => item.id === templateId);
                  const saved = savedTemplates.find((item) => item.id === templateId);
                  if (starter) applyTemplate(starter);
                  else if (saved) applyTemplate(saved);
                }}
                className={`max-w-40 rounded-lg border px-2 py-2 text-[11px] outline-none ${isLight ? 'border-gray-200 bg-white text-gray-700' : 'border-gray-700 bg-[#0d1117] text-gray-200'}`}
                aria-label="Apply a workflow template"
              >
                <option value="">Templates</option>
                <optgroup label="Starter templates">
                  {WORKFLOW_TEMPLATES.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
                </optgroup>
                {savedTemplates.length > 0 && (
                  <optgroup label="Your templates">
                    {savedTemplates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
                  </optgroup>
                )}
              </select>
              <button
                type="button"
                onClick={saveAsTemplate}
                disabled={!workflow.nodes.length}
                className={`rounded-lg border px-2 py-2 text-[11px] font-semibold disabled:opacity-40 ${isLight ? 'border-gray-200 hover:bg-gray-100' : 'border-gray-700 hover:bg-gray-800'}`}
                title="Save current workflow as a reusable template"
              >Save template</button>
            </div>
          )}
          <button
            type="button"
            onClick={() => setScale((value) => Math.min(1.5, Number((value + 0.1).toFixed(2))))}
            className={`rounded-lg border p-2 ${isLight ? 'border-gray-200 hover:bg-gray-100' : 'border-gray-700 hover:bg-gray-800'}`}
            title="Zoom in"
            aria-label="Zoom in"
          ><ZoomIn size={15} /></button>
          <button
            type="button"
            onClick={() => setScale((value) => Math.max(0.6, Number((value - 0.1).toFixed(2))))}
            className={`rounded-lg border p-2 ${isLight ? 'border-gray-200 hover:bg-gray-100' : 'border-gray-700 hover:bg-gray-800'}`}
            title="Zoom out"
            aria-label="Zoom out"
          ><ZoomOut size={15} /></button>
          <button
            type="button"
            onClick={() => void copyShareLink()}
            className={`rounded-lg border p-2 ${isLight ? 'border-gray-200 hover:bg-gray-100' : 'border-gray-700 hover:bg-gray-800'}`}
            title="Copy read-only project workflow link"
            aria-label="Copy read-only project workflow link"
          ><Share2 size={14} /></button>
          <details className="relative">
            <summary className={`flex cursor-pointer list-none items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-semibold ${isLight ? 'border-gray-200 hover:bg-gray-100' : 'border-gray-700 hover:bg-gray-800'}`}>
              <Download size={14} /> Export
            </summary>
            <div className={`absolute right-0 top-full z-30 mt-1 min-w-44 rounded-xl border p-1 shadow-xl ${isLight ? 'border-gray-200 bg-white' : 'border-gray-700 bg-[#161b22]'}`}>
              <button type="button" onClick={() => downloadFile(`${projectName || 'workflow'}.svg`, makeSvg(), 'image/svg+xml')} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs ${isLight ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}>
                <FileImage size={14} /> Download SVG
              </button>
              <button type="button" onClick={() => downloadFile(`${projectName || 'workflow'}.json`, JSON.stringify({ project: projectName, ...workflow }, null, 2), 'application/json')} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs ${isLight ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}>
                <FileJson2 size={14} /> Download JSON
              </button>
              <button type="button" onClick={() => {
                const printWindow = window.open('', '_blank');
                if (!printWindow) {
                  toast.error('Allow pop-ups to print or save this workflow as PDF.');
                  return;
                }
                printWindow.opener = null;
                printWindow.document.write(`<!doctype html><html><head><title>${escapeXml(projectName || 'Project workflow')}</title><style>body{margin:0;padding:24px;font-family:Arial,sans-serif}svg{max-width:100%;height:auto}@media print{body{padding:0}}</style></head><body>${makeSvg()}<script>window.onload=()=>window.print()</script></body></html>`);
                printWindow.document.close();
              }} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs ${isLight ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}>
                <FileImage size={14} /> Print / Save as PDF
              </button>
            </div>
          </details>
          {canEdit && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (!selectedNodeId) {
                    toast.info('Select a step first, then choose Connect.');
                    return;
                  }
                  setConnectingFrom(selectedNodeId);
                  toast.info('Choose another step to connect it.');
                }}
                disabled={!workflow.nodes.length}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-40 ${isLight ? 'border-gray-200 hover:bg-gray-100' : 'border-gray-700 hover:bg-gray-800'}`}
              ><GitBranch size={14} /> Connect</button>
              <button
                type="button"
                onClick={addStep}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
              ><Plus size={14} /> Add step</button>
              <button
                type="button"
                onClick={saveWorkflow}
                disabled={!dirty || saving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-45"
              >{saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                {saving ? 'Saving' : dirty ? 'Save changes' : 'Saved'}
              </button>
            </>
          )}
        </div>
      </header>

      {loadError && (
        <div className={`border-b px-4 py-2 text-xs ${isLight ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-amber-800/60 bg-amber-950/30 text-amber-200'}`} role="status">
          {loadError}
        </div>
      )}
      {!canEdit && !loading && (
        <div className={`border-b px-4 py-2 text-xs ${isLight ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-blue-900 bg-blue-950/30 text-blue-200'}`}>
          Read-only workflow · {forceReadOnly ? 'this shared link opens in view mode.' : 'project owners and editors can make changes.'}
        </div>
      )}

      <section className={`border-b ${isLight ? 'border-gray-200 bg-white' : 'border-gray-800 bg-[#161b22]'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2">
          <button
            type="button"
            onClick={() => setShowHistory((value) => !value)}
            className={`inline-flex items-center gap-2 text-xs font-semibold ${isLight ? 'text-gray-700 hover:text-indigo-600' : 'text-gray-200 hover:text-indigo-300'}`}
            aria-expanded={showHistory}
          >
            <History size={14} />
            Runs & version history
            <span className={`text-[10px] font-normal ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
              {runs.length} runs · {versions.length} versions
            </span>
          </button>
          {canEdit && (
            <button
              type="button"
              onClick={startWorkflowRun}
              disabled={!workflow.nodes.length || runs.some((run) => run.status === 'running')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-45"
              title={runs.some((run) => run.status === 'running') ? 'Finish the active run before starting another' : 'Start a manual progress-tracking run'}
            ><Play size={12} /> Start run</button>
          )}
        </div>
        {showHistory && (
          <div className={`grid gap-4 border-t px-4 py-3 lg:grid-cols-2 ${isLight ? 'border-gray-100 bg-gray-50' : 'border-gray-800 bg-[#0d1117]'}`}>
            <div>
              <h3 className={`mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                <Clock3 size={13} /> Workflow runs
              </h3>
              <p className={`mb-2 text-[10px] ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                Manual progress records only; runs do not execute external actions.
              </p>
              {runs.length === 0 ? (
                <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>No runs recorded yet.</p>
              ) : (
                <ul className="space-y-2">
                  {runs.map((run) => {
                    const snapshot = isWorkflowData(run.workflow_snapshot) ? run.workflow_snapshot : EMPTY_WORKFLOW;
                    const completedCount = snapshot.nodes.filter((node) => node.status === 'done').length;
                    return (
                      <li key={run.id} className={`rounded-lg border p-2.5 ${isLight ? 'border-gray-200 bg-white' : 'border-gray-800 bg-[#161b22]'}`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className={`text-xs font-semibold ${isLight ? 'text-gray-800' : 'text-gray-100'}`}>
                              {run.status === 'running' ? 'In progress' : run.status === 'completed' ? 'Completed' : 'Failed'}
                            </span>
                            <span className={`ml-2 text-[10px] ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                              {new Date(run.started_at).toLocaleString()}
                            </span>
                          </div>
                          {run.status === 'running' && canEdit && (
                            <div className="flex gap-1.5">
                              <button type="button" onClick={() => void finishWorkflowRun(run, 'completed')} className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-semibold text-white">
                                <CheckCircle2 size={11} /> Complete
                              </button>
                              <button type="button" onClick={() => void finishWorkflowRun(run, 'failed')} className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-2 py-1 text-[10px] font-semibold text-white">
                                <Square size={10} /> Fail
                              </button>
                            </div>
                          )}
                        </div>
                        <p className={`mt-1 text-[10px] ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                          {completedCount}/{snapshot.nodes.length} steps complete
                          {run.finished_at ? ` · finished ${new Date(run.finished_at).toLocaleString()}` : ''}
                        </p>
                        {run.result_note && <p className={`mt-1 text-[11px] ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>{run.result_note}</p>}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div>
              <h3 className={`mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                <History size={13} /> Saved versions
              </h3>
              {versions.length === 0 ? (
                <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Save a workflow to create its first version.</p>
              ) : (
                <ul className="space-y-2">
                  {versions.map((version) => (
                    <li key={version.id} className={`flex items-center justify-between gap-2 rounded-lg border p-2.5 ${isLight ? 'border-gray-200 bg-white' : 'border-gray-800 bg-[#161b22]'}`}>
                      <span className={`text-xs ${isLight ? 'text-gray-700' : 'text-gray-200'}`}>
                        Version {version.version_number}
                        <span className={`ml-2 text-[10px] ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                          {new Date(version.created_at).toLocaleString()}
                        </span>
                      </span>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => restoreVersion(version)}
                          className={`rounded-md border px-2 py-1 text-[10px] font-semibold ${isLight ? 'border-gray-200 text-gray-600 hover:bg-gray-100' : 'border-gray-700 text-gray-300 hover:bg-gray-800'}`}
                        >Restore</button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>

      <div className="flex min-h-0 flex-1">
        <div
          className={`relative min-w-0 flex-1 overflow-auto ${isLight ? 'bg-white' : 'bg-[#0d1117]'}`}
          style={{
            backgroundImage: isLight
              ? 'radial-gradient(#cbd5e1 0.75px, transparent 0.75px)'
              : 'radial-gradient(#374151 0.75px, transparent 0.75px)',
            backgroundSize: `${24 * scale}px ${24 * scale}px`,
          }}
        >
          {loading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-inherit">
              <Loader2 className="animate-spin text-indigo-500" size={24} />
            </div>
          ) : null}
          <div
            className="relative origin-top-left"
            style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT, transform: `scale(${scale})` }}
          >
            <svg
              className="pointer-events-none absolute inset-0"
              width={BOARD_WIDTH}
              height={BOARD_HEIGHT}
              aria-hidden="true"
            >
              <defs>
                <marker id="workflow-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={isLight ? '#64748b' : '#94a3b8'} />
                </marker>
              </defs>
              {workflow.edges.map((edge) => {
                const source = workflow.nodes.find((node) => node.id === edge.source);
                const target = workflow.nodes.find((node) => node.id === edge.target);
                if (!source || !target) return null;
                const x1 = source.x + NODE_WIDTH;
                const y1 = source.y + NODE_HEIGHT / 2;
                const x2 = target.x;
                const y2 = target.y + NODE_HEIGHT / 2;
                const bend = Math.max(48, Math.abs(x2 - x1) / 2);
                return (
                  <g key={edge.id}>
                    <path
                      d={`M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`}
                      fill="none"
                      stroke={isLight ? '#94a3b8' : '#64748b'}
                      strokeWidth="2"
                      markerEnd="url(#workflow-arrow)"
                    />
                    {canEdit && (
                      <foreignObject x={(x1 + x2) / 2 - 14} y={(y1 + y2) / 2 - 14} width="28" height="28">
                        <button
                          type="button"
                          title="Remove connection"
                          aria-label="Remove connection"
                          onClick={() => updateWorkflow({ ...workflow, edges: workflow.edges.filter((item) => item.id !== edge.id) })}
                          className={`pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full border shadow-sm ${isLight ? 'border-gray-200 bg-white text-gray-500 hover:text-rose-600' : 'border-gray-700 bg-[#161b22] text-gray-300 hover:text-rose-400'}`}
                        ><Unplug size={13} /></button>
                      </foreignObject>
                    )}
                  </g>
                );
              })}
            </svg>

            {workflow.nodes.map((node) => {
              const status = STATUS_OPTIONS.find((option) => option.value === node.status) || DEFAULT_STATUS;
              const selected = node.id === selectedNodeId;
              return (
                <div
                  key={node.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Workflow step ${node.title}`}
                  onClick={() => handleNodeClick(node.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleNodeClick(node.id);
                    }
                  }}
                  onPointerDown={(event) => startDrag(event, node)}
                  onPointerMove={moveNode}
                  onPointerUp={finishDrag}
                  onPointerCancel={finishDrag}
                  className={`absolute w-[250px] select-none overflow-hidden rounded-xl border shadow-sm transition-shadow ${
                    selected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                      : isLight ? 'border-gray-200 hover:border-indigo-300' : 'border-gray-700 hover:border-gray-500'
                  } ${isLight ? 'bg-white' : 'bg-[#161b22]'} ${connectingFrom ? 'cursor-crosshair' : canEdit ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
                  style={{ left: node.x, top: node.y, touchAction: 'none' }}
                >
                  <div className={`h-1 ${status.color}`} />
                  <div className="space-y-2 p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className={`truncate text-sm font-bold ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>{node.title}</div>
                        <div className={`mt-1 text-[10px] ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{status.label}</div>
                      </div>
                      {node.taskId && <Check className="shrink-0 text-emerald-500" size={15} />}
                    </div>
                    <p className={`line-clamp-2 min-h-8 text-[11px] ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                      {node.description || (node.taskId ? taskTitle(node.taskId) : 'Add a short description in step details.')}
                    </p>
                    <div className={`flex items-center justify-between gap-2 border-t pt-2 text-[10px] ${isLight ? 'border-gray-100 text-gray-500' : 'border-gray-800 text-gray-400'}`}>
                      <span className="truncate">{profileName(node.ownerId)}</span>
                      <span>{node.dueDate || 'No due date'}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {!loading && workflow.nodes.length === 0 && (
              <div className={`absolute left-1/2 top-1/2 w-72 -translate-x-1/2 -translate-y-1/2 text-center ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                <Workflow className="mx-auto mb-3 text-indigo-500" size={32} />
                <p className={`text-sm font-semibold ${isLight ? 'text-gray-800' : 'text-gray-100'}`}>Map out this project</p>
                <p className="mt-1 text-xs">Add a workflow step or link an existing task to get started.</p>
                {canEdit && (
                  <button type="button" onClick={addStep} className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white">
                    <Plus size={14} /> Add first step
                  </button>
                )}
              </div>
            )}
          </div>
          {connectingFrom && (
            <div className="sticky bottom-3 left-3 z-10 mx-3 w-fit rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-lg">
              Select a destination step to connect.
            </div>
          )}
        </div>

        <aside className={`hidden w-80 shrink-0 overflow-y-auto border-l p-4 lg:block ${isLight ? 'border-gray-200 bg-white' : 'border-gray-800 bg-[#161b22]'}`}>
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className={`text-sm font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Step details</h3>
                  <p className={`mt-1 text-[11px] ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Edit workflow information and task links.</p>
                </div>
                {canEdit && (
                  <button type="button" onClick={() => removeNode(selectedNode.id)} title="Delete step" className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              <label className="block space-y-1.5">
                <span className={`text-[11px] font-semibold ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>Title</span>
                <input
                  value={selectedNode.title}
                  readOnly={!canEdit}
                  onChange={(event) => updateNode(selectedNode.id, { title: event.target.value })}
                  className={`w-full rounded-lg border px-3 py-2 text-xs outline-none focus:border-indigo-500 ${isLight ? 'border-gray-200 bg-white text-gray-900' : 'border-gray-700 bg-[#0d1117] text-gray-100'} disabled:opacity-60`}
                />
              </label>

              <label className="block space-y-1.5">
                <span className={`text-[11px] font-semibold ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>Description</span>
                <textarea
                  value={selectedNode.description}
                  readOnly={!canEdit}
                  rows={3}
                  onChange={(event) => updateNode(selectedNode.id, { description: event.target.value })}
                  className={`w-full resize-y rounded-lg border px-3 py-2 text-xs outline-none focus:border-indigo-500 ${isLight ? 'border-gray-200 bg-white text-gray-900' : 'border-gray-700 bg-[#0d1117] text-gray-100'}`}
                />
              </label>

              <label className="block space-y-1.5">
                <span className={`text-[11px] font-semibold ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>Status</span>
                <select
                  value={selectedNode.status}
                  disabled={!canEdit}
                  onChange={(event) => updateNode(selectedNode.id, { status: event.target.value as WorkflowStatus })}
                  className={`w-full rounded-lg border px-3 py-2 text-xs outline-none focus:border-indigo-500 disabled:opacity-60 ${isLight ? 'border-gray-200 bg-white text-gray-900' : 'border-gray-700 bg-[#0d1117] text-gray-100'}`}
                >
                  {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>

              <label className="block space-y-1.5">
                <span className={`text-[11px] font-semibold ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>Linked project task</span>
                <select
                  value={selectedNode.taskId || ''}
                  disabled={!canEdit}
                  onChange={(event) => {
                    const task = tasks.find((item) => item.id === event.target.value);
                    updateNode(selectedNode.id, {
                      taskId: task?.id || null,
                      ...(task ? {
                        title: selectedNode.title === 'New workflow step' ? task.title : selectedNode.title,
                        status: statusFromTask(task.status),
                        dueDate: selectedNode.dueDate || task.due_date,
                        ownerId: selectedNode.ownerId || task.assigned_to,
                      } : {}),
                    });
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-xs outline-none focus:border-indigo-500 disabled:opacity-60 ${isLight ? 'border-gray-200 bg-white text-gray-900' : 'border-gray-700 bg-[#0d1117] text-gray-100'}`}
                >
                  <option value="">No linked task</option>
                  {tasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
                </select>
                {selectedNode.taskId && <p className={`text-[10px] ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Linked: {taskTitle(selectedNode.taskId)}</p>}
              </label>

              <label className="block space-y-1.5">
                <span className={`text-[11px] font-semibold ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>Owner</span>
                <select
                  value={selectedNode.ownerId || ''}
                  disabled={!canEdit}
                  onChange={(event) => updateNode(selectedNode.id, { ownerId: event.target.value || null })}
                  className={`w-full rounded-lg border px-3 py-2 text-xs outline-none focus:border-indigo-500 disabled:opacity-60 ${isLight ? 'border-gray-200 bg-white text-gray-900' : 'border-gray-700 bg-[#0d1117] text-gray-100'}`}
                >
                  <option value="">Unassigned</option>
                  {members.map((member) => (
                    <option key={member.user_id} value={member.user_id}>
                      {profileName(member.user_id)} · {member.role}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1.5">
                <span className={`text-[11px] font-semibold ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>Due date</span>
                <input
                  type="date"
                  value={selectedNode.dueDate || ''}
                  disabled={!canEdit}
                  onChange={(event) => updateNode(selectedNode.id, { dueDate: event.target.value || null })}
                  className={`w-full rounded-lg border px-3 py-2 text-xs outline-none focus:border-indigo-500 disabled:opacity-60 ${isLight ? 'border-gray-200 bg-white text-gray-900' : 'border-gray-700 bg-[#0d1117] text-gray-100'}`}
                />
              </label>
            </div>
          ) : (
            <div className={`flex h-full flex-col items-center justify-center text-center ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
              <ArrowRight className="mb-3 text-indigo-500" size={22} />
              <p className={`text-xs font-semibold ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>Select a workflow step</p>
              <p className="mt-1 text-[11px]">Its description, task link, owner, status, and due date will appear here.</p>
              <ArrowDown className="mt-4 opacity-50" size={16} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
