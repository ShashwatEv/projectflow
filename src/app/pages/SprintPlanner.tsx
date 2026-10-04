import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Calendar, Clock, Loader2, Trash2, FolderKanban, Plus, Lock
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { askGeminiCodeAssistant } from '../../lib/geminiClient';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const SUPER_ADMIN_EMAIL = 'shashwatop69@gmail.com';

interface Project {
  id: string;
  name: string;
}

interface SprintItem {
  id: string;
  title: string;
  goal?: string;
  target_date?: string;
}

interface GeneratedTask {
  title: string;
  description: string;
  priority: 'P0' | 'P1' | 'P2';
  estimate_hours: number;
}

export default function SprintPlanner() {
  const navigate = useNavigate();
  const theme = useAccentTheme();
  const { user } = useAuth();

  const isSuperAdmin = user?.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL;
  const isVerified = Boolean(user?.is_verified || isSuperAdmin);

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  
  // Prompt & Generation States
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
  const [sprintTitle, setSprintTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');

  // Existing Sprints
  const [sprints, setSprints] = useState<SprintItem[]>([]);
  const [loadingSprints, setLoadingSprints] = useState(false);
  const [savingSprint, setSavingSprint] = useState(false);

  // 1. Fetch available projects
  useEffect(() => {
    async function loadProjects() {
      const { data } = await supabase
        .from('projects')
        .select('id, name')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setProjects(data as Project[]);
        const first = data[0];
        if (first?.id) {
          setSelectedProjectId(first.id);
        }
      }
    }
    loadProjects();
  }, []);

  // 2. Fetch sprints for selected project
  useEffect(() => {
    if (!selectedProjectId) return;
    async function loadSprints() {
      setLoadingSprints(true);
      const { data } = await supabase
        .from('sprints')
        .select('*')
        .eq('project_id', selectedProjectId)
        .order('created_at', { ascending: false });

      setSprints((data as SprintItem[]) || []);
      setLoadingSprints(false);
    }
    loadSprints();
  }, [selectedProjectId]);

  // 3. Trigger Gemini to structure Sprint & Tasks
  const handleGenerateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setGeneratedTasks([]);

    const systemPrompt = `
You are an expert Agile Scrum Architect.
Break down the following feature/milestone into structured engineering tasks.
Respond with raw JSON only (no markdown, no backticks, no comments).
Format:
{
  "sprintTitle": "Short descriptive title",
  "targetDays": 7,
  "tasks": [
    {
      "title": "Concise task title",
      "description": "Clear technical acceptance criteria",
      "priority": "P0",
      "estimate_hours": 3
    }
  ]
}
Feature description: "${prompt}"
`;

    try {
      const rawResponse = await askGeminiCodeAssistant(systemPrompt, '', 'architecture.json');
      const cleanJson = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      setSprintTitle(parsed.sprintTitle || 'Sprint Milestone');
      setGeneratedTasks(parsed.tasks || []);

      const date = new Date();
      date.setDate(date.getDate() + (parsed.targetDays || 7));
      setTargetDate(date.toISOString().split('T')[0] || '');

      toast.success('Sprint architecture generated!');
    } catch (err: any) {
      console.error(err);
      toast.error('AI formatting failed. Please re-run or try a shorter prompt.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 4. Save Sprint and Batch Insert Tasks to Supabase
  const handleSaveSprint = async () => {
    if (!isVerified) {
      toast.error('Identity Verification Required', {
        description: 'Please verify your email address to publish sprint milestones and batch tasks to project boards.',
        action: {
          label: 'Verify Now',
          onClick: () => navigate('/settings'),
        },
      });
      return;
    }

    if (!selectedProjectId || !sprintTitle.trim()) {
      toast.error('Please specify a project and sprint title');
      return;
    }

    setSavingSprint(true);
    try {
      // Create Sprint
      const { data: sprintData, error: sprintError } = await supabase
        .from('sprints')
        .insert({
          project_id: selectedProjectId,
          title: sprintTitle,
          goal: prompt,
          target_date: targetDate || null,
        })
        .select()
        .single();

      if (sprintError || !sprintData) throw sprintError;

      // Insert Generated Tasks
      if (generatedTasks.length > 0) {
        const payload = generatedTasks.map((t) => ({
          project_id: selectedProjectId,
          sprint_id: sprintData.id,
          title: t.title,
          description: t.description,
          priority: t.priority,
          estimate_hours: t.estimate_hours,
          status: 'todo',
        }));

        const { error: taskError } = await supabase.from('tasks').insert(payload);
        if (taskError) throw taskError;
      }

      toast.success(`Sprint "${sprintTitle}" published with ${generatedTasks.length} tasks!`);
      setSprints((prev) => [sprintData as SprintItem, ...prev]);
      setGeneratedTasks([]);
      setPrompt('');
      setSprintTitle('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save sprint');
    } finally {
      setSavingSprint(false);
    }
  };

  const removeGeneratedTask = (index: number) => {
    setGeneratedTasks((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 text-gray-200 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/60 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${theme.bgSubtle} ${theme.textAccent} border ${theme.borderAccent}/30 shadow-sm`}>
              <Sparkles size={22} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">AI Sprint Architect</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Generate milestone epics, technical tasks, and work estimates via Google Gemini.
          </p>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-2 bg-[#161b22] border border-gray-800 rounded-xl px-3 py-1.5">
          <FolderKanban size={14} className={theme.textAccent} />
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-transparent text-xs text-white outline-none font-semibold cursor-pointer"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#161b22] text-white">
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Prompt & Active Sprints */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#161b22] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Describe Milestone</h2>
            <form onSubmit={handleGenerateSprint} className="space-y-3">
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Build an authentication module with Google OAuth, Supabase RLS policies, dynamic token refreshes, and rate limiting."
                className={`w-full bg-[#0d1117] border border-gray-800 rounded-2xl p-3.5 text-xs text-white placeholder-gray-500 outline-none ${theme.ringAccent} transition-colors`}
              />

              <button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className={`w-full py-3 rounded-xl ${theme.btnPrimary} font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Architecting Sprint...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    <span>Generate Sprint Plan</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sprints Overview */}
          <div className="bg-[#161b22] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Sprints</h3>
            {loadingSprints ? (
              <div className="py-6 text-center text-xs text-gray-400">Loading sprints...</div>
            ) : sprints.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">No active sprints for this project.</p>
            ) : (
              <div className="space-y-2">
                {sprints.map((s) => (
                  <div key={s.id} className="p-3 bg-[#0d1117] border border-gray-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">{s.title}</h4>
                      {s.target_date && (
                        <span className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
                          <Calendar size={11} /> {s.target_date}
                        </span>
                      )}
                    </div>
                    {s.goal && <p className="text-[11px] text-gray-400 line-clamp-1">{s.goal}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Generated Plan & Task Breakdown */}
        <div className="lg:col-span-7 bg-[#161b22] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
            <div>
              <h2 className="text-base font-bold text-white">Sprint Breakdown</h2>
              <p className="text-xs text-gray-400">Review task estimates and push directly to your board.</p>
            </div>

            {generatedTasks.length > 0 && (
              <button
                type="button"
                onClick={handleSaveSprint}
                disabled={savingSprint}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl ${theme.btnPrimary} font-bold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50`}
              >
                {savingSprint ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : !isVerified ? (
                  <Lock size={13} />
                ) : (
                  <Plus size={13} />
                )}
                <span>Publish to Project</span>
              </button>
            )}
          </div>

          {generatedTasks.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Sparkles size={36} className="mx-auto text-gray-600" />
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                No active generated plan. Describe your engineering goals on the left to structure a sprint.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sprint Metadata Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#0d1117] border border-gray-800 rounded-2xl">
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase">Sprint Title</label>
                  <input
                    type="text"
                    value={sprintTitle}
                    onChange={(e) => setSprintTitle(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase">Target Deadline</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-transparent text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-2.5">
                {generatedTasks.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#0d1117] border border-gray-800 rounded-xl flex items-start justify-between gap-3 group hover:border-gray-700 transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          t.priority === 'P0' 
                            ? 'bg-rose-950/50 text-rose-400 border border-rose-800/60'
                            : t.priority === 'P1'
                            ? 'bg-amber-950/50 text-amber-400 border border-amber-800/60'
                            : 'bg-blue-950/50 text-blue-400 border border-blue-800/60'
                        }`}>
                          {t.priority}
                        </span>
                        <h4 className="text-xs font-bold text-white">{t.title}</h4>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed">{t.description}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 pt-1 font-mono">
                        <Clock size={11} />
                        <span>~{t.estimate_hours} hrs</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeGeneratedTask(idx)}
                      className="text-gray-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-all"
                      title="Remove task"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}