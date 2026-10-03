import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderKanban, Plus, Calendar, ArrowRight, MoreVertical, 
  Trash2, Loader2, Search, Code2, Sparkles, Github, 
  CheckCircle2, Clock, PauseCircle, PlayCircle, ExternalLink 
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'on_hold';
  progress?: number;
  created_at: string;
  owner_id?: string;
  github_repo?: string;
  owner?: {
    name?: string;
    avatar?: string;
  };
}

export default function Projects() {
  const navigate = useNavigate();
  const theme = useAccentTheme();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'on_hold'>('all');
  
  // Creation Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectRepo, setNewProjectRepo] = useState('');
  const [creating, setCreating] = useState(false);

  // Active Context Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectError) throw projectError;

      const { data: userData } = await supabase
        .from('users')
        .select('id, name, avatar');

      const userMap = new Map((userData || []).map((u) => [u.id, u]));

      const merged: Project[] = (projectData || []).map((p) => {
        const ownerUser = p.owner_id ? userMap.get(p.owner_id) : undefined;
        return {
          ...p,
          owner: ownerUser ? { name: ownerUser.name, avatar: ownerUser.avatar } : undefined,
        };
      });

      setProjects(merged);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    // Realtime Postgres listener
    const channel = supabase
      .channel('projects_live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => fetchProjects()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setCreating(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData?.user?.id;

      const { error } = await supabase
        .from('projects')
        .insert({
          name: newProjectName.trim(),
          description: newProjectDesc.trim(),
          github_repo: newProjectRepo.trim() || null,
          status: 'active',
          progress: 0,
          owner_id: currentUserId,
        });

      if (error) throw error;

      toast.success('Project created successfully!');
      setIsCreateModalOpen(false);
      setNewProjectName('');
      setNewProjectDesc('');
      setNewProjectRepo('');
      fetchProjects();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (projectId: string, newStatus: Project['status']) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId);

      if (error) throw error;
      toast.success(`Project marked as ${newStatus}`);
      fetchProjects();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setActiveMenuId(null);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? All associated tasks will be removed.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      toast.success('Project deleted successfully');
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete project');
    } finally {
      setActiveMenuId(null);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.github_repo && p.github_repo.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  // Calculate Quick Metric Stats
  const activeCount = projects.filter((p) => p.status === 'active').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const avgProgress = projects.length > 0 
    ? Math.round(projects.reduce((acc, curr) => acc + (curr.progress || 0), 0) / projects.length) 
    : 0;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto text-gray-900 dark:text-gray-200 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${theme.bgSubtle} ${theme.textAccent} border ${theme.borderAccent}/30 shadow-sm`}>
            <FolderKanban size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Projects Workspace</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Manage branches, automate sprints, and track milestones across your software portfolio.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl ${theme.btnPrimary} font-bold text-xs shadow-md transition-all active:scale-95`}
        >
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      {/* KPI Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Projects</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{activeCount}</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 border border-emerald-200 dark:border-emerald-800/40">
            <PlayCircle size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Completed</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{completedCount}</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 border border-blue-200 dark:border-blue-800/40">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Avg Progress</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{avgProgress}%</h3>
          </div>
          <div className={`p-2.5 rounded-xl ${theme.bgSubtle} ${theme.textAccent} border ${theme.borderAccent}/30`}>
            <Sparkles size={20} />
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects by name, repo, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none ${theme.ringAccent} transition-all shadow-sm`}
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-xl">
          {(['all', 'active', 'completed', 'on_hold'] as const).map((filterKey) => {
            const isActive = statusFilter === filterKey;
            return (
              <button
                key={filterKey}
                onClick={() => setStatusFilter(filterKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? `${theme.btnPrimary} shadow-sm`
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {filterKey.replace('_', ' ')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-gray-400 space-y-3">
          <Loader2 size={30} className={`animate-spin ${theme.textAccent}`} />
          <p className="text-xs">Syncing workspace projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-[#161b22] border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-8 space-y-3 shadow-sm">
          <FolderKanban size={40} className="mx-auto text-gray-400 dark:text-gray-600" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">No projects found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            {searchQuery ? 'No projects match your search keywords.' : 'Create your first project to start organizing tasks, code, and sprints.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => {
            const progressVal = p.progress || 0;
            const isMenuOpen = activeMenuId === p.id;

            return (
              <div
                key={p.id}
                className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800/80 hover:border-gray-300 dark:hover:border-gray-700/80 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative"
              >
                <div className="space-y-4">
                  {/* Top Bar (Icon, Status Badge, More Menu) */}
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-2xl ${theme.bgSubtle} ${theme.textAccent} border ${theme.borderAccent}/30 shadow-sm`}>
                      <FolderKanban size={22} />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        p.status === 'active' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60' 
                          : p.status === 'completed'
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                      }`}>
                        {p.status.replace('_', ' ')}
                      </span>

                      {/* Dropdown Options */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(isMenuOpen ? null : p.id)}
                          className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-0 top-7 w-40 bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-20 py-1.5 text-xs animate-in fade-in zoom-in-95">
                            <button
                              onClick={() => handleStatusChange(p.id, 'active')}
                              className="w-full px-3 py-1.5 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                            >
                              <PlayCircle size={13} className="text-emerald-500" /> Mark Active
                            </button>
                            <button
                              onClick={() => handleStatusChange(p.id, 'completed')}
                              className="w-full px-3 py-1.5 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                            >
                              <CheckCircle2 size={13} className="text-blue-500" /> Mark Complete
                            </button>
                            <button
                              onClick={() => handleStatusChange(p.id, 'on_hold')}
                              className="w-full px-3 py-1.5 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                            >
                              <PauseCircle size={13} className="text-amber-500" /> Put on Hold
                            </button>
                            <button
                              onClick={() => handleDeleteProject(p.id)}
                              className="w-full px-3 py-1.5 text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 border-t border-gray-100 dark:border-gray-800 mt-1 pt-1.5"
                            >
                              <Trash2 size={13} /> Delete Project
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1.5 leading-relaxed">
                      {p.description || 'No description provided for this project.'}
                    </p>
                  </div>

                  {/* Connected GitHub Repository Badge */}
                  {p.github_repo && (
                    <div className="flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#0d1117] p-2 rounded-xl border border-gray-100 dark:border-gray-800">
                      <Github size={13} className="shrink-0 text-gray-700 dark:text-gray-300" />
                      <span className="truncate">{p.github_repo}</span>
                    </div>
                  )}

                  {/* Progress Meter */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                      <span>Velocity</span>
                      <span>{progressVal}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-[#0d1117] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${theme.progressBar} transition-all duration-500`}
                        style={{ width: `${progressVal}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Footer: Quick Actions + Deep Links */}
                <div className="pt-5 mt-5 border-t border-gray-100 dark:border-gray-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    {/* Owner Info */}
                    <div className="flex items-center gap-2">
                      <img
                        src={p.owner?.avatar || '/pfp.jpg'}
                        alt={p.owner?.name || 'Owner'}
                        className="w-6 h-6 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate max-w-[90px]">
                        {p.owner?.name || 'Workspace'}
                      </span>
                    </div>

                    {/* Direct Project Tools (Code Studio & Sprint Planner Shortcuts) */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (p.github_repo) localStorage.setItem('pf_active_repo', p.github_repo);
                          localStorage.setItem('pf_selected_project_id', p.id);
                          navigate('/code');
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Open in Code Studio"
                      >
                        <Code2 size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          localStorage.setItem('pf_selected_project_id', p.id);
                          navigate('/sprint-planner');
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Architect Sprint"
                      >
                        <Sparkles size={15} />
                      </button>

                      <button
                        onClick={() => navigate(`/projects/${p.id}`)}
                        className={`flex items-center gap-1 text-xs font-bold ${theme.textAccent} ${theme.textHover} ml-1 transition-colors`}
                      >
                        <span>Board</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-md p-6 md:p-8 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Workspace Project</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Initialize a milestone container with tasks and GitHub linkage.</p>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NextGen Web Platform"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className={`w-full bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white outline-none ${theme.ringAccent}`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  rows={3}
                  placeholder="What is the objective of this project milestone?"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className={`w-full bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white outline-none ${theme.ringAccent}`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">GitHub Repository (owner/repo)</label>
                <input
                  type="text"
                  placeholder="e.g. octocat/Hello-World"
                  value={newProjectRepo}
                  onChange={(e) => setNewProjectRepo(e.target.value)}
                  className={`w-full bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white outline-none font-mono ${theme.ringAccent}`}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newProjectName.trim()}
                  className={`px-5 py-2.5 rounded-xl ${theme.btnPrimary} font-bold text-xs disabled:opacity-50 flex items-center gap-1.5 transition-all shadow-md active:scale-95`}
                >
                  {creating && <Loader2 size={13} className="animate-spin" />}
                  <span>Create Project</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}