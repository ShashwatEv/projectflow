import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Check, ChevronDown, Loader2, Send, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import {
  extractExplicitTaskTitle,
  findTaskSuggestions,
  type ChatAssistantMessage,
} from '../../lib/teamChatAssistant';

interface ProjectContext {
  id: string;
  name: string;
  key: string;
  status: string | null;
  can_create_task: boolean;
}

interface TaskContext {
  id: string;
  project_id: string;
  title: string;
  status: string;
  priority: string | null;
  due_date: string | null;
}

interface TeamChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatAssistantMessage[];
}

interface TaskDraft {
  title: string;
  projectId: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

const fieldClassName =
  'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';

function getLocalAnswer(
  question: string,
  projects: ProjectContext[],
  tasks: TaskContext[],
  suggestions: ReturnType<typeof findTaskSuggestions>
) {
  const normalized = question.toLowerCase();
  if (/\b(code|repository|source)\b/.test(normalized)) {
    return 'I do not inspect source code or connect to a code host. I can use project and task details already available to your signed-in account.';
  }

  if (/\b(project|workspace)\b/.test(normalized)) {
    if (!projects.length) return 'No projects are currently available to your account.';
    return `You can access ${projects.length} project${projects.length === 1 ? '' : 's'}: ${projects
      .map((project) => `${project.name} (${project.key})`)
      .join(', ')}.`;
  }

  const openTasks = tasks.filter((task) => !['done', 'complete', 'completed'].includes(task.status.toLowerCase()));
  if (/\b(task|todo|work|progress)\b/.test(normalized)) {
    const recentTitles = openTasks.slice(0, 5).map((task) => task.title);
    const taskSummary = recentTitles.length ? ` Recent open tasks: ${recentTitles.join('; ')}.` : '';
    const suggestionSummary = suggestions.length
      ? ` I found ${suggestions.length} possible action item${suggestions.length === 1 ? '' : 's'} in this conversation below.`
      : '';
    return `I found ${openTasks.length} open task${openTasks.length === 1 ? '' : 's'} among the recent task records available to your account.${taskSummary}${suggestionSummary}`;
  }

  return `I can summarize ${projects.length} accessible project${projects.length === 1 ? '' : 's'} and ${tasks.length} task${tasks.length === 1 ? '' : 's'}. Try asking about projects or open tasks, or type “create task: …” to prepare a task for your review.`;
}

export default function TeamChatAssistant({ isOpen, onClose, messages }: TeamChatAssistantProps) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectContext[]>([]);
  const [tasks, setTasks] = useState<TaskContext[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [draft, setDraft] = useState<TaskDraft | null>(null);
  const [creating, setCreating] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const suggestions = useMemo(() => findTaskSuggestions(messages), [messages]);
  const [editableProjectIds, setEditableProjectIds] = useState<Set<string>>(new Set());
  const panelRef = useRef<HTMLElement>(null);
  const questionInputRef = useRef<HTMLTextAreaElement>(null);
  const previousUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    questionInputRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]'
      );
      if (!focusable?.length) return;
      const first = focusable.item(0);
      const last = focusable.item(focusable.length - 1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !user?.id) return;
    if (previousUserIdRef.current !== user.id) {
      setProjects([]);
      setTasks([]);
      setEditableProjectIds(new Set());
      setDraft(null);
      setAnswer('');
      previousUserIdRef.current = user.id;
    }
    let active = true;
    const loadContext = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const { data, error } = await supabase.rpc('team_chat_assistant_context');
        if (error) throw error;
        if (!active) return;

        const context = data as { projects?: ProjectContext[]; tasks?: TaskContext[] } | null;
        const availableProjects = context?.projects || [];
        const editableIds = new Set(
          availableProjects.filter((project) => project.can_create_task).map((project) => project.id)
        );
        setProjects(availableProjects);
        setTasks(context?.tasks || []);
        setEditableProjectIds(editableIds);
      } catch (error) {
        if (!active) return;
        console.error('Could not load team-chat assistant context:', error);
        setLoadError('Project and task context could not be loaded. Check your connection and access, then try again.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadContext();
    return () => {
      active = false;
    };
  }, [isOpen, reloadToken, user?.email, user?.id, user?.role]);

  const createableProjects = useMemo(
    () => projects.filter((project) => editableProjectIds.has(project.id)),
    [editableProjectIds, projects]
  );

  if (!isOpen) return null;

  const prepareTask = (title: string) => {
    setAnswer('');
    setDraft({
      title,
      projectId: createableProjects[0]?.id || '',
      description: '',
      priority: 'medium',
    });
  };

  const handleAsk = (event: FormEvent) => {
    event.preventDefault();
    const prompt = question.trim();
    if (!prompt) return;
    const explicitTitle = extractExplicitTaskTitle(prompt);
    if (explicitTitle) {
      if (createableProjects.length) {
        prepareTask(explicitTitle);
      } else {
        setDraft(null);
        setAnswer('You can review project context, but creating tasks requires owner, editor, or admin access to a project.');
      }
      setQuestion('');
      return;
    }
    setDraft(null);
    setAnswer(getLocalAnswer(prompt, projects, tasks, suggestions));
    setQuestion('');
  };

  const handleCreateTask = async (event: FormEvent) => {
    event.preventDefault();
    if (!user?.id || !draft?.projectId || !draft.title.trim() || !editableProjectIds.has(draft.projectId)) return;
    setCreating(true);
    try {
      const { error } = await supabase.rpc('create_chat_task', {
        p_project_id: draft.projectId,
        p_title: draft.title.trim(),
        p_description: draft.description.trim() || null,
        p_priority: draft.priority,
      });
      if (error) throw error;

      toast.success('Task created in the selected project.');
      setDraft(null);
      setAnswer('Task created. The project task list will update from the shared workspace.');
      setReloadToken((current) => current + 1);
    } catch (error) {
      console.error('Could not create task from team chat:', error);
      toast.error('Task was not created. Check your project role and try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-gray-950/45 backdrop-blur-[2px]" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section
        id="team-chat-assistant-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-chat-assistant-title"
        className="flex h-full w-full max-w-xl flex-col border-l border-gray-200 bg-gray-50 shadow-2xl motion-reduce:transition-none dark:border-gray-800 dark:bg-gray-950"
      >
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
              <Bot size={20} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 id="team-chat-assistant-title" className="truncate text-sm font-bold text-gray-900 dark:text-white">
                Team chat assistant
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Private to your signed-in workspace context</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close team chat assistant"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-5">
          <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/80 p-4 dark:border-indigo-900/70 dark:bg-indigo-950/35">
            <div className="flex items-start gap-2.5">
              <Sparkles size={16} className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-300" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">A helpful teammate, not an auto-run bot</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                  I use only project and task records your account can already read. I do not inspect code or send chat history to an external AI service.
                </p>
              </div>
            </div>
          </div>

          {loading && (
            <p role="status" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Loader2 size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
              Loading your available project context…
            </p>
          )}
          {loadError && (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
              {loadError}
            </div>
          )}

          <section aria-labelledby="assistant-projects-heading" className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 id="assistant-projects-heading" className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Your project snapshot
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {projects.length} accessible projects · {tasks.length} recent tasks
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                Account-scoped
              </span>
            </div>
            {projects.length > 0 && (
              <ul className="mt-3 space-y-2">
                {projects.slice(0, 4).map((project) => {
                  const projectTasks = tasks.filter((task) => task.project_id === project.id);
                  const openCount = projectTasks.filter((task) => !['done', 'complete', 'completed'].includes(task.status.toLowerCase())).length;
                  return (
                    <li key={project.id} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-gray-800/70">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{project.name}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">{project.key}{project.status ? ` · ${project.status}` : ''}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-medium text-gray-600 dark:bg-gray-900 dark:text-gray-300">
                        {openCount} open
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            {projects.length === 0 && !loading && !loadError && (
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">No projects are available to your account yet.</p>
            )}
          </section>

          <section aria-labelledby="assistant-discussion-heading">
            <div className="mb-2 flex items-center justify-between">
              <h3 id="assistant-discussion-heading" className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                From this conversation
              </h3>
              <span className="text-[10px] text-gray-400">Recent messages only</span>
            </div>
            {suggestions.length ? (
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li key={`${suggestion.title}-${index}`} className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{suggestion.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                      {suggestion.source.user?.name ? `${suggestion.source.user.name}: ` : ''}{suggestion.source.content}
                    </p>
                    {createableProjects.length > 0 && (
                      <button
                        type="button"
                        onClick={() => prepareTask(suggestion.title)}
                        className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-300 dark:hover:bg-indigo-950/50"
                      >
                        Review as task <ChevronDown size={13} aria-hidden="true" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-xl border border-dashed border-gray-300 px-3 py-4 text-center text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                No clear action items detected in the recent messages.
              </p>
            )}
          </section>

          {answer && (
            <div role="status" className="rounded-2xl border border-gray-200 bg-white p-4 text-sm leading-relaxed text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
              {answer}
            </div>
          )}

          {draft && (
            <form onSubmit={handleCreateTask} className="space-y-3 rounded-2xl border border-indigo-200 bg-white p-4 shadow-sm dark:border-indigo-900/70 dark:bg-gray-900">
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Review task before creating</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Nothing changes until you confirm below. Your project role is checked again by the server.
                </p>
              </div>
              <label className="block space-y-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                Project
                <select
                  required
                  value={draft.projectId}
                  onChange={(event) => setDraft({ ...draft, projectId: event.target.value })}
                  className={fieldClassName}
                >
                  <option value="" disabled>Select a project you can edit</option>
                  {createableProjects.map((project) => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                Task title
                <input
                  required
                  maxLength={180}
                  value={draft.title}
                  onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                  className={fieldClassName}
                />
              </label>
              <label className="block space-y-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                Description <span className="font-normal text-gray-400">(optional)</span>
                <textarea
                  rows={2}
                  maxLength={2000}
                  value={draft.description}
                  onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                  className={`${fieldClassName} resize-y`}
                />
              </label>
              <label className="block space-y-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                Priority
                <select
                  value={draft.priority}
                  onChange={(event) => setDraft({ ...draft, priority: event.target.value as TaskDraft['priority'] })}
                  className={fieldClassName}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
              <div className="flex justify-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                <button type="button" onClick={() => setDraft(null)} className="min-h-10 rounded-xl px-3 text-xs font-semibold text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-gray-300 dark:hover:bg-gray-800">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !draft.projectId || !draft.title.trim()}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-gray-900"
                >
                  {creating ? <Loader2 size={14} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Check size={14} aria-hidden="true" />}
                  {creating ? 'Creating…' : 'Confirm & create task'}
                </button>
              </div>
            </form>
          )}
        </div>

        <form onSubmit={handleAsk} className="border-t border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <label htmlFor="team-chat-assistant-prompt" className="sr-only">Ask the team chat assistant</label>
          <div className="flex items-end gap-2">
            <textarea
              id="team-chat-assistant-prompt"
              ref={questionInputRef}
              rows={2}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask about projects/tasks or type “create task: …”"
              className={`${fieldClassName} min-h-11 flex-1 resize-none`}
            />
            <button
              type="submit"
              disabled={!question.trim() || loading}
              aria-label="Send question to assistant"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-gray-900"
            >
              <Send size={16} aria-hidden="true" />
            </button>
          </div>
          <p className="mt-2 text-[10px] text-gray-400">Local summaries · no external AI or code access</p>
        </form>
      </section>
    </div>
  );
}
